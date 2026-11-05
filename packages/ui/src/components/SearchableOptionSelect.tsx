import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { SearchableOptionList, SearchableOptionListMulti } from './SearchableOptionList';
import { OptionSheet } from './OptionSheet';
import { SelectChip } from './SelectChip';

const LIST_MAX_HEIGHT = Math.min(420, Dimensions.get('window').height * 0.52);

export interface SearchableOptionSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Etiqueta sobre el selector (opcional). */
  label?: string;
  /** Texto cuando no hay valor (poco común en zonas). */
  placeholder?: string;
  searchPlaceholder?: string;
  sheetTitle?: string;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  /** `chip` = pill en fila de selectores; `field` = selector ancho (formularios). */
  variant?: 'field' | 'chip';
  /**
   * Texto fijo en el chip (no muestra el valor elegido).
   * Útil en búsqueda: "Selecciona tu zona" en lugar del nombre del barrio.
   */
  chipLabel?: string;
}

function formatMultiSummary(values: string[]): string {
  if (values.length === 0) return 'Elige al menos una';
  if (values.length === 1) return values[0]!;
  if (values.length === 2) return `${values[0]}, ${values[1]}`;
  return `${values.length} zonas seleccionadas`;
}

type FieldSelectTriggerProps = {
  label?: string;
  valueText: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const FieldSelectTrigger: React.FC<FieldSelectTriggerProps> = ({
  label,
  valueText,
  onPress,
  style,
}) => (
  <View style={style}>
    {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.trigger}
      accessibilityRole="button"
      accessibilityLabel={label ? `${label}: ${valueText}` : valueText}
    >
      <Text style={styles.triggerText} numberOfLines={1}>
        {valueText}
      </Text>
      <AppIcon name="chevron-down" size={20} color="#6B6058" />
    </TouchableOpacity>
  </View>
);

/** Selector compacto: al tocar abre sheet con buscador + lista (una opción). */
export const SearchableOptionSelect: React.FC<SearchableOptionSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Elegir…',
  searchPlaceholder = 'Buscar…',
  sheetTitle,
  emptyMessage,
  style,
  variant = 'field',
  chipLabel,
}) => {
  const [open, setOpen] = useState(false);
  const displayValue = value?.trim() ? value : placeholder;
  const chipText = chipLabel?.trim() || displayValue;

  const trigger =
    variant === 'chip' ? (
      <SelectChip
        label={chipText}
        onPress={() => setOpen(true)}
        emphasized={chipLabel ? false : Boolean(value?.trim())}
        style={style}
        accessibilityLabel={
          chipLabel
            ? `${chipLabel}. Zona actual: ${displayValue}`
            : `Zona: ${displayValue}`
        }
      />
    ) : (
      <FieldSelectTrigger
        label={label}
        valueText={displayValue}
        onPress={() => setOpen(true)}
        style={style}
      />
    );

  return (
    <>
      {trigger}
      <OptionSheet
        visible={open}
        title={sheetTitle ?? label ?? 'Elegir opción'}
        onClose={() => setOpen(false)}
      >
        <SearchableOptionList
          options={options}
          value={value}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
          searchPlaceholder={searchPlaceholder}
          maxListHeight={LIST_MAX_HEIGHT}
          emptyMessage={emptyMessage}
        />
      </OptionSheet>
    </>
  );
};

export interface SearchableOptionSelectMultiProps {
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  searchPlaceholder?: string;
  sheetTitle?: string;
  emptyMessage?: string;
  minSelected?: number;
  confirmLabel?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'field' | 'chip';
}

/** Selector compacto — varias opciones; confirmar con botón en el sheet. */
export const SearchableOptionSelectMulti: React.FC<SearchableOptionSelectMultiProps> = ({
  options,
  values,
  onChange,
  label,
  searchPlaceholder = 'Buscar…',
  sheetTitle,
  emptyMessage,
  minSelected = 1,
  confirmLabel = 'Listo',
  style,
  variant = 'field',
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(values);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const summary = useMemo(() => formatMultiSummary(values), [values]);

  const handleConfirm = () => {
    if (draft.length < minSelected) return;
    onChange(draft);
    setOpen(false);
  };

  const trigger =
    variant === 'chip' ? (
      <SelectChip
        label={summary}
        onPress={() => setOpen(true)}
        emphasized={values.length > 0}
        style={style}
      />
    ) : (
      <FieldSelectTrigger
        label={label}
        valueText={summary}
        onPress={() => setOpen(true)}
        style={style}
      />
    );

  return (
    <>
      {trigger}
      <OptionSheet
        visible={open}
        title={sheetTitle ?? label ?? 'Elegir opciones'}
        onClose={() => setOpen(false)}
        footer={
          <Button
            title={confirmLabel}
            onPress={handleConfirm}
            size="lg"
            disabled={draft.length < minSelected}
          />
        }
      >
        <SearchableOptionListMulti
          options={options}
          values={draft}
          onChange={setDraft}
          searchPlaceholder={searchPlaceholder}
          maxListHeight={LIST_MAX_HEIGHT}
          emptyMessage={emptyMessage}
          minSelected={minSelected}
        />
      </OptionSheet>
    </>
  );
};

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#6B6058',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  triggerText: {
    flex: 1,
    fontFamily: 'Figtree_500Medium',
    fontSize: 16,
    color: '#2A2420',
  },
});
