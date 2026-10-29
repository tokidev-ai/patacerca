import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, IconButton, ChatBubble, ChatInput } from '@patacerca/ui';
import { ChatMessage, APP_STRINGS } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';

export const WalkerChatScreen: React.FC = () => {
  const router = useRouter();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const queryClient = useQueryClient();
  const { chatRepository, requestsRepository } = useWalkerData();
  const { walker, phone } = useWalkerSessionStore();
  const flatListRef = useRef<FlatList>(null);

  const walkerId = walker?.id || phone || 'w1';

  // If threadId is request ID (e.g. 's1'), get the request to know owner phone
  const { data: request } = useQuery({
    queryKey: ['request_detail', threadId],
    queryFn: () => requestsRepository.getRequestById(threadId || ''),
    enabled: Boolean(threadId && !threadId.includes(':')),
  });

  const ownerPhone = request ? request.ownerPhone : threadId?.split(':')[0] || '70000001';
  const ownerName = request ? request.ownerName : 'Dueño';

  const { data: thread } = useQuery({
    queryKey: ['thread', ownerPhone, walkerId],
    queryFn: () => chatRepository.getThread(ownerPhone, walkerId),
    refetchInterval: 2000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      chatRepository.sendMessage(
        ownerPhone,
        walkerId,
        'walker',
        text,
        ownerName,
        walker?.name || 'Paseador'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['thread', ownerPhone, walkerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['walker_threads', walkerId],
      });
    },
  });

  const messages = thread?.messages || [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola ${ownerName}! Te escribo de Patacerca para coordinar el paseo.`
    );
    Linking.openURL(`https://wa.me/591${ownerPhone}?text=${text}`);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="back" size={40} onPress={() => router.back()} />
          <View style={styles.headerProfile}>
            <Avatar name={ownerName} colorName="peach" size={40} />
            <View style={styles.nameBlock}>
              <Text style={styles.headerName}>{ownerName}</Text>
              <Text style={styles.roleText}>Dueño</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenWhatsApp}
            style={styles.whatsAppButton}
          >
            <Text style={styles.whatsAppText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Advice banner */}
        <View style={styles.adviceBanner}>
          <Text style={styles.adviceText}>{APP_STRINGS.chat.walkerAdvice}</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }: { item: ChatMessage }) => (
            <ChatBubble
              text={item.text}
              isSelf={item.sender === 'walker'}
              time={new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          )}
        />

        {/* Input */}
        <ChatInput onSend={(text) => sendMutation.mutate(text)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameBlock: {
    justifyContent: 'center',
  },
  headerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  roleText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#6B6058',
  },
  whatsAppButton: {
    backgroundColor: '#E4EFE6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  whatsAppText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
    color: '#2F6E48',
  },
  adviceBanner: {
    backgroundColor: '#F7F2EA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  adviceText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#8A7D70',
    textAlign: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

