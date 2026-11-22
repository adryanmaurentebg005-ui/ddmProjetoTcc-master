import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth, getAuthErrorMessage } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function CadastroScreen() {
  const { signUp } = useAuth();
  useAppTheme();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  async function submit() {
    if (!name.trim() || !email.trim() || !password) { setError('Preencha todos os campos.'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true); setError('');
    try { await signUp(name, email, password); }
    catch (err) { setError(getAuthErrorMessage(err)); }
    finally { setLoading(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={{ backgroundColor: theme.colors.background }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text}/></Pressable>
      <View style={[styles.icon, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name="account-plus-outline" size={35} color={theme.colors.primaryLight}/></View>
      <Text style={[styles.kicker, { color: theme.colors.primaryLight }]}>FAÇA PARTE DA MUDANÇA</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>Crie sua conta</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Comece a contribuir para uma cidade melhor.</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nome completo</Text>
        <TextInput accessibilityLabel="Nome completo" style={[styles.field, { color: theme.colors.text, backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]} placeholder="Como podemos chamar você?" placeholderTextColor={theme.colors.placeholder} autoComplete="name" value={name} onChangeText={setName}/>
        <Text style={[styles.label, { color: theme.colors.text }]}>E-mail</Text>
        <TextInput accessibilityLabel="E-mail" style={[styles.field, { color: theme.colors.text, backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]} placeholder="seu@email.com" placeholderTextColor={theme.colors.placeholder} autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail}/>
        <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
        <View style={[styles.passwordRow, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]}>
          <TextInput accessibilityLabel="Senha" style={[styles.password, { color: theme.colors.text }]} placeholder="Mínimo de 6 caracteres" placeholderTextColor={theme.colors.placeholder} secureTextEntry={!visible} value={password} onChangeText={setPassword}/>
          <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(!visible)}><MaterialCommunityIcons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.colors.textSecondary}/></Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Text> : null}
        <Button title={loading ? 'Criando conta...' : 'Criar minha conta'} loading={loading} onPress={submit}/>
        <View style={styles.footer}><Text style={{ color: theme.colors.textSecondary }}>Já tem uma conta? </Text><Pressable onPress={() => router.replace('/(auth)/login')}><Text style={{ color: theme.colors.primaryLight, fontWeight: '900' }}>Entrar</Text></Pressable></View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 22, maxWidth: 600, width: '100%', alignSelf: 'center' },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: 19 },
  icon: { width: 65, height: 65, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 19 },
  kicker: { fontSize: 10, letterSpacing: 2, fontWeight: '900' },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 25 },
  card: { borderWidth: 1, borderRadius: 24, padding: 22 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 9 },
  field: { minHeight: 54, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, marginBottom: 17 },
  passwordRow: { minHeight: 54, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  password: { flex: 1, paddingVertical: 13, fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 21 },
});
