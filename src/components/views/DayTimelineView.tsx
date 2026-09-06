import React from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  MoreVertical,
  Bell,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Users,
} from 'lucide-react';
import { AgendaEvent, Collaborator, AppTheme } from '../../types';
import { motion } from 'motion/react';

interface DayTimelineViewProps {
  date: Date;
  events: AgendaEvent[];
  collaborators: Collaborator[];
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: AgendaEvent) => void;
  onDeleteEvent: (id: string) => void;
  onOpenNewEventModal: () => void;
  theme?: AppTheme;
}

export const DayTimelineView: React.FC<DayTimelineViewProps> = ({
  date = new Date(),
  events = [],
  collaborators = [],
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onOpenNewEventModal,
  theme,
}) => {
  const safeDate =
    date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const dateStr = `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`;
  
  // Filter events for this day and sort chronologically
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = dayEvents.filter((e) => e.isCompleted).length;

  const getCollab = (id: string) => collaborators.find((c) => c.id === id);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      {/* Daily Summary Card (Inspired by Image 2 & 3) */}
      <div className="mb-6 p-4 rounded-2xl bg-[#151823] border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Planning & Rappels du jour</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40">
              {dayEvents.length} événements
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronisation active avec vos partenaires et rappels programmés
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedCount} terminés</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{dayEvents.length - completedCount} restants</span>
          </div>
          <button
            onClick={onOpenNewEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-black font-bold transition text-xs shadow-sm cursor-pointer active:scale-95"
            style={{
              backgroundColor: theme ? theme.primaryColor : '#6366f1',
              boxShadow: theme ? `0 0 10px ${theme.glowColor}` : undefined,
            }}
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#151823]/40 border border-slate-800/50 p-8">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-200">Aucun rendez-vous pour ce jour</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Ajoutez un rendez-vous ou un rappel quotidien partagé pour commencer votre journée.
          </p>
          <button
            onClick={onOpenNewEventModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-black text-xs font-bold transition cursor-pointer active:scale-95"
            style={{
              backgroundColor: theme ? theme.primaryColor : '#6366f1',
              boxShadow: theme ? `0 0 14px ${theme.glowColor}` : undefined,
            }}
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Créer un rappel ou rendez-vous</span>
          </button>
        </div>
      ) : (
        /* Vertical connected timeline (Faithfully inspired by Reference Image 2) */
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-800">
          {dayEvents.map((event, idx) => {
            const isDone = event.isCompleted;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Node indicator circle on connecting line */}
                <button
                  onClick={() => onToggleComplete(event.id)}
                  title={isDone ? 'Marquer non fait' : 'Marquer fait'}
                  className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer z-10 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                      : 'bg-[#151823] border-2 text-transparent hover:text-slate-400'
                  }`}
                  style={{ borderColor: isDone ? '#10b981' : event.color || '#6366f1' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                {/* Event Card (Image 2 & 4 style) */}
                <div
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isDone
                      ? 'bg-[#12141c]/80 border-slate-800/60 opacity-65'
                      : 'bg-[#151823] border-slate-800/90 hover:border-slate-700 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Time pill */}
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>
                            {event.startTime}
                            {!event.isDailyReminder && event.endTime ? ` - ${event.endTime}` : ''}
                          </span>
                        </span>

                        {/* Category tag */}
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${event.color}18`,
                            color: event.color,
                            border: `1px solid ${event.color}35`,
                          }}
                        >
                          {event.category}
                        </span>

                        {/* Daily Reminder Badge */}
                        {event.isDailyReminder && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Rappel Quotidien
                          </span>
                        )}

                        {/* Notification lead badge */}
                        {event.reminderMinutesBefore !== undefined && event.reminderMinutesBefore > 0 && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Bell className="w-2.5 h-2.5 text-indigo-400" />
                            {event.reminderMinutesBefore}m avant
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm sm:text-base font-bold text-white mt-1 ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {event.title}
                      </h4>

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                          {event.description}
                        </p>
                      )}

                      {/* Location & Collaborators footer */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
                        {event.location ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* Collaborator Avatars (multi-user 2-3 people) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">
                            Partagé avec :
                          </span>
                          <div className="flex -space-x-1.5">
                            {event.collaboratorIds.map((cId) => {
                              const collab = getCollab(cId);
                              if (!collab) return null;
                              return (
                                <img
                                  key={cId}
                                  src={collab.avatar}
                                  alt={collab.name}
                                  title={`${collab.name} (${collab.role})`}
                                  className="w-5 h-5 rounded-full object-cover border border-[#151823]"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
