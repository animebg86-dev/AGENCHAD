import React, { useEffect, useRef } from 'react';
import { AgendaEvent, Collaborator, AppTheme } from '../../types';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';

interface WeekGridViewProps {
  currentDate: Date;
  events: AgendaEvent[];
  collaborators: Collaborator[];
  onSelectDate: (date: Date) => void;
  onEditEvent: (event: AgendaEvent) => void;
  onCreateAtSlot: (dateStr: string, timeStr: string) => void;
  theme?: AppTheme;
}

export const WeekGridView: React.FC<WeekGridViewProps> = ({
  currentDate = new Date(),
  events = [],
  collaborators = [],
  onSelectDate,
  onEditEvent,
  onCreateAtSlot,
  theme,
}) => {
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayColumnRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Compute the 7 days of the current week (starting Monday)
  const curr = new Date(safeDate);
  const dayOfWeek = curr.getDay();
  // Adjust Monday = 0
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr);
    d.setDate(curr.getDate() + mondayOffset + i);
    weekDays.push(d);
  }

  // Range from 06:00 to 23:00 (18 hours) to comfortably cover morning routines and late evening dinners
  const startHour = 6;
  const hours = Array.from({ length: 18 }, (_, i) => i + startHour); // 6:00 to 23:00

  const dayLabels = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

  const getCollab = (id: string) => (collaborators || []).find((c) => c.id === id);

  // Auto-scroll horizontally to the selected day column on mobile / small screens
  useEffect(() => {
    const selectedIndex = weekDays.findIndex(
      (d) =>
        d.getDate() === safeDate.getDate() &&
        d.getMonth() === safeDate.getMonth() &&
        d.getFullYear() === safeDate.getFullYear()
    );

    if (selectedIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetCol = dayColumnRefs.current[selectedIndex];
      if (targetCol) {
        // Sticky time column width offset is ~64px
        const stickyOffset = 64;
        const colLeft = targetCol.offsetLeft;
        const colWidth = targetCol.offsetWidth;
        const containerWidth = container.clientWidth;

        // If the column is not already comfortably visible, scroll it into view
        const targetScroll = Math.max(
          0,
          colLeft - stickyOffset - Math.max(0, (containerWidth - colWidth - stickyOffset) / 2)
        );

        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [safeDate.getDate(), safeDate.getMonth(), safeDate.getFullYear()]);

  // Format week range label (e.g. "31 août - 6 sept. 2026")
  const startD = weekDays[0];
  const endD = weekDays[6];
  const monthNames = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];
  const weekRangeLabel = `${startD.getDate()} ${monthNames[startD.getMonth()]} – ${endD.getDate()} ${monthNames[endD.getMonth()]} ${endD.getFullYear()}`;

  const shiftWeek = (direction: -1 | 1) => {
    const next = new Date(safeDate);
    next.setDate(next.getDate() + direction * 7);
    onSelectDate(next);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0f15]">
      {/* Mobile Top Week Navigator & Quick Day Pill Selector (sm:hidden) */}
      <div className="sm:hidden bg-[#12141c] border-b border-slate-800/80 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => shiftWeek(-1)}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition cursor-pointer"
            title="Semaine précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white tracking-wide">
            {weekRangeLabel}
          </span>
          <button
            onClick={() => shiftWeek(1)}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition cursor-pointer"
            title="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Quick Day Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {weekDays.map((d, i) => {
            const isToday =
              d.getDate() === new Date().getDate() &&
              d.getMonth() === new Date().getMonth() &&
              d.getFullYear() === new Date().getFullYear();

            const isSelected =
              d.getDate() === safeDate.getDate() &&
              d.getMonth() === safeDate.getMonth() &&
              d.getFullYear() === safeDate.getFullYear();

            return (
              <button
                key={i}
                onClick={() => onSelectDate(d)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition cursor-pointer flex flex-col items-center ${
                  isSelected
                    ? 'text-black font-bold shadow-sm'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: theme?.primaryColor || '#6366f1',
                        boxShadow: `0 0 10px ${theme?.glowColor || 'rgba(99,102,241,0.4)'}`,
                      }
                    : {}
                }
              >
                <span
                  className={`text-[9px] uppercase tracking-wider ${
                    isSelected ? 'text-black/80 font-bold' : 'text-slate-400'
                  }`}
                >
                  {dayLabels[i]}
                </span>
                <span className="text-xs font-bold leading-tight">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scrollable Week Canvas (Horizontal & Vertical Unified Scroll) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto bg-[#0d0f15] scrollbar-thin scroll-smooth"
      >
        <div className="min-w-[880px] md:min-w-full flex flex-col min-h-full pb-36 sm:pb-28">
          {/* Sticky 7-Day Header Row */}
          <div className="sticky top-0 z-30 flex border-b border-slate-800 bg-[#12141c] shrink-0">
            {/* GMT+2 top-left pinned intersection cell */}
            <div className="sticky left-0 z-40 w-16 sm:w-20 shrink-0 p-2 sm:p-2.5 border-r border-slate-800/80 bg-[#12141c] text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400">GMT+2</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase">Heures</span>
            </div>

            {/* 7 Day Column Headers */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-slate-800/80">
              {weekDays.map((d, i) => {
                const isToday =
                  d.getDate() === new Date().getDate() &&
                  d.getMonth() === new Date().getMonth() &&
                  d.getFullYear() === new Date().getFullYear();

                const isSelected =
                  d.getDate() === safeDate.getDate() &&
                  d.getMonth() === safeDate.getMonth() &&
                  d.getFullYear() === safeDate.getFullYear();

                return (
                  <button
                    key={i}
                    onClick={() => onSelectDate(d)}
                    className={`p-2.5 text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 text-white'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                      {dayLabels[i]}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-sm font-bold px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isSelected
                          ? 'text-white'
                          : 'text-slate-200'
                      }`}
                      style={
                        isSelected && !isToday
                          ? {
                              backgroundColor: theme?.primaryColor || '#6366f1',
                              color: '#000000',
                            }
                          : {}
                      }
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Content with Hourly Slots and Sticky Left Time Column */}
          <div className="flex-1 flex">
            {/* Sticky Time Labels Column on Left */}
            <div className="sticky left-0 z-20 w-16 sm:w-20 shrink-0 border-r border-slate-800/80 bg-[#10121a] shadow-lg">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-20 border-b border-slate-800/60 p-2 text-right text-[11px] font-mono text-slate-400 flex items-start justify-end"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 7 Days Grid Columns */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-slate-800/60 min-h-full">
              {weekDays.map((d, colIdx) => {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const colEvents = events.filter((e) => e.date === dateStr);

                const isSelected =
                  d.getDate() === safeDate.getDate() &&
                  d.getMonth() === safeDate.getMonth() &&
                  d.getFullYear() === safeDate.getFullYear();

                return (
                  <div
                    key={colIdx}
                    ref={(el) => {
                      dayColumnRefs.current[colIdx] = el;
                    }}
                    className={`relative transition ${
                      isSelected
                        ? 'bg-[#121624]/60'
                        : 'bg-[#0f1117] hover:bg-[#12141c]/40'
                    }`}
                  >
                    {/* Hourly background slot cells */}
                    {hours.map((h) => {
                      const hourStr = `${String(h).padStart(2, '0')}:00`;
                      return (
                        <div
                          key={h}
                          onClick={() => onCreateAtSlot(dateStr, hourStr)}
                          className="h-20 border-b border-slate-800/40 hover:bg-indigo-950/20 cursor-pointer transition relative group"
                          title={`Ajouter un événement le ${dateStr} à ${hourStr}`}
                        >
                          <Plus className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition" />
                        </div>
                      );
                    })}

                    {/* Render Events within this day column (with spacious 115px+ width) */}
                    {colEvents.map((ev) => {
                      const [startH, startM] = ev.startTime.split(':').map(Number);
                      const [endH, endM] = (ev.endTime || ev.startTime).split(':').map(Number);

                      if (isNaN(startH)) return null;

                      // Position in pixels relative to base startHour (6:00)
                      const startMinutesFromBase = (startH - startHour) * 60 + (startM || 0);
                      const endMinutesFromBase = (endH - startHour) * 60 + (endM || 0);
                      const durationMinutes = Math.max(30, endMinutesFromBase - startMinutesFromBase);

                      const topPx = (startMinutesFromBase / 60) * 80;
                      const heightPx = Math.max(52, (durationMinutes / 60) * 80);

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent(ev);
                          }}
                          style={{
                            top: `${Math.max(0, topPx)}px`,
                            height: `${heightPx}px`,
                            backgroundColor: `${ev.color || '#6366f1'}22`,
                            borderColor: `${ev.color || '#6366f1'}55`,
                            boxShadow: `0 2px 10px ${ev.color || '#6366f1'}15`,
                          }}
                          className="absolute left-1 right-1 rounded-xl border p-2 text-xs overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 z-10 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span
                                className="font-mono text-[10px] font-bold tracking-tight whitespace-nowrap"
                                style={{ color: ev.color || '#818cf8' }}
                              >
                                {ev.startTime} - {ev.endTime}
                              </span>
                              {ev.isCompleted && (
                                <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓</span>
                              )}
                            </div>
                            <h5 className="font-semibold text-white text-[11px] leading-snug break-words line-clamp-2">
                              {ev.title}
                            </h5>
                            {ev.location && (
                              <span className="text-[10px] text-slate-400 truncate block mt-0.5 opacity-85">
                                📍 {ev.location}
                              </span>
                            )}
                          </div>

                          {/* Footer with avatars & category badge */}
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                            <div className="flex -space-x-1 overflow-hidden">
                              {ev.collaboratorIds.map((cId) => {
                                const collab = getCollab(cId);
                                if (!collab) return null;
                                return (
                                  <img
                                    key={cId}
                                    src={collab.avatar}
                                    alt={collab.name}
                                    title={collab.name}
                                    className="w-4 h-4 rounded-full object-cover border border-[#12141c]"
                                  />
                                );
                              })}
                            </div>
                            {ev.category && (
                              <span
                                className="text-[9px] px-1 rounded uppercase font-bold tracking-wider opacity-80 truncate max-w-[60px]"
                                style={{ color: ev.color || '#818cf8' }}
                              >
                                {ev.category}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
