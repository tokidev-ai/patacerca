import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const FORM_SCREEN_BACKGROUND = '#F7F2EA';

export interface FormScreenLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  horizontalPadding?: number;
  scrollContentStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
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
}) => {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
            scrollContentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
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
    paddingBottom: 16,
  },
  footerSafe: {
    paddingTop: 12,
  },
  footerInner: {
    paddingBottom: 4,
  },
});
