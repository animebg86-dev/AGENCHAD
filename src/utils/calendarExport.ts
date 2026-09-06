import { AgendaEvent } from '../types';

export function exportEventsToICS(events: AgendaEvent[], filename = 'mon-agenda.ics') {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agenda & Rappels Synchronisés//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda Synchronisé',
    'X-WR-TIMEZONE:Europe/Paris',
  ];

  events.forEach((event) => {
    const cleanDate = event.date.replace(/-/g, '');
    const [startH, startM] = event.startTime.split(':');
    const [endH, endM] = (event.endTime || event.startTime).split(':');

    const dtStart = `${cleanDate}T${startH}${startM}00`;
    const dtEnd = `${cleanDate}T${endH}${endM}00`;
    const now = new Date();
    const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${event.id}@agendasync.local`);
    icsLines.push(`DTSTAMP:${dtStamp}`);
    icsLines.push(`DTSTART:${dtStart}`);
    icsLines.push(`DTEND:${dtEnd}`);
    icsLines.push(`SUMMARY:${event.title.replace(/[,;]/g, ' ')}`);
    if (event.description) {
      icsLines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/[,;]/g, ' ')}`);
    }
    if (event.location) {
      icsLines.push(`LOCATION:${event.location.replace(/[,;]/g, ' ')}`);
    }
    if (event.reminderMinutesBefore && event.reminderMinutesBefore > 0) {
      icsLines.push('BEGIN:VALARM');
      icsLines.push(`TRIGGER:-PT${event.reminderMinutesBefore}M`);
      icsLines.push('ACTION:DISPLAY');
      icsLines.push(`DESCRIPTION:Rappel: ${event.title}`);
      icsLines.push('END:VALARM');
    }
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  const icsData = icsLines.join('\r\n');
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseICS(icsContent: string): Partial<AgendaEvent>[] {
  const events: Partial<AgendaEvent>[] = [];
  const lines = icsContent.split(/\r\n|\n|\r/);
  let currentEvent: Partial<AgendaEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: 'ics-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        category: 'travail',
        collaboratorIds: ['user-1'],
        reminderMinutesBefore: 15,
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.date) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12).replace(/\\n/g, '\n');
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      } else if (line.startsWith('DTSTART')) {
        // e.g., DTSTART:20261015T090000 or DTSTART;VALUE=DATE:20261015
        const val = line.split(':').pop() || '';
        if (val.length >= 8) {
          const year = val.substring(0, 4);
          const month = val.substring(4, 6);
          const day = val.substring(6, 8);
          currentEvent.date = `${year}-${month}-${day}`;
          if (val.includes('T') && val.length >= 13) {
            const timePart = val.split('T')[1];
            currentEvent.startTime = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
          } else {
            currentEvent.startTime = '09:00';
          }
        }
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':').pop() || '';
        if (val.includes('T') && val.length >= 13) {
          const timePart = val.split('T')[1];
          currentEvent.endTime = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
        } else {
          currentEvent.endTime = '10:00';
        }
      }
    }
  }

  return events;
}
