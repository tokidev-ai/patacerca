import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SelectChip } from './SelectChip';
import { OptionSheet } from './OptionSheet';
import { Button } from './Button';
import { AppIcon } from './AppIcon';

export type ToggleFilterItem = {
  id: string;
  label: string;
  description?: string;
};

export interface ToggleFilterSelectProps {
  items: ToggleFilterItem[];
  values: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
  onClearAll?: () => void;
  triggerBaseLabel?: string;
  sheetTitle?: string;
  style?: StyleProp<ViewStyle>;
}

/** Selector de filtros (sheet con opciones on/off), mismo chip que la zona. */
export const ToggleFilterSelect: React.FC<ToggleFilterSelectProps> = ({
  items,
  values,
  onToggle,
  onClearAll,
  triggerBaseLabel = 'Filtros',
  sheetTitle = 'Filtrar paseadores',
  style,
}) => {
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(
    () => items.filter((item) => values[item.id]).length,
    [items, values]
  );

  const triggerLabel =
    activeCount > 0 ? `${triggerBaseLabel} · ${activeCount}` : triggerBaseLabel;

  return (
    <>
      <SelectChip
        label={triggerLabel}
        onPress={() => setOpen(true)}
        emphasized={activeCount > 0}
        style={style}
        accessibilityLabel={`${triggerBaseLabel}, ${activeCount} activos`}
      />
      <OptionSheet
        visible={open}
        title={sheetTitle}
        onClose={() => setOpen(false)}
        footer={
          <Button title="Listo" onPress={() => setOpen(false)} size="lg" />
        }
      >
        {items.map((item) => {
          const selected = Boolean(values[item.id]);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onToggle(item.id, !selected)}
              style={[styles.row, selected && styles.rowSelected]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>
                  {item.label}
                </Text>
                {item.description ? (
                  <Text style={styles.rowDescription}>{item.description}</Text>
                ) : null}
              </View>
              <View style={[styles.indicator, selected && styles.indicatorSelected]}>
                {selected ? <AppIcon name="check" size={14} color="#FFFFFF" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
        {activeCount > 0 && onClearAll ? (
          <TouchableOpacity onPress={onClearAll} style={styles.clearRow}>
            <Text style={styles.clearText}>Quitar todos los filtros</Text>
          </TouchableOpacity>
        ) : null}
      </OptionSheet>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE6D8',
  },
  rowSelected: {
    backgroundColor: '#F5FAF6',
    marginHorizontal: -4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderBottomColor: 'transparent',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 15,
    color: '#2A2420',
  },
  rowLabelSelected: {
    fontFamily: 'Figtree_600SemiBold',
    color: '#2F6E48',
  },
  rowDescription: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
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
  clearRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#3E8E5E',
  },
});
