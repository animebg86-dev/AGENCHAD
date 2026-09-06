import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && apiKey) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Assistant API Endpoint
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { message, currentDate, existingEvents, existingNotes, activeTheme } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const client = getGeminiClient();

    // Context summary for Gemini
    const eventsSummary = Array.isArray(existingEvents)
      ? existingEvents
          .slice(0, 20)
          .map(
            (e: any) =>
              `- [ID: ${e.id}] "${e.title}" le ${e.date} de ${e.startTime} à ${e.endTime || e.startTime} (${e.category}) ${e.isCompleted ? '[Fait]' : '[À faire]'}`
          )
          .join('\n')
      : 'Aucun événement';

    const notesSummary = Array.isArray(existingNotes)
      ? existingNotes
          .slice(0, 15)
          .map((n: any) => `- [ID: ${n.id}] "${n.title}" (${n.category})`)
          .join('\n')
      : 'Aucune note';

    const systemInstruction = `Tu es l'assistant vocal intelligent d'élite ("Gemini AI & Siri") pour l'application nommée "AGENCHAD", l'agenda haut de gamme synchronisé pour mobile (notamment Xiaomi 14T Pro 5G, iPhone/iPad) et PC.
La date actuelle de référence est : ${currentDate || new Date().toISOString().slice(0, 10)}.
Le thème actif actuel est : ${activeTheme || 'amber'}.

Voici la liste des événements/tâches existants :
${eventsSummary}

Voici la liste des notes existantes :
${notesSummary}

L'utilisateur te parle en langage naturel (souvent par commande vocale sur son smartphone ou son PC).
Tu dois comprendre son intention et retourner STRICTEMENT un objet JSON valide conforme au format suivant :

{
  "spokenResponse": "Une réponse vocale courte, chaleureuse et énergique en français (1 à 2 phrases max)",
  "action": {
    "type": "create_event" | "delete_event" | "complete_event" | "create_note" | "delete_note" | "navigate" | "change_theme" | "create_group" | "join_group" | "switch_workspace" | "answer",
    "payload": { ... }
  }
}

Détails des types d'action et de leur payload :
1. "create_event" : Pour ajouter un rendez-vous, une tâche ou un rappel.
   payload : {
     "title": "Titre clair",
     "date": "YYYY-MM-DD" (calcule la date exacte par rapport à la date de référence si l'utilisateur dit 'demain', 'lundi prochain', etc.),
     "startTime": "HH:mm" (ex: "14:00", par défaut "09:00" si non spécifié),
     "endTime": "HH:mm" (ex: "15:00", par défaut 1h après startTime),
     "category": "travail" | "personnel" | "sante" | "famille" | "loisirs" | "urgent",
     "isDailyReminder": boolean,
     "description": string (optionnel)
   }

2. "delete_event" : Pour supprimer une tâche ou un rendez-vous.
   payload : {
     "eventId": "ID de l'événement trouvé dans la liste ci-dessus, ou null si non trouvé",
     "eventTitle": "Titre recherché"
   }

3. "complete_event" : Pour cocher ou marquer comme fait un rappel ou une tâche.
   payload : {
     "eventId": "ID de l'événement",
     "isCompleted": true
   }

4. "create_note" : Pour créer une note, mémo, liste de courses ou checklist.
   payload : {
     "title": "Titre de la note",
     "content": "Contenu ou texte",
     "category": "Priorités" | "Général" | "Santé" | "Idées" | etc.,
     "checklist": [ { "text": "Item 1", "done": false } ] (optionnel si liste demandée)
   }

5. "delete_note" : Pour supprimer une note.
   payload : {
     "noteId": "ID de la note trouvée",
     "noteTitle": "Titre de la note"
   }

6. "navigate" : Pour aller sur une section de l'application (ex: 'va sur mes notes', 'montre-moi la semaine', 'affiche le mois', 'reviens sur le planning').
   payload : {
     "view": "timeline" | "day" | "week" | "month" | "notes"
   }

7. "change_theme" : Pour changer l'apparence ou la couleur (ex: 'mets le thème violet', 'change en rouge', 'passe en noir', 'thème ambre', 'thème émeraude', 'thème cyan').
   payload : {
     "themeId": "amber" | "violet" | "rouge" | "noir" | "emeraude" | "cyan"
   }

8. "create_group" : Pour créer un nouveau groupe de projet (ex: 'crée le groupe Projet Alpha').
   payload : {
     "name": "Nom du projet"
   }

9. "answer" : Pour une question générale sur le planning ou une simple conversation.
   payload : {
     "reply": "Ta réponse détaillée"
   }

RÈGLE ABSOLUE : Réponds UNIQUEMENT avec le JSON brut, sans markdown, sans \`\`\`json.`;

    if (client) {
      try {
        const geminiRes = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const rawText = geminiRes.text || '{}';
        // Parse the JSON output safely
        const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using fallback parser:', geminiError?.message || geminiError);
      }
    }

    // Smart Fallback Local Parser (works even if API key is not configured or network glitch)
    const lower = message.toLowerCase();
    const fallbackResponse = parseCommandLocally(lower, currentDate);
    res.json(fallbackResponse);
  } catch (error: any) {
    console.error('Error handling assistant request:', error);
    res.status(500).json({
      spokenResponse: "Désolé, une erreur est survenue lors du traitement de votre demande.",
      action: { type: 'answer', payload: { reply: error?.message || 'Erreur serveur' } },
    });
  }
});

// Local heuristic fallback parser
function parseCommandLocally(text: string, refDateStr?: string): any {
  const refDate = refDateStr ? new Date(refDateStr) : new Date();

  // 1. Theme switching
  if (text.includes('theme') || text.includes('thème') || text.includes('couleur')) {
    if (text.includes('violet') || text.includes('pourpre')) {
      return {
        spokenResponse: "Thème violet activé avec succès.",
        action: { type: 'change_theme', payload: { themeId: 'violet' } },
      };
    }
    if (text.includes('rouge') || text.includes('red')) {
      return {
        spokenResponse: "Thème rouge écarlate activé.",
        action: { type: 'change_theme', payload: { themeId: 'rouge' } },
      };
    }
    if (text.includes('noir') || text.includes('black') || text.includes('sombre')) {
      return {
        spokenResponse: "Thème noir titane activé.",
        action: { type: 'change_theme', payload: { themeId: 'noir' } },
      };
    }
    if (text.includes('orange') || text.includes('ambre') || text.includes('amber')) {
      return {
        spokenResponse: "Thème ambre obsidienne activé.",
        action: { type: 'change_theme', payload: { themeId: 'amber' } },
      };
    }
    if (text.includes('vert') || text.includes('emeraude') || text.includes('émeraude')) {
      return {
        spokenResponse: "Thème émeraude activé.",
        action: { type: 'change_theme', payload: { themeId: 'emeraude' } },
      };
    }
    if (text.includes('bleu') || text.includes('cyan')) {
      return {
        spokenResponse: "Thème cyan électrique activé.",
        action: { type: 'change_theme', payload: { themeId: 'cyan' } },
      };
    }
  }

  // 2. Navigation
  if (text.includes('note') && (text.includes('va') || text.includes('aller') || text.includes('ouvre') || text.includes('affiche') || text.includes('montre'))) {
    return {
      spokenResponse: "J'ouvre vos notes personnelles.",
      action: { type: 'navigate', payload: { view: 'notes' } },
    };
  }
  if (text.includes('semaine') && (text.includes('va') || text.includes('aller') || text.includes('ouvre') || text.includes('affiche') || text.includes('montre'))) {
    return {
      spokenResponse: "Voici l'affichage de votre semaine.",
      action: { type: 'navigate', payload: { view: 'week' } },
    };
  }
  if (text.includes('mois') && (text.includes('va') || text.includes('aller') || text.includes('ouvre') || text.includes('affiche') || text.includes('montre'))) {
    return {
      spokenResponse: "Voici la vue mensuelle de votre agenda.",
      action: { type: 'navigate', payload: { view: 'month' } },
    };
  }
  if ((text.includes('timeline') || text.includes('planning') || text.includes('jour')) && (text.includes('va') || text.includes('aller') || text.includes('ouvre') || text.includes('affiche') || text.includes('montre'))) {
    return {
      spokenResponse: "Voici votre planning du jour.",
      action: { type: 'navigate', payload: { view: 'timeline' } },
    };
  }

  // 3. Create Note
  if (text.includes('note') && (text.includes('ajoute') || text.includes('créer') || text.includes('creer') || text.includes('écris') || text.includes('ecris') || text.includes('nouvelle'))) {
    const cleanTitle = text.replace(/.*(ajoute|créer|creer|nouvelle|écris|ecris)\s+(une\s+)?note(\s+pour|\s+sur|\s+de)?\s*/i, '').trim() || 'Nouvelle note';
    return {
      spokenResponse: `Note créée : "${cleanTitle}".`,
      action: {
        type: 'create_note',
        payload: {
          title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
          content: '',
          category: 'Idées',
        },
      },
    };
  }

  // 4. Delete Event or Note
  if (text.includes('supprime') || text.includes('efface') || text.includes('retire')) {
    const targetTitle = text.replace(/.*(supprime|efface|retire)\s+(le|la|les|l'|un|une)?\s*(tâche|tache|événement|evenement|rappel|note)?\s*/i, '').trim();
    if (text.includes('note')) {
      return {
        spokenResponse: `Suppression de la note "${targetTitle}".`,
        action: {
          type: 'delete_note',
          payload: { noteTitle: targetTitle },
        },
      };
    }
    return {
      spokenResponse: `Suppression de la tâche "${targetTitle}".`,
      action: {
        type: 'delete_event',
        payload: { eventTitle: targetTitle },
      },
    };
  }

  // 5. Create Event / Task
  if (text.includes('ajoute') || text.includes('programme') || text.includes('créer') || text.includes('creer') || text.includes('planifie') || text.includes('rappel') || text.includes('rendez-vous') || text.includes('reunion') || text.includes('réunion')) {
    let targetDate = new Date(refDate);
    if (text.includes('demain')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (text.includes('après-demain') || text.includes('apres demain')) {
      targetDate.setDate(targetDate.getDate() + 2);
    }

    const dateFormatted = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // Extract time like "14h", "14:30", "à 10h"
    const timeMatch = text.match(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/);
    let startTime = '10:00';
    let endTime = '11:00';
    if (timeMatch) {
      const h = timeMatch[1] || timeMatch[3];
      const m = timeMatch[2] || timeMatch[4] || '00';
      startTime = `${String(h).padStart(2, '0')}:${m}`;
      endTime = `${String((Number(h) + 1) % 24).padStart(2, '0')}:${m}`;
    }

    const cleanTitle = text
      .replace(/.*(ajoute|programme|créer|creer|planifie|nouveau|nouvelle)\s+(un\s+rappel|un\s+rendez-vous|une\s+réunion|une\s+reunion|une\s+tâche|une\s+tache)?\s*(pour|à|a)?\s*/i, '')
      .replace(/demain|aujourd'hui|après-demain|apres demain|\d{1,2}h\d{0,2}/gi, '')
      .trim() || 'Nouveau rendez-vous';

    const finalTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      spokenResponse: `C'est programmé ! J'ai ajouté "${finalTitle}" pour le ${dateFormatted} à ${startTime}.`,
      action: {
        type: 'create_event',
        payload: {
          title: finalTitle,
          date: dateFormatted,
          startTime,
          endTime,
          category: text.includes('urgent') ? 'urgent' : text.includes('santé') || text.includes('medecin') || text.includes('dentiste') ? 'sante' : 'travail',
          isDailyReminder: text.includes('quotidien') || text.includes('tous les jours'),
        },
      },
    };
  }

  // Default response
  return {
    spokenResponse: "Je peux ajouter ou supprimer des tâches, ouvrir vos notes, modifier votre planning ou changer le thème (violet, rouge, noir, ambre). Que souhaitez-vous faire ?",
    action: {
      type: 'answer',
      payload: {
        reply: "Commande non reconnue. Essayez par exemple : 'Ajoute une réunion demain à 14h', 'Va sur mes notes', ou 'Mets le thème violet'.",
      },
    },
  };
}

// Vite middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
