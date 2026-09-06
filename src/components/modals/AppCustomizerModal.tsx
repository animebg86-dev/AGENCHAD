import React, { useState, useRef } from 'react';
import {
  X,
  Sliders,
  Palette,
  Bot,
  Download,
  Upload,
  RotateCcw,
  Check,
  Smartphone,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppTheme, AppThemeId } from '../../types';
import { APP_THEMES } from '../../utils/themes';

interface AppCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAppName: string;
  onUpdateCustomAppName: (name: string) => void;
  customSubtitle: string;
  onUpdateCustomSubtitle: (subtitle: string) => void;
  currentTheme: AppTheme;
  onSelectTheme: (themeId: AppThemeId) => void;
  voiceFeedbackEnabled: boolean;
  onToggleVoiceFeedback: (enabled: boolean) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: string) => boolean;
  onResetAllData: () => void;
}

export const AppCustomizerModal: React.FC<AppCustomizerModalProps> = ({
  isOpen,
  onClose,
  customAppName,
  onUpdateCustomAppName,
  customSubtitle,
  onUpdateCustomSubtitle,
  currentTheme,
  onSelectTheme,
  voiceFeedbackEnabled,
  onToggleVoiceFeedback,
  onExportAllData,
  onImportAllData,
  onResetAllData,
}) => {
  const [appNameInput, setAppNameInput] = useState(customAppName || 'AGENCHAD');
  const [subtitleInput, setSubtitleInput] = useState(customSubtitle || 'EXECUTIVE & SYNC');
  const [saveToast, setSaveToast] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveNaming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNameInput.trim()) return;
    onUpdateCustomAppName(appNameInput.trim());
    onUpdateCustomSubtitle(subtitleInput.trim());
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = onImportAllData(text);
        if (success) {
          setImportStatus('Données et personnalisations importées avec succès !');
        } else {
          setImportStatus('Fichier invalide.');
        }
      } catch {
        setImportStatus('Erreur de lecture du fichier JSON.');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0f1118] border border-slate-800 shadow-2xl flex flex-col relative text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-black shadow-lg"
              style={{
                backgroundColor: currentTheme.primaryColor,
                boxShadow: `0 0 16px ${currentTheme.glowColor}`,
              }}
            >
              <Sliders className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Studio de Personnalisation
                </h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${currentTheme.primaryColor}20`,
                    color: currentTheme.primaryColor,
                  }}
                >
                  Direct Edit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Modifiez directement le nom, le design, l'IA et les réglages de l'application
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
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Section 1: App Name & Subtitle */}
          <form onSubmit={handleSaveNaming} className="space-y-3 p-4 rounded-2xl bg-[#141724] border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Type className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
              <span>Nom de l'application & Marque</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Titre Principal
                </label>
                <input
                  type="text"
                  required
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="Ex: AGENCHAD, AGENCHAD PRO..."
                  className="w-full bg-[#0b0d13] border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Sous-titre / Slogan
                </label>
                <input
                  type="text"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  placeholder="Ex: EXECUTIVE & SYNC..."
                  className="w-full bg-[#0b0d13] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {saveToast && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>Nom mis à jour instantanément sur toute l'interface !</span>
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-black transition shadow cursor-pointer"
              style={{ backgroundColor: currentTheme.primaryColor }}
            >
              Appliquer le changement de nom
            </button>
          </form>

          {/* Section 2: Visual Themes */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#141724] border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Palette className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
              <span>Palette de Couleurs & Thème Dark Pro</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(APP_THEMES) as AppThemeId[]).map((tId) => {
                const t = APP_THEMES[tId];
                const isSelected = currentTheme.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1e2d] border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-[#0e1017] border-slate-800 hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isSelected ? t.primaryColor : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      {isSelected && <Check className="w-4 h-4" style={{ color: t.primaryColor }} />}
                    </div>
                    <span className="text-xs font-bold text-white block">{t.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{t.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Gemini & Siri Voice Settings */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#141724] border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Bot className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
                <span>Assistant Gemini & Siri</span>
              </div>
              <button
                onClick={() => onToggleVoiceFeedback(!voiceFeedbackEnabled)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  voiceFeedbackEnabled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {voiceFeedbackEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Voix Active</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Voix Muette</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              L'IA vocale répond à voix haute sur votre Xiaomi 14T Pro 5G, iPad, iPhone et PC après chaque commande vocale.
            </p>
          </div>

          {/* Section 4: Data Sync & Backup (JSON) */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#141724] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Sauvegarde & Synchronisation Multi-Appareils
              </span>
            </div>

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-300">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={onExportAllData}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0e1017] border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition cursor-pointer"
              >
                <Download className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
                <span>Exporter Sauvegarde (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0e1017] border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition cursor-pointer"
              >
                <Upload className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
                <span>Importer Sauvegarde (.json)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Remettre à zéro l'agenda de démonstration
              </span>
              <button
                onClick={() => {
                  if (confirm('Voulez-vous réinitialiser toutes les données par défaut ?')) {
                    onResetAllData();
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
