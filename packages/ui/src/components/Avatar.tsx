import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { getInitials } from '@patacerca/core';
import { avatarColors, AvatarColorName } from '@patacerca/theme';

export interface AvatarProps {
  name: string;
  size?: 40 | 44 | 48 | 56 | 64 | 80;
  colorName?: AvatarColorName | string;
  imageUri?: string;
  imageSource?: ImageSourcePropType;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 56,
  colorName = 'green',
  imageUri,
  imageSource,
}) => {
  const initials = getInitials(name);
  // Si la foto remota no carga, se muestran las iniciales en vez de un círculo en blanco.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const matched = avatarColors.find((c) => c.name === colorName) || avatarColors[0]!;

  const fontSize = Math.round(size * 0.38);

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  if (imageUri && imageUri !== failedUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        onError={(event) => {
          console.warn(
            '[avatar] no cargó la imagen:',
            imageUri,
            event.nativeEvent?.error
          );
          setFailedUri(imageUri);
        }}
        style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: matched.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: matched.text,
            lineHeight: fontSize * 1.2,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: 'BricolageGrotesque_700Bold',
    textAlign: 'center',
  },
});
