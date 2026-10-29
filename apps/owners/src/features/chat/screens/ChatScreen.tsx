import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, IconButton, ChatBubble, ChatInput } from '@patacerca/ui';
import { ChatMessage, APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';

export const ChatScreen: React.FC = () => {
  const router = useRouter();
  const { walkerId } = useLocalSearchParams<{ walkerId: string }>();
  const queryClient = useQueryClient();
  const { chatRepository, walkersRepository } = useData();
  const { owner } = useSessionStore();
  const flatListRef = useRef<FlatList>(null);

  const ownerPhone = owner?.phone || '70000000';

  const { data: walker } = useQuery({
    queryKey: ['walker', walkerId],
    queryFn: () => walkersRepository.getWalkerById(walkerId || ''),
    enabled: Boolean(walkerId),
  });

  const { data: thread } = useQuery({
    queryKey: ['thread', ownerPhone, walkerId],
    queryFn: () => chatRepository.getThread(ownerPhone, walkerId || ''),
    refetchInterval: 1500, // Poll for mock auto-reply
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      chatRepository.sendMessage(
        ownerPhone,
        walkerId || '',
        'owner',
        text,
        owner?.name || 'Dueño',
        walker?.name || 'Paseador'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['thread', ownerPhone, walkerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['owner_threads', ownerPhone],
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
    if (!walker) return;
    const text = encodeURIComponent(
      `¡Hola ${walker.name}! Te escribo desde Patacerca para coordinar el paseo.`
    );
    Linking.openURL(`https://wa.me/591${walker.phone}?text=${text}`);
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
            <Avatar
              name={walker?.name || 'Paseador'}
              colorName={walker?.colorName}
              size={40}
            />
            <View style={styles.nameBlock}>
              <Text style={styles.headerName}>
                {walker?.name || 'Paseador'}
              </Text>
              <Text style={styles.verifiedText}>✓ Verificado</Text>
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

        {/* Security Warning */}
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            {APP_STRINGS.chat.disclaimer}
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }: { item: ChatMessage }) => (
            <ChatBubble
              text={item.text}
              isSelf={item.sender === 'owner'}
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
  verifiedText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 12,
    color: '#2F6E48',
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
  warningContainer: {
    backgroundColor: '#F7F2EA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  warningText: {
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

