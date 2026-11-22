import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { ScreenShell, Surface } from '../../../components/ScreenShell';
import { theme } from '../../../constants/theme';

const items = [
  { title: 'Configurações', caption: 'Aparência e preferências', icon: 'cog-outline' as const, route: '/(citizen)/perfil/configuracoes' as const },
  { title: 'Central de ajuda', caption: 'Dúvidas sobre o aplicativo', icon: 'help-circle-outline' as const, route: '/(citizen)/perfil/ajuda' as const },
  { title: 'Sobre o projeto', caption: 'Conheça a iniciativa', icon: 'information-outline' as const, route: '/(citizen)/perfil/sobre' as const },
];

export default function PerfilScreen() {
  useAppTheme();
  const { user, logout } = useAuth();
  const [leaving, setLeaving] = React.useState(false);
  const [error, setError] = React.useState('');
  return <ScreenShell title="Seu perfil" subtitle="Sua conta e suas preferências." icon="account-outline">
    <Surface>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name="account" size={42} color={theme.colors.primaryLight}/></View>
        <Text style={[styles.name, { color: theme.colors.text }]}>{user?.displayName || 'Cidadão'}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email || 'E-mail indisponível'}</Text>
        <View style={[styles.tag, { backgroundColor: theme.colors.elevated }]}><Text style={[styles.tagText, { color: theme.colors.primaryLight }]}>CONTA CIDADÃ</Text></View>
      </View>
    </Surface>
    <Surface>
      {items.map((item) => <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.route)} style={[styles.menuRow, { borderBottomColor: theme.colors.border }]}>
        <View style={[styles.menuIcon, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name={item.icon} size={23} color={theme.colors.primaryLight}/></View>
        <View style={{ flex: 1 }}><Text style={[styles.menuTitle, { color: theme.colors.text }]}>{item.title}</Text><Text style={[styles.menuCaption, { color: theme.colors.textSecondary }]}>{item.caption}</Text></View>
        <MaterialCommunityIcons name="chevron-right" size={23} color={theme.colors.textSecondary}/>
      </Pressable>)}
    </Surface>
    <Pressable disabled={leaving} accessibilityRole="button" onPress={async () => { setLeaving(true); setError(''); try { await logout(); } catch { setError('Não foi possível sair. Tente novamente.'); } finally { setLeaving(false); } }} style={[styles.signOut, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <MaterialCommunityIcons name="logout" size={21} color={theme.colors.error}/>
      <Text style={[styles.signOutText, { color: theme.colors.error }]}>{leaving ? 'Saindo...' : 'Sair da conta'}</Text>
    </Pressable>
    {error ? <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text> : null}
  </ScreenShell>;
}
const styles = StyleSheet.create({
  identity: { alignItems: 'center', paddingVertical: 18 },
  avatar: { width: 84, height: 84, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  name: { fontSize: 23, fontWeight: '900' },
  email: { marginTop: 6, fontSize: 13 },
  tag: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99, marginTop: 16 },
  tagText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1 },
  menuIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '800' },
  menuCaption: { fontSize: 12, marginTop: 4 },
  signOut: { padding: 18, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  signOutText: { fontSize: 14, fontWeight: '800' },
});
