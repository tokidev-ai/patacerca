import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';

function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export interface SearchableOptionListProps {
  options: readonly string[];
  /** Selección única */
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  maxListHeight?: number;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
}

export interface SearchableOptionListMultiProps {
  options: readonly string[];
  /** Selección múltiple */
  values: string[];
  onChange: (values: string[]) => void;
  searchPlaceholder?: string;
  maxListHeight?: number;
  emptyMessage?: string;
  minSelected?: number;
  style?: StyleProp<ViewStyle>;
}

type RowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
};

const OptionRow: React.FC<RowProps> = ({ label, selected, onPress, multi }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={[styles.row, selected && styles.rowSelected]}
  >
    <Text
      style={[styles.rowLabel, selected && styles.rowLabelSelected]}
      numberOfLines={1}
    >
      {label}
    </Text>
    <View style={[styles.indicator, selected && styles.indicatorSelected]}>
      {selected ? (
        <AppIcon name="check" size={14} color="#FFFFFF" />
      ) : multi ? (
        <View style={styles.indicatorEmpty} />
      ) : null}
    </View>
  </TouchableOpacity>
);

const SearchableOptionListBase: React.FC<{
  options: readonly string[];
  searchPlaceholder: string;
  maxListHeight: number;
  emptyMessage: string;
  style?: StyleProp<ViewStyle>;
  renderRows: (filtered: readonly string[]) => React.ReactNode;
}> = ({ options, searchPlaceholder, maxListHeight, emptyMessage, style, renderRows }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return options;
    return options.filter((opt) => normalizeForSearch(opt).includes(q));
  }, [options, query]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchWrap}>
        <AppIcon name="search" size={18} color="#8A7D70" style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor="#8A7D70"
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      <ScrollView
        style={[styles.list, { maxHeight: maxListHeight }]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        ) : (
          renderRows(filtered)
        )}
      </ScrollView>
    </View>
  );
};

/** Lista vertical con buscador — elegir una opción (formularios, zona, etc.). */
export const SearchableOptionList: React.FC<SearchableOptionListProps> = ({
  options,
  value,
  onChange,
  searchPlaceholder = 'Buscar…',
  maxListHeight = 220,
  emptyMessage = 'No hay resultados para tu búsqueda.',
  style,
}) => (
  <SearchableOptionListBase
    options={options}
    searchPlaceholder={searchPlaceholder}
    maxListHeight={maxListHeight}
    emptyMessage={emptyMessage}
    style={style}
    renderRows={(filtered) =>
      filtered.map((opt) => (
        <OptionRow
          key={opt}
          label={opt}
          selected={value === opt}
          onPress={() => onChange(opt)}
        />
      ))
    }
  />
);

/** Lista vertical con buscador — elegir varias opciones (ej. zonas donde paseas). */
export const SearchableOptionListMulti: React.FC<SearchableOptionListMultiProps> = ({
  options,
  values,
  onChange,
  searchPlaceholder = 'Buscar…',
  maxListHeight = 240,
  emptyMessage = 'No hay resultados para tu búsqueda.',
  minSelected = 1,
  style,
}) => {
  const toggle = (opt: string) => {
    const isOn = values.includes(opt);
    if (isOn) {
      if (values.length <= minSelected) return;
      onChange(values.filter((v) => v !== opt));
      return;
    }
    onChange([...values, opt]);
  };

  return (
    <SearchableOptionListBase
      options={options}
      searchPlaceholder={searchPlaceholder}
      maxListHeight={maxListHeight}
      emptyMessage={emptyMessage}
      style={style}
      renderRows={(filtered) =>
        filtered.map((opt) => (
          <OptionRow
            key={opt}
            label={opt}
            selected={values.includes(opt)}
            onPress={() => toggle(opt)}
            multi
          />
        ))
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    backgroundColor: '#FFFCF7',
    overflow: 'hidden',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: '#2A2420',
    paddingVertical: 10,
  },
  list: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowSelected: {
    backgroundColor: '#E4EFE6',
  },
  rowLabel: {
    flex: 1,
    fontFamily: 'Figtree_500Medium',
    fontSize: 15,
    color: '#2A2420',
  },
  rowLabelSelected: {
    fontFamily: 'Figtree_600SemiBold',
    color: '#2F6E48',
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CDBFAB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFCF7',
  },
  indicatorSelected: {
    backgroundColor: '#3E8E5E',
    borderColor: '#3E8E5E',
  },
  indicatorEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    paddingHorizontal: 14,
    paddingVertical: 16,
    textAlign: 'center',
  },
});
