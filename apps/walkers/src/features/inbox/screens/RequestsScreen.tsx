import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Segmented, Button, EmptyState } from '@patacerca/ui';
import { WalkRequest, getCompletedStepsCount, APP_STRINGS } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

type TabSegment = 'new' | 'accepted' | 'history';

export const RequestsScreen: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requestsRepository, verificationRepository } = useWalkerData();
  const { walker, phone, status, setStatus } = useWalkerSessionStore();
  const { showToast } = useToastStore();

  const [segment, setSegment] = useState<TabSegment>('new');

  const walkerId = walker?.id || 'w1';

  const { data: requests = [] } = useQuery({
    queryKey: ['walker_requests', walkerId],
    queryFn: () => requestsRepository.getRequestsByWalker(walkerId),
  });

  const { data: vData } = useQuery({
    queryKey: ['verification', walkerId],
    queryFn: () => verificationRepository.getVerificationData(walkerId),
  });

  const completedSteps = getCompletedStepsCount(vData || undefined);

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestsRepository.updateRequestStatus(requestId, 'accepted'),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['walker_requests', walkerId] });
      showToast(APP_STRINGS.toasts.walkAccepted(updated.ownerName));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestsRepository.updateRequestStatus(requestId, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walker_requests', walkerId] });
      showToast('Solicitud rechazada');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestsRepository.updateRequestStatus(requestId, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walker_requests', walkerId] });
      showToast(APP_STRINGS.toasts.walkCompleted);
    },
  });

  const simulateApprovalMutation = useMutation({
    mutationFn: () => verificationRepository.simulateApproval(walkerId),
    onSuccess: () => {
      setStatus('approved');
      showToast(APP_STRINGS.toasts.verificationApproved);
    },
  });

  const newRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter(
    (r) => r.status === 'accepted' || r.status === 'completed'
  );
  const historyRequests = requests.filter(
    (r) =>
      r.status === 'rejected' ||
      r.status === 'cancelled' ||
      r.status === 'confirmed'
  );

  const displayedRequests =
    segment === 'new'
      ? newRequests
      : segment === 'accepted'
      ? acceptedRequests
      : historyRequests;

  const handleAcceptPress = (req: WalkRequest) => {
    if (status !== 'approved') {
      showToast(APP_STRINGS.errors.verificationRequiredToAccept);
      if (status === 'pending') {
        router.push('/verification');
      }
      return;
    }
    acceptMutation.mutate(req.id);
  };

  const renderItem = ({ item }: { item: WalkRequest }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar name={item.ownerName} colorName="peach" size={44} />
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            <Text style={styles.ownerZone}>{item.ownerZone}</Text>
          </View>
          <Text style={styles.priceText}>{item.price} Bs</Text>
        </View>

        <View style={styles.chipsRow}>
          <View style={styles.chipBox}>
            <Text style={styles.chipText}>
              {item.dayText} · {item.timeText} · {item.durationMinutes} min
            </Text>
          </View>
          <View style={styles.chipBox}>
            <Text style={styles.chipText}>
              {item.dogName} ·{' '}
              {item.dogSize === 'small'
                ? 'Pequeño'
                : item.dogSize === 'large'
                ? 'Grande'
                : 'Mediano'}
            </Text>
          </View>
        </View>

        {Boolean(item.note) && (
          <Text style={styles.noteText}>“{item.note}”</Text>
        )}

        {/* Actions for New Requests */}
        {segment === 'new' && (
          <View style={styles.actionsRow}>
            <Button
              title="Rechazar"
              variant="outline"
              style={styles.actionButton}
              onPress={() => rejectMutation.mutate(item.id)}
              size="sm"
            />
            <Button
              title="Aceptar"
              variant={status === 'approved' ? 'primary' : 'disabled'}
              style={styles.actionButton}
              onPress={() => handleAcceptPress(item)}
              size="sm"
            />
          </View>
        )}

        {/* Actions for Accepted Requests */}
        {segment === 'accepted' && (
          <View style={styles.acceptedActionsCol}>
            <Button
              title={`Escribir a ${item.ownerName}`}
              variant="primary"
              size="sm"
              onPress={() => router.push(`/chat/${item.id}`)}
            />
            {item.status === 'accepted' && (
              <Button
                title="Marcar como completado"
                variant="outline"
                size="sm"
                style={styles.completeBtn}
                onPress={() => completeMutation.mutate(item.id)}
              />
            )}
            {item.status === 'completed' && (
              <Text style={styles.waitingConfirmText}>
                ✓ Marcado completado · Esperando confirmación del dueño
              </Text>
            )}
          </View>
        )}

        {/* History info */}
        {segment === 'history' && (
          <View style={styles.historyRow}>
            <Text style={styles.historyStatusText}>
              {item.status === 'rejected'
                ? 'Rechazada por ti'
                : item.status === 'cancelled'
                ? 'Cancelada por el dueño'
                : 'Paseo completado y calificado ★★★★★'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {walker?.name || 'Paseador'}</Text>
        <Text style={styles.title}>Solicitudes</Text>

        {/* Status Banners */}
        {status === 'pending' && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/verification')}
            style={styles.pendingBanner}
          >
            <Text style={styles.pendingTitle}>
              Completa tu verificación para aceptar paseos
            </Text>
            <View style={styles.progressRow}>
              {[1, 2, 3, 4].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.progressBar,
                    step <= completedSteps
                      ? styles.progressBarActive
                      : styles.progressBarInactive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.pendingSubtitle}>
              {completedSteps} de 4 pasos · Continuar →
            </Text>
          </TouchableOpacity>
        )}

        {status === 'in_review' && (
          <View style={styles.reviewBanner}>
            <Text style={styles.reviewTitle}>
              Tu verificación está en revisión
            </Text>
            <Text style={styles.reviewSubtitle}>
              Te avisaremos por WhatsApp en 48 horas. Mientras, ya puedes ver
              solicitudes.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => simulateApprovalMutation.mutate()}
            >
              <Text style={styles.simulateLink}>
                Simular aprobación (prototipo)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.segmentedContainer}>
          <Segmented
            options={[
              { value: 'new', label: 'Nuevas', count: newRequests.length },
              {
                value: 'accepted',
                label: 'Aceptadas',
                count: acceptedRequests.length,
              },
              { value: 'history', label: 'Historial' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </View>
      </View>

      <FlatList
        data={displayedRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={
              segment === 'new'
                ? 'No tienes solicitudes nuevas'
                : segment === 'accepted'
                ? 'Aún no aceptaste paseos'
                : 'Sin historial todavía'
            }
            subtitle={
              segment === 'new'
                ? 'Cuando un dueño de tu zona solicite un paseo aparecerá aquí.'
                : undefined
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
    marginBottom: 12,
  },
  pendingBanner: {
    backgroundColor: '#2A2420',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  pendingTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#F7F2EA',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#3E8E5E',
  },
  progressBarInactive: {
    backgroundColor: '#4A413A',
  },
  pendingSubtitle: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#D9CCB8',
  },
  reviewBanner: {
    backgroundColor: '#EFE6D8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  reviewTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    lineHeight: 18,
    marginBottom: 8,
  },
  simulateLink: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#2F6E48',
    textDecorationLine: 'underline',
  },
  segmentedContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  ownerZone: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
  },
  priceText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chipBox: {
    backgroundColor: '#F7F2EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#2A2420',
  },
  noteText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B6058',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  acceptedActionsCol: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingTop: 12,
  },
  completeBtn: {
    marginTop: 4,
  },
  waitingConfirmText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#2F6E48',
    textAlign: 'center',
    marginTop: 4,
  },
  historyRow: {
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingTop: 10,
  },
  historyStatusText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#8A7D70',
  },
});

