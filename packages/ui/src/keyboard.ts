import { Platform } from 'react-native';

/** Comportamiento recomendado para KeyboardAvoidingView en Patacerca. */
export const keyboardAvoidingBehavior =
  Platform.OS === 'ios' ? ('padding' as const) : ('height' as const);
