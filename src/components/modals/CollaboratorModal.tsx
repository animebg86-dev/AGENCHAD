import React, { useState } from 'react';
import { X, Users, Copy, Check, RefreshCw, Plus, Edit2, Shield, QrCode } from 'lucide-react';
import { Collaborator, SyncRoomState } from '../../types';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onUpdateCollaborators: (collabs: Collaborator[]) => void;
  syncState: SyncRoomState;
  onUpdateRoomCode: (code: string) => void;
  onTriggerSync: () => void;
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  onUpdateCollaborators,
  syncState,
  onUpdateRoomCode,
  onTriggerSync,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinBox, setShowJoinBox] = useState(false);

  if (!isOpen) return null;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(syncState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copySyncLink = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}?syncRoom=${syncState.roomCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveName = (id: string) => {
    if (!editName.trim()) return;
    const updated = collaborators.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c));
    onUpdateCollaborators(updated);
    setEditingId(null);
    setEditName('');
  };

  const handleJoinRoom = () => {
    if (joinCodeInput.trim().length >= 4) {
      onUpdateRoomCode(joinCodeInput.trim().toUpperCase());
      setShowJoinBox(false);
      setJoinCodeInput('');
      onTriggerSync();
    }
  };

  const handleAddCollaborator = () => {
    if (collaborators.length >= 3) return;
    const newIndex = collaborators.length + 1;
    const colors = ['#ec4899', '#f97316', '#a855f7'];
    const newCollab: Collaborator = {
      id: `user-${Date.now()}`,
      name: `Partenaire ${newIndex}`,
      role: `Membre ${newIndex}`,
      color: colors[newIndex - 1] || '#8b5cf6',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    };
    onUpdateCollaborators([...collaborators, newCollab]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#151823] border border-slate-700/60 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Synchronisation à 2 ou 3 personnes</h3>
            <p className="text-xs text-slate-400">Partagez votre agenda et vos rappels en temps réel</p>
          </div>
        </div>

        {/* Sync Room Box */}
        <div className="rounded-xl bg-[#0e1017] border border-slate-800 p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Code de Salon Partagé</span>
              <div className="text-xl font-mono font-bold text-emerald-400 tracking-wider mt-0.5">
                {syncState.roomCode}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié' : 'Code'}</span>
              </button>
              <button
                onClick={copySyncLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Lien copié' : 'Inviter'}</span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Connecté au salon synchronisé</span>
            </div>
            <button
              onClick={onTriggerSync}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span>Synchroniser</span>
            </button>
          </div>
        </div>

        {/* Join another room toggle */}
        {!showJoinBox ? (
          <div className="mb-5 flex justify-end">
            <button
              onClick={() => setShowJoinBox(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition underline-offset-4 hover:underline"
            >
              Rejoindre un salon existant avec un code
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3 mb-5 flex items-center gap-2">
            <input
              type="text"
              placeholder="Entrez le code (ex: SYNC-4821)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleJoinRoom}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Rejoindre
            </button>
            <button
              onClick={() => setShowJoinBox(false)}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Collaborators List (Up to 2-3 people) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">
              Participants à l'agenda ({collaborators.length} / 3)
            </span>
            {collaborators.length < 3 && (
              <button
                onClick={handleAddCollaborator}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un partenaire</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {collaborators.map((collab, idx) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={collab.avatar}
                      alt={collab.name}
                      className="w-9 h-9 rounded-full object-cover border-2"
                      style={{ borderColor: collab.color }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#151823]"
                      style={{ backgroundColor: collab.color }}
                    />
                  </div>
                  <div>
                    {editingId === collab.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveName(collab.id)}
                          className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px]"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{collab.name}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                            Principal
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400">
                      {collab.role || `Membre de l'agenda partagé`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingId(collab.id);
                    setEditName(collab.name);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Modifier le nom"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
