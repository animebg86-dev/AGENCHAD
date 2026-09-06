import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  Check,
  Copy,
  FolderKanban,
  UserCheck,
  Sparkles,
  ArrowRight,
  Shield,
  LogOut,
  Edit3,
  UserPlus,
} from 'lucide-react';
import { ProjectGroup, UserProfile, AppTheme } from '../../types';

interface ProjectGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  projectGroups: ProjectGroup[];
  activeGroupId: string | 'personal';
  onSelectActiveGroup: (groupId: string | 'personal') => void;
  onCreateGroup: (newGroup: Omit<ProjectGroup, 'id' | 'createdAt'>) => void;
  onUpdateGroup: (group: ProjectGroup) => void;
  onDeleteOrLeaveGroup: (groupId: string) => void;
  onAddMemberByPseudo: (groupId: string, pseudo: string, role?: string) => void;
  theme: AppTheme;
}

export const ProjectGroupsModal: React.FC<ProjectGroupsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateUserProfile,
  projectGroups,
  activeGroupId,
  onSelectActiveGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteOrLeaveGroup,
  onAddMemberByPseudo,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'profile' | 'create'>('groups');
  
  // Profile edit state
  const [editPseudo, setEditPseudo] = useState(userProfile.pseudo);
  const [editRole, setEditRole] = useState(userProfile.role);
  const [profileSaved, setProfileSaved] = useState(false);

  // Create group form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(theme.primaryColor || '#f59e0b');

  // Join group state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

  // Add member by pseudo state
  const [memberPseudoInputs, setMemberPseudoInputs] = useState<Record<string, string>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPseudo.trim()) return;
    onUpdateUserProfile({
      ...userProfile,
      pseudo: editPseudo.trim(),
      role: editRole.trim() || 'Membre',
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    // Generate neat code like CHAD-42
    const randomNum = Math.floor(10 + Math.random() * 90);
    const codePrefix = newGroupName.trim().substring(0, 4).toUpperCase();
    const code = `${codePrefix}-${randomNum}`;

    onCreateGroup({
      name: newGroupName.trim(),
      code,
      description: newGroupDesc.trim() || 'Projet collaboratif synchronisé',
      color: newGroupColor,
      status: 'active',
      members: [
        {
          id: userProfile.id,
          pseudo: userProfile.pseudo,
          avatar: userProfile.avatar,
          color: userProfile.color,
          role: 'Leader & Fondateur',
          isLeader: true,
        },
      ],
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setActiveTab('groups');
  };

  const handleCopyCode = (groupId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(groupId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleAddMember = (groupId: string) => {
    const pseudoToAdd = (memberPseudoInputs[groupId] || '').trim();
    if (!pseudoToAdd) return;

    onAddMemberByPseudo(groupId, pseudoToAdd);
    setMemberPseudoInputs((prev) => ({ ...prev, [groupId]: '' }));
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codeClean = joinCodeInput.trim().toUpperCase();
    if (!codeClean) return;

    const targetGroup = projectGroups.find((g) => g.code.toUpperCase() === codeClean);
    if (targetGroup) {
      // Check if user already in group
      const alreadyIn = targetGroup.members.some(
        (m) => m.pseudo.toLowerCase() === userProfile.pseudo.toLowerCase()
      );
      if (!alreadyIn) {
        onAddMemberByPseudo(targetGroup.id, userProfile.pseudo, 'Collaborateur');
        onSelectActiveGroup(targetGroup.id);
        setJoinStatus(`Vous avez rejoint "${targetGroup.name}" !`);
      } else {
        onSelectActiveGroup(targetGroup.id);
        setJoinStatus(`Vous êtes déjà membre de "${targetGroup.name}". Espace activé !`);
      }
    } else {
      setJoinStatus('Code introuvable. Vérifiez le code fourni par votre équipe.');
    }
    setJoinCodeInput('');
    setTimeout(() => setJoinStatus(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0f1118] border border-slate-800 shadow-2xl flex flex-col relative text-slate-100 max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-black shadow-lg"
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: `0 0 16px ${theme.glowColor}`,
              }}
            >
              <FolderKanban className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Comptes & Groupes de Projets
                </h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    color: theme.primaryColor,
                  }}
                >
                  AGENCHAD SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gérez votre profil perso, vos équipes et quittez les projets terminés
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800/60 bg-[#12151f]">
          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'groups'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={{
              borderColor: activeTab === 'groups' ? theme.primaryColor : 'transparent',
              color: activeTab === 'groups' ? theme.primaryColor : undefined,
            }}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mes Projets & Groupes ({projectGroups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={{
              borderColor: activeTab === 'create' ? theme.primaryColor : 'transparent',
              color: activeTab === 'create' ? theme.primaryColor : undefined,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un Groupe</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={{
              borderColor: activeTab === 'profile' ? theme.primaryColor : 'transparent',
              color: activeTab === 'profile' ? theme.primaryColor : undefined,
            }}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mon Profil Perso ({userProfile.pseudo})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: GROUPS LIST & WORKSPACE SWITCHER */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              {/* Quick join by code */}
              <form
                onSubmit={handleJoinByCode}
                className="p-3.5 rounded-2xl bg-[#141724] border border-slate-800/80 flex flex-col sm:flex-row items-center gap-2.5"
              >
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Rejoindre un projet avec un code
                  </label>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Ex: CHAD-5G, TITAN-9..."
                    className="w-full bg-[#0b0d13] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-black transition shrink-0 cursor-pointer self-end mt-1 sm:mt-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Rejoindre avec mon pseudo ({userProfile.pseudo})
                </button>
              </form>

              {joinStatus && (
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-medium">
                  {joinStatus}
                </div>
              )}

              {/* Personal Account Card (Always available) */}
              <div
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  activeGroupId === 'personal'
                    ? 'bg-[#181c2b] border-amber-500 shadow-md'
                    : 'bg-[#12141d] border-slate-800 hover:border-slate-700'
                }`}
                style={{
                  borderColor: activeGroupId === 'personal' ? theme.primaryColor : undefined,
                }}
                onClick={() => onSelectActiveGroup('personal')}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.pseudo}
                    className="w-10 h-10 rounded-full object-cover border-2"
                    style={{ borderColor: theme.primaryColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white">
                        Espace Personnel de {userProfile.pseudo}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        Privé & Solo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vos rendez-vous, rappels et notes strictement personnels.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeGroupId === 'personal' ? (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-xl text-black flex items-center gap-1"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Actif
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectActiveGroup('personal');
                      }}
                      className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 transition"
                    >
                      Basculer
                    </button>
                  )}
                </div>
              </div>

              {/* Project Groups List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Groupes de Projets Collaboratifs
                  </h4>
                  <span className="text-xs text-slate-500">
                    {projectGroups.length} groupe{projectGroups.length > 1 ? 's' : ''}
                  </span>
                </div>

                {projectGroups.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-[#12141c] border border-slate-800 p-4">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      Vous n'avez aucun groupe de projet actif.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-black transition"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Créer un groupe de projet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectGroups.map((group) => {
                      const isActive = activeGroupId === group.id;
                      return (
                        <div
                          key={group.id}
                          className={`p-4 rounded-2xl border transition relative ${
                            isActive
                              ? 'bg-[#181c2b] border-amber-500 shadow-md'
                              : 'bg-[#12141d] border-slate-800 hover:border-slate-700'
                          }`}
                          style={{
                            borderColor: isActive ? group.color || theme.primaryColor : undefined,
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: group.color || theme.primaryColor }}
                                />
                                <h5 className="text-sm font-bold text-white">{group.name}</h5>
                                <div
                                  onClick={() => handleCopyCode(group.id, group.code)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition border border-slate-700"
                                  title="Cliquer pour copier le code de partage"
                                >
                                  <span>Code : {group.code}</span>
                                  {copiedCodeId === group.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </div>
                              </div>
                              {group.description && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {group.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                              {isActive ? (
                                <span
                                  className="text-xs font-bold px-3 py-1 rounded-xl text-black flex items-center gap-1"
                                  style={{ backgroundColor: group.color || theme.primaryColor }}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Projet Actif
                                </span>
                              ) : (
                                <button
                                  onClick={() => onSelectActiveGroup(group.id)}
                                  className="text-xs px-3 py-1 rounded-xl font-bold bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                                >
                                  Ouvrir ce projet
                                </button>
                              )}

                              {/* Quit / Delete project button when completed */}
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Voulez-vous retirer le projet "${group.name}" ? (Si votre projet est terminé, cela le supprimera de votre liste)`
                                    )
                                  ) {
                                    onDeleteOrLeaveGroup(group.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                title="Projet terminé ? Retirer ou quitter ce groupe"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Member pseudos list */}
                          <div className="mt-3 pt-3 border-t border-slate-800/80">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Membres inscrits ({group.members.length})
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                              {group.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                                >
                                  <img
                                    src={member.avatar}
                                    alt={member.pseudo}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-white">{member.pseudo}</span>
                                  {member.role && (
                                    <span className="text-[10px] text-slate-400">
                                      ({member.role})
                                    </span>
                                  )}
                                  {member.isLeader && (
                                    <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 font-bold">
                                      Chef
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add member by pseudo input inside group */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={memberPseudoInputs[group.id] || ''}
                                  onChange={(e) =>
                                    setMemberPseudoInputs({
                                      ...memberPseudoInputs,
                                      [group.id]: e.target.value,
                                    })
                                  }
                                  placeholder="Ajouter un collègue par son pseudo (ex: Thomas, Sarah...)"
                                  className="w-full bg-[#0a0c12] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddMember(group.id);
                                    }
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => handleAddMember(group.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Ajouter</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE GROUP */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nom du projet / Groupe *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Refonte 5G Xiaomi, Lancement SaaS, Projet Équipe..."
                  className="w-full bg-[#12141e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description ou Objectif du groupe
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Objectif commun, deadlines, détails du projet..."
                  className="w-full bg-[#12141e] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Couleur d'identification du projet
                </label>
                <div className="flex items-center gap-3">
                  {['#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#0ea5e9', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGroupColor(c)}
                      className={`w-8 h-8 rounded-full transition flex items-center justify-center cursor-pointer ${
                        newGroupColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {newGroupColor === c && <Check className="w-4 h-4 text-black font-bold" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gestion simplifiée de fin de projet</span>
                </div>
                <p>
                  Lorsque ce projet est achevé, vous pouvez facilement le retirer ou le clôturer
                  d'un clic sans jamais effacer vos données personnelles.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('groups')}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-black transition shadow-lg hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Créer et activer ce groupe
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: USER PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#141724] border border-slate-800">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.pseudo}
                  className="w-14 h-14 rounded-full object-cover border-2"
                  style={{ borderColor: theme.primaryColor }}
                />
                <div>
                  <h4 className="text-base font-black text-white">{userProfile.pseudo}</h4>
                  <p className="text-xs text-slate-400">{userProfile.role}</p>
                  <span className="text-[10px] text-amber-400 font-mono mt-0.5 inline-block">
                    Identifiant AGENCHAD : {userProfile.id}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Votre Pseudo dans l'application *
                </label>
                <input
                  type="text"
                  required
                  value={editPseudo}
                  onChange={(e) => setEditPseudo(e.target.value)}
                  placeholder="Ex: Chad, AnimeBG, Alex..."
                  className="w-full bg-[#12141e] border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ce pseudo s'affiche sur vos rendez-vous, vos notes et auprès de vos collaborateurs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Rôle ou Titre
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="Ex: Organisateur, Chef de projet, Athlète..."
                  className="w-full bg-[#12141e] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profil sauvegardé et mis à jour instantanément !</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black transition shadow-lg hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer mon pseudo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
