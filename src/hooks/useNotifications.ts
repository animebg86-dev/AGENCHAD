import { useState, useEffect, useCallback } from 'react';
import { AgendaEvent } from '../types';

// Audio chime generator using browser Web Audio API
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Note 1 (A5: 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2 (D6: 1174.66Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

export function useNotifications(
  events: AgendaEvent[],
  onTriggerNotification?: (event: AgendaEvent) => void
) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [recentAlert, setRecentAlert] = useState<{ id: string; title: string; time: string } | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        playNotificationChime();
        new Notification('🔔 Notifications activées', {
          body: 'Vous recevrez vos rappels de rendez-vous en temps réel !',
          icon: '/pwa-192x192.png',
        });
      }
      return result;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string, eventId?: string) => {
      playNotificationChime();
      setRecentAlert({ id: eventId || Date.now().toString(), title, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: eventId || 'agenda-reminder',
          });
        } catch (err) {
          console.warn('Notification display failed:', err);
        }
      }
    },
    []
  );

  const testNotification = useCallback(() => {
    sendNotification(
      '⏰ Rappel Test Agenda',
      'Votre système de notification et rappel sonore fonctionne parfaitement !',
      'test-id'
    );
  }, [sendNotification]);

  // Periodic interval checking for due reminders (every 10 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      events.forEach((event) => {
        if (event.isCompleted || event.notified) return;

        // Check if event date is today
        if (event.date === todayStr) {
          const [h, m] = event.startTime.split(':').map(Number);
          const eventMinutes = h * 60 + m;
          const reminderMinutesBefore = event.reminderMinutesBefore ?? 5;
          const triggerMinutes = eventMinutes - reminderMinutesBefore;

          // If within the trigger minute window
          if (currentMinutes >= triggerMinutes && currentMinutes <= eventMinutes + 2) {
            sendNotification(
              event.isDailyReminder ? `📌 Rappel quotidien: ${event.title}` : `📅 Rendez-vous: ${event.title}`,
              `À ${event.startTime}${event.location ? ` • ${event.location}` : ''} ${reminderMinutesBefore > 0 ? `(Rappel ${reminderMinutesBefore} min avant)` : 'maintenant !'}`,
              event.id
            );
            if (onTriggerNotification) {
              onTriggerNotification(event);
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 12000);
    return () => clearInterval(interval);
  }, [events, onTriggerNotification, sendNotification]);

  return {
    permission,
    isSupported,
    recentAlert,
    dismissRecentAlert: () => setRecentAlert(null),
    requestPermission,
    sendNotification,
    testNotification,
  };
}
