import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Button } from '@patacerca/ui';

export const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/duenos-welcome.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.bottomContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>patacerca</Text>
          </View>
          <Text style={styles.title}>
            Paseadores verificados a pocas cuadras
          </Text>
          <Text style={styles.subtitle}>
            Encuentra a alguien de confianza en tu barrio de Cochabamba.
          </Text>
          <View style={styles.buttonWrapper}>
            <Button
              title="Ingresar con WhatsApp"
              onPress={() => router.push('/(auth)/phone')}
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  imageContainer: {
    flex: 1.1,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomSafeArea: {
    flex: 0.9,
    backgroundColor: '#F7F2EA',
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3E8E5E',
  },
  logoText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.96,
    color: '#2A2420',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B6058',
    marginTop: 8,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 20,
  },
});

