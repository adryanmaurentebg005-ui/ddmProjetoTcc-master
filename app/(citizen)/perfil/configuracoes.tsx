import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScreenShell, Surface } from '../../../components/ScreenShell';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { theme, ThemeMode } from '../../../constants/theme';

const modes: { value: ThemeMode; title: string; subtitle: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { value: 'light', title: 'Modo claro', subtitle: 'Visual leve e iluminado', icon: 'white-balance-sunny' },
  { value: 'dark', title: 'Modo escuro', subtitle: 'Conforto em ambientes escuros', icon: 'weather-night' },
  { value: 'automatic', title: 'Automático', subtitle: 'Segue o tema do dispositivo', icon: 'theme-light-dark' },
];
export default function ConfiguracoesScreen() {
  const { mode, setMode } = useAppTheme();
  return <ScreenShell title="Aparência" subtitle="Escolha como deseja visualizar o aplicativo." icon="palette-outline">
    <Surface>
      {modes.map((item) => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ checked: mode === item.value }} onPress={() => void setMode(item.value)} style={[styles.option, { borderColor: mode === item.value ? theme.colors.primaryLight : theme.colors.border, backgroundColor: theme.colors.elevated }]}>
        <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primaryLight}/>
        <View style={{ flex: 1 }}><Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text><Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text></View>
        <MaterialCommunityIcons name={mode === item.value ? 'radiobox-marked' : 'radiobox-blank'} size={23} color={theme.colors.primaryLight}/>
      </Pressable>)}
    </Surface>
  </ScreenShell>;
}
const styles = StyleSheet.create({ option: { borderWidth: 1, borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 11 }, title: { fontSize: 15, fontWeight: '800' }, subtitle: { fontSize: 12, marginTop: 4 } });
