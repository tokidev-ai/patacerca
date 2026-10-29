import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Escribe un mensaje...',
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#8A7D70"
        style={styles.input}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSend}
        disabled={!text.trim()}
        style={[styles.sendButton, !text.trim() && styles.disabledSendButton]}
      >
        <Text style={styles.sendText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
  },
  sendButton: {
    backgroundColor: '#3E8E5E',
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  disabledSendButton: {
    backgroundColor: '#E6DCCD',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },
});

