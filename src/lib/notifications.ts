import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const VISA_NOTIFICATION_KEYS = 'epats_scheduled_visa_notifications';

// Configure notification behavior when app is in foreground
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Failed to get notification permissions:', error);
    return false;
  }
}

export async function scheduleVisaReminder(expiryDate: Date, visaType: string = 'E-Visa'): Promise<string[]> {
  if (Platform.OS === 'web') return [];

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  // Cancel any existing visa notifications first
  await cancelVisaReminders();

  const now = new Date().getTime();
  const scheduledIds: string[] = [];

  const milestones = [
    { daysBefore: 7, title: `⚠️ 7 дней до истечения ${visaType}!`, body: 'Пора планировать визаран или продление, чтобы не попасть на оверстей.' },
    { daysBefore: 3, title: `🚨 3 дня до визарана (${visaType})!`, body: 'Проверьте билеты, бронь трансфера и паспортный контроль.' },
    { daysBefore: 1, title: `🔥 Завтра крайний день визы!`, body: 'Выезд должен состояться сегодня/завтра. Штраф за оверстей от 500,000 VND/день.' },
  ];

  for (const item of milestones) {
    const triggerTime = new Date(expiryDate.getTime() - item.daysBefore * 24 * 60 * 60 * 1000);
    triggerTime.setHours(10, 0, 0, 0);

    if (triggerTime.getTime() > now) {
      const secondsUntil = Math.max(1, Math.floor((triggerTime.getTime() - now) / 1000));
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: item.title,
            body: item.body,
            sound: true,
            data: { type: 'visa_reminder', visaType },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntil,
            repeats: false,
          },
        });
        scheduledIds.push(id);
      } catch (err) {
        console.warn('Error scheduling notification:', err);
      }
    }
  }

  await AsyncStorage.setItem(VISA_NOTIFICATION_KEYS, JSON.stringify(scheduledIds));
  return scheduledIds;
}

export async function cancelVisaReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const raw = await AsyncStorage.getItem(VISA_NOTIFICATION_KEYS);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
      await AsyncStorage.removeItem(VISA_NOTIFICATION_KEYS);
    }
  } catch (err) {
    console.warn('Error canceling visa reminders:', err);
  }
}

export async function sendLocalAlert(title: string, body: string, data?: Record<string, any>): Promise<void> {
  if (Platform.OS === 'web') return;
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('Error sending local alert:', err);
  }
}
