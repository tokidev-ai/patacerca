import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Button } from './Button';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HORIZONTAL_INSET = 48;
const IMAGE_MAX_HEIGHT = 280;

function getImageFrameSize(source: ImageSourcePropType): {
  width: number;
  height: number;
} {
  const maxWidth = SCREEN_WIDTH - IMAGE_HORIZONTAL_INSET;
  const resolved = Image.resolveAssetSource(source as number);

  if (resolved?.width && resolved?.height) {
    const ratio = resolved.width / resolved.height;
    let height = maxWidth / ratio;
    let width = maxWidth;
    if (height > IMAGE_MAX_HEIGHT) {
      height = IMAGE_MAX_HEIGHT;
      width = height * ratio;
    }
    return { width, height };
  }

  return { width: maxWidth, height: Math.min(maxWidth * 0.75, IMAGE_MAX_HEIGHT) };
}

export interface EmptyStateProps {
  imageSource?: ImageSourcePropType;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  imageSource,
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  const imageFrame = useMemo(
    () => (imageSource ? getImageFrameSize(imageSource) : null),
    [imageSource]
  );

  return (
    <View style={[styles.container, style]}>
      {imageSource && imageFrame ? (
        <View style={styles.imageOuter}>
          <View
            style={[
              styles.imageFrame,
              { width: imageFrame.width, height: imageFrame.height },
            ]}
          >
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              accessibilityRole="image"
            />
          </View>
        </View>
      ) : null}

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
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  imageOuter: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
  },
  image: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 8,
  },
  buttonWrapper: {
    minWidth: 200,
    width: '100%',
    maxWidth: 320,
    marginTop: 4,
  },
});
