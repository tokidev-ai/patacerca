import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AppIcon, type AppIconName } from './AppIcon';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Datos clave en chips (ej. "Hoy · 22:45", "20 Bs"). */
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` para acciones destructivas (rechazar, eliminar, salir). */
  tone?: 'primary' | 'danger';
  icon?: AppIconName;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Respaldo nativo si la app no montó `ConfirmDialogProvider`. */
const nativeConfirm: ConfirmFn = (o) =>
  new Promise((resolve) => {
    Alert.alert(
      o.title,
      [o.message, ...(o.details ?? [])].filter(Boolean).join('\n'),
      [
        {
          text: o.cancelLabel ?? 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: o.confirmLabel ?? 'Confirmar',
          style: o.tone === 'danger' ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

/**
 * Confirmación con el estilo de Patacerca.
 * Uso: `const confirm = useConfirm(); if (await confirm({ title: '…' })) { … }`
 */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext) ?? nativeConfirm;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Diálogo controlado. Normalmente se usa vía `useConfirm()`. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  details,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  icon,
  onCancel,
  onConfirm,
}) => {
  const danger = tone === 'danger';
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  danger ? styles.iconDanger : styles.iconPrimary,
                ]}
              >
                <AppIcon
                  name={icon ?? (danger ? 'alert-triangle' : 'check')}
                  size={24}
                  color={danger ? '#B4472B' : '#3E8E5E'}
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              {Boolean(message) && <Text style={styles.message}>{message}</Text>}

              {details && details.length > 0 && (
                <View style={styles.detailsRow}>
                  {details.map((d) => (
                    <View key={d} style={styles.detailChip}>
                      <Text style={styles.detailText}>{d}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Button
                  title={cancelLabel}
                  variant="outline"
                  size="md"
                  onPress={onCancel}
                  style={styles.actionButton}
                />
                <Button
                  title={confirmLabel}
                  variant={danger ? 'danger' : 'primary'}
                  size="md"
                  onPress={onConfirm}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/** Montar una vez en el layout raíz de cada app. */
export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    resolverRef.current?.(false);
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          visible
          {...options}
          onCancel={() => close(false)}
          onConfirm={() => close(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 36, 32, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFCF7',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconPrimary: {
    backgroundColor: '#E4EFE6',
  },
  iconDanger: {
    backgroundColor: '#FBEAE4',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: '#6B6058',
    textAlign: 'center',
    marginTop: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  detailChip: {
    backgroundColor: '#F7F2EA',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#4A413A',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    width: 'auto',
    paddingHorizontal: 12,
  },
});
