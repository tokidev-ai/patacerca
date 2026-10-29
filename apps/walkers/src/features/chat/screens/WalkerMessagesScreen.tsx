import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Avatar, EmptyState } from '@patacerca/ui';
import { ChatThread } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';

export const WalkerMessagesScreen: React.FC = () => {
  const router = useRouter();
  const { chatRepository } = useWalkerData();
  const { walker, phone } = useWalkerSessionStore();

  const walkerId = walker?.id || phone || 'w1';

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['walker_threads', walkerId],
    queryFn: () => chatRepository.getThreadsForWalker(walkerId),
  });

  const renderItem = ({ item }: { item: ChatThread }) => {
    const lastMsg = item.lastMessage;
    const isOwn = lastMsg?.sender === 'walker';
    const previewText = lastMsg
      ? `${isOwn ? 'Tú: ' : ''}${lastMsg.text}`
      : 'Conversación iniciada';

    const timeFormatted = lastMsg
      ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
        style={styles.threadItem}
      >
        <Avatar name={item.ownerName} colorName="peach" size={48} />
        <View style={styles.threadInfo}>
          <View style={styles.threadHeader}>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
          <Text style={styles.previewText} numberOfLines={1}>
            {previewText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="Aún no tienes conversaciones"
              subtitle="Acepta una solicitud para poder escribirle al dueño."
            />
          ) : undefined
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
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  threadInfo: {
    flex: 1,
    marginLeft: 14,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  timeText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#8A7D70',
  },
  previewText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
  },
  separator: {
    height: 1,
    backgroundColor: '#E6DCCD',
  },
});

