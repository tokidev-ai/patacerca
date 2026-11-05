import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  IconButton,
  Input,
  KeyboardAwareScrollView,
  keyboardAvoidingBehavior,
} from '@patacerca/ui';
import {
  APP_STRINGS,
  formatTimeHHmm,
  formatWalkDayCalendar,
  formatWalkDayText,
  getDefaultWalkTime,
  getWalkScheduleMinDate,
  getWalkScheduleMaxDate,
  clampWalkScheduleDate,
  toWalkDayId,
  isWalkScheduleInPast,
  roundTimeToInterval,
} from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const RequestWalkModal: React.FC = () => {
  const router = useRouter();
  const { walkerId } = useLocalSearchParams<{ walkerId: string }>();
  const queryClient = useQueryClient();
  const { walkersRepository, requestsRepository } = useData();
  const { owner } = useSessionStore();
  const { showToast } = useToastStore();

  const scheduleMinDate = useMemo(() => getWalkScheduleMinDate(), []);
  const scheduleMaxDate = useMemo(() => getWalkScheduleMaxDate(), []);

  const [duration, setDuration] = useState<30 | 60>(30);
  const [walkDate, setWalkDate] = useState(() => getWalkScheduleMinDate());
  const [scheduleTime, setScheduleTime] = useState(() => getDefaultWalkTime());
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const walkDayId = toWalkDayId(walkDate);
  const walkDayLabel = formatWalkDayText(walkDate);
  const walkDayCalendarLabel = formatWalkDayCalendar(walkDate);

  const datePickerValue = useMemo(() => {
    const d = new Date(walkDate);
    d.setHours(12, 0, 0, 0);
    return d;
  }, [walkDate]);

  const { data: walker } = useQuery({
    queryKey: ['walker', walkerId],
    queryFn: () => walkersRepository.getWalkerById(walkerId || ''),
    enabled: Boolean(walkerId),
  });

  const sendRequestMutation = useMutation({
    mutationFn: () => {
      const price = duration === 30 ? walker?.price30 || 20 : walker?.price60 || 32;
      const timeText = formatTimeHHmm(scheduleTime);
      return requestsRepository.createRequest({
        ownerPhone: owner?.phone || '70000000',
        ownerName: owner?.name || 'Dueño',
        ownerZone: owner?.zone || 'Queru Queru',
        dogName: owner?.dogName || 'Toby',
        dogSize: owner?.dogSize || 'medium',
        walkerId: walkerId || '',
        walkerName: walker?.name || 'Paseador',
        durationMinutes: duration,
        dayText: walkDayLabel,
        timeText,
        note: note.trim() || undefined,
        price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      showToast(APP_STRINGS.toasts.requestSent(walker?.name || 'el paseador'));
      router.replace('/(tabs)/walks');
    },
  });

  const totalPrice = duration === 30 ? walker?.price30 || 20 : walker?.price60 || 32;

  const applyWalkDate = (next: Date) => {
    const clamped = clampWalkScheduleDate(next);
    setWalkDate(clamped);
    const nextDayId = toWalkDayId(clamped);
    setScheduleTime((prev) =>
      isWalkScheduleInPast(nextDayId, prev) ? getDefaultWalkTime() : prev
    );
    if (error) setError('');
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidDatePicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    applyWalkDate(date);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidTimePicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    const rounded = roundTimeToInterval(date, 15);
    if (isWalkScheduleInPast(walkDayId, rounded)) {
      setError('Elige una hora futura para este día');
      return;
    }
    setScheduleTime(rounded);
    if (error) setError('');
  };

  const handleSubmit = () => {
    if (isWalkScheduleInPast(walkDayId, scheduleTime)) {
      setError('Elige una fecha y hora futuras');
      return;
    }
    setError('');
    sendRequestMutation.mutate();
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/search');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Paseo con {walker?.name || 'Paseador'}</Text>
            <Text style={styles.title}>
              Solicitar paseo para {owner?.dogName || 'tu perro'}
            </Text>
          </View>
          <IconButton icon="close" onPress={handleClose} />
        </View>

        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          extraBottomInset={120}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionLabel}>Duración</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDuration(30)}
              style={[
                styles.durationCard,
                duration === 30 && styles.durationCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.durationTitle,
                  duration === 30 && styles.durationTextSelected,
                ]}
              >
                30 minutos
              </Text>
              <Text style={styles.durationPrice}>{walker?.price30 || 20} Bs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDuration(60)}
              style={[
                styles.durationCard,
                duration === 60 && styles.durationCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.durationTitle,
                  duration === 60 && styles.durationTextSelected,
                ]}
              >
                60 minutos
              </Text>
              <Text style={styles.durationPrice}>{walker?.price60 || 32} Bs</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Fecha y hora del paseo</Text>
          <Text style={styles.sectionHint}>
            Solo fechas desde hoy. Elige día, mes y hora en el calendario.
          </Text>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleLabel}>Fecha del paseo</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display="spinner"
                  minimumDate={scheduleMinDate}
                  maximumDate={scheduleMaxDate}
                  onChange={handleDateChange}
                  themeVariant="light"
                  style={styles.iosDatePicker}
                />
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.androidPickerButton}
                    onPress={() => setShowAndroidDatePicker(true)}
                  >
                    <Text style={styles.androidPickerMain}>{walkDayCalendarLabel}</Text>
                    <Text style={styles.androidPickerHint}>Seleccionar fecha</Text>
                  </TouchableOpacity>
                  {showAndroidDatePicker ? (
                    <DateTimePicker
                      value={datePickerValue}
                      mode="date"
                      minimumDate={scheduleMinDate}
                      maximumDate={scheduleMaxDate}
                      onChange={handleDateChange}
                    />
                  ) : null}
                </>
              )}
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleLabel}>Hora de inicio</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={scheduleTime}
                  mode="time"
                  display="spinner"
                  is24Hour
                  minuteInterval={15}
                  onChange={handleTimeChange}
                  themeVariant="light"
                  style={styles.iosTimePicker}
                />
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.androidPickerButton}
                    onPress={() => setShowAndroidTimePicker(true)}
                  >
                    <Text style={styles.androidPickerMain}>
                      {formatTimeHHmm(scheduleTime)}
                    </Text>
                    <Text style={styles.androidPickerHint}>Seleccionar hora</Text>
                  </TouchableOpacity>
                  {showAndroidTimePicker ? (
                    <DateTimePicker
                      value={scheduleTime}
                      mode="time"
                      is24Hour
                      minuteInterval={15}
                      onChange={handleTimeChange}
                    />
                  ) : null}
                </>
              )}
            </View>

            <Text style={styles.scheduleConfirm}>
              Programado: {walkDayCalendarLabel} · {formatTimeHHmm(scheduleTime)}
            </Text>
          </View>

          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.sectionLabel}>
            Nota para {walker?.name || 'el paseador'}{' '}
            <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="Ej. Tira de la correa, no le gustan las motos"
            multiline
            numberOfLines={2}
            style={styles.noteInput}
          />
        </KeyboardAwareScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.subtotalLabel}>pagas al paseador</Text>
            </View>
            <Text style={styles.totalPrice}>{totalPrice} Bs</Text>
          </View>
          <Button
            title="Enviar solicitud"
            onPress={handleSubmit}
            loading={sendRequestMutation.isPending}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
  },
  eyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: -4,
    marginBottom: 10,
    lineHeight: 18,
  },
  optional: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A7D70',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  durationCardSelected: {
    backgroundColor: '#E4EFE6',
    borderColor: '#3E8E5E',
  },
  durationTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2A2420',
    marginBottom: 4,
  },
  durationTextSelected: {
    color: '#2F6E48',
  },
  durationPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    overflow: 'hidden',
  },
  scheduleBlock: {
    paddingVertical: 4,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#E6DCCD',
    marginVertical: 8,
  },
  scheduleLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#6B6058',
    marginBottom: 4,
  },
  scheduleConfirm: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#2F6E48',
    marginTop: 12,
    textAlign: 'center',
  },
  iosDatePicker: {
    width: '100%',
    height: 150,
  },
  iosTimePicker: {
    width: '100%',
    height: 150,
  },
  androidPickerButton: {
    backgroundColor: '#F7F2EA',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  androidPickerMain: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    color: '#2A2420',
    textAlign: 'center',
  },
  androidPickerHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 4,
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2A2420',
  },
  subtotalLabel: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#6B6058',
  },
  totalPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    color: '#2A2420',
  },
});
