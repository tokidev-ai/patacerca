import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Button } from './Button';

export interface EmptyStateProps {
  imageSource?: ImageSourcePropType;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  imageSource,
  title,
  subtitle,
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {imageSource && (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {Boolean(subtitle) && <Text style={styles.subtitle}>{subtitle}</Text>}
      {Boolean(actionTitle && onAction) && (
        <View style={styles.buttonWrapper}>
          <Button title={actionTitle!} onPress={onAction!} size="md" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: '#6B6058',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonWrapper: {
    minWidth: 200,
    marginTop: 4,
  },
});

