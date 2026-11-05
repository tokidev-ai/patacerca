import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { keyboardAvoidingBehavior } from '../keyboard';

export interface OptionSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Sheet inferior reutilizable (selectores, filtros, listas). */
export const OptionSheet: React.FC<OptionSheetProps> = ({
  visible,
  title,
  onClose,
  children,
  footer,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.modalRoot}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle} numberOfLines={2}>
            {title}
          </Text>
          <IconButton icon="close" size={36} onPress={onClose} />
        </View>
        <View style={styles.sheetBody}>{children}</View>
        {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(42, 36, 32, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    lineHeight: 26,
    color: '#2A2420',
  },
  sheetBody: {
    paddingBottom: 8,
  },
  sheetFooter: {
    paddingTop: 8,
    paddingBottom: 4,
  },
});
