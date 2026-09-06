import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  BellRing,
  Menu,
  Sparkles,
  Volume2,
  Palette,
  Bot,
} from 'lucide-react';
import { ViewMode, AppTheme } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface CalendarHeaderProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenNewEventModal: () => void;
  onOpenInstallModal: () => void;
  onToggleMobileSidebar: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  onTestNotification: () => void;
  theme: AppTheme;
  onOpenThemeModal: () => void;
  onOpenAssistantModal: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate = new Date(),
  onSelectDate,
  viewMode,
  onSelectViewMode,
  onOpenNewEventModal,
  onOpenInstallModal,
  onToggleMobileSidebar,
  notificationPermission,
  onRequestNotificationPermission,
  onTestNotification,
  theme,
  onOpenThemeModal,
  onOpenAssistantModal,
}) => {
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const formattedDate = `${safeDate.getDate()} ${monthNames[safeDate.getMonth()]} ${safeDate.getFullYear()}`;

  const goToToday = () => {
    onSelectDate(new Date());
  };

  const shiftDate = (direction: -1 | 1) => {
    const next = new Date(safeDate);
    if (viewMode === 'day' || viewMode === 'timeline') {
      next.setDate(next.getDate() + direction);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else if (viewMode === 'month') {
      next.setMonth(next.getMonth() + direction);
    } else {
      next.setDate(next.getDate() + direction);
    }
    onSelectDate(next);
  };

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'day', label: 'Jour' },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <header className="px-4 py-3 bg-[#11131c] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Left: Mobile menu toggle + Date & Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition cursor-pointer"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-black text-white whitespace-nowrap tracking-tight">
            {formattedDate}
          </h2>
          <button
            onClick={goToToday}
            className="hidden sm:inline-flex ml-2 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: View Switcher (Timeline, Jour, Semaine, Mois, Notes) */}
      <div className="flex rounded-xl bg-[#0a0c12] p-1 border border-slate-800 order-last sm:order-none w-full sm:w-auto justify-between sm:justify-start">
        {viewTabs.map((tab) => {
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectViewMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center ${
                isActive
                  ? 'text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: theme.primaryColor,
                      boxShadow: `0 0 12px ${theme.glowColor}`,
                    }
                  : {}
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Siri/Gemini AI + Theme + Notifications + PWA Install + Add */}
      <div className="flex items-center gap-2">
        {/* Gemini & Siri AI Assistant Button */}
        <button
          onClick={onOpenAssistantModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer hover:scale-102 active:scale-98"
          style={{
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            border: `1px solid ${theme.badgeBorder}`,
          }}
          title="Assistant Vocal Siri & Gemini"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Gemini & Siri</span>
        </button>

        {/* Theme Picker Button */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
          title="Changer de thème (Ambre, Violet, Rouge, Noir...)"
        >
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{
              backgroundColor: theme.primaryColor,
              boxShadow: `0 0 6px ${theme.glowColor}`,
            }}
          />
          <span className="hidden sm:inline">Thème</span>
        </button>

        {/* Notification toggle */}
        <button
          onClick={() => {
            if (notificationPermission !== 'granted') {
              onRequestNotificationPermission();
            } else {
              onTestNotification();
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
            notificationPermission === 'granted'
              ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-800'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
          }`}
          title={
            notificationPermission === 'granted'
              ? 'Notifications actives (Cliquer pour tester)'
              : 'Activer les notifications du navigateur'
          }
        >
          {notificationPermission === 'granted' ? (
            <>
              <BellRing className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Notifs ON</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="hidden lg:inline">Activer Notifs</span>
            </>
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton onOpenInstallModal={onOpenInstallModal} />

        {/* New Event / Reminder Button */}
        <button
          onClick={onOpenNewEventModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-black text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
          style={{
            backgroundColor: theme.primaryColor,
            boxShadow: `0 0 14px ${theme.glowColor}`,
          }}
        >
          <Plus className="w-4 h-4 text-black" />
          <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>
    </header>
  );
};

