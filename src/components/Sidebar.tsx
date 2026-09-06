import React from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  CalendarSync,
  Plus,
  Tag,
  CheckCircle2,
  BookOpen,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Smartphone,
  Palette,
  Bot,
  Sliders,
  FolderKanban,
  UserCheck,
} from 'lucide-react';
import {
  Collaborator,
  EventCategory,
  SyncRoomState,
  AppTheme,
  UserProfile,
  ProjectGroup,
} from '../types';
import { AgenchadLogo } from './AgenchadLogo';

interface SidebarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  collaborators: Collaborator[];
  selectedCollaboratorId: string | 'all';
  onSelectCollaborator: (id: string | 'all') => void;
  selectedCategory: EventCategory | 'all';
  onSelectCategory: (cat: EventCategory | 'all') => void;
  onOpenCollaboratorModal: () => void;
  onOpenSyncModal: () => void;
  onOpenInstallModal: () => void;
  syncState: SyncRoomState;
  activeView: string;
  onSelectView: (view: any) => void;
  categoryCounts: Record<string, number>;
  theme: AppTheme;
  onOpenThemeModal: () => void;
  onOpenAssistantModal: () => void;
  userProfile?: UserProfile;
  projectGroups?: ProjectGroup[];
  activeGroupId?: string | 'personal';
  onOpenProjectGroupsModal?: () => void;
  onOpenCustomizerModal?: () => void;
  onOpenDeviceModal?: () => void;
  customAppName?: string;
  customSubtitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDate = new Date(),
  onSelectDate,
  collaborators,
  selectedCollaboratorId,
  onSelectCollaborator,
  selectedCategory,
  onSelectCategory,
  onOpenCollaboratorModal,
  onOpenSyncModal,
  onOpenInstallModal,
  syncState,
  activeView,
  onSelectView,
  categoryCounts,
  theme,
  onOpenThemeModal,
  onOpenAssistantModal,
  userProfile = {
    id: 'user-me',
    pseudo: 'Chad',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    color: '#f59e0b',
    role: 'Leader',
  },
  projectGroups = [],
  activeGroupId = 'personal',
  onOpenProjectGroupsModal,
  onOpenCustomizerModal,
  onOpenDeviceModal,
  customAppName = 'AGENCHAD',
  customSubtitle = 'EXECUTIVE & SYNC',
}) => {
  // Safe date guarantee
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();

  // Mini calendar generator
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  // Adjust Monday as first day (0=Sun, 1=Mon, ..., 6=Sat)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onSelectDate(next);
  };

  const categories: { id: EventCategory | 'all'; label: string; color: string }[] = [
    { id: 'all', label: 'Tous les événements', color: theme.primaryColor },
    { id: 'travail', label: 'Travail & Projets', color: '#6366f1' },
    { id: 'personnel', label: 'Personnel', color: '#a855f7' },
    { id: 'sante', label: 'Santé & Routine', color: '#10b981' },
    { id: 'famille', label: 'Famille / Duo', color: '#ec4899' },
    { id: 'loisirs', label: 'Loisirs & Détente', color: '#0ea5e9' },
    { id: 'urgent', label: 'Prioritaire', color: '#ef4444' },
  ];

  const activeGroup = projectGroups.find((g) => g.id === activeGroupId);

  return (
    <aside className="w-72 bg-[#10121a] border-r border-slate-800/80 flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* App Header & Sync Room Pill */}
      <div className="p-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <AgenchadLogo size="md" theme={theme} subtitle={customSubtitle} />

          <div className="flex items-center gap-1">
            {onOpenCustomizerModal && (
              <button
                onClick={onOpenCustomizerModal}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Studio & Modifier l'app directement"
              >
                <Sliders className="w-4 h-4" style={{ color: theme.primaryColor }} />
              </button>
            )}
            <button
              onClick={onOpenThemeModal}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="Changer de thème"
            >
              <Palette className="w-4 h-4" style={{ color: theme.primaryColor }} />
            </button>
            {onOpenDeviceModal && (
              <button
                onClick={onOpenDeviceModal}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Xiaomi 14T Pro 5G, iPad & PC"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>
        </div>

        {/* Active Account / Project Workspace Switcher */}
        {onOpenProjectGroupsModal && (
          <button
            onClick={onOpenProjectGroupsModal}
            className="mt-3 w-full flex items-center justify-between p-2 rounded-2xl bg-[#151926] border border-slate-800 hover:border-slate-700 transition cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${activeGroup?.color || theme.primaryColor}20`,
                  borderColor: activeGroup?.color || theme.primaryColor,
                  color: activeGroup?.color || theme.primaryColor,
                }}
              >
                {activeGroupId === 'personal' ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <FolderKanban className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  {activeGroupId === 'personal' ? 'Espace Personnel' : 'Groupe de Projet'}
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {activeGroupId === 'personal' ? `${userProfile.pseudo} (Moi)` : activeGroup?.name}
                </span>
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 group-hover:bg-slate-800 transition"
              style={{ color: theme.primaryColor }}
            >
              Changer &gt;
            </span>
          </button>
        )}

        {/* AI Siri/Gemini quick button in sidebar */}
        <button
          onClick={onOpenAssistantModal}
          className="mt-2.5 w-full flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer group"
          style={{
            backgroundColor: theme.badgeBg,
            border: `1px solid ${theme.badgeBorder}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 group-hover:scale-110 transition" style={{ color: theme.badgeText }} />
            <span className="text-xs font-bold" style={{ color: theme.badgeText }}>
              Gemini & Siri Vocal
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Micro &gt;</span>
        </button>

        {/* Collaborators strip (Inspired by Reference Image) */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Collaborateurs (2-3)
            </span>
            <button
              onClick={onOpenCollaboratorModal}
              className="text-[11px] hover:underline flex items-center gap-1 font-semibold transition"
              style={{ color: theme.primaryColor }}
            >
              <Plus className="w-3 h-3" />
              <span>Gérer</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => onSelectCollaborator('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedCollaboratorId === 'all'
                  ? 'text-black font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
              style={
                selectedCollaboratorId === 'all'
                  ? { backgroundColor: theme.primaryColor }
                  : {}
              }
            >
              Tous
            </button>
            {collaborators.map((c) => {
              const isSelected = selectedCollaboratorId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCollaborator(c.id)}
                  title={`Filtrer pour ${c.name} (${c.role})`}
                  className={`relative p-0.5 rounded-full transition shrink-0 cursor-pointer ${
                    isSelected ? 'scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={
                    isSelected
                      ? {
                          outline: `2px solid ${theme.primaryColor}`,
                          outlineOffset: '2px',
                        }
                      : {}
                  }
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  />
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#10121a]"
                    style={{ backgroundColor: c.color }}
                  />
                </button>
              );
            })}
          </div>

          {/* Room Sync Badge */}
          <button
            onClick={onOpenCollaboratorModal}
            className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#0b0c13] border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Salon :</span>
              <span className="font-mono font-semibold text-emerald-400">{syncState.roomCode}</span>
            </div>
            <span className="text-slate-400 hover:text-white text-[10px]">Partager &gt;</span>
          </button>
        </div>
      </div>

      {/* Mini Calendar (Inspired by Reference Image: glowing dot on active day) */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-1.5">
          <span>Lu</span>
          <span>Ma</span>
          <span>Me</span>
          <span>Je</span>
          <span>Ve</span>
          <span>Sa</span>
          <span>Di</span>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {Array.from({ length: adjustedFirstDay }).map((_, i) => {
            const dayNum = daysInPrevMonth - adjustedFirstDay + i + 1;
            return (
              <span key={`prev-${i}`} className="text-slate-600 text-[11px] py-1">
                {dayNum}
              </span>
            );
          })}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected =
              dayNum === safeDate.getDate() &&
              month === safeDate.getMonth() &&
              year === safeDate.getFullYear();

            return (
              <button
                key={`curr-${dayNum}`}
                onClick={() => onSelectDate(new Date(year, month, dayNum))}
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition cursor-pointer relative ${
                  isSelected
                    ? 'text-black font-bold shadow-md'
                    : isToday
                    ? 'font-bold border'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: theme.primaryColor,
                        boxShadow: `0 0 10px ${theme.glowColor}`,
                      }
                    : isToday
                    ? {
                        borderColor: theme.primaryColor,
                        color: theme.badgeText,
                      }
                    : {}
                }
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories & Filter List */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Catégories
          </span>
        </div>

        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.label}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sync Calendars Action */}
        <div className="mt-6 pt-4 border-t border-slate-800/60">
          <button
            onClick={onOpenSyncModal}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition cursor-pointer"
          >
            <CalendarSync className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <span>Sync Google / Apple (.ics)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

