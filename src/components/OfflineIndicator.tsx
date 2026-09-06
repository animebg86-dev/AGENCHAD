import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-700/60 px-3.5 py-2 text-xs font-medium text-emerald-300 shadow-xl backdrop-blur-md">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span>Connexion rétablie — Synchronisation active.</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-700/60 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-xl backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>Mode hors-ligne — Vos données restent disponibles et enregistrées localement.</span>
    </div>
  );
};
