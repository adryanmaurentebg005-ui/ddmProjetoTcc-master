import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../../constants/theme';
import { Platform } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function CitizenLayout() {
  useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingTop: 9,
          paddingBottom: Platform.OS === 'ios' ? 23 : 9,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 5,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 3 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Início', tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'home-variant' : 'home-variant-outline'} size={25} color={color} /> }} />
      <Tabs.Screen name="minhas-denuncias" options={{ title: 'Registros', tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'clipboard-text' : 'clipboard-text-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="mapa" options={{ title: "Locais", tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? "map-marker" : "map-marker-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="notificacoes" options={{ title: "Atualizações", tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? "bell" : "bell-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="denuncia/nova" options={{ href: null }} />
      <Tabs.Screen name="denuncia/localizacao" options={{ href: null }} />
      <Tabs.Screen name="denuncia/[id]" options={{ href: null }} />
    </Tabs>
  );
}
