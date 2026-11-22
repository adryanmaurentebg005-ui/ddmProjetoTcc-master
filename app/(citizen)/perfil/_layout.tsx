import { Stack } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useAppTheme } from '../../../contexts/ThemeContext';

export default function PerfilLayout() {
  useAppTheme();
  return <Stack screenOptions={{
    headerShown: true,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
    headerShadowVisible: false,
    headerTitleStyle: { fontWeight: '800' },
    contentStyle: { backgroundColor: theme.colors.background },
  }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
    <Stack.Screen name="ajuda" options={{ title: 'Ajuda' }} />
    <Stack.Screen name="sobre" options={{ title: 'Sobre' }} />
    <Stack.Screen name="sair" options={{ headerShown: false }} />
  </Stack>;
}
