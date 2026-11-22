import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { theme } from '../../../constants/theme';
import { useAppTheme } from '../../../contexts/ThemeContext';

export default function ConfiguracoesScreen() {
  const { mode, setMode } = useAppTheme();
  const options = [
    { id: 'light' as const, title: 'Claro', icon: 'light-mode' as const },
    { id: 'dark' as const, title: 'Escuro', icon: 'dark-mode' as const },
    { id: 'automatic' as const, title: 'Automático', icon: 'brightness-auto' as const },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aparência</Text>
        <Text style={styles.text}>Escolha como a interface deve ser exibida.</Text>
        <View style={styles.options}>
          {options.map((option) => {
            const active = mode === option.id;
            return (
              <Pressable key={option.id} style={[styles.option, active && styles.optionActive]} onPress={() => void setMode(option.id)}>
                <MaterialIcons name={option.icon} size={22} color={active ? theme.colors.primaryLight : theme.colors.textSecondary} />
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.title}</Text>
                {active && <MaterialIcons name="check-circle" size={20} color={theme.colors.primaryLight} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, marginTop: 16, marginBottom: 20 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { color: theme.colors.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  text: { color: theme.colors.textSecondary, lineHeight: 22 },
  options: { marginTop: 16, gap: 10 },
  option: { minHeight: 56, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, backgroundColor: theme.colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionActive: { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.elevated },
  optionText: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  optionTextActive: { color: theme.colors.primaryLight },
});