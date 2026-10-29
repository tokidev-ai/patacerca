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
          const profile = await profileRepository.getWalkerProfile(session.phone);
          setSession(session.phone, profile);
          router.replace('/(tabs)/requests');
          return;
        }
      } catch {
        // Fallback
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
    backgroundColor: '#2A2420',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

