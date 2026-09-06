import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
  Palette,
  Trash2,
} from 'lucide-react';
import { AppTheme, AIAssistantAction, AIAssistantResult, AgendaEvent, PersonalNote } from '../../types';
import { GlowingOrb } from '../GlowingOrb';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  currentDate?: Date;
  events: AgendaEvent[];
  notes: PersonalNote[];
  onExecuteAction: (action: AIAssistantAction, spokenFeedback?: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentDate = new Date(),
  events = [],
  notes = [],
  onExecuteAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIAssistantResult | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'fr-FR';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          // Auto submit after voice capture
          handleSendMessage(transcript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech function
  const speakFeedback = (text: string) => {
    if (voiceMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best French voice if available
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith('fr') && !v.name.includes('Google'));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur. Vous pouvez saisir votre commande au clavier.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setInputText('');

    const safeDate =
      currentDate instanceof Date && !isNaN(currentDate.getTime())
        ? currentDate
        : new Date();

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentDate: `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`,
          existingEvents: events.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime,
            category: e.category,
            isCompleted: e.isCompleted,
          })),
          existingNotes: notes.map((n) => ({
            id: n.id,
            title: n.title,
            category: n.category,
          })),
          activeTheme: theme.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const result: AIAssistantResult = await res.json();
      setLastResponse(result);

      // Speak feedback
      if (result.spokenResponse) {
        speakFeedback(result.spokenResponse);
      }

      // Execute action
      if (result.action) {
        onExecuteAction(result.action, result.spokenResponse);
      }
    } catch (err: any) {
      console.error('Error contacting Gemini Assistant:', err);
      const fallbackResult: AIAssistantResult = {
        spokenResponse: "Désolé, je n'ai pas pu traiter votre demande pour le moment.",
        action: { type: 'answer', payload: { reply: err.message } },
      };
      setLastResponse(fallbackResult);
      speakFeedback(fallbackResult.spokenResponse);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0f1118] border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative text-slate-100">
        {/* Top bar with Siri / Gemini badge and controls */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: `0 0 16px ${theme.glowColor}`,
              }}
            >
              <Sparkles className="w-4 h-4 text-black font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Gemini & Siri Vocal
                </h3>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    border: `1px solid ${theme.badgeBorder}`,
                  }}
                >
                  IA Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Commandes vocales, ajout de tâches, notes & thèmes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Voice Mute Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setVoiceMuted(!voiceMuted);
              }}
              className={`p-2 rounded-xl border transition ${
                voiceMuted
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
              title={voiceMuted ? 'Activer la voix' : 'Couper la voix'}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Visual: The glowing particle orb (Signature visual from reference image) */}
        <div className="p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#121420]/50 to-transparent">
          <div className="relative">
            <GlowingOrb
              theme={theme}
              isListening={isListening}
              isSpeaking={isSpeaking || isLoading}
              size={190}
            />

            {/* Central Mic Button overlapping or next to the orb */}
            <button
              onClick={toggleListening}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                isListening
                  ? 'bg-rose-600 text-white scale-110 animate-pulse ring-4 ring-rose-500/40'
                  : 'text-white hover:scale-105 active:scale-95'
              }`}
              style={{
                backgroundColor: isListening ? '#f43f5e' : theme.primaryColor,
                boxShadow: `0 0 24px ${isListening ? 'rgba(244, 63, 94, 0.6)' : theme.glowColor}`,
              }}
              title={isListening ? 'Arrêter l’écoute' : 'Parler (Siri / Micro)'}
            >
              {isListening ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-black" />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs font-semibold text-slate-300 flex items-center gap-2">
            {isListening ? (
              <span className="text-rose-400 font-bold animate-pulse">
                ● À l'écoute... Parlez maintenant
              </span>
            ) : isLoading ? (
              <span className="text-amber-400 font-bold animate-pulse">
                ● Gemini réfléchit...
              </span>
            ) : isSpeaking ? (
              <span style={{ color: theme.badgeText }} className="font-bold flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Réponse vocale en cours...
              </span>
            ) : (
              <span className="text-slate-400">
                Appuyez sur le micro ou tapez ci-dessous
              </span>
            )}
          </p>

          {/* Action result preview banner */}
          {lastResponse && (
            <div className="mt-3 w-full p-3 rounded-2xl bg-[#141724] border border-slate-700/80 text-xs flex items-start gap-2.5">
              <CheckCircle2
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: theme.primaryColor }}
              />
              <div className="flex-1">
                <p className="text-white font-medium">{lastResponse.spokenResponse}</p>
                {lastResponse.action?.type && (
                  <span
                    className="inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    Action : {lastResponse.action.type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-[#0c0d13] border-t border-b border-slate-800/80">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Suggestions rapides :
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {[
              { text: 'Ajoute une réunion demain à 14h', icon: Calendar },
              { text: 'Va sur mes notes', icon: BookOpen },
              { text: 'Change en thème violet', icon: Palette },
              { text: 'Change en thème rouge', icon: Palette },
              { text: 'Passe au thème noir', icon: Palette },
              { text: 'Ajoute une note pour les courses', icon: BookOpen },
            ].map((sug, i) => {
              const Icon = sug.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition shrink-0 cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span>{sug.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0f1118]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Écrivez une commande (ex: 'Ajoute dentiste demain à 10h', 'Va sur mes notes')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#151824] border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-2xl text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: `0 0 12px ${theme.glowColor}`,
              }}
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
