import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Pin,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PersonalNote, AppTheme } from '../../types';

interface NotesViewProps {
  notes: PersonalNote[];
  onSaveNote: (note: PersonalNote) => void;
  onDeleteNote: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  theme?: AppTheme;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onToggleChecklistItem,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);

  // Form state for creating/editing note
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Général');
  const [isPinned, setIsPinned] = useState(false);
  const [checklistInput, setChecklistInput] = useState('');

  const categories = ['all', ...Array.from(new Set(notes.map((n) => n.category)))];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('Priorités');
    setIsPinned(false);
    setChecklistInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: PersonalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setIsPinned(!!note.isPinned);
    setChecklistInput(
      note.checklist ? note.checklist.map((c) => (c.done ? `[x] ${c.text}` : `[ ] ${c.text}`)).join('\n') : ''
    );
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Parse checklist items if user wrote lines with brackets or bullets
    const parsedChecklist = checklistInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, idx) => {
        const isDone = line.startsWith('[x]') || line.startsWith('✓');
        const cleanText = line.replace(/^\[[ x]\]|^[-*•✓]\s*/i, '').trim();
        return {
          id: `item-${Date.now()}-${idx}`,
          text: cleanText,
          done: isDone,
        };
      });

    const noteToSave: PersonalNote = {
      id: editingNote ? editingNote.id : `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category.trim() || 'Général',
      updatedAt: new Date().toISOString(),
      isPinned,
      color: editingNote?.color || '#6366f1',
      checklist: parsedChecklist.length > 0 ? parsedChecklist : editingNote?.checklist,
    };

    onSaveNote(noteToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0f15] p-4 sm:p-6">
      {/* Header with Search and Create */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Notes Personnelles Synchronisées</span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronisées avec vos rendez-vous, rappels et partenaires
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-black text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
            style={{
              backgroundColor: theme ? theme.primaryColor : '#6366f1',
              boxShadow: theme ? `0 0 14px ${theme.glowColor}` : undefined,
            }}
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Nouvelle note</span>
          </button>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher dans mes notes et listes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151823] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Toutes les catégories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-[#151823]/40 border border-slate-800/60 p-8">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-300">Aucune note trouvée</p>
            <p className="text-xs text-slate-500 mt-1">Créez votre première note ou liste de rappels.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              + Ajouter une note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between transition-all duration-200 ${
                  note.isPinned
                    ? 'bg-[#181c2b] border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'bg-[#151823] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 text-indigo-400">
                      {note.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {note.isPinned && (
                        <span title="Épinglé">
                          <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{note.title}</h4>

                  {note.content && (
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-3">
                      {note.content}
                    </p>
                  )}

                  {/* Checklist items */}
                  {note.checklist && note.checklist.length > 0 && (
                    <div className="space-y-1.5 mb-3 pt-2 border-t border-slate-800/60">
                      {note.checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onToggleChecklistItem(note.id, item.id)}
                          className="flex items-start gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                        >
                          {item.done ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className={item.done ? 'line-through text-slate-500' : ''}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  {note.linkedDate && (
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Calendar className="w-3 h-3" />
                      Liée à l'agenda
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#151823] border border-slate-700/60 p-6 shadow-2xl text-slate-100 relative">
            <h3 className="text-base font-bold text-white mb-4">
              {editingNote ? 'Modifier la note' : 'Nouvelle note personnelle'}
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Idées de projets, Liste de courses, Routine..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
                  <input
                    type="text"
                    placeholder="Priorités, Santé, Idées..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Épingler en haut</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contenu texte</label>
                <textarea
                  rows={3}
                  placeholder="Écrivez vos pensées, notes ou rappels..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Éléments de liste à cocher (1 par ligne)
                </label>
                <textarea
                  rows={3}
                  placeholder={"[ ] Acheter des vitamines\n[ ] Envoyer le rapport à Alex\n[x] Méditation 10 min"}
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
