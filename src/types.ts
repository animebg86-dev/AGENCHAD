export type ViewMode = 'day' | 'week' | 'month' | 'timeline' | 'notes';

export type EventCategory = 'travail' | 'personnel' | 'sante' | 'famille' | 'loisirs' | 'urgent';

export type AppThemeId = 'amber' | 'violet' | 'rouge' | 'noir' | 'emeraude' | 'cyan';

export interface AppTheme {
  id: AppThemeId;
  name: string;
  tagline: string;
  primaryColor: string; // e.g. '#f97316'
  primaryHover: string;
  glowColor: string; // e.g. 'rgba(249, 115, 22, 0.4)'
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  gradientFrom: string;
  gradientTo: string;
  dotColor: string;
}

export interface AIAssistantAction {
  type:
    | 'create_event'
    | 'delete_event'
    | 'complete_event'
    | 'create_note'
    | 'delete_note'
    | 'navigate'
    | 'change_theme'
    | 'create_group'
    | 'join_group'
    | 'switch_workspace'
    | 'answer';
  payload?: any;
}

export interface AIAssistantResult {
  spokenResponse: string;
  action: AIAssistantAction;
}

export interface UserProfile {
  id: string;
  pseudo: string;
  avatar: string;
  color: string;
  role: string;
}

export interface GroupMember {
  id: string;
  pseudo: string;
  avatar: string;
  color?: string;
  role: string;
  isLeader?: boolean;
  joinedAt?: string;
}

export interface ProjectGroup {
  id: string;
  name: string;
  code: string; // 6-digit sync code e.g. "CHAD-99"
  description?: string;
  color: string;
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
  members: GroupMember[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  collaboratorIds: string[]; // ['user-1', 'user-2']
  groupId?: string; // undefined or 'personal' = personal account, otherwise projectId
  authorPseudo?: string;
  isDailyReminder?: boolean;
  isCompleted?: boolean;
  reminderMinutesBefore?: number; // 0, 5, 15, 30, 60, 1440
  location?: string;
  color?: string;
  notified?: boolean;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  groupId?: string; // undefined or 'personal' = personal account, otherwise projectId
  authorPseudo?: string;
  isPinned?: boolean;
  linkedDate?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  color?: string;
}

export interface SyncRoomState {
  roomCode: string;
  roomName: string;
  collaborators: Collaborator[];
  lastSyncedAt: string;
  isSyncing: boolean;
}
