import React from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Tablet,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  Mic,
  Share2,
  Radio,
} from 'lucide-react';
import { AppTheme } from '../../types';

interface DeviceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onOpenVoiceAssistant: () => void;
}

export const DeviceIntegrationModal: React.FC<DeviceIntegrationModalProps> = ({
  isOpen,
  onClose,
  theme,
  onOpenVoiceAssistant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0f1118] border border-slate-800 shadow-2xl flex flex-col relative text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-black shadow-lg"
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: `0 0 16px ${theme.glowColor}`,
              }}
            >
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Intégration Xiaomi 14T Pro, iPad & PC
                </h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    color: theme.primaryColor,
                  }}
                >
                  GEMINI & SIRI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comment l'IA Gemini et Siri interviennent directement dans AGENCHAD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Card 1: Xiaomi 14T Pro 5G */}
          <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Xiaomi 14T Pro 5G (HyperOS & Gemini)
                  </h4>
                  <span className="text-[10px] text-amber-400 font-mono">
                    IA Gemini intégrée au système
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                Optimisé 5G
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Bouton Micro Flottant Direct :</strong> Sur votre Xiaomi, le bouton micro
                  situé en bas à droite de l'écran déclenche instantanément la reconnaissance vocale
                  Google/Gemini avec réponse audio à voix haute.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Installation en Application Native (PWA) :</strong> Dans Chrome sur le
                  Xiaomi, cliquez sur <em>« Installer l'application »</em>. AGENCHAD s'installe comme
                  une vraie app sans barre de navigation, avec accès instantané aux raccourcis.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Synchronisation 5G temps réel :</strong> Toutes les modifications
                  (tâches, notes de projet) se synchronisent immédiatement entre votre Xiaomi et vos
                  autres appareils.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: iPad & iPhone (iOS) */}
          <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Tablet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    iPad & iPhone (Apple iOS / Safari)
                  </h4>
                  <span className="text-[10px] text-purple-400 font-mono">
                    Siri Voice & Raccourcis iOS
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Synthèse vocale Siri :</strong> Sur iPad et iPhone, l'application utilise
                  automatiquement la voix française Siri pour vous confirmer les rendez-vous ajoutés.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sur l'écran d'accueil :</strong> Depuis Safari, appuyez sur le bouton de
                  partage puis <em>« Sur l'écran d'accueil »</em> pour l'ouvrir en plein écran.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: PC & Mac Desktop */}
          <div className="p-4 rounded-2xl bg-[#141724] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    PC Desktop & Ordinateur Portable
                  </h4>
                  <span className="text-[10px] text-sky-400 font-mono">
                    Raccourci clavier Alt + G
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Raccourci rapide clavier :</strong> Pressez <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Alt + G</kbd> n'importe quand pour ouvrir Gemini vocalement !
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-fenêtres temps réel :</strong> Ouvrez AGENCHAD sur plusieurs
                  écrans, vos modifications se reflètent instantanément via le canal de diffusion.
                </span>
              </div>
            </div>
          </div>

          {/* Test Voice Assistant Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenVoiceAssistant();
              }}
              className="w-full py-3 rounded-2xl font-bold text-xs text-black transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: `0 0 20px ${theme.glowColor}`,
              }}
            >
              <Mic className="w-4 h-4" />
              <span>Tester l'Assistant Gemini Vocal Maintenant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
