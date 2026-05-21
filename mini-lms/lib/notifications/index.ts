import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AppStorage } from '../storage/async';

// Push token auto-registration is removed from Expo Go SDK 53+ — only local notifications work there
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let cachedNotifications: typeof import('expo-notifications') | null = null;
let handlerReady = false;

async function getNotifications() {
  if (isExpoGo) return null;
  if (cachedNotifications) return cachedNotifications;
  cachedNotifications = await import('expo-notifications');
  return cachedNotifications;
}

async function ensureNotificationHandler() {
  if (handlerReady) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerReady = true;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) return false;
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  await ensureNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await ensureNotificationHandler();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 5 Courses Bookmarked!',
      body: "Great job! You've saved 5 courses. Time to start learning!",
      data: { type: 'bookmark_milestone' },
    },
    trigger: null, // fire immediately
  });
}

export async function scheduleReminderIfInactive(): Promise<void> {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await ensureNotificationHandler();
  const lastOpened = await AppStorage.getLastOpened();
  if (!lastOpened) return;

  const hoursSince = (Date.now() - lastOpened) / (1000 * 60 * 60);
  if (hoursSince >= 24) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Miss learning?',
        body: "You haven't opened Mini LMS in a while. Pick up where you left off!",
        data: { type: 'inactivity_reminder' },
      },
      trigger: null,
    });
  }

  // Also schedule a future 24hr reminder
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 Time to learn!',
      body: 'Your courses are waiting. Keep the momentum going!',
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
      repeats: false,
    },
  });
}
