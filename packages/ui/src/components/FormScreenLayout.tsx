import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '../keyboard-aware-scroll';
import { keyboardAvoidingBehavior } from '../keyboard';

export const FORM_SCREEN_BACKGROUND = '#F7F2EA';

export interface FormScreenLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  horizontalPadding?: number;
  scrollContentStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  /** Sin safe area superior: el primer hijo (p. ej. una imagen) llega al borde de la pantalla. */
  edgeToEdgeTop?: boolean;
}

/**
 * Pantallas de formulario con scroll, botón fijo abajo, safe area inferior
 * y elevación del footer cuando aparece el teclado (owners + walkers).
 */
export const FormScreenLayout: React.FC<FormScreenLayoutProps> = ({
  children,
  footer,
  backgroundColor = FORM_SCREEN_BACKGROUND,
  horizontalPadding = 24,
  scrollContentStyle,
  keyboardVerticalOffset = 0,
  edgeToEdgeTop = false,
}) => {
  return (
    <SafeAreaView
      edges={edgeToEdgeTop ? ['left', 'right'] : ['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? keyboardAvoidingBehavior : undefined}
        style={styles.flex}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <KeyboardAwareScrollView
          style={styles.flex}
          extraBottomInset={footer ? 112 : 32}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
            scrollContentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </KeyboardAwareScrollView>
        {footer ? (
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            style={[
              styles.footerSafe,
              { paddingHorizontal: horizontalPadding, backgroundColor },
            ]}
          >
            <View style={styles.footerInner}>{footer}</View>
          </SafeAreaView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footerSafe: {
    paddingTop: 12,
  },
  footerInner: {
    paddingBottom: 4,
  },
});
