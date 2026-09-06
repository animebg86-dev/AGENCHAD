import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Apple } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenInstallModal: () => void;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenInstallModal, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      onOpenInstallModal();
    }
  };

  if (isInstalled) {
    return (
      <button
        onClick={onOpenInstallModal}
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-emerald-400 font-medium transition hover:bg-emerald-900/30 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
        }`}
        title="Application installée"
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>{compact ? 'Installé' : 'App Active'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <button
        onClick={onOpenInstallModal}
        className={`flex items-center gap-1.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 font-medium transition hover:bg-indigo-900/40 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <Apple className="w-3.5 h-3.5 text-indigo-300" />
        <span>{compact ? 'Installer' : 'Installer sur iPhone'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={installing}
      className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium shadow-md shadow-indigo-900/30 transition active:scale-95 cursor-pointer ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
      }`}
      title="Installer sur PC ou Téléphone Android (APK)"
    >
      {isInstallable ? <Download className="w-3.5 h-3.5 animate-pulse" /> : <Smartphone className="w-3.5 h-3.5" />}
      <span>{compact ? 'Installer' : 'Installer App / APK'}</span>
    </button>
  );
};
