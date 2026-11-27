import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, StatusPill, EmptyState, RatingModal, useConfirm } from '@patacerca/ui';
import { WalkRequest, APP_STRINGS, buildWhatsAppUrl } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const WalksScreen: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requestsRepository, walkersRepository } = useData();
  const { owner } = useSessionStore();
  const { showToast } = useToastStore();
  const confirm = useConfirm();

  const [ratingTarget, setRatingTarget] = useState<WalkRequest | null>(null);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['requests', owner?.phone],
    queryFn: () => requestsRepository.getRequestsByOwner(owner?.phone || '70000000'),
    enabled: Boolean(owner?.phone),
    // Sin push todavía: refrescamos para ver si el paseador aceptó/rechazó.
    refetchInterval: 30000,
  });

  useFocusEffect(
    useCallback(() => {
      if (owner?.phone) void refetch();
    }, [owner?.phone, refetch])
  );

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestsRepository.updateRequestStatus(requestId, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      showToast(APP_STRINGS.toasts.walkCancelled);
    },
  });

  const rateMutation = useMutation({
    mutationFn: ({
      requestId,
      rating,
      comment,
    }: {
      requestId: string;
      rating: number;
      comment?: string;
    }) => requestsRepository.rateCompletedWalk(requestId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['walker', ratingTarget?.walkerId] });
      queryClient.invalidateQueries({ queryKey: ['walkers'] });
      showToast(APP_STRINGS.toasts.walkRated);
      setRatingTarget(null);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      showToast('No se pudo guardar la calificación');
      setRatingTarget(null);
    },
  });

  const openWalkerWhatsApp = async (item: WalkRequest) => {
    const walker = await walkersRepository.getWalkerById(item.walkerId);
    if (!walker?.phone) return;
    const message = `Hola ${item.walkerName}, te escribo por el paseo de ${item.dogName} (${item.dayText} ${item.timeText}) en Patacerca.`;
    Linking.openURL(buildWhatsAppUrl(walker.phone, message));
  };

  const renderItem = ({ item }: { item: WalkRequest }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.walkerName}>{item.walkerName}</Text>
          <StatusPill status={item.status} />
        </View>

        <Text style={styles.detailsText}>
          {item.dayText} · {item.timeText} · {item.durationMinutes} min
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.dogInfo}>
            {item.dogName} ·{' '}
            {item.dogSize === 'small'
              ? 'Pequeño'
              : item.dogSize === 'large'
                ? 'Grande'
                : 'Mediano'}
          </Text>
          <Text style={styles.price}>{item.price} Bs</Text>
        </View>

        {Boolean(item.note) && <Text style={styles.noteText}>“{item.note}”</Text>}

        {item.status === 'completed' && item.rating == null && (
          <View style={styles.ratePrompt}>
            <Text style={styles.rateStars}>★★★★★</Text>
            <Text style={styles.rateTitle}>¿Cómo estuvo el paseo de {item.dogName}?</Text>
            <Text style={styles.rateSubtitle}>
              Califica a {item.walkerName}. Tu opinión ayuda a otros dueños.
            </Text>
            <Button
              title="Calificar paseo"
              size="md"
              onPress={() => setRatingTarget(item)}
              style={styles.rateButton}
            />
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => openWalkerWhatsApp(item)}>
            <Text style={styles.chatAction}>WhatsApp</Text>
          </TouchableOpacity>

          {item.status === 'pending' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={async () => {
                const ok = await confirm({
                  title: 'Cancelar paseo',
                  message: `¿Cancelar la solicitud de ${item.dogName} con ${item.walkerName}?`,
                  confirmLabel: 'Sí, cancelar',
                  cancelLabel: 'Volver',
                  tone: 'danger',
                });
                if (ok) cancelMutation.mutate(item.id);
              }}
            >
              <Text style={styles.cancelAction}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {item.rating != null && (
            <Text style={styles.ratedText}>
              Tu calificación {'★'.repeat(item.rating)}
              <Text style={styles.ratedTextMuted}>{'★'.repeat(5 - item.rating)}</Text>
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis paseos</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor="#3E8E5E"
            colors={['#3E8E5E']}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && !isLoading && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              imageSource={require('../../../../assets/duenos-paseos-vacio.jpg')}
              title="Aún no tienes paseos"
              subtitle="Encuentra a un paseador de confianza cerca de ti para consentir a tu perrito."
              actionTitle="Buscar paseador"
              onAction={() => router.push('/(tabs)/search')}
            />
          ) : undefined
        }
      />

      {ratingTarget && (
        <RatingModal
          visible={Boolean(ratingTarget)}
          walkerName={ratingTarget.walkerName}
          loading={rateMutation.isPending}
          onClose={() => setRatingTarget(null)}
          onSubmit={(rating, comment) =>
            rateMutation.mutate({
              requestId: ratingTarget.id,
              rating,
              comment,
            })
          }
        />
      )}
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
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walkerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  detailsText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dogInfo: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#2A2420',
  },
  price: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2A2420',
  },
  noteText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B6058',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingTop: 12,
    marginTop: 4,
  },
  chatAction: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2F6E48',
  },
  cancelAction: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#B4472B',
  },
  ratePrompt: {
    backgroundColor: '#E4EFE6',
    borderWidth: 1,
    borderColor: '#C5DEC9',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  rateStars: {
    fontSize: 22,
    letterSpacing: 4,
    color: '#3E8E5E',
    marginBottom: 6,
  },
  rateTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    color: '#2A2420',
    textAlign: 'center',
  },
  rateSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#4A413A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  rateButton: {
    alignSelf: 'stretch',
  },
  ratedText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginLeft: 'auto',
  },
  ratedTextMuted: {
    color: '#D9CDBC',
  },
});
