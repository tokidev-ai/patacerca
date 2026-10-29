import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { TabBarItem } from '@patacerca/ui';
import { useWalkerData } from '../../src/providers/DataProvider';
import { useWalkerSessionStore } from '../../src/store/session.store';

export default function TabsLayout() {
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
        const { state, navigation } = props;
        return (
          <SafeAreaView style={styles.tabBarSafeArea}>
            <View style={styles.tabBar}>
              <TabBarItem
                label="Solicitudes"
                focused={state.index === 0}
                badgeCount={newCount}
                onPress={() => navigation.navigate('requests')}
              />
              <TabBarItem
                label="Mensajes"
                focused={state.index === 1}
                onPress={() => navigation.navigate('messages')}
              />
              <TabBarItem
                label="Perfil"
                focused={state.index === 2}
                onPress={() => navigation.navigate('profile')}
              />
            </View>
          </SafeAreaView>
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

