import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationToastProps {
  alert: { id: string; title: string; time: string } | null;
  onDismiss: () => void;
  onConfirm?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ alert, onDismiss, onConfirm }) => {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full bg-[#181b26] border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Rappel Agenda</span>
              <span className="text-[11px] text-slate-400">{alert.time}</span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5 truncate">{alert.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">Votre rendez-vous ou rappel est arrivé à échéance !</p>
            <div className="mt-3 flex items-center gap-2">
              {onConfirm && (
                <button
                  onClick={() => {
                    onConfirm();
                    onDismiss();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Marquer fait
                </button>
              )}
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Ignorer
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-300 transition p-1"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
