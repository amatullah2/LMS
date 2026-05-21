import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CoursesProvider } from '@/context/CoursesContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { requestNotificationPermissions, scheduleReminderIfInactive } from '@/lib/notifications';
import { AppStorage } from '@/lib/storage/async';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

function AppInit() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync().catch(() => {});
  }, [isLoading]);

  useEffect(() => {
    (async () => {
      try {
        await AppStorage.validateCacheVersion();
      } catch {}
      try {
        await requestNotificationPermissions();
        await scheduleReminderIfInactive();
      } catch {
        // Notifications not supported on this device/emulator — safe to ignore
      }
      try {
        await AppStorage.updateLastOpened();
      } catch {}
    })();
  }, []);

  return null;
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <NetworkProvider>
      <AuthProvider>
        <CoursesProvider>
          <AuthGuard />
          <AppInit />
          <View style={{ flex: 1 }}>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="course/[id]"
                options={{
                  headerShown: true,
                  headerTitle: 'Course Details',
                  headerStyle: { backgroundColor: '#ffffff' },
                  headerTintColor: '#7c3aed',
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="course/webview/[id]"
                options={{
                  headerShown: true,
                  headerTitle: 'Course Content',
                  headerStyle: { backgroundColor: '#ffffff' },
                  headerTintColor: '#7c3aed',
                  presentation: 'modal',
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
          <StatusBar style="dark" />
        </CoursesProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}

export default RootLayout;
