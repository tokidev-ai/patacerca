import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, IconButton, Chip } from '@patacerca/ui';
import { WALK_HOURS, APP_STRINGS } from '@patacerca/core';
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

  const [duration, setDuration] = useState<30 | 60>(30);
  const [selectedDay, setSelectedDay] = useState('Hoy');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const { data: walker } = useQuery({
    queryKey: ['walker', walkerId],
    queryFn: () => walkersRepository.getWalkerById(walkerId || ''),
    enabled: Boolean(walkerId),
  });

  const sendRequestMutation = useMutation({
    mutationFn: () => {
      const price = duration === 30 ? walker?.price30 || 20 : walker?.price60 || 32;
      return requestsRepository.createRequest({
        ownerPhone: owner?.phone || '70000000',
        ownerName: owner?.name || 'Dueño',
        ownerZone: owner?.zone || 'Queru Queru',
        dogName: owner?.dogName || 'Toby',
        dogSize: owner?.dogSize || 'medium',
        walkerId: walkerId || '',
        walkerName: walker?.name || 'Paseador',
        durationMinutes: duration,
        dayText: selectedDay,
        timeText: selectedTime,
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

  const daysList = ['Hoy', 'Mañana', 'Vie 30', 'Sáb 31', 'Dom 01', 'Lun 02'];

  const totalPrice =
    duration === 30 ? walker?.price30 || 20 : walker?.price60 || 32;

  const handleSubmit = () => {
    if (!selectedTime) {
      setError(APP_STRINGS.errors.missingTimeSlot);
      return;
    }
    setError('');
    sendRequestMutation.mutate();
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              Paseo con {walker?.name || 'Paseador'}
            </Text>
            <Text style={styles.title}>
              Solicitar paseo para {owner?.dogName || 'tu perro'}
            </Text>
          </View>
          <IconButton icon="close" onPress={() => router.back()} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Duration */}
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
              <Text style={styles.durationPrice}>
                {walker?.price30 || 20} Bs
              </Text>
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
              <Text style={styles.durationPrice}>
                {walker?.price60 || 32} Bs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Day */}
          <Text style={styles.sectionLabel}>Día</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {daysList.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={selectedDay === d}
                onPress={() => setSelectedDay(d)}
                size="md"
              />
            ))}
          </ScrollView>

          {/* Time grid */}
          <Text style={styles.sectionLabel}>Hora</Text>
          <View style={styles.hoursGrid}>
            {WALK_HOURS.map((h) => {
              const isSelected = selectedTime === h;
              return (
                <TouchableOpacity
                  key={h}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedTime(h);
                    if (error) setError('');
                  }}
                  style={[
                    styles.hourButton,
                    isSelected && styles.hourButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.hourText,
                      isSelected && styles.hourTextSelected,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          {/* Optional Note */}
          <Text style={styles.sectionLabel}>
            Nota para {walker?.name || 'el paseador'}{' '}
            <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ej. Tira de la correa, no le gustan las motos"
            placeholderTextColor="#8A7D70"
            multiline
            numberOfLines={2}
            style={styles.noteInput}
          />
        </ScrollView>

        {/* Bottom Total & Submit */}
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
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hourButton: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  hourButtonSelected: {
    backgroundColor: '#3E8E5E',
    borderColor: '#3E8E5E',
  },
  hourText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  hourTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 6,
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

