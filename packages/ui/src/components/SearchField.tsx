import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';
import { AppIcon } from './AppIcon';

export interface SearchFieldProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
}

/** Barra de búsqueda compacta (icono + input), estilo apps modernas. */
export const SearchField: React.FC<SearchFieldProps> = ({
  containerStyle,
  inputStyle,
  value,
  onChangeText,
  placeholder = 'Buscar…',
  ...props
}) => {
  const showClear = typeof value === 'string' && value.length > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <AppIcon name="search" size={18} color="#8A7D70" style={styles.leadingIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A7D70"
        style={[styles.input, inputStyle]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...props}
      />
      {showClear && onChangeText ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
        >
          <AppIcon name="x" size={18} color="#8A7D70" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 9999,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  leadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: '#2A2420',
    paddingVertical: 10,
    minWidth: 0,
  },
});
