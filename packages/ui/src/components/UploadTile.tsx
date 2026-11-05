import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Image,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';

export interface UploadTileProps {
  label: string;
  isUploaded: boolean;
  onPress: () => void;
  aspectRatio?: number;
  previewUri?: string | null;
  /** Resalta borde cuando falta en un intento de guardar */
  highlightMissing?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const UploadTile: React.FC<UploadTileProps> = ({
  label,
  isUploaded,
  onPress,
  aspectRatio = 4 / 3,
  previewUri,
  highlightMissing = false,
  style,
}) => {
  const showPreview = Boolean(previewUri);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        { aspectRatio },
        isUploaded ? styles.uploadedContainer : styles.emptyContainer,
        highlightMissing && !isUploaded && styles.missingContainer,
        style,
      ]}
    >
      {showPreview ? (
        <>
          <Image
            source={{ uri: previewUri! }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.previewOverlay} />
        </>
      ) : null}
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            isUploaded ? styles.uploadedText : styles.emptyText,
            showPreview && styles.labelOnPreview,
          ]}
        >
          {label}
        </Text>
        {isUploaded ? (
          <View style={styles.uploadedRow}>
            <AppIcon name="check" size={14} color="#2F6E48" />
            <Text style={[styles.subtext, styles.uploadedText]}>Cargado</Text>
          </View>
        ) : (
          <Text style={[styles.subtext, styles.emptySubtext]}>Tocar para subir</Text>
        )}
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
    overflow: 'hidden',
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
  missingContainer: {
    borderColor: '#B4472B',
    backgroundColor: '#FBF0EC',
  },
  previewImage: {
    ...StyleSheet.absoluteFill,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(42, 36, 32, 0.35)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  labelOnPreview: {
    color: '#FFFCF7',
  },
  subtext: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
