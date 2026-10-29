import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { TabBarItem } from '@patacerca/ui';
import { useData } from '../../src/providers/DataProvider';
import { useSessionStore } from '../../src/store/session.store';

export default function TabsLayout() {
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
        const { state, navigation } = props;
        return (
          <SafeAreaView style={styles.tabBarSafeArea}>
            <View style={styles.tabBar}>
              <TabBarItem
                label="Buscar"
                focused={state.index === 0}
                onPress={() => navigation.navigate('search')}
              />
              <TabBarItem
                label="Paseos"
                focused={state.index === 1}
                badgeCount={acceptedCount}
                onPress={() => navigation.navigate('walks')}
              />
              <TabBarItem
                label="Mensajes"
                focused={state.index === 2}
                onPress={() => navigation.navigate('messages')}
              />
              <TabBarItem
                label="Perfil"
                focused={state.index === 3}
                onPress={() => navigation.navigate('profile')}
              />
            </View>
          </SafeAreaView>
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
  tabBarSafeArea: {
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

