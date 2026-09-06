import React from 'react';
import { AgendaEvent, AppTheme, Collaborator } from '../../types';
import { Clock, Plus, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthViewProps {
  currentDate?: Date;
  events?: AgendaEvent[];
  collaborators?: Collaborator[];
  onSelectDate: (date: Date) => void;
  onEditEvent: (event: AgendaEvent) => void;
  onOpenNewEventModal: () => void;
  theme?: AppTheme;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate = new Date(),
  events = [],
  collaborators = [],
  onSelectDate,
  onEditEvent,
  onOpenNewEventModal,
  theme,
}) => {
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();

  const year = safeDate.getFullYear();
  const month = safeDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  // Monday = 0, Sunday = 6
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Grid calculation to produce complete rectangular rows (35 or 42 cells)
  const totalDaysSoFar = adjustedFirstDay + daysInMonth;
  const totalCells = Math.ceil(totalDaysSoFar / 7) * 7;
  const trailingDays = totalCells - totalDaysSoFar;

  const dayLabels = [
    { full: 'Lundi', short: 'Lun', mini: 'L' },
    { full: 'Mardi', short: 'Mar', mini: 'M' },
    { full: 'Mercredi', short: 'Mer', mini: 'M' },
    { full: 'Jeudi', short: 'Jeu', mini: 'J' },
    { full: 'Vendredi', short: 'Ven', mini: 'V' },
    { full: 'Samedi', short: 'Sam', mini: 'S' },
    { full: 'Dimanche', short: 'Dim', mini: 'D' },
  ];

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayOfWeekNames = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`;
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);

  const activeColor = theme?.primaryColor || '#f59e0b';
  const glowColor = theme?.glowColor || 'rgba(245, 158, 11, 0.4)';

  const getCollab = (id: string) => (collaborators || []).find((c) => c.id === id);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden bg-[#0a0c12]">
      {/* Month Calendar Card / Grid Section */}
      <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-[#0d0f15] lg:overflow-y-auto">
        {/* Sticky Day of Week Header */}
        <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-slate-800 bg-[#12141c] text-center text-xs font-bold text-slate-400 py-2.5 shadow-sm">
          {dayLabels.map((lbl, i) => (
            <span key={i} className="px-1 select-none">
              <span className="hidden md:inline">{lbl.full}</span>
              <span className="hidden sm:inline md:hidden">{lbl.short}</span>
              <span className="sm:hidden font-mono text-[11px] text-slate-300">{lbl.short}</span>
            </span>
          ))}
        </div>

        {/* Month grid cells */}
        <div className="grid grid-cols-7 flex-1 border-collapse select-none">
          {/* Previous month days */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => {
            const dayNum = daysInPrevMonth - adjustedFirstDay + i + 1;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            return (
              <div
                key={`prev-${i}`}
                onClick={() => onSelectDate(prevMonthDate)}
                className="p-1 sm:p-2 border-r border-b border-slate-800/40 bg-[#0a0c12]/40 text-slate-600 text-xs h-14 sm:h-20 lg:min-h-[85px] lg:h-auto cursor-pointer hover:bg-slate-900/30 transition flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-slate-600 pl-0.5">{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvs = events.filter((e) => e.date === dateStr);

            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const isSelected =
              dayNum === safeDate.getDate() &&
              month === safeDate.getMonth() &&
              year === safeDate.getFullYear();

            return (
              <div
                key={`curr-${dayNum}`}
                onClick={() => onSelectDate(dateObj)}
                className={`p-1 sm:p-2 border-r border-b border-slate-800/60 transition cursor-pointer flex flex-col justify-between h-14 sm:h-20 lg:min-h-[85px] lg:h-auto group relative ${
                  isSelected
                    ? 'bg-slate-800/40'
                    : 'hover:bg-slate-800/30 bg-[#0f1118]'
                }`}
                style={{
                  boxShadow: isSelected ? `inset 0 0 0 1.5px ${activeColor}` : undefined,
                }}
              >
                {/* Cell Header: Day Number & Event Count Badge */}
                <div className="flex items-center justify-between pointer-events-none">
                  <span
                    className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'text-black font-extrabold shadow-md scale-105'
                        : isToday
                        ? 'border-2 text-white font-bold'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                    style={{
                      backgroundColor: isSelected ? activeColor : undefined,
                      borderColor: isToday && !isSelected ? activeColor : undefined,
                      boxShadow: isSelected ? `0 0 12px ${glowColor}` : undefined,
                    }}
                  >
                    {dayNum}
                  </span>

                  {dayEvs.length > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold hidden sm:inline"
                      style={{
                        backgroundColor: `${activeColor}20`,
                        color: activeColor,
                      }}
                    >
                      {dayEvs.length}
                    </span>
                  )}
                </div>

                {/* Mobile View: Event Indicator Dots (Prevents cut-offs and truncation) */}
                <div className="flex sm:hidden items-center justify-center gap-1 mt-auto pb-0.5 pointer-events-none">
                  {dayEvs.slice(0, 3).map((ev, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm"
                      style={{
                        backgroundColor: ev.color || activeColor,
                        boxShadow: `0 0 6px ${ev.color || activeColor}`,
                      }}
                    />
                  ))}
                  {dayEvs.length > 3 && (
                    <span className="text-[8px] text-slate-400 font-mono font-bold">
                      +{dayEvs.length - 3}
                    </span>
                  )}
                </div>

                {/* Tablet & Desktop View: Event Labels */}
                <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden pointer-events-none">
                  {dayEvs.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center gap-1 shadow-sm"
                      style={{
                        backgroundColor: `${ev.color || activeColor}22`,
                        color: ev.color || activeColor,
                        borderLeft: `2.5px solid ${ev.color || activeColor}`,
                      }}
                    >
                      <span className="font-mono text-[9px] font-bold">{ev.startTime}</span>
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvs.length > 2 && (
                    <span
                      className="text-[9px] font-semibold pl-1"
                      style={{ color: activeColor }}
                    >
                      +{dayEvs.length - 2} autre{dayEvs.length - 2 > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next month days to complete the 35 or 42 grid */}
          {Array.from({ length: trailingDays }).map((_, i) => {
            const dayNum = i + 1;
            const nextMonthDate = new Date(year, month + 1, dayNum);
            return (
              <div
                key={`next-${i}`}
                onClick={() => onSelectDate(nextMonthDate)}
                className="p-1 sm:p-2 border-r border-b border-slate-800/40 bg-[#0a0c12]/40 text-slate-600 text-xs h-14 sm:h-20 lg:min-h-[85px] lg:h-auto cursor-pointer hover:bg-slate-900/30 transition flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-slate-600 pl-0.5">{dayNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda & Tasks Side Panel */}
      <div className="w-full lg:w-96 bg-[#11131c] p-4 lg:p-5 flex flex-col shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" style={{ color: activeColor }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Agenda du jour
              </span>
            </div>
            <h4 className="text-base font-black text-white mt-0.5 capitalize">
              {dayOfWeekNames[safeDate.getDay()]} {safeDate.getDate()} {monthNames[safeDate.getMonth()]}
            </h4>
            <p className="text-xs text-slate-400">
              {selectedDayEvents.length} rendez-vous et rappel{selectedDayEvents.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onOpenNewEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-black transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 16px ${glowColor}`,
            }}
            title="Ajouter un événement"
          >
            <Plus className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 my-auto">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h5 className="text-sm font-bold text-slate-300">Aucun rendez-vous planifié</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Votre emploi du temps est libre pour cette journée.
            </p>
            <button
              onClick={onOpenNewEventModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: `${activeColor}20`,
                color: activeColor,
                border: `1px solid ${activeColor}40`,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Planifier un événement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onEditEvent(ev)}
                className="p-3.5 rounded-2xl bg-[#161924] border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {/* Color highlight bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: ev.color || activeColor }}
                />

                <div className="flex items-start justify-between gap-2 pl-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${ev.color || activeColor}25`,
                          color: ev.color || activeColor,
                        }}
                      >
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800/80">
                        {ev.category}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white mt-2 group-hover:text-amber-300 transition truncate">
                      {ev.title}
                    </h5>

                    {ev.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0 mt-1" />
                </div>

                {ev.collaboratorIds && ev.collaboratorIds.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 pl-1.5">
                    <span className="text-[11px] text-slate-500">Collaborateurs</span>
                    <div className="flex -space-x-1.5">
                      {ev.collaboratorIds.map((cId) => {
                        const collab = getCollab(cId);
                        if (!collab) return null;
                        return (
                          <img
                            key={cId}
                            src={collab.avatar}
                            alt={collab.name}
                            title={collab.name}
                            className="w-5 h-5 rounded-full object-cover border-2 border-slate-900"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

