import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export interface UploadTileProps {
  label: string;
  isUploaded: boolean;
  onPress: () => void;
  aspectRatio?: number;
}

export const UploadTile: React.FC<UploadTileProps> = ({
  label,
  isUploaded,
  onPress,
  aspectRatio = 4 / 3,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        { aspectRatio },
        isUploaded ? styles.uploadedContainer : styles.emptyContainer,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            isUploaded ? styles.uploadedText : styles.emptyText,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.subtext,
            isUploaded ? styles.uploadedText : styles.emptySubtext,
          ]}
        >
          {isUploaded ? '✓ Cargado' : 'Tocar para subir'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  emptyContainer: {
    backgroundColor: '#F7F2EA',
    borderColor: '#CDBFAB',
    borderStyle: 'dashed',
  },
  uploadedContainer: {
    backgroundColor: '#E4EFE6',
    borderColor: '#3E8E5E',
    borderStyle: 'solid',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtext: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: '#2A2420',
  },
  emptySubtext: {
    color: '#6B6058',
  },
  uploadedText: {
    color: '#2F6E48',
  },
});

