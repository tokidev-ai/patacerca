import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalkerData } from '../src/providers/DataProvider';
import { useWalkerSessionStore } from '../src/store/session.store';

export default function Index() {
  const router = useRouter();
  const { authRepository, profileRepository } = useWalkerData();
  const { setSession } = useWalkerSessionStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authRepository.getCurrentSession();
        if (session && session.role === 'walker') {
          // Perfil fresco (no el cacheado) para saber si el admin lo suspendió.
          const profile =
            (await profileRepository.getWalkerProfile(session.phone).catch(() => null)) ??
            session.walkerData;
          if (profile && !profile.blocked) {
            setSession(session.phone, profile);
            router.replace('/(tabs)/requests');
            return;
          }
          await authRepository.logout();
          if (profile?.blocked) {
            router.replace({ pathname: '/(auth)/login', params: { blocked: '1' } });
            return;
          }
        }
      } catch {
        // Fallback to login
      }
      setChecking(false);
      router.replace('/(auth)/login');
    }

    checkAuth();
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#3E8E5E" size="large" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2420',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
