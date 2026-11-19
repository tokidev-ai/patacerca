import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Avatar, type AvatarProps } from './Avatar';
import { AppIcon } from './AppIcon';
import { pickImageFromLibraryOrCamera } from '../pickImage';

export interface AvatarPickerProps {
  name: string;
  uri?: string | null;
  onChange: (uri: string) => void;
  size?: AvatarProps['size'];
  colorName?: AvatarProps['colorName'];
  label?: string;
  hint?: string;
  error?: string;
  /** Muestra un spinner sobre la foto (subiendo) y bloquea el toque. */
  loading?: boolean;
}

/** Avatar tocable para elegir/cambiar la foto de perfil (galería o cámara). */
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  name,
  uri,
  onChange,
  size = 80,
  colorName,
  label,
  hint,
  error,
  loading = false,
}) => {
  const handlePress = async () => {
    const picked = await pickImageFromLibraryOrCamera('Foto de perfil');
    if (picked) onChange(picked);
  };

  const badge = Math.max(24, Math.round(size * 0.36));

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} disabled={loading}>
        <Avatar
          name={name}
          size={size}
          colorName={colorName}
          imageUri={uri ?? undefined}
        />
        {loading ? (
          <View style={[styles.loadingOverlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator color="#FFFCF7" />
          </View>
        ) : (
          <View
            style={[
              styles.badge,
              { width: badge, height: badge, borderRadius: badge / 2 },
            ]}
          >
            <AppIcon name="camera" size={Math.round(badge * 0.5)} color="#FFFCF7" />
          </View>
        )}
      </TouchableOpacity>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#3E8E5E',
    borderWidth: 2,
    borderColor: '#F7F2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(42, 36, 32, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginTop: 10,
  },
  hint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#6B6058',
    marginTop: 2,
    textAlign: 'center',
  },
  error: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 6,
    textAlign: 'center',
  },
});
