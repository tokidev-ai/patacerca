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
import { WalkerDataProvider } from '../src/providers/DataProvider';
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
    <WalkerDataProvider>
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
              name="verification/index"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="verification/[step]"
              options={{
                presentation: 'formSheet',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="profile-preview"
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="chat/[threadId]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="__dev/ui"
              options={{ presentation: 'modal' }}
            />
          </Stack>
        </ToastProvider>
      </QueryProvider>
    </WalkerDataProvider>
  );
}

