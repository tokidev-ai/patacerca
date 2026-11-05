import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  VerifiedBadge,
  EmptyState,
  SearchableOptionSelect,
  SearchField,
  ToggleFilterSelect,
  type ToggleFilterItem,
} from '@patacerca/ui';
import { Walker, COCHABAMBA_ZONES } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';

const WALKER_FILTER_ITEMS: ToggleFilterItem[] = [
  { id: 'today', label: 'Disponible hoy' },
  { id: 'large', label: 'Acepta perros grandes' },
  { id: 'travel', label: 'Cuida en viajes' },
  { id: 'price', label: 'Hasta 20 Bs (paseo 30 min)' },
];

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const { walkersRepository } = useData();
  const { owner } = useSessionStore();

  const [selectedZone, setSelectedZone] = useState<string>(owner?.zone || 'Queru Queru');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [acceptsLargeDogs, setAcceptsLargeDogs] = useState(false);
  const [travelCare, setTravelCare] = useState(false);
  const [maxPrice20, setMaxPrice20] = useState(false);

  const { data: walkers = [], isLoading } = useQuery({
    queryKey: [
      'walkers',
      selectedZone,
      searchQuery,
      onlyAvailableToday,
      acceptsLargeDogs,
      travelCare,
      maxPrice20,
    ],
    queryFn: () =>
      walkersRepository.getWalkers({
        zone: selectedZone,
        query: searchQuery,
        availableToday: onlyAvailableToday,
        acceptsLargeDogs: acceptsLargeDogs,
        travelCare: travelCare,
        maxPrice: maxPrice20 ? 20 : undefined,
      }),
  });

  const filterValues = useMemo(
    () => ({
      today: onlyAvailableToday,
      large: acceptsLargeDogs,
      travel: travelCare,
      price: maxPrice20,
    }),
    [onlyAvailableToday, acceptsLargeDogs, travelCare, maxPrice20]
  );

  const handleFilterToggle = (id: string, next: boolean) => {
    switch (id) {
      case 'today':
        setOnlyAvailableToday(next);
        break;
      case 'large':
        setAcceptsLargeDogs(next);
        break;
      case 'travel':
        setTravelCare(next);
        break;
      case 'price':
        setMaxPrice20(next);
        break;
      default:
        break;
    }
  };

  const clearFilterToggles = () => {
    setOnlyAvailableToday(false);
    setAcceptsLargeDogs(false);
    setTravelCare(false);
    setMaxPrice20(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    clearFilterToggles();
  };

  const hasActiveFilters =
    searchQuery || onlyAvailableToday || acceptsLargeDogs || travelCare || maxPrice20;

  const { inZoneCount, nearbyCount } = useMemo(() => {
    let inZone = 0;
    let nearby = 0;
    walkers.forEach((w) => {
      if (w.zone.toLowerCase() === selectedZone.toLowerCase()) {
        inZone++;
      } else {
        nearby++;
      }
    });
    return { inZoneCount: inZone, nearbyCount: nearby };
  }, [walkers, selectedZone]);

  const resultsSummary = useMemo(() => {
    if (inZoneCount > 0 && nearbyCount > 0) {
      return `${inZoneCount} en ${selectedZone} · ${nearbyCount} cerca`;
    }
    if (inZoneCount > 0) return `${inZoneCount} en ${selectedZone}`;
    if (nearbyCount > 0) return `${nearbyCount} en zonas cercanas`;
    return `Sin resultados en ${selectedZone}`;
  }, [inZoneCount, nearbyCount, selectedZone]);

  const renderWalkerCard = ({ item }: { item: Walker }) => {
    const isExactZone = item.zone.toLowerCase() === selectedZone.toLowerCase();
    const subtitle = isExactZone
      ? `${item.zone} · ${item.distanceText}`
      : `${item.zone} · zona cercana`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/walker/${item.id}`)}
        style={styles.card}
      >
        <Avatar name={item.name} colorName={item.colorName} size={56} />
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.walkerName}>{item.name}</Text>
            <VerifiedBadge size={16} />
          </View>
          <Text style={styles.walkerSubtitle}>{subtitle}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.ratingText}>
              ★ {item.rating.toFixed(1)} · {item.reviewsCount} reseñas
            </Text>
            {item.availableToday && (
              <Text style={styles.availableBadge}> · Disponible hoy</Text>
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.fromLabel}>desde</Text>
          <Text style={styles.priceText}>{item.price30} Bs</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.resultsCounter}>{resultsSummary}</Text>
      {hasActiveFilters ? (
        <TouchableOpacity onPress={clearFilters} hitSlop={8}>
          <Text style={styles.clearFilters}>Limpiar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.greeting}>Hola, {owner?.name?.split(' ')[0] || 'Amigo'}</Text>
            <Text style={styles.title}>Paseadores cerca de ti</Text>
          </View>
        </View>

        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre…"
          containerStyle={styles.searchBar}
        />

        <View style={styles.selectorRow}>
          <SearchableOptionSelect
            variant="chip"
            chipLabel="Selecciona tu zona"
            options={COCHABAMBA_ZONES}
            value={selectedZone}
            onChange={setSelectedZone}
            searchPlaceholder="Buscar barrio…"
            sheetTitle="Selecciona tu zona"
          />
          <ToggleFilterSelect
            items={WALKER_FILTER_ITEMS}
            values={filterValues}
            onToggle={handleFilterToggle}
            onClearAll={clearFilterToggles}
            sheetTitle="Filtrar paseadores"
          />
        </View>
      </View>

      <FlatList
        data={walkers}
        keyExtractor={(item) => item.id}
        renderItem={renderWalkerCard}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No hay paseadores con esos filtros"
              subtitle="Prueba quitando algunos filtros para ver más opciones disponibles."
              actionTitle={hasActiveFilters ? 'Quitar filtros' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
    backgroundColor: '#F7F2EA',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    lineHeight: 28,
    color: '#2A2420',
    letterSpacing: -0.72,
  },
  searchBar: {
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 4,
  },
  resultsCounter: {
    flex: 1,
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#6B6058',
  },
  clearFilters: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginLeft: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 14,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walkerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  walkerSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  ratingText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#2A2420',
  },
  availableBadge: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#2F6E48',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  fromLabel: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 11,
    color: '#6B6058',
  },
  priceText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
});
