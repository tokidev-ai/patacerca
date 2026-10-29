import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, IconButton, Chip } from '@patacerca/ui';
import {
  COCHABAMBA_ZONES,
  WEEK_DAYS,
  WALKER_TIME_SLOTS,
  calculatePrice60,
  getCompletedStepsCount,
} from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';
import { ProfilePreviewModal } from './ProfilePreviewModal';

export const WalkerProfileScreen: React.FC = () => {
  const router = useRouter();
  const { authRepository, verificationRepository, walkersRepository } =
    useWalkerData();
  const { walker, phone, status, clearSession, updateWalker } =
    useWalkerSessionStore();
  const { showToast } = useToastStore();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [bio, setBio] = useState(walker?.bio || '');
  const [price30, setPrice30] = useState(walker?.price30 || 20);
  const [selectedZones, setSelectedZones] = useState<string[]>(
    walker?.zones || [walker?.zone || 'Queru Queru']
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    walker?.days || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    walker?.timeSlots || ['Tarde']
  );
  const [travelCare, setTravelCare] = useState(walker?.travelCare || false);

  const walkerId = walker?.id || phone || 'w1';

  const { data: vData } = useQuery({
    queryKey: ['verification', walkerId],
    queryFn: () => verificationRepository.getVerificationData(walkerId),
  });

  const completedSteps = getCompletedStepsCount(vData || undefined);
  const price60 = calculatePrice60(price30);

  const handlePriceDec = () => {
    if (price30 > 15) setPrice30((p) => p - 1);
  };

  const handlePriceInc = () => {
    if (price30 < 30) setPrice30((p) => p + 1);
  };

  const toggleZone = (z: string) => {
    if (selectedZones.includes(z)) {
      if (selectedZones.length > 1) {
        setSelectedZones(selectedZones.filter((item) => item !== z));
      }
    } else {
      setSelectedZones([...selectedZones, z]);
    }
  };

  const toggleDay = (d: string) => {
    if (selectedDays.includes(d)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((item) => item !== d));
      }
    } else {
      setSelectedDays([...selectedDays, d]);
    }
  };

  const toggleTime = (t: string) => {
    if (selectedTimes.includes(t)) {
      if (selectedTimes.length > 1) {
        setSelectedTimes(selectedTimes.filter((item) => item !== t));
      }
    } else {
      setSelectedTimes([...selectedTimes, t]);
    }
  };

  const handleSaveProfile = async () => {
    updateWalker({
      bio,
      price30,
      price60,
      zones: selectedZones,
      days: selectedDays,
      timeSlots: selectedTimes,
      travelCare,
    });
    if (walker?.id) {
      await walkersRepository
        .updateWalkerProfile(walker.id, {
          bio,
          price30,
          price60,
          zones: selectedZones,
          days: selectedDays,
          timeSlots: selectedTimes,
          travelCare,
        })
        .catch(() => {});
    }
    showToast('Perfil actualizado');
  };

  const handleLogout = async () => {
    await authRepository.logout();
    clearSession();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mi perfil</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPreviewVisible(true)}
          >
            <Text style={styles.previewLink}>Vista previa</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            name={walker?.name || 'Paseador'}
            colorName={walker?.colorName || 'green'}
            size={64}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.walkerName}>{walker?.name || 'Paseador'}</Text>
            <View
              style={[
                styles.statusPill,
                status === 'approved'
                  ? styles.statusPillApproved
                  : styles.statusPillPending,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  status === 'approved'
                    ? styles.statusPillTextApproved
                    : styles.statusPillTextPending,
                ]}
              >
                {status === 'approved'
                  ? '✓ Paseador verificado'
                  : status === 'in_review'
                  ? 'Verificación en revisión'
                  : 'Sin verificar'}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/verification')}
          style={styles.verificationRow}
        >
          <Text style={styles.verificationLabel}>Verificación de cuenta</Text>
          <Text style={styles.verificationCount}>
            {status === 'approved'
              ? '4/4 Completo →'
              : `${completedSteps}/4 Pasos →`}
          </Text>
        </TouchableOpacity>

        {/* About me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            onBlur={handleSaveProfile}
            placeholder="Cuéntales a los dueños tu experiencia con perros..."
            placeholderTextColor="#8A7D70"
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />
        </View>

        {/* Price Stepper */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio por paseo</Text>
          <View style={styles.stepperContainer}>
            <IconButton
              icon="minus"
              size={44}
              onPress={handlePriceDec}
              disabled={price30 <= 15}
            />
            <View style={styles.priceDisplay}>
              <Text style={styles.price30Text}>{price30} Bs</Text>
              <Text style={styles.price30Sub}>· 30 min</Text>
            </View>
            <IconButton
              icon="plus"
              size={44}
              onPress={handlePriceInc}
              disabled={price30 >= 30}
            />
          </View>
          <Text style={styles.calculated60Text}>
            60 min: {price60} Bs
          </Text>
          <Text style={styles.priceHelp}>
            Rango sugerido en Cochabamba: 15 a 50 Bs
          </Text>
        </View>

        {/* Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zonas donde paseas</Text>
          <View style={styles.chipsWrap}>
            {COCHABAMBA_ZONES.map((z) => {
              const isSelected = selectedZones.includes(z);
              return (
                <Chip
                  key={z}
                  label={z}
                  selected={isSelected}
                  onPress={() => toggleZone(z)}
                  size="sm"
                />
              );
            })}
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Días disponibles</Text>
          <View style={styles.chipsWrap}>
            {WEEK_DAYS.map((d) => {
              const isSelected = selectedDays.includes(d);
              return (
                <Chip
                  key={d}
                  label={d}
                  selected={isSelected}
                  onPress={() => toggleDay(d)}
                  size="sm"
                />
              );
            })}
          </View>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios</Text>
          <View style={styles.chipsWrap}>
            {WALKER_TIME_SLOTS.map((t) => {
              const isSelected = selectedTimes.includes(t);
              return (
                <Chip
                  key={t}
                  label={t}
                  selected={isSelected}
                  onPress={() => toggleTime(t)}
                  size="sm"
                />
              );
            })}
          </View>
        </View>

        {/* Travel care toggle */}
        <View style={styles.travelCareRow}>
          <View style={styles.travelCareTextCol}>
            <Text style={styles.travelCareTitle}>
              Cuido perros durante viajes
            </Text>
            <Text style={styles.travelCareSubtitle}>
              Próximamente en la app
            </Text>
          </View>
          <Switch
            value={travelCare}
            onValueChange={setTravelCare}
            trackColor={{ false: '#CDBFAB', true: '#3E8E5E' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Cerrar sesión"
            variant="danger-soft"
            onPress={handleLogout}
            size="md"
          />
        </View>
      </ScrollView>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        visible={previewVisible}
        walker={walker}
        status={status}
        price30={price30}
        bio={bio}
        onClose={() => setPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
  },
  previewLink: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2F6E48',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  walkerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 18,
    color: '#2A2420',
    marginBottom: 6,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusPillApproved: {
    backgroundColor: '#3E8E5E',
  },
  statusPillPending: {
    backgroundColor: '#EFE6D8',
  },
  statusPillText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
  },
  statusPillTextApproved: {
    color: '#FFFFFF',
  },
  statusPillTextPending: {
    color: '#6B6058',
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  verificationLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  verificationCount: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#3E8E5E',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2A2420',
    marginBottom: 10,
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 12,
  },
  priceDisplay: {
    alignItems: 'center',
  },
  price30Text: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    color: '#2A2420',
  },
  price30Sub: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
  },
  calculated60Text: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#4A413A',
    marginTop: 8,
    textAlign: 'center',
  },
  priceHelp: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#8A7D70',
    marginTop: 4,
    textAlign: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  travelCareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  travelCareTextCol: {
    flex: 1,
  },
  travelCareTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  travelCareSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#8A7D70',
    marginTop: 2,
  },
  logoutWrapper: {
    marginTop: 10,
  },
});

