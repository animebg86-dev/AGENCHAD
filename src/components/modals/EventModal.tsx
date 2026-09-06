import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Bell, Users, Trash2, CheckSquare } from 'lucide-react';
import { AgendaEvent, Collaborator, EventCategory } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: AgendaEvent | null;
  selectedDate?: string;
  collaborators: Collaborator[];
}

const CATEGORIES: { id: EventCategory; label: string; color: string }[] = [
  { id: 'travail', label: 'Travail', color: '#6366f1' },
  { id: 'personnel', label: 'Personnel', color: '#8b5cf6' },
  { id: 'sante', label: 'Santé & Sport', color: '#10b981' },
  { id: 'famille', label: 'Famille / Duo', color: '#ec4899' },
  { id: 'loisirs', label: 'Loisirs', color: '#0ea5e9' },
  { id: 'urgent', label: 'Urgent', color: '#f43f5e' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  selectedDate,
  collaborators,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('travail');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>(['user-1']);
  const [isDailyReminder, setIsDailyReminder] = useState(false);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(15);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setCategory(initialEvent.category);
      setCollaboratorIds(initialEvent.collaboratorIds || ['user-1']);
      setIsDailyReminder(!!initialEvent.isDailyReminder);
      setReminderMinutesBefore(initialEvent.reminderMinutesBefore ?? 15);
      setLocation(initialEvent.location || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setStartTime('10:00');
      setEndTime('11:00');
      setCategory('travail');
      setCollaboratorIds(['user-1']);
      setIsDailyReminder(false);
      setReminderMinutesBefore(15);
      setLocation('');
    }
  }, [initialEvent, selectedDate]);

  if (!isOpen) return null;

  const toggleCollaborator = (collabId: string) => {
    if (collaboratorIds.includes(collabId)) {
      if (collaboratorIds.length > 1) {
        setCollaboratorIds(collaboratorIds.filter((id) => id !== collabId));
      }
    } else {
      setCollaboratorIds([...collaboratorIds, collabId]);
    }
  };

  const selectAllCollaborators = () => {
    setCollaboratorIds(collaborators.map((c) => c.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedCat = CATEGORIES.find((c) => c.id === category);

    const eventToSave: AgendaEvent = {
      id: initialEvent ? initialEvent.id : `ev-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime: isDailyReminder ? startTime : endTime,
      category,
      collaboratorIds,
      isDailyReminder,
      isCompleted: initialEvent ? initialEvent.isCompleted : false,
      reminderMinutesBefore,
      location: location.trim(),
      color: matchedCat?.color || '#6366f1',
    };

    onSave(eventToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-[#151823] border border-slate-700/60 p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4">
          {initialEvent ? 'Modifier le rendez-vous / rappel' : 'Nouveau rendez-vous / rappel'}
        </h3>

        {/* Mode Selector (Rendez-vous vs Rappel Quotidien) */}
        <div className="flex rounded-xl bg-[#0e1017] p-1 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setIsDailyReminder(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              !isDailyReminder ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Rendez-vous</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDailyReminder(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              isDailyReminder ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Rappel quotidien</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Titre *</label>
            <input
              type="text"
              required
              placeholder={isDailyReminder ? 'Ex: Boire 1L eau & vitamines, Méditation...' : 'Ex: Réunion client, Dentiste, Déjeuner...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isDailyReminder ? 'Heure du rappel' : 'Début'}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {!isDailyReminder && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Heure de fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Collaborator Multi-select (1, 2, or 3 people) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Participants synchronisés ({collaboratorIds.length})</span>
              </label>
              <button
                type="button"
                onClick={selectAllCollaborators}
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                Tous (3)
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collab) => {
                const isSelected = collaboratorIds.includes(collab.id);
                return (
                  <button
                    key={collab.id}
                    type="button"
                    onClick={() => toggleCollaborator(collab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={collab.avatar}
                      alt={collab.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{collab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Lead Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              <span>Notification de rappel avant l'événement</span>
            </label>
            <select
              value={reminderMinutesBefore}
              onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>À l'heure exacte</option>
              <option value={5}>5 minutes avant</option>
              <option value={15}>15 minutes avant (recommandé)</option>
              <option value={30}>30 minutes avant</option>
              <option value={60}>1 heure avant</option>
              <option value={1440}>1 jour avant</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catégorie</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    category === cat.id
                      ? 'border-indigo-500 bg-slate-800 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Lieu ou lien de réunion (facultatif)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Paris 8e, Google Meet, Salle 3..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Détails ou notes personnelles</label>
            <textarea
              rows={2}
              placeholder="Ajouter des notes, ordre du jour, objectifs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialEvent.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-md shadow-indigo-900/40"
              >
                {initialEvent ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
