import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../src/providers/DataProvider';
import { useSessionStore } from '../src/store/session.store';

export default function Index() {
  const router = useRouter();
  const { authRepository, profileRepository } = useData();
  const { setSession } = useSessionStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authRepository.getCurrentSession();
        if (session && session.role === 'owner') {
          const profile = await profileRepository.getOwnerProfile(session.phone);
          setSession(session.phone, profile);
          router.replace('/(tabs)/search');
          return;
        }
      } catch {
        // Fallback to welcome
      } finally {
        setChecking(false);
        router.replace('/(auth)/welcome');
      }
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
    backgroundColor: '#F7F2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

