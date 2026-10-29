import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusPill, EmptyState, RatingModal } from '@patacerca/ui';
import { WalkRequest, APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const WalksScreen: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requestsRepository } = useData();
  const { owner } = useSessionStore();
  const { showToast } = useToastStore();

  const [ratingTarget, setRatingTarget] = useState<WalkRequest | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', owner?.phone],
    queryFn: () => requestsRepository.getRequestsByOwner(owner?.phone || '70000000'),
    enabled: Boolean(owner?.phone),
  });

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
      showToast(APP_STRINGS.toasts.walkRated);
      setRatingTarget(null);
    },
  });

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
            {item.dogName} · {item.dogSize === 'small' ? 'Pequeño' : item.dogSize === 'large' ? 'Grande' : 'Mediano'}
          </Text>
          <Text style={styles.price}>{item.price} Bs</Text>
        </View>

        {Boolean(item.note) && (
          <Text style={styles.noteText}>“{item.note}”</Text>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/chat/${item.walkerId}`)}
          >
            <Text style={styles.chatAction}>Escribir al paseador</Text>
          </TouchableOpacity>

          {item.status === 'pending' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => cancelMutation.mutate(item.id)}
            >
              <Text style={styles.cancelAction}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {item.status === 'completed' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setRatingTarget(item)}
              style={styles.confirmBadge}
            >
              <Text style={styles.confirmText}>Calificar paseo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis paseos</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
  confirmBadge: {
    backgroundColor: '#E4EFE6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  confirmText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#2F6E48',
  },
});

