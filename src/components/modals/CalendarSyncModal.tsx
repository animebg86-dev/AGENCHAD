import React, { useRef, useState } from 'react';
import { X, Calendar, Download, Upload, CheckCircle, ExternalLink, CalendarSync } from 'lucide-react';
import { AgendaEvent } from '../../types';
import { exportEventsToICS, parseICS } from '../../utils/calendarExport';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AgendaEvent[];
  onImportEvents: (newEvents: AgendaEvent[]) => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  events,
  onImportEvents,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportEventsToICS(events);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseICS(content);
        if (parsed.length > 0) {
          const completeEvents: AgendaEvent[] = parsed.map((p, index) => ({
            id: `imported-${Date.now()}-${index}`,
            title: p.title || 'Événement importé',
            description: p.description || '',
            date: p.date || new Date().toISOString().split('T')[0],
            startTime: p.startTime || '09:00',
            endTime: p.endTime || '10:00',
            category: 'personnel',
            collaboratorIds: ['user-1'],
            reminderMinutesBefore: 15,
            location: p.location,
            color: '#6366f1',
          }));
          onImportEvents(completeEvents);
          setImportStatus(`${completeEvents.length} événements importés avec succès !`);
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          setImportStatus('Aucun événement trouvé dans ce fichier .ics.');
        }
      } catch (err) {
        console.error('ICS parse error:', err);
        setImportStatus('Erreur lors de la lecture du fichier calendrier.');
      }
    };
    reader.readAsText(file);
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
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CalendarSync className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Synchronisation avec vos calendriers</h3>
            <p className="text-xs text-slate-400">Google Calendar, Apple Calendar (iOS), Outlook</p>
          </div>
        </div>

        {importStatus && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleExport}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-[#0e1017] border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-white">Exporter vers .ICS</span>
            <span className="text-[11px] text-slate-400 mt-1">Télécharger tous vos rendez-vous et rappels</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-[#0e1017] border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-white">Importer depuis .ICS</span>
            <span className="text-[11px] text-slate-400 mt-1">Intégrer vos événements existants</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".ics,text/calendar"
              className="hidden"
            />
          </button>
        </div>

        {/* Guides */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Guide de synchronisation pas à pas
          </h4>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Google Calendar (Android & PC)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. Téléchargez le fichier via <strong>« Exporter vers .ICS »</strong> ci-dessus.<br />
              2. Ouvrez <strong>calendar.google.com</strong> sur PC ou mobile.<br />
              3. Cliquez sur la roue crantée ⚙️ &gt; <strong>Paramètres</strong> &gt; <strong>Importer et exporter</strong>.<br />
              4. Sélectionnez votre fichier exporté : tous vos rendez-vous apparaissent instantanément !
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Apple Calendrier (iPhone, iPad, Mac)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. Sur votre iPhone ou Mac, touchez le bouton <strong>« Exporter vers .ICS »</strong>.<br />
              2. Ouvrez le fichier téléchargé : iOS vous propose immédiatement <strong>« Tout ajouter »</strong> dans votre application Calendrier Apple native !
            </p>
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
