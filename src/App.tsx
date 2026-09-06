/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AgendaEvent,
  Collaborator,
  EventCategory,
  PersonalNote,
  SyncRoomState,
  ViewMode,
} from './types';
import {
  DEFAULT_COLLABORATORS,
  DEFAULT_USER_PROFILE,
  DEFAULT_PROJECT_GROUPS,
  INITIAL_EVENTS,
  INITIAL_NOTES,
  STORAGE_KEYS,
  syncChannel,
} from './utils/storage';
import { useNotifications, playNotificationChime } from './hooks/useNotifications';
import { Sidebar } from './components/Sidebar';
import { CalendarHeader } from './components/CalendarHeader';
import { DayTimelineView } from './components/views/DayTimelineView';
import { WeekGridView } from './components/views/WeekGridView';
import { MonthView } from './components/views/MonthView';
import { NotesView } from './components/views/NotesView';
import { EventModal } from './components/modals/EventModal';
import { CollaboratorModal } from './components/modals/CollaboratorModal';
import { InstallPwaModal } from './components/modals/InstallPwaModal';
import { CalendarSyncModal } from './components/modals/CalendarSyncModal';
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { ProjectGroupsModal } from './components/modals/ProjectGroupsModal';
import { AppCustomizerModal } from './components/modals/AppCustomizerModal';
import { DeviceIntegrationModal } from './components/modals/DeviceIntegrationModal';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { NotificationToast } from './components/NotificationToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { APP_THEMES, DEFAULT_THEME_ID } from './utils/themes';
import { AppThemeId, AIAssistantAction, UserProfile, ProjectGroup } from './types';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Users,
  Smartphone,
  Plus,
  Bot,
  Sparkles,
  Sliders,
  FolderKanban,
} from 'lucide-react';

export default function App() {
  // Theme State
  const [themeId, setThemeId] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('agendasync_theme') as AppThemeId;
      return saved && APP_THEMES[saved] ? saved : DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const currentTheme = APP_THEMES[themeId] || APP_THEMES[DEFAULT_THEME_ID];

  const handleSelectTheme = (newThemeId: AppThemeId) => {
    setThemeId(newThemeId);
    try {
      localStorage.setItem('agendasync_theme', newThemeId);
    } catch {}
  };

  // Custom App Branding & Title (Direct App Modification)
  const [customAppName, setCustomAppName] = useState<string>(() => {
    try {
      return localStorage.getItem('agenchad_app_name') || 'AGENCHAD';
    } catch {
      return 'AGENCHAD';
    }
  });

  const [customSubtitle, setCustomSubtitle] = useState<string>(() => {
    try {
      return localStorage.getItem('agenchad_app_subtitle') || 'EXECUTIVE & SYNC';
    } catch {
      return 'EXECUTIVE & SYNC';
    }
  });

  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agenchad_voice_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleUpdateCustomAppName = (name: string) => {
    setCustomAppName(name);
    try {
      localStorage.setItem('agenchad_app_name', name);
    } catch {}
  };

  const handleUpdateCustomSubtitle = (sub: string) => {
    setCustomSubtitle(sub);
    try {
      localStorage.setItem('agenchad_app_subtitle', sub);
    } catch {}
  };

  const handleToggleVoiceFeedback = (enabled: boolean) => {
    setVoiceFeedbackEnabled(enabled);
    try {
      localStorage.setItem('agenchad_voice_enabled', JSON.stringify(enabled));
    } catch {}
  };

  // User Profile State (Pseudo, Avatar, Color)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // Project Groups State
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_GROUPS);
      return saved ? JSON.parse(saved) : DEFAULT_PROJECT_GROUPS;
    } catch {
      return DEFAULT_PROJECT_GROUPS;
    }
  });

  // Active Workspace / Group (either 'personal' or a groupId)
  const [activeGroupId, setActiveGroupId] = useState<string | 'personal'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_GROUP);
      return saved || 'personal';
    } catch {
      return 'personal';
    }
  });

  // Check URL search params for shared syncRoom
  const initialRoom = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('syncRoom');
      if (urlRoom) return urlRoom;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_ROOM);
    return saved ? JSON.parse(saved).roomCode : 'SYNC-7489';
  }, []);

  // Core States with localStorage persistence
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [notes, setNotes] = useState<PersonalNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLLABORATORS);
      return saved ? JSON.parse(saved) : DEFAULT_COLLABORATORS;
    } catch {
      return DEFAULT_COLLABORATORS;
    }
  });

  const [syncState, setSyncState] = useState<SyncRoomState>(() => ({
    roomCode: initialRoom,
    roomName: 'Salon Partagé',
    collaborators: DEFAULT_COLLABORATORS,
    lastSyncedAt: new Date().toISOString(),
    isSyncing: false,
  }));

  // UI Navigation States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isProjectGroupsModalOpen, setIsProjectGroupsModalOpen] = useState(false);
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [slotPrefillDate, setSlotPrefillDate] = useState<string | undefined>(undefined);

  // Keyboard shortcut Alt+G / Option+G to trigger Gemini & Siri assistant on PC/Mac
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsAssistantModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save User Profile & Groups
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      syncChannel?.postMessage({ type: 'SYNC_USER_PROFILE', payload: userProfile });
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECT_GROUPS, JSON.stringify(projectGroups));
      syncChannel?.postMessage({ type: 'SYNC_PROJECT_GROUPS', payload: projectGroups });
    } catch {}
  }, [projectGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP, activeGroupId);
    } catch {}
  }, [activeGroupId]);

  // Notifications hook
  const {
    permission,
    recentAlert,
    dismissRecentAlert,
    requestPermission,
    testNotification,
  } = useNotifications(events, (triggeredEvent) => {
    // Mark as notified in state
    setEvents((prev) =>
      prev.map((e) => (e.id === triggeredEvent.id ? { ...e, notified: true } : e))
    );
  });

  // Save events to localStorage and broadcast to other tabs/devices
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      syncChannel?.postMessage({ type: 'SYNC_EVENTS', payload: events });
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [events]);

  // Save notes to localStorage and broadcast
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      syncChannel?.postMessage({ type: 'SYNC_NOTES', payload: notes });
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [notes]);

  // Save collaborators to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLABORATORS, JSON.stringify(collaborators));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [collaborators]);

  // Listen to BroadcastChannel for real-time live sync between tabs/windows
  useEffect(() => {
    if (!syncChannel) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SYNC_EVENTS' && Array.isArray(e.data.payload)) {
        setEvents(e.data.payload);
      } else if (e.data?.type === 'SYNC_NOTES' && Array.isArray(e.data.payload)) {
        setNotes(e.data.payload);
      } else if (e.data?.type === 'SYNC_PROJECT_GROUPS' && Array.isArray(e.data.payload)) {
        setProjectGroups(e.data.payload);
      } else if (e.data?.type === 'SYNC_USER_PROFILE' && e.data.payload?.pseudo) {
        setUserProfile(e.data.payload);
      }
    };
    syncChannel.addEventListener('message', handleMessage);
    return () => syncChannel.removeEventListener('message', handleMessage);
  }, []);

  // Filter events based on active workspace (Personal vs. Project Group), collaborator, and category
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Workspace isolation
      const matchWorkspace =
        activeGroupId === 'personal'
          ? !ev.groupId || ev.groupId === 'personal'
          : ev.groupId === activeGroupId;

      const matchCollab =
        selectedCollaboratorId === 'all' ||
        ev.collaboratorIds.includes(selectedCollaboratorId);

      const matchCat = selectedCategory === 'all' || ev.category === selectedCategory;

      return matchWorkspace && matchCollab && matchCat;
    });
  }, [events, activeGroupId, selectedCollaboratorId, selectedCategory]);

  // Filter notes based on active workspace
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (activeGroupId === 'personal') {
        return !n.groupId || n.groupId === 'personal';
      }
      return n.groupId === activeGroupId;
    });
  }, [notes, activeGroupId]);

  // Category counts based on current workspace
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredEvents.length };
    filteredEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, [filteredEvents]);

  // Handler to toggle event completion (with sound celebration!)
  const handleToggleComplete = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextState = !e.isCompleted;
          if (nextState) {
            playNotificationChime();
          }
          return { ...e, isCompleted: nextState };
        }
        return e;
      })
    );
  }, []);

  const handleSaveEvent = useCallback((eventToSave: AgendaEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === eventToSave.id);
      const withWorkspace: AgendaEvent = {
        ...eventToSave,
        groupId: eventToSave.groupId || (activeGroupId === 'personal' ? undefined : activeGroupId),
        authorPseudo: eventToSave.authorPseudo || userProfile.pseudo,
      };

      if (exists) {
        return prev.map((e) => (e.id === withWorkspace.id ? withWorkspace : e));
      }
      return [...prev, withWorkspace];
    });
    playNotificationChime();
  }, [activeGroupId, userProfile.pseudo]);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleOpenEditEvent = useCallback((event: AgendaEvent) => {
    setEditingEvent(event);
    setSlotPrefillDate(event.date);
    setIsEventModalOpen(true);
  }, []);

  const handleCreateAtSlot = useCallback((dateStr: string, timeStr: string) => {
    setEditingEvent(null);
    setSlotPrefillDate(dateStr);
    setIsEventModalOpen(true);
  }, []);

  const handleImportEvents = useCallback((newEvents: AgendaEvent[]) => {
    setEvents((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const fresh = newEvents.filter((e) => !existingIds.has(e.id));
      return [...prev, ...fresh];
    });
    playNotificationChime();
  }, []);

  // Notes Handlers with workspace tagging
  const handleSaveNote = useCallback((noteToSave: PersonalNote) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === noteToSave.id);
      const withWorkspace: PersonalNote = {
        ...noteToSave,
        groupId: noteToSave.groupId || (activeGroupId === 'personal' ? undefined : activeGroupId),
        authorPseudo: noteToSave.authorPseudo || userProfile.pseudo,
      };

      if (exists) {
        return prev.map((n) => (n.id === withWorkspace.id ? withWorkspace : n));
      }
      return [withWorkspace, ...prev];
    });
  }, [activeGroupId, userProfile.pseudo]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleToggleChecklistItem = useCallback((noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId && n.checklist) {
          const updated = n.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          );
          return { ...n, checklist: updated, updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );
  }, []);

  // Project Groups & Workspace Handlers
  const handleSelectWorkspaceGroup = useCallback((groupId: string | 'personal') => {
    setActiveGroupId(groupId);
  }, []);

  const handleCreateProjectGroup = useCallback(
    (name: string, description?: string, color?: string) => {
      const code = `PROJ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newGroup: ProjectGroup = {
        id: `grp-${Date.now()}`,
        name,
        description: description || 'Projet d’équipe',
        color: color || currentTheme.primaryColor,
        code,
        createdAt: new Date().toISOString(),
        status: 'active',
        members: [
          {
            id: userProfile.id,
            pseudo: userProfile.pseudo,
            avatar: userProfile.avatar,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      setProjectGroups((prev) => [newGroup, ...prev]);
      setActiveGroupId(newGroup.id);
      playNotificationChime();
    },
    [currentTheme.primaryColor, userProfile]
  );

  const handleJoinProjectGroup = useCallback(
    (code: string): boolean => {
      const cleanCode = code.trim().toUpperCase();
      const existing = projectGroups.find(
        (g) => g.code.toUpperCase() === cleanCode || g.id === cleanCode
      );

      if (existing) {
        const isMember = existing.members.some((m) => m.id === userProfile.id);
        if (!isMember) {
          setProjectGroups((prev) =>
            prev.map((g) =>
              g.id === existing.id
                ? {
                    ...g,
                    members: [
                      ...g.members,
                      {
                        id: userProfile.id,
                        pseudo: userProfile.pseudo,
                        avatar: userProfile.avatar,
                        role: 'member',
                        joinedAt: new Date().toISOString(),
                      },
                    ],
                  }
                : g
            )
          );
        }
        setActiveGroupId(existing.id);
        playNotificationChime();
        return true;
      }

      // If not found in local state, join a mock team group with this code
      const joined: ProjectGroup = {
        id: `grp-${Date.now()}`,
        name: `Projet ${cleanCode}`,
        description: `Groupe de projet synchronisé avec le code ${cleanCode}`,
        color: currentTheme.primaryColor,
        code: cleanCode,
        createdAt: new Date().toISOString(),
        status: 'active',
        members: [
          {
            id: 'owner-remote',
            pseudo: 'Team Lead',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
          {
            id: userProfile.id,
            pseudo: userProfile.pseudo,
            avatar: userProfile.avatar,
            role: 'member',
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      setProjectGroups((prev) => [joined, ...prev]);
      setActiveGroupId(joined.id);
      playNotificationChime();
      return true;
    },
    [projectGroups, userProfile, currentTheme.primaryColor]
  );

  const handleLeaveOrRemoveGroup = useCallback(
    (groupId: string) => {
      setProjectGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (activeGroupId === groupId) {
        setActiveGroupId('personal');
      }
    },
    [activeGroupId]
  );

  const handleUpdateUserProfile = useCallback((updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  // Direct Customization: Backup Export, Import, Reset
  const handleExportAllData = useCallback(() => {
    const data = {
      appName: customAppName,
      subtitle: customSubtitle,
      themeId,
      voiceFeedbackEnabled,
      userProfile,
      projectGroups,
      activeGroupId,
      events,
      notes,
      collaborators,
      exportedAt: new Date().toISOString(),
      platform: 'AGENCHAD Multi-Device Sync',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenchad-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    customAppName,
    customSubtitle,
    themeId,
    voiceFeedbackEnabled,
    userProfile,
    projectGroups,
    activeGroupId,
    events,
    notes,
    collaborators,
  ]);

  const handleImportAllData = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.events && Array.isArray(data.events)) setEvents(data.events);
      if (data.notes && Array.isArray(data.notes)) setNotes(data.notes);
      if (data.projectGroups && Array.isArray(data.projectGroups)) setProjectGroups(data.projectGroups);
      if (data.userProfile && data.userProfile.pseudo) setUserProfile(data.userProfile);
      if (data.activeGroupId) setActiveGroupId(data.activeGroupId);
      if (data.appName) setCustomAppName(data.appName);
      if (data.subtitle) setCustomSubtitle(data.subtitle);
      if (data.themeId && APP_THEMES[data.themeId as AppThemeId]) handleSelectTheme(data.themeId);
      if (typeof data.voiceFeedbackEnabled === 'boolean') setVoiceFeedbackEnabled(data.voiceFeedbackEnabled);
      playNotificationChime();
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleResetAllData = useCallback(() => {
    setEvents(INITIAL_EVENTS);
    setNotes(INITIAL_NOTES);
    setUserProfile(DEFAULT_USER_PROFILE);
    setProjectGroups(DEFAULT_PROJECT_GROUPS);
    setActiveGroupId('personal');
    setCustomAppName('AGENCHAD');
    setCustomSubtitle('EXECUTIVE & SYNC');
    handleSelectTheme(DEFAULT_THEME_ID);
    playNotificationChime();
  }, []);

  // Trigger sync simulation
  const handleTriggerSync = useCallback(() => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
      }));
      playNotificationChime();
    }, 800);
  }, []);

  const handleUpdateRoomCode = useCallback((code: string) => {
    setSyncState((prev) => {
      const updated = { ...prev, roomCode: code };
      localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handler for Gemini & Siri assistant actions (create task, delete, note, nav, theme, groups)
  const handleExecuteAssistantAction = useCallback(
    (action: AIAssistantAction) => {
      if (!action || !action.type) return;

      switch (action.type) {
        case 'create_event': {
          const p = action.payload || {};
          const newEv: AgendaEvent = {
            id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: p.title || 'Nouvelle tâche',
            date:
              p.date ||
              `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
            startTime: p.startTime || '10:00',
            endTime: p.endTime || '11:00',
            category: p.category || 'travail',
            collaboratorIds: ['collab-1'],
            isDailyReminder: Boolean(p.isDailyReminder),
            isCompleted: false,
            reminderMinutesBefore: 15,
            description: p.description || 'Créé via Siri & Gemini IA',
            groupId: activeGroupId === 'personal' ? undefined : activeGroupId,
            authorPseudo: userProfile.pseudo,
          };
          handleSaveEvent(newEv);
          break;
        }

        case 'delete_event': {
          const p = action.payload || {};
          const target = events.find(
            (e) =>
              (p.eventId && e.id === p.eventId) ||
              (p.eventTitle && e.title.toLowerCase().includes(p.eventTitle.toLowerCase()))
          );
          if (target) {
            handleDeleteEvent(target.id);
          }
          break;
        }

        case 'complete_event': {
          const p = action.payload || {};
          const target = events.find(
            (e) =>
              (p.eventId && e.id === p.eventId) ||
              (p.eventTitle && e.title.toLowerCase().includes(p.eventTitle.toLowerCase()))
          );
          if (target) {
            handleToggleComplete(target.id);
          }
          break;
        }

        case 'create_note': {
          const p = action.payload || {};
          const newNote: PersonalNote = {
            id: `note-${Date.now()}`,
            title: p.title || 'Nouvelle note',
            content: p.content || '',
            category: p.category || 'Idées',
            updatedAt: new Date().toISOString(),
            isPinned: Boolean(p.isPinned),
            color: currentTheme.primaryColor,
            groupId: activeGroupId === 'personal' ? undefined : activeGroupId,
            authorPseudo: userProfile.pseudo,
            checklist: Array.isArray(p.checklist)
              ? p.checklist.map((item: any, idx: number) => ({
                  id: `chk-${idx}`,
                  text: typeof item === 'string' ? item : item.text,
                  done: Boolean(item.done),
                }))
              : undefined,
          };
          handleSaveNote(newNote);
          setViewMode('notes');
          break;
        }

        case 'delete_note': {
          const p = action.payload || {};
          const target = notes.find(
            (n) =>
              (p.noteId && n.id === p.noteId) ||
              (p.noteTitle && n.title.toLowerCase().includes(p.noteTitle.toLowerCase()))
          );
          if (target) {
            handleDeleteNote(target.id);
          }
          break;
        }

        case 'navigate': {
          const p = action.payload || {};
          if (p.view) {
            setViewMode(p.view);
          }
          break;
        }

        case 'change_theme': {
          const p = action.payload || {};
          if (p.themeId && APP_THEMES[p.themeId as AppThemeId]) {
            handleSelectTheme(p.themeId as AppThemeId);
          }
          break;
        }

        case 'create_group': {
          const p = action.payload || {};
          if (p.name) {
            handleCreateProjectGroup(p.name);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      currentDate,
      events,
      notes,
      currentTheme,
      activeGroupId,
      userProfile.pseudo,
      handleSaveEvent,
      handleDeleteEvent,
      handleToggleComplete,
      handleSaveNote,
      handleDeleteNote,
      handleCreateProjectGroup,
    ]
  );

  return (
    <div className="flex h-screen w-screen bg-[#0f1117] text-slate-100 overflow-hidden font-sans select-none">
      {/* Sidebar for Desktop & Tablet */}
      <div className="hidden lg:flex h-full">
        <Sidebar
          currentDate={currentDate}
          onSelectDate={setCurrentDate}
          collaborators={collaborators}
          selectedCollaboratorId={selectedCollaboratorId}
          onSelectCollaborator={setSelectedCollaboratorId}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenCollaboratorModal={() => setIsCollaboratorModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          syncState={syncState}
          activeView={viewMode}
          onSelectView={setViewMode}
          categoryCounts={categoryCounts}
          theme={currentTheme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
          userProfile={userProfile}
          projectGroups={projectGroups}
          activeGroupId={activeGroupId}
          onOpenProjectGroupsModal={() => setIsProjectGroupsModalOpen(true)}
          onOpenCustomizerModal={() => setIsCustomizerModalOpen(true)}
          onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
          customAppName={customAppName}
          customSubtitle={customSubtitle}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm">
          <div className="w-80 max-w-[85vw] h-full bg-[#12141c] shadow-2xl flex flex-col">
            <div className="p-3 flex justify-end border-b border-slate-800">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Fermer ✕
              </button>
            </div>
            <Sidebar
              currentDate={currentDate}
              onSelectDate={(d) => {
                setCurrentDate(d);
                setIsMobileSidebarOpen(false);
              }}
              collaborators={collaborators}
              selectedCollaboratorId={selectedCollaboratorId}
              onSelectCollaborator={(id) => {
                setSelectedCollaboratorId(id);
                setIsMobileSidebarOpen(false);
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setIsMobileSidebarOpen(false);
              }}
              onOpenCollaboratorModal={() => {
                setIsMobileSidebarOpen(false);
                setIsCollaboratorModalOpen(true);
              }}
              onOpenSyncModal={() => {
                setIsMobileSidebarOpen(false);
                setIsSyncModalOpen(true);
              }}
              onOpenInstallModal={() => {
                setIsMobileSidebarOpen(false);
                setIsInstallModalOpen(true);
              }}
              syncState={syncState}
              activeView={viewMode}
              onSelectView={(v) => {
                setViewMode(v);
                setIsMobileSidebarOpen(false);
              }}
              categoryCounts={categoryCounts}
              theme={currentTheme}
              onOpenThemeModal={() => {
                setIsMobileSidebarOpen(false);
                setIsThemeModalOpen(true);
              }}
              onOpenAssistantModal={() => {
                setIsMobileSidebarOpen(false);
                setIsAssistantModalOpen(true);
              }}
              userProfile={userProfile}
              projectGroups={projectGroups}
              activeGroupId={activeGroupId}
              onOpenProjectGroupsModal={() => {
                setIsMobileSidebarOpen(false);
                setIsProjectGroupsModalOpen(true);
              }}
              onOpenCustomizerModal={() => {
                setIsMobileSidebarOpen(false);
                setIsCustomizerModalOpen(true);
              }}
              onOpenDeviceModal={() => {
                setIsMobileSidebarOpen(false);
                setIsDeviceModalOpen(true);
              }}
              customAppName={customAppName}
              customSubtitle={customSubtitle}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          onSelectDate={setCurrentDate}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
          onOpenNewEventModal={() => {
            setEditingEvent(null);
            setSlotPrefillDate(undefined);
            setIsEventModalOpen(true);
          }}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notificationPermission={permission}
          onRequestNotificationPermission={requestPermission}
          onTestNotification={testNotification}
          theme={currentTheme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
        />

        {/* View Component Rendering */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
          {(viewMode === 'timeline' || viewMode === 'day') && (
            <div className="p-4 sm:p-6 pb-2 max-w-4xl mx-auto w-full">
              <ExecutiveOverview
                currentDate={currentDate}
                events={filteredEvents}
                collaborators={collaborators}
                theme={currentTheme}
                onOpenNewEventModal={() => {
                  setEditingEvent(null);
                  setSlotPrefillDate(undefined);
                  setIsEventModalOpen(true);
                }}
                onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
                onSelectEvent={(ev) => handleOpenEditEvent(ev)}
              />
            </div>
          )}

          {viewMode === 'timeline' && (
            <DayTimelineView
              date={currentDate}
              events={filteredEvents}
              collaborators={collaborators}
              onToggleComplete={handleToggleComplete}
              onEditEvent={handleOpenEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onOpenNewEventModal={() => {
                setEditingEvent(null);
                setSlotPrefillDate(undefined);
                setIsEventModalOpen(true);
              }}
              theme={currentTheme}
            />
          )}

          {viewMode === 'day' && (
            <DayTimelineView
              date={currentDate}
              events={filteredEvents}
              collaborators={collaborators}
              onToggleComplete={handleToggleComplete}
              onEditEvent={handleOpenEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onOpenNewEventModal={() => {
                setEditingEvent(null);
                setSlotPrefillDate(undefined);
                setIsEventModalOpen(true);
              }}
              theme={currentTheme}
            />
          )}

          {viewMode === 'week' && (
            <WeekGridView
              currentDate={currentDate}
              events={filteredEvents}
              collaborators={collaborators}
              onSelectDate={setCurrentDate}
              onEditEvent={handleOpenEditEvent}
              onCreateAtSlot={handleCreateAtSlot}
              theme={currentTheme}
            />
          )}

          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              collaborators={collaborators}
              onSelectDate={setCurrentDate}
              onEditEvent={handleOpenEditEvent}
              onOpenNewEventModal={() => {
                setEditingEvent(null);
                setSlotPrefillDate(undefined);
                setIsEventModalOpen(true);
              }}
              theme={currentTheme}
            />
          )}

          {viewMode === 'notes' && (
            <NotesView
              notes={filteredNotes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onToggleChecklistItem={handleToggleChecklistItem}
              theme={currentTheme}
            />
          )}
        </main>

        {/* Floating Voice & Gemini AI Assistant Button */}
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-30">
          <button
            id="floating-gemini-assistant-btn"
            onClick={() => setIsAssistantModalOpen(true)}
            className="group relative flex items-center justify-center sm:gap-2.5 w-11 h-11 sm:w-auto sm:px-4 sm:py-2.5 rounded-full text-black font-bold text-xs sm:text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            style={{
              backgroundColor: currentTheme.primaryColor,
              boxShadow: `0 0 20px ${currentTheme.glowColor}, 0 4px 14px rgba(0,0,0,0.5)`,
            }}
            title="Assistant Vocal IA Gemini & Siri (Alt + G)"
            aria-label="Assistant Vocal IA Gemini & Siri"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
            </span>
            <Sparkles className="w-4 h-4 text-black shrink-0" />
            <span className="hidden sm:inline tracking-wide whitespace-nowrap">Assistant IA</span>
          </button>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="sm:hidden bg-[#12141c] border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shrink-0 z-20">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              viewMode === 'timeline' || viewMode === 'day'
                ? 'font-bold'
                : 'text-slate-400'
            }`}
            style={{
              color: viewMode === 'timeline' || viewMode === 'day' ? currentTheme.primaryColor : undefined,
            }}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              viewMode === 'week' ? 'font-bold' : 'text-slate-400'
            }`}
            style={{
              color: viewMode === 'week' ? currentTheme.primaryColor : undefined,
            }}
          >
            <CalendarIcon className="w-4 h-4 mb-0.5" />
            <span>Semaine</span>
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setSlotPrefillDate(undefined);
              setIsEventModalOpen(true);
            }}
            className="w-10 h-10 rounded-full text-black flex items-center justify-center shadow-lg active:scale-95 transition -mt-3 cursor-pointer"
            style={{
              backgroundColor: currentTheme.primaryColor,
              boxShadow: `0 0 16px ${currentTheme.glowColor}`,
            }}
            title="Nouveau"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              viewMode === 'month' ? 'font-bold' : 'text-slate-400'
            }`}
            style={{
              color: viewMode === 'month' ? currentTheme.primaryColor : undefined,
            }}
          >
            <CalendarIcon className="w-4 h-4 mb-0.5" />
            <span>Mois</span>
          </button>
          <button
            onClick={() => setViewMode('notes')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              viewMode === 'notes' ? 'font-bold' : 'text-slate-400'
            }`}
            style={{
              color: viewMode === 'notes' ? currentTheme.primaryColor : undefined,
            }}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Notes</span>
          </button>
        </nav>
      </div>

      {/* Modals & Dialogs */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={editingEvent}
        selectedDate={
          slotPrefillDate ||
          `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
        }
        collaborators={collaborators}
      />

      <CollaboratorModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        collaborators={collaborators}
        onUpdateCollaborators={setCollaborators}
        syncState={syncState}
        onUpdateRoomCode={handleUpdateRoomCode}
        onTriggerSync={handleTriggerSync}
      />

      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        events={events}
        onImportEvents={handleImportEvents}
      />

      {/* Theme Picker Modal (Violet, Rouge, Noir, Ambre, Émeraude, Cyan) */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={themeId}
        onSelectTheme={handleSelectTheme}
      />

      {/* Siri & Gemini AI Voice Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        events={events}
        notes={notes}
        theme={currentTheme}
        currentDate={currentDate}
        onExecuteAction={handleExecuteAssistantAction}
      />

      {/* Project Groups & User Account Modal */}
      <ProjectGroupsModal
        isOpen={isProjectGroupsModalOpen}
        onClose={() => setIsProjectGroupsModalOpen(false)}
        userProfile={userProfile}
        onUpdateUserProfile={handleUpdateUserProfile}
        projectGroups={projectGroups}
        activeGroupId={activeGroupId}
        onSelectGroup={handleSelectWorkspaceGroup}
        onCreateGroup={handleCreateProjectGroup}
        onJoinGroup={handleJoinProjectGroup}
        onLeaveGroup={handleLeaveOrRemoveGroup}
        theme={currentTheme}
      />

      {/* App Direct Customization Studio Modal */}
      <AppCustomizerModal
        isOpen={isCustomizerModalOpen}
        onClose={() => setIsCustomizerModalOpen(false)}
        customAppName={customAppName}
        onUpdateCustomAppName={handleUpdateCustomAppName}
        customSubtitle={customSubtitle}
        onUpdateCustomSubtitle={handleUpdateCustomSubtitle}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        voiceFeedbackEnabled={voiceFeedbackEnabled}
        onToggleVoiceFeedback={handleToggleVoiceFeedback}
        onExportAllData={handleExportAllData}
        onImportAllData={handleImportAllData}
        onResetAllData={handleResetAllData}
      />

      {/* Device Integration Guide (Xiaomi 14T Pro 5G, iPad, PC) */}
      <DeviceIntegrationModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        theme={currentTheme}
        onOpenVoiceAssistant={() => setIsAssistantModalOpen(true)}
      />

      {/* Real-time Notification Alert Toast */}
      <NotificationToast
        alert={recentAlert}
        onDismiss={dismissRecentAlert}
        onConfirm={() => {
          if (recentAlert?.id) {
            handleToggleComplete(recentAlert.id);
          }
        }}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
