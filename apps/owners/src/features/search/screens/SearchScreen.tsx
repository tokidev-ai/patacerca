import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  VerifiedBadge,
  Chip,
  EmptyState,
} from '@patacerca/ui';
import { Walker, COCHABAMBA_ZONES } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';

export const SearchScreen: React.FC = () => {
  const router = useRouter();
  const { walkersRepository } = useData();
  const { owner } = useSessionStore();

  const [selectedZone, setSelectedZone] = useState<string>(
    owner?.zone || 'Queru Queru'
  );
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

  const clearFilters = () => {
    setSearchQuery('');
    setOnlyAvailableToday(false);
    setAcceptsLargeDogs(false);
    setTravelCare(false);
    setMaxPrice20(false);
  };

  const hasActiveFilters =
    searchQuery ||
    onlyAvailableToday ||
    acceptsLargeDogs ||
    travelCare ||
    maxPrice20;

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

  const renderWalkerCard = ({ item }: { item: Walker }) => {
    const isExactZone =
      item.zone.toLowerCase() === selectedZone.toLowerCase();
    const subtitle = isExactZone
      ? `${item.zone} · ${item.distanceText}`
      : `${item.zone} · zona cercana`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/walker/${item.id}`)}
        style={styles.card}
      >
        <Avatar
          name={item.name}
          colorName={item.colorName}
          size={56}
        />
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {owner?.name || 'Amigo'}</Text>
        <Text style={styles.title}>Paseadores cerca de ti</Text>

        <View style={styles.searchRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesScroll}
          >
            {COCHABAMBA_ZONES.map((z) => (
              <Chip
                key={z}
                label={z}
                selected={selectedZone === z}
                onPress={() => setSelectedZone(z)}
                size="sm"
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Buscar por nombre..."
            placeholderTextColor="#8A7D70"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <Chip
            label="Disponible hoy"
            selected={onlyAvailableToday}
            onPress={() => setOnlyAvailableToday(!onlyAvailableToday)}
            size="sm"
          />
          <Chip
            label="Perros grandes"
            selected={acceptsLargeDogs}
            onPress={() => setAcceptsLargeDogs(!acceptsLargeDogs)}
            size="sm"
          />
          <Chip
            label="Cuida en viajes"
            selected={travelCare}
            onPress={() => setTravelCare(!travelCare)}
            size="sm"
          />
          <Chip
            label="Hasta 20 Bs"
            selected={maxPrice20}
            onPress={() => setMaxPrice20(!maxPrice20)}
            size="sm"
          />
        </ScrollView>

        <Text style={styles.resultsCounter}>
          {inZoneCount > 0
            ? `${inZoneCount} en ${selectedZone}`
            : `Ninguno en ${selectedZone} todavía`}
          {nearbyCount > 0 ? ` · ${nearbyCount} en zonas cercanas` : ''}
        </Text>
      </View>

      <FlatList
        data={walkers}
        keyExtractor={(item) => item.id}
        renderItem={renderWalkerCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
    letterSpacing: -0.84,
    marginBottom: 12,
  },
  searchRow: {
    marginBottom: 10,
  },
  zonesScroll: {
    gap: 6,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
  },
  filtersScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  resultsCounter: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 8,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
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

