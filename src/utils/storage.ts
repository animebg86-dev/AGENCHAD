import { AgendaEvent, Collaborator, PersonalNote, ProjectGroup, SyncRoomState, UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-me',
  pseudo: 'Chad',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  color: '#f59e0b',
  role: 'Leader & Organisateur',
};

export const DEFAULT_PROJECT_GROUPS: ProjectGroup[] = [
  {
    id: 'group-alpha',
    name: 'Projet Alpha 5G & Mobile',
    code: 'CHAD-5G',
    description: 'Projet partagé : intégration Gemini AI sur Xiaomi 14T Pro 5G, iPad et PC.',
    color: '#f59e0b',
    createdAt: '2026-09-01',
    status: 'active',
    members: [
      {
        id: 'user-me',
        pseudo: 'Chad',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        color: '#f59e0b',
        role: 'Fondateur',
        isLeader: true,
      },
      {
        id: 'user-alex',
        pseudo: 'Alex',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        color: '#10b981',
        role: 'Tech Lead',
      },
      {
        id: 'user-camille',
        pseudo: 'Camille',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        color: '#0ea5e9',
        role: 'UI Designer',
      },
    ],
  },
  {
    id: 'group-fitness',
    name: 'Squad Musculation & Santé',
    code: 'TITAN-9',
    description: 'Suivi des entraînements, routine hydratation et objectifs partagés.',
    color: '#ef4444',
    createdAt: '2026-09-03',
    status: 'active',
    members: [
      {
        id: 'user-me',
        pseudo: 'Chad',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        color: '#f59e0b',
        role: 'Athlète',
        isLeader: true,
      },
      {
        id: 'user-alex',
        pseudo: 'Alex',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        color: '#10b981',
        role: 'Partenaire training',
      },
    ],
  },
];

export const DEFAULT_COLLABORATORS: Collaborator[] = [
  {
    id: 'user-me',
    name: 'Moi (Chad)',
    role: 'Leader & Organisateur',
    color: '#f59e0b',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-alex',
    name: 'Alex',
    role: 'Partenaire 1',
    color: '#10b981',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-camille',
    name: 'Camille',
    role: 'Partenaire 2',
    color: '#0ea5e9',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
];

// Helper to get today, yesterday, and future dates easily in format YYYY-MM-DD
export function getRelativeDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_EVENTS: AgendaEvent[] = [
  {
    id: 'ev-1',
    title: 'Réveil & Routine matinale',
    description: 'Hydratation 500ml, étirements et méditation 10 min.',
    date: getRelativeDateString(0),
    startTime: '06:30',
    endTime: '07:15',
    category: 'sante',
    collaboratorIds: ['user-1'],
    isDailyReminder: true,
    isCompleted: true,
    reminderMinutesBefore: 0,
    color: '#f59e0b',
  },
  {
    id: 'ev-2',
    title: 'Marche & Entraînement 7.5K',
    description: 'Circuit plein air + gainage et tractions.',
    date: getRelativeDateString(0),
    startTime: '07:30',
    endTime: '08:45',
    category: 'sante',
    collaboratorIds: ['user-1', 'user-2'],
    isDailyReminder: true,
    isCompleted: true,
    reminderMinutesBefore: 15,
    location: 'Parc des Buttes',
    color: '#10b981',
  },
  {
    id: 'ev-3',
    title: 'Point Équipe UI/UX Responsive',
    description: 'Revue des maquettes mobiles iOS & Android, fluidité des animations.',
    date: getRelativeDateString(0),
    startTime: '10:00',
    endTime: '11:15',
    category: 'travail',
    collaboratorIds: ['user-1', 'user-2', 'user-3'],
    isDailyReminder: false,
    isCompleted: false,
    reminderMinutesBefore: 15,
    location: 'Visioconférence Google Meet',
    color: '#6366f1',
  },
  {
    id: 'ev-4',
    title: 'Déjeuner Healthy & Créatine',
    description: 'Salade quinoa, avocat, protéines et vitamines.',
    date: getRelativeDateString(0),
    startTime: '12:30',
    endTime: '13:30',
    category: 'sante',
    collaboratorIds: ['user-1'],
    isDailyReminder: true,
    isCompleted: false,
    reminderMinutesBefore: 10,
    color: '#84cc16',
  },
  {
    id: 'ev-5',
    title: 'Session Deep Work / Code PWA',
    description: 'Finalisation du mode hors-ligne et du manifest PWA.',
    date: getRelativeDateString(0),
    startTime: '14:30',
    endTime: '16:45',
    category: 'travail',
    collaboratorIds: ['user-1', 'user-2'],
    isDailyReminder: false,
    isCompleted: false,
    reminderMinutesBefore: 15,
    color: '#8b5cf6',
  },
  {
    id: 'ev-6',
    title: 'Rappel: Prendre vitamines & hydratation',
    description: 'Boire un grand verre d eau et magnésium.',
    date: getRelativeDateString(0),
    startTime: '17:00',
    endTime: '17:15',
    category: 'sante',
    collaboratorIds: ['user-1'],
    isDailyReminder: true,
    isCompleted: false,
    reminderMinutesBefore: 5,
    color: '#06b6d4',
  },
  {
    id: 'ev-7',
    title: 'Sauna infrarouge & Douche froide',
    description: 'Récupération musculaire 20 min.',
    date: getRelativeDateString(0),
    startTime: '18:30',
    endTime: '19:15',
    category: 'sante',
    collaboratorIds: ['user-1', 'user-3'],
    isDailyReminder: true,
    isCompleted: false,
    reminderMinutesBefore: 15,
    color: '#f43f5e',
  },
  {
    id: 'ev-8',
    title: 'Dîner partagé à 3',
    description: 'Organisation du planning de la semaine prochaine.',
    date: getRelativeDateString(0),
    startTime: '20:00',
    endTime: '22:00',
    category: 'famille',
    collaboratorIds: ['user-1', 'user-2', 'user-3'],
    isDailyReminder: false,
    isCompleted: false,
    reminderMinutesBefore: 30,
    location: 'Chez Alex',
    color: '#ec4899',
  },
  // Tomorrow's events
  {
    id: 'ev-9',
    title: 'Appel Client & Stratégie',
    description: 'Présentation de la nouvelle version mobile.',
    date: getRelativeDateString(1),
    startTime: '09:30',
    endTime: '10:30',
    category: 'travail',
    collaboratorIds: ['user-1', 'user-2'],
    isDailyReminder: false,
    isCompleted: false,
    reminderMinutesBefore: 15,
    color: '#6366f1',
  },
  {
    id: 'ev-10',
    title: 'Rendez-vous Médical Annuel',
    description: 'Bilan de santé et contrôle général.',
    date: getRelativeDateString(2),
    startTime: '14:00',
    endTime: '15:00',
    category: 'sante',
    collaboratorIds: ['user-1'],
    isDailyReminder: false,
    isCompleted: false,
    reminderMinutesBefore: 60,
    location: 'Centre Médical Saint-Germain',
    color: '#10b981',
  },
];

export const INITIAL_NOTES: PersonalNote[] = [
  {
    id: 'note-1',
    title: 'Objectifs de la semaine & Rappels',
    content: 'Priorités absolues pour synchroniser nos 3 agendas :\n- Valider le planning d entraînement conjoint avec Alex\n- Finaliser les maquettes avec Camille pour la revue mobile\n- Maintenir 8h de sommeil chaque nuit.',
    category: 'Priorités',
    updatedAt: new Date().toISOString(),
    isPinned: true,
    linkedDate: getRelativeDateString(0),
    color: '#6366f1',
    checklist: [
      { id: 'chk-1', text: 'Installer l application PWA sur mon téléphone', done: true },
      { id: 'chk-2', text: 'Activer les notifications push de rappel sonore', done: true },
      { id: 'chk-3', text: 'Partager le code de synchronisation à Alex et Camille', done: false },
      { id: 'chk-4', text: 'Exporter les rendez-vous vers mon Google / Apple Calendar', done: false },
    ],
  },
  {
    id: 'note-2',
    title: 'Routine d hydratation & compléments',
    content: 'Matin au réveil : 500ml eau tiède + citron\nAvant entraînement : Créatine 5g + électrolytes\nSoir : Magnésium bisglycinate.',
    category: 'Santé',
    updatedAt: new Date().toISOString(),
    isPinned: false,
    color: '#10b981',
    checklist: [
      { id: 'chk-5', text: 'Prendre oméga 3', done: true },
      { id: 'chk-6', text: 'Boire au moins 2.5L d eau', done: false },
    ],
  },
  {
    id: 'note-3',
    title: 'Idées de sorties partagées',
    content: '- Randonnée en forêt de Fontainebleau le weekend prochain\n- Restaurant italien vendredi soir avec l équipe\n- Réservation séance de sauna et bain glacé.',
    category: 'Loisirs',
    updatedAt: new Date().toISOString(),
    isPinned: false,
    color: '#0ea5e9',
  },
];

export const STORAGE_KEYS = {
  EVENTS: 'agenchad_events_v2',
  NOTES: 'agenchad_notes_v2',
  COLLABORATORS: 'agenchad_collaborators_v2',
  SYNC_ROOM: 'agenchad_sync_room_v2',
  USER_PROFILE: 'agenchad_user_profile_v2',
  PROJECT_GROUPS: 'agenchad_project_groups_v2',
  ACTIVE_WORKSPACE: 'agenchad_active_workspace_v2',
  ACTIVE_GROUP: 'agenchad_active_group_v2',
  APP_CUSTOM_NAME: 'agenchad_custom_name_v2',
};

// Broadcast channel for instantaneous cross-tab and cross-window sync
export const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('agenchad_channel')
    : null;
