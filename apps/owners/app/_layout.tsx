import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
} from '@expo-google-fonts/figtree';
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DataProvider } from '../src/providers/DataProvider';
import { QueryProvider } from '../src/providers/QueryProvider';
import { ToastProvider } from '../src/providers/ToastProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <DataProvider>
        <QueryProvider>
          <ToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F7F2EA' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="walker/[id]"
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="request/[walkerId]"
                options={{
                  presentation: 'formSheet',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="chat/[walkerId]"
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="__dev/ui"
                options={{ presentation: 'modal' }}
              />
            </Stack>
          </ToastProvider>
        </QueryProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}

