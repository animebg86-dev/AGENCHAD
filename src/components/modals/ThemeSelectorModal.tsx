import React from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { AppTheme, AppThemeId } from '../../types';
import { APP_THEMES } from '../../utils/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(APP_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#11131c] border border-slate-800 shadow-2xl p-6 text-slate-100 relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white">
              <Palette className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personnaliser le Thème</h3>
              <p className="text-xs text-slate-400">
                Ambre, Violet, Rouge, Noir Titane, Émeraude, Cyan...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="space-y-2.5">
          {themeList.map((t) => {
            const isSelected = t.id === currentThemeId;

            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#181b28] border-slate-600 shadow-lg'
                    : 'bg-[#141622]/60 border-slate-800/80 hover:bg-[#181b28]/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color preview circle with glow */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-md relative shrink-0"
                    style={{
                      backgroundColor: t.primaryColor,
                      boxShadow: `0 0 12px ${t.glowColor}`,
                    }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-black font-bold stroke-[3]" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          (Actif)
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">{t.tagline}</p>
                  </div>
                </div>

                {/* Swatch gradient preview pill */}
                <div
                  className="w-10 h-5 rounded-full border border-slate-700/80"
                  style={{
                    background: `linear-gradient(to right, ${t.gradientFrom}, ${t.gradientTo})`,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vous pouvez aussi dire à l'IA : "Passe au thème violet / rouge / noir" !</span>
          </p>
        </div>
      </div>
    </div>
  );
};
