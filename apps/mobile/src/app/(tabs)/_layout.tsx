import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C } from '@/theme/tokens';

function Icon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.pulse,
        tabBarInactiveTintColor: C.fg3,
        tabBarStyle: {
          backgroundColor: C.ink900,
          borderTopColor: C.edge1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ focused }) => <Icon label="◎" focused={focused} /> }}
      />
      <Tabs.Screen
        name="carteira"
        options={{ title: 'Carteira', tabBarIcon: ({ focused }) => <Icon label="₿" focused={focused} /> }}
      />
      <Tabs.Screen
        name="bar"
        options={{ title: 'Bar', tabBarIcon: ({ focused }) => <Icon label="🍸" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ingressos"
        options={{ title: 'Ingressos', tabBarIcon: ({ focused }) => <Icon label="🎟" focused={focused} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <Icon label="◐" focused={focused} /> }}
      />
    </Tabs>
  );
}
