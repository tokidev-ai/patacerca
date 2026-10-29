import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ChatBubbleProps {
  text: string;
  isSelf: boolean;
  time?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  isSelf,
  time,
}) => {
  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.selfContainer : styles.otherContainer,
      ]}
    >
      <Text style={[styles.text, isSelf ? styles.selfText : styles.otherText]}>
        {text}
      </Text>
      {Boolean(time) && (
        <Text
          style={[styles.time, isSelf ? styles.selfTime : styles.otherTime]}
        >
          {time}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginVertical: 4,
  },
  selfContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#3E8E5E',
    borderBottomRightRadius: 4,
  },
  otherContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Figtree_400Regular',
    lineHeight: 21,
  },
  selfText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#2A2420',
  },
  time: {
    fontSize: 11,
    fontFamily: 'Figtree_400Regular',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  selfTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTime: {
    color: 'rgba(107, 96, 88, 0.75)',
  },
});

