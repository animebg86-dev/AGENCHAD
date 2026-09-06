import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Flame,
  ArrowUpRight,
  Plus,
  Bot,
  Users,
} from 'lucide-react';
import { AgendaEvent, AppTheme, Collaborator } from '../types';

interface ExecutiveOverviewProps {
  currentDate?: Date;
  events?: AgendaEvent[];
  collaborators?: Collaborator[];
  theme: AppTheme;
  onOpenNewEventModal?: () => void;
  onOpenAssistantModal?: () => void;
  onSelectEvent?: (event: AgendaEvent) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  currentDate = new Date(),
  events = [],
  collaborators = [],
  theme,
  onOpenNewEventModal,
  onOpenAssistantModal,
  onSelectEvent,
}) => {
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();
  const dateStr = `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`;
  
  const todayEvents = events.filter((e) => e.date === dateStr);
  const doneCount = events.filter((e) => e.isCompleted).length;
  const inProgressCount = todayEvents.filter((e) => !e.isCompleted).length;
  const totalRoutinesCount = events.filter((e) => e.isDailyReminder).length;
  const pendingCount = events.filter((e) => !e.isCompleted).length;

  // Find the next upcoming or active event today
  const activeEvent = todayEvents.find((e) => !e.isCompleted) || todayEvents[0] || events[0];

  const getCollab = (id: string) => (collaborators || []).find((c) => c.id === id);

  return (
    <div className="mb-6 space-y-4">
      {/* Top Greeting & Pending count (Inspired by center screen of reference image) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Bonjour</span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                border: `1px solid ${theme.badgeBorder}`,
              }}
            >
              Agenda Pro
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-semibold text-slate-200">{pendingCount} tâches & rendez-vous</span> à traiter
          </p>
        </div>

        {/* Action Pills: Siri / Gemini Voice & New Task */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAssistantModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-lg cursor-pointer hover:scale-102 active:scale-98"
            style={{
              backgroundColor: theme.primaryColor,
              color: '#000000',
              boxShadow: `0 0 20px ${theme.glowColor}`,
            }}
          >
            <Bot className="w-4 h-4 text-black" />
            <span>Assistant Vocal IA</span>
          </button>

          <button
            onClick={onOpenNewEventModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700/80 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Featured Active Card (Inspired by reference image: "Mobile App Design - Mike and Anita") */}
      {activeEvent && (
        <div
          onClick={() => onSelectEvent?.(activeEvent)}
          className="relative rounded-3xl p-5 border overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #181b28 0%, #10121b 100%)',
            borderColor: `${theme.primaryColor}35`,
          }}
        >
          {/* Ambient decorative glow corner */}
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: theme.primaryColor }}
          />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                  }}
                >
                  {activeEvent.category}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {activeEvent.startTime} - {activeEvent.endTime || activeEvent.startTime}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100 transition">
                {activeEvent.title}
              </h3>

              {activeEvent.description && (
                <p className="text-xs text-slate-400 line-clamp-1 max-w-lg">
                  {activeEvent.description}
                </p>
              )}

              {/* Collaborator Avatars */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex -space-x-1.5">
                  {activeEvent.collaboratorIds.map((cId) => {
                    const collab = getCollab(cId);
                    if (!collab) return null;
                    return (
                      <img
                        key={cId}
                        src={collab.avatar}
                        alt={collab.name}
                        title={collab.name}
                        className="w-6 h-6 rounded-full object-cover border-2 border-[#151722]"
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400">
                  {activeEvent.collaboratorIds.length > 0
                    ? activeEvent.collaboratorIds.map((id) => getCollab(id)?.name).filter(Boolean).join(' & ')
                    : 'Personnel'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between self-stretch shrink-0">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-sm"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  border: `1px solid ${theme.badgeBorder}`,
                }}
              >
                En cours
              </span>

              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
            </div>
          </div>
        </div>
      )}

      {/* 4 Luxury Stat Cards (Identical layout to reference image: 22 Done, 7 In progress, 10 Ongoing, 12 Routines) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Done */}
        <div
          className="p-4 rounded-2xl border transition-all duration-200"
          style={{
            background: 'linear-gradient(145deg, #161824 0%, #0e1017 100%)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Terminés</span>
          </div>
          <p className="text-2xl font-black text-white">{doneCount}</p>
          <p className="text-[11px] text-slate-400">Tâches validées</p>
        </div>

        {/* Card 2: In progress */}
        <div
          className="p-4 rounded-2xl border transition-all duration-200"
          style={{
            background: 'linear-gradient(145deg, #161824 0%, #0e1017 100%)',
            borderColor: `${theme.primaryColor}40`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <Clock className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <span className="text-[10px] uppercase font-bold text-slate-400">Aujourd'hui</span>
          </div>
          <p className="text-2xl font-black text-white">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400">En cours aujourd'hui</p>
        </div>

        {/* Card 3: Total events */}
        <div
          className="p-4 rounded-2xl border transition-all duration-200"
          style={{
            background: 'linear-gradient(145deg, #161824 0%, #0e1017 100%)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Planning</span>
          </div>
          <p className="text-2xl font-black text-white">{events.length}</p>
          <p className="text-[11px] text-slate-400">Total planifiés</p>
        </div>

        {/* Card 4: Routines & Quotidien */}
        <div
          className="p-4 rounded-2xl border transition-all duration-200"
          style={{
            background: 'linear-gradient(145deg, #161824 0%, #0e1017 100%)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Rappels</span>
          </div>
          <p className="text-2xl font-black text-white">{totalRoutinesCount}</p>
          <p className="text-[11px] text-slate-400">Routines actives</p>
        </div>
      </div>
    </div>
  );
};
