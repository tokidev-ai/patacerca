import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  IconButton,
  Button,
  Stat,
  Card,
  VerifiedBadge,
} from '@patacerca/ui';
import { avatarColors } from '@patacerca/theme';
import { useData } from '../../../providers/DataProvider';

export const WalkerDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { walkersRepository } = useData();

  const { data: walker, isLoading } = useQuery({
    queryKey: ['walker', id],
    queryFn: () => walkersRepository.getWalkerById(id || ''),
    enabled: Boolean(id),
  });

  if (isLoading || !walker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const colorConfig =
    avatarColors.find((c) => c.name === walker.colorName) || avatarColors[0]!;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola ${walker.name}! Te encontré en Patacerca y me gustaría consultar por paseos.`
    );
    Linking.openURL(`https://wa.me/591${walker.phone}?text=${text}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with walker color */}
        <View
          style={[styles.headerContainer, { backgroundColor: colorConfig.bg }]}
        >
          <SafeAreaView>
            <View style={styles.navBar}>
              <IconButton
                icon="back"
                variant="translucent"
                onPress={() => router.back()}
              />
            </View>

            <View style={styles.headerInfo}>
              <Avatar
                name={walker.name}
                colorName={walker.colorName}
                size={80}
              />
              <Text style={styles.headerName}>{walker.name}</Text>
              <Text style={styles.headerSubtitle}>
                {walker.zone} · {walker.distanceText}
              </Text>
              <View style={styles.badgeRow}>
                <VerifiedBadge size={16} />
                <Text style={styles.badgeText}>Paseador verificado</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.body}>
          {/* 3 Stats */}
          <View style={styles.statsRow}>
            <Stat value={`${walker.price30} Bs`} label="30 min" />
            <Stat value={`${walker.price60} Bs`} label="60 min" />
            <Stat
              value={`★ ${walker.rating.toFixed(1)}`}
              label={`${walker.reviewsCount} reseñas`}
            />
          </View>

          {/* About section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre {walker.name}</Text>
            <Text style={styles.bioText}>{walker.bio}</Text>

            <View style={styles.tagsRow}>
              {walker.acceptsLargeDogs && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Acepta perros grandes</Text>
                </View>
              )}
              {walker.availableToday && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Disponible hoy</Text>
                </View>
              )}
              {walker.travelCare && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Cuida en viajes</Text>
                </View>
              )}
            </View>
          </View>

          {/* Verified by Patacerca Card */}
          <Card variant="accentSoft" style={styles.verifiedCard}>
            <Text style={styles.verifiedCardTitle}>
              Verificado por Patacerca
            </Text>
            <View style={styles.checkItem}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.checkText}>Identidad confirmada con carnet</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.checkText}>
                Certificado de antecedentes revisado
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.checkText}>Referencias comprobadas</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.checkText}>
                Entrevista personal con el equipo
              </Text>
            </View>
          </Card>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reseñas de tu zona</Text>
            {walker.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>
                    {rev.authorName} · {rev.zone}
                  </Text>
                  <Text style={styles.reviewStars}>
                    {'★'.repeat(rev.rating)}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          <Button
            title="Escribir"
            variant="outline"
            style={styles.writeButton}
            onPress={() => router.push(`/chat/${walker.id}`)}
          />
          <Button
            title="Solicitar paseo"
            variant="primary"
            style={styles.requestButton}
            onPress={() => router.push(`/request/${walker.id}`)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: '#6B6058',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerContainer: {
    paddingBottom: 28,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerName: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    color: '#2A2420',
    marginTop: 12,
  },
  headerSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E8E5E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    gap: 6,
    marginTop: 10,
  },
  badgeText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
    gap: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2A2420',
    marginBottom: 8,
  },
  bioText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#4A413A',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EFE6D8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  tagText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#4A413A',
  },
  verifiedCard: {
    padding: 18,
  },
  verifiedCardTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    color: '#2F6E48',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  greenCheck: {
    color: '#3E8E5E',
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
  },
  checkText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#2A2420',
  },
  reviewCard: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2A2420',
  },
  reviewStars: {
    color: '#3E8E5E',
    fontSize: 14,
  },
  reviewComment: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#4A413A',
    lineHeight: 20,
  },
  bottomBarSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFCF7',
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  writeButton: {
    flex: 1,
  },
  requestButton: {
    flex: 1.4,
  },
});

