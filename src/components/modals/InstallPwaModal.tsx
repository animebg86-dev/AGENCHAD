import React, { useState } from 'react';
import { X, Smartphone, Monitor, Apple, Download, CheckCircle2, ShieldCheck, Zap, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'pc' | 'ios'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (isInstallable) {
      await install();
      onClose();
    }
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#151823] border border-slate-700/60 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Installer sur Mobile & PC</h3>
            <p className="text-xs text-slate-400">Application autonome, ultra fluide et synchronisée hors-ligne</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[#0e1017] p-1 border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'android' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android / APK</span>
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pc' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>PC & Mac</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ios' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple iOS</span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Installation directe Android (WebAPK)</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Android génère directement un package <strong>WebAPK natif</strong> avec icône sur l'écran d'accueil, affichage plein écran sans barre d'adresse et notifications push en arrière-plan.
                  </p>
                </div>
              </div>
              {isInstallable && (
                <button
                  onClick={handleNativeInstall}
                  className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-950"
                >
                  <Download className="w-4 h-4" />
                  Installer instantanément sur Android
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">1</span>
                <span>Ouvrez le lien sur <strong>Google Chrome</strong> ou <strong>Brave</strong> sur votre téléphone.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">2</span>
                <span>Appuyez sur les <strong>3 points verticaux (⋮)</strong> en haut à droite.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">3</span>
                <span>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">4</span>
                <span>L'application s'installe comme une véritable application APK Android !</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pc' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" />
                Application de Bureau pour Windows / Mac / Linux
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Profitez d'une fenêtre dédiée indépendante de votre navigateur avec raccourci sur le bureau et dans le menu Démarrer.
              </p>
              {isInstallable && (
                <button
                  onClick={handleNativeInstall}
                  className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Installer sur cet ordinateur
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p>Dans <strong>Chrome</strong> ou <strong>Edge</strong> sur PC :</p>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cliquez sur l'icône <strong>d'installation (ordinateur avec flèche)</strong> dans la barre d'adresse à droite.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validez en cliquant sur <strong>« Installer »</strong>.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-200" />
                Installation sur iPhone & iPad (Safari)
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Sur iOS, Safari permet d'installer l'agenda en pleine page avec l'icône officielle et la prise en charge des notifications locales.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">1</span>
                <span>Ouvrez cette page dans <strong>Safari</strong> sur votre iPhone.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">2</span>
                <span className="flex items-center gap-1.5">
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline text-indigo-400" /> (en bas de Safari).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">3</span>
                <span>Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[11px]">4</span>
                <span>Touchez <strong>« Ajouter »</strong> en haut à droite.</span>
              </div>
            </div>
          </div>
        )}

        {/* Copy link bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 truncate">
            Lien d'accès : <span className="text-slate-300 font-mono text-[11px]">{window.location.host}</span>
          </div>
          <button
            onClick={copyAppUrl}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-1.5"
          >
            {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>{copiedUrl ? 'Lien copié !' : 'Copier le lien'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
