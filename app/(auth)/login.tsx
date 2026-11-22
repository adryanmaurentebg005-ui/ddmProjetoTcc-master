import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth, getAuthErrorMessage } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isDark } = useAppTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  async function submit() {
    if (!email.trim() || !password) { setError('Informe seu e-mail e sua senha.'); return; }
    setLoading(true); setError('');
    try { await signIn(email, password); }
    catch (err) { setError(getAuthErrorMessage(err)); }
    finally { setLoading(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.scroll}>
      <LinearGradient colors={isDark ? ['#172B55', '#26315F'] : ['#142B64', '#285CC1']} style={styles.hero}>
        <View style={styles.brand}><MaterialCommunityIcons name="city-variant-outline" size={29} color="#FFFFFF"/></View>
        <Text style={styles.brandName}>DENÚNCIA URBANA</Text>
        <Text style={styles.heroTitle}>Sua voz transforma a cidade.</Text>
        <Text style={styles.heroSubtitle}>Participe, registre e acompanhe. Um espaço para fazer a diferença.</Text>
      </LinearGradient>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Bem-vindo de volta</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Entre na sua conta para continuar.</Text>
        <Text style={[styles.label, { color: theme.colors.text }]}>E-mail</Text>
        <View style={[styles.field, { borderColor: theme.colors.border, backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="email-outline" size={21} color={theme.colors.textSecondary}/>
          <TextInput accessibilityLabel="E-mail" style={[styles.input, { color: theme.colors.text }]} placeholder="seu@email.com" placeholderTextColor={theme.colors.placeholder} keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail}/>
        </View>
        <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
        <View style={[styles.field, { borderColor: theme.colors.border, backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="lock-outline" size={21} color={theme.colors.textSecondary}/>
          <TextInput accessibilityLabel="Senha" style={[styles.input, { color: theme.colors.text }]} placeholder="Sua senha" placeholderTextColor={theme.colors.placeholder} secureTextEntry={!visible} value={password} onChangeText={setPassword}/>
          <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(!visible)}><MaterialCommunityIcons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color={theme.colors.textSecondary}/></Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Text> : null}
        <Button title={loading ? 'Entrando...' : 'Entrar na conta'} onPress={submit} loading={loading}/>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/admin-login')} style={{ marginTop: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}><MaterialCommunityIcons name="shield-account-outline" size={20} color={theme.colors.primaryLight}/><Text style={{ color: theme.colors.primaryLight, fontWeight: '800' }}>Acesso administrativo</Text></Pressable>
        <View style={styles.footer}><Text style={{ color: theme.colors.textSecondary }}>Ainda não tem conta? </Text><Pressable onPress={() => router.push('/(auth)/cadastro')}><Text style={{ color: theme.colors.primaryLight, fontWeight: '900' }}>Cadastre-se</Text></Pressable></View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32, width: '100%', maxWidth: 600, alignSelf: 'center' },
  hero: { paddingTop: 47, paddingHorizontal: 27, paddingBottom: 65, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  brand: { width: 53, height: 53, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  brandName: { color: '#D9E9FF', letterSpacing: 2.1, fontSize: 11, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -1, lineHeight: 39, marginTop: 18, maxWidth: 310 },
  heroSubtitle: { color: '#DBEAFE', fontSize: 13, lineHeight: 21, marginTop: 12, maxWidth: 320 },
  card: { marginHorizontal: 18, marginTop: -28, borderWidth: 1, borderRadius: 25, padding: 24 },
  title: { fontSize: 23, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, marginTop: 6, marginBottom: 25 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 9 },
  field: { borderWidth: 1, borderRadius: 15, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 17 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 23 },
});
