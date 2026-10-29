import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { TabBarItem } from '@patacerca/ui';
import { useWalkerData } from '../../src/providers/DataProvider';
import { useWalkerSessionStore } from '../../src/store/session.store';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestsRepository } = useWalkerData();
  const { walker, phone } = useWalkerSessionStore();

  const walkerId = walker?.id || phone || 'w1';

  const { data: requests = [] } = useQuery({
    queryKey: ['walker_requests', walkerId],
    queryFn: () => requestsRepository.getRequestsByWalker(walkerId),
  });

  const newCount = requests.filter((r) => r.status === 'pending').length;

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
                label="Solicitudes"
                focused={state.index === 0}
                badgeCount={newCount}
                onPress={() => goToTab(0, 'requests')}
              />
              <TabBarItem
                label="Mensajes"
                focused={state.index === 1}
                onPress={() => goToTab(1, 'messages')}
              />
              <TabBarItem
                label="Perfil"
                focused={state.index === 2}
                onPress={() => goToTab(2, 'profile')}
              />
            </View>
          </View>
        );
      }}
    >
      <Tabs.Screen name="requests" />
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

