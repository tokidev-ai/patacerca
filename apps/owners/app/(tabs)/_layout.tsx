import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { TabBarItem } from '@patacerca/ui';
import { useData } from '../../src/providers/DataProvider';
import { useSessionStore } from '../../src/store/session.store';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestsRepository } = useData();
  const { owner } = useSessionStore();

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', owner?.phone],
    queryFn: () => requestsRepository.getRequestsByOwner(owner?.phone || '70000000'),
    enabled: Boolean(owner?.phone),
  });

  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => {
        const { state, navigateToTab, insets: tabInsets } = props;
        const bottomPadding = Math.max(tabInsets?.bottom ?? insets.bottom, 12);

        const goToTab = (index: number, name: string) => {
          if (typeof navigateToTab === 'function' && state.routes?.[index]) {
            navigateToTab(state.routes[index].key);
          } else {
            router.navigate(`/(tabs)/${name}` as any);
          }
        };

        return (
          <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
            <View style={styles.tabBar}>
              <TabBarItem
                label="Buscar"
                focused={state.index === 0}
                onPress={() => goToTab(0, 'search')}
              />
              <TabBarItem
                label="Paseos"
                focused={state.index === 1}
                badgeCount={acceptedCount}
                onPress={() => goToTab(1, 'walks')}
              />
              <TabBarItem
                label="Mensajes"
                focused={state.index === 2}
                onPress={() => goToTab(2, 'messages')}
              />
              <TabBarItem
                label="Perfil"
                focused={state.index === 3}
                onPress={() => goToTab(3, 'profile')}
              />
            </View>
          </View>
        );
      }}
    >
      <Tabs.Screen name="search" />
      <Tabs.Screen name="walks" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#FFFCF7',
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#FFFCF7',
  },
});

