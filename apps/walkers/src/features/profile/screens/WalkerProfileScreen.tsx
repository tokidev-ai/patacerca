import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AppIcon,
  AvatarPicker,
  BottomSheet,
  Button,
  IconButton,
  Chip,
  SearchableOptionSelectMulti,
  useConfirm,
} from '@patacerca/ui';
import {
  WEEK_DAYS,
  WALKER_TIME_SLOTS,
  calculatePrice60,
  getCompletedStepsCount,
  type Walker,
} from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';
import { ProfilePreviewModal } from './ProfilePreviewModal';
import { useZones } from '../../../hooks/useZones';

type EditSection = 'bio' | 'price' | 'availability' | null;

const PRICE_MIN = 15;
const PRICE_MAX = 30;

/** "Lun–Vie" si son días seguidos de la semana; si no, lista corta. */
function formatDays(days: string[]): string {
  if (days.length === 0) return 'Sin días';
  if (days.length === WEEK_DAYS.length) return 'Todos los días';
  const idx = days
    .map((d) => WEEK_DAYS.indexOf(d as (typeof WEEK_DAYS)[number]))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1);
  if (consecutive && idx.length > 2) {
    return `${WEEK_DAYS[idx[0]!]}–${WEEK_DAYS[idx[idx.length - 1]!]}`;
  }
  return idx.map((i) => WEEK_DAYS[i]).join(', ');
}

type RowProps = {
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
  valueColor?: string;
};

const Row: React.FC<RowProps> = ({ label, value, onPress, last, valueColor }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[styles.row, !last && styles.rowDivider]}
  >
    <View style={styles.rowTextCol}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
    <AppIcon name="chevron-right" size={20} color="#8A7D70" />
  </TouchableOpacity>
);

export const WalkerProfileScreen: React.FC = () => {
  const router = useRouter();
  const zoneOptions = useZones();
  const { authRepository, verificationRepository, walkersRepository } = useWalkerData();
  const { walker, phone, status, clearSession, updateWalker } = useWalkerSessionStore();
  const { showToast } = useToastStore();
  const confirm = useConfirm();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [editing, setEditing] = useState<EditSection>(null);

  // Valores guardados
  const bio = walker?.bio || '';
  const price30 = walker?.price30 || 20;
  const price60 = calculatePrice60(price30);
  const zones = walker?.zones?.length ? walker.zones : [walker?.zone || 'Queru Queru'];
  const days = walker?.days?.length ? walker.days : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const timeSlots = walker?.timeSlots?.length ? walker.timeSlots : ['Tarde'];
  const travelCare = walker?.travelCare || false;

  // Borradores del panel de edición
  const [draftBio, setDraftBio] = useState(bio);
  const [draftPrice, setDraftPrice] = useState(price30);
  const [draftDays, setDraftDays] = useState<string[]>(days);
  const [draftTimes, setDraftTimes] = useState<string[]>(timeSlots);

  const walkerId = walker?.id || phone || 'w1';

  const { data: vData } = useQuery({
    queryKey: ['verification', walkerId],
    queryFn: () => verificationRepository.getVerificationData(walkerId),
  });
  const completedSteps = getCompletedStepsCount(vData || undefined);

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<Walker>) => {
      if (walker?.id) {
        await walkersRepository.updateWalkerProfile(walker.id, updates);
      }
      return updates;
    },
    onSuccess: (updates) => {
      updateWalker(updates);
      setEditing(null);
      showToast('Perfil actualizado');
    },
    onError: () => showToast('No se pudo guardar. Intenta de nuevo.'),
  });

  const openEditor = (section: Exclude<EditSection, null>) => {
    setDraftBio(bio);
    setDraftPrice(price30);
    setDraftDays(days);
    setDraftTimes(timeSlots);
    setEditing(section);
  };

  const toggleIn = (list: string[], value: string): string[] =>
    list.includes(value)
      ? list.length > 1
        ? list.filter((v) => v !== value)
        : list
      : [...list, value];

  const handleChangePhoto = async (uri: string) => {
    if (!walker) return;
    setPhotoLoading(true);
    try {
      const saved = await walkersRepository.updateWalkerProfile(walker.id, {
        photoUrl: uri,
      });
      updateWalker({ photoUrl: saved.photoUrl });
      showToast('Foto de perfil actualizada');
    } catch (e) {
      console.warn('[foto] falló:', e);
      const detail = __DEV__ && e instanceof Error ? ` (${e.message})` : '';
      showToast(`No pudimos subir la foto. Intenta de nuevo.${detail}`);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Cerrar sesión',
      message: '¿Seguro que quieres salir de tu cuenta?',
      confirmLabel: 'Salir',
      tone: 'danger',
      icon: 'log-out',
    });
    if (!ok) return;
    await authRepository.logout();
    clearSession();
    router.replace('/(auth)/login');
  };

  const verified = status === 'approved';
  const rating = walker?.rating ?? 0;
  const reviewsCount = walker?.reviewsCount ?? 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Mi perfil</Text>

        {/* Cabecera */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <AvatarPicker
              name={walker?.name || 'Paseador'}
              colorName={walker?.colorName || 'green'}
              size={64}
              uri={walker?.photoUrl}
              onChange={handleChangePhoto}
              loading={photoLoading}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.walkerName} numberOfLines={1}>
                {walker?.name || 'Paseador'}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  verified ? styles.statusPillApproved : styles.statusPillPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    verified
                      ? styles.statusPillTextApproved
                      : styles.statusPillTextPending,
                  ]}
                >
                  {verified
                    ? '✓ Verificado'
                    : status === 'in_review'
                      ? 'En revisión'
                      : 'Sin verificar'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {reviewsCount > 0 ? `★ ${rating.toFixed(1)}` : '—'}
              </Text>
              <Text style={styles.statLabel}>{reviewsCount} reseñas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{price30} Bs</Text>
              <Text style={styles.statLabel}>30 min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{price60} Bs</Text>
              <Text style={styles.statLabel}>60 min</Text>
            </View>
          </View>

          <Button
            title="Ver cómo me ven los dueños"
            variant="outline"
            size="sm"
            onPress={() => setPreviewVisible(true)}
          />
        </View>

        {/* Servicio */}
        <Text style={styles.groupTitle}>Tu servicio</Text>
        <View style={styles.group}>
          <Row
            label="Sobre mí"
            value={bio || 'Agrega una descripción'}
            valueColor={bio ? undefined : '#B4472B'}
            onPress={() => openEditor('bio')}
          />
          <Row
            label="Precio"
            value={`${price30} Bs · 30 min  ·  ${price60} Bs · 60 min`}
            onPress={() => openEditor('price')}
          />
          <Row
            label="Disponibilidad"
            value={`${formatDays(days)} · ${timeSlots.join(', ')}`}
            onPress={() => openEditor('availability')}
          />
          <View style={[styles.row, styles.rowDivider]}>
            <View style={styles.rowTextCol}>
              <SearchableOptionSelectMulti
                label="Zonas donde paseas"
                options={zoneOptions}
                values={zones}
                onChange={(next) => saveMutation.mutate({ zones: next })}
                searchPlaceholder="Buscar zona…"
                sheetTitle="Zonas donde paseas"
                minSelected={1}
                confirmLabel="Guardar zonas"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowLabel}>Cuido perros en viajes</Text>
              <Text style={styles.rowValue}>Próximamente en la app</Text>
            </View>
            <Switch
              value={travelCare}
              onValueChange={(v) => saveMutation.mutate({ travelCare: v })}
              trackColor={{ false: '#CDBFAB', true: '#3E8E5E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Cuenta */}
        <Text style={styles.groupTitle}>Cuenta</Text>
        <View style={styles.group}>
          <Row
            label="Verificación"
            value={verified ? 'Completa · 4/4' : `${completedSteps}/4 pasos completados`}
            valueColor={verified ? '#2F6E48' : '#B4472B'}
            onPress={() => router.push('/verification')}
          />
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.row}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Editores */}
      <BottomSheet visible={editing !== null} onClose={() => setEditing(null)}>
        {editing === 'bio' && (
          <>
            <Text style={styles.sheetTitle}>Sobre mí</Text>
            <Text style={styles.sheetHint}>
              Cuéntales a los dueños tu experiencia con perros.
            </Text>
            <TextInput
              value={draftBio}
              onChangeText={setDraftBio}
              placeholder="Ej. Tengo 3 años paseando perros grandes…"
              placeholderTextColor="#8A7D70"
              multiline
              autoFocus
              maxLength={400}
              style={styles.bioInput}
            />
            <Text style={styles.counter}>{draftBio.length}/400</Text>
          </>
        )}

        {editing === 'price' && (
          <>
            <Text style={styles.sheetTitle}>Precio por paseo</Text>
            <Text style={styles.sheetHint}>
              Rango sugerido en Cochabamba: {PRICE_MIN} a {PRICE_MAX} Bs por 30 min.
            </Text>
            <View style={styles.stepperContainer}>
              <IconButton
                icon="minus"
                size={44}
                onPress={() => setDraftPrice((p) => Math.max(PRICE_MIN, p - 1))}
                disabled={draftPrice <= PRICE_MIN}
              />
              <View style={styles.priceDisplay}>
                <Text style={styles.price30Text}>{draftPrice} Bs</Text>
                <Text style={styles.price30Sub}>30 min</Text>
              </View>
              <IconButton
                icon="plus"
                size={44}
                onPress={() => setDraftPrice((p) => Math.min(PRICE_MAX, p + 1))}
                disabled={draftPrice >= PRICE_MAX}
              />
            </View>
            <Text style={styles.calculated60Text}>
              Paseo de 60 min: {calculatePrice60(draftPrice)} Bs (se calcula solo)
            </Text>
          </>
        )}

        {editing === 'availability' && (
          <>
            <Text style={styles.sheetTitle}>Disponibilidad</Text>
            <Text style={styles.sheetLabel}>Días</Text>
            <View style={styles.chipsWrap}>
              {WEEK_DAYS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  size="sm"
                  selected={draftDays.includes(d)}
                  onPress={() => setDraftDays((l) => toggleIn(l, d))}
                />
              ))}
            </View>
            <Text style={styles.sheetLabel}>Horarios</Text>
            <View style={styles.chipsWrap}>
              {WALKER_TIME_SLOTS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  size="sm"
                  selected={draftTimes.includes(t)}
                  onPress={() => setDraftTimes((l) => toggleIn(l, t))}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.sheetFooter}>
          <Button
            title="Guardar"
            size="lg"
            loading={saveMutation.isPending}
            onPress={() => {
              if (editing === 'bio') saveMutation.mutate({ bio: draftBio.trim() });
              if (editing === 'price')
                saveMutation.mutate({
                  price30: draftPrice,
                  price60: calculatePrice60(draftPrice),
                });
              if (editing === 'availability')
                saveMutation.mutate({ days: draftDays, timeSlots: draftTimes });
            }}
          />
        </View>
      </BottomSheet>

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
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  walkerName: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusPillApproved: {
    backgroundColor: '#3E8E5E',
  },
  statusPillPending: {
    backgroundColor: '#F6E7C8',
  },
  statusPillText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
  },
  statusPillTextApproved: {
    color: '#FFFFFF',
  },
  statusPillTextPending: {
    color: '#8A5A12',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F7F2EA',
    borderRadius: 14,
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E6DCCD',
  },
  statValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 17,
    color: '#2A2420',
  },
  statLabel: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#6B6058',
    marginTop: 2,
  },
  groupTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#8A7D70',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DC',
  },
  rowTextCol: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  rowValue: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
  },
  logoutText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#B4472B',
  },
  sheetTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    marginBottom: 4,
  },
  sheetHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginBottom: 14,
  },
  sheetLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetFooter: {
    marginTop: 20,
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
    minHeight: 110,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  counter: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#8A7D70',
    textAlign: 'right',
    marginTop: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 18,
    padding: 12,
  },
  priceDisplay: {
    alignItems: 'center',
  },
  price30Text: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
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
    textAlign: 'center',
    marginTop: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
