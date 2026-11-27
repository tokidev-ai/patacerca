import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '../keyboard-aware-scroll';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Hoja inferior. Maneja teclado e insets a mano porque en Android (edge-to-edge)
 * un Modal no recibe el resize ni los safe areas automáticamente.
 */
const BottomSheetBody: React.FC<Omit<BottomSheetProps, 'visible'>> = ({
  onClose,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + 24 }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.sheetContent,
          { paddingBottom: keyboardOpen ? 16 : Math.max(insets.bottom, 12) + 12 },
        ]}
      >
        {children}
      </View>
      <View style={{ height: keyboardHeight }} />
    </View>
  );
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {visible ? <BottomSheetBody onClose={onClose}>{children}</BottomSheetBody> : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 36, 32, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    flexShrink: 1,
  },
});
