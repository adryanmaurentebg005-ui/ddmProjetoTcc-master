import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth, getAuthErrorMessage } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';

export default function AdminLoginScreen() {
  useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  async function submit() {
    if (!email.trim() || !password) { setError('Informe e-mail e senha.'); return; }
    setLoading(true); setError('');
    try { await signIn(email, password); }
    catch (err) { setError(getAuthErrorMessage(err)); }
    finally { setLoading(false); }
  }
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: theme.colors.background }}>
    <View style={{ maxWidth: 450, width: '100%', alignSelf: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 26, padding: 25 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: theme.colors.elevated, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="shield-crown-outline" size={36} color={theme.colors.primaryLight}/>
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 18 }}>Acesso administrativo</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 8, marginBottom: 24, lineHeight: 21 }}>Área exclusiva para contas autorizadas. O acesso é verificado no Firebase.</Text>
      <Text style={{ color: theme.colors.text, fontWeight: '800', marginBottom: 8 }}>E-mail</Text>
      <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="admin@exemplo.com" placeholderTextColor={theme.colors.placeholder} value={email} onChangeText={setEmail} style={{ backgroundColor: theme.colors.elevated, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 16 }}/>
      <Text style={{ color: theme.colors.text, fontWeight: '800', marginBottom: 8 }}>Senha</Text>
      <TextInput secureTextEntry placeholder="Sua senha" placeholderTextColor={theme.colors.placeholder} value={password} onChangeText={setPassword} style={{ backgroundColor: theme.colors.elevated, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 16 }}/>
      {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Text> : null}
      <Pressable accessibilityRole="button" disabled={loading} onPress={() => void submit()} style={{ backgroundColor: theme.colors.primaryLight, padding: 16, borderRadius: 14, alignItems: 'center' }}>
        {loading ? <ActivityIndicator color="#FFFFFF"/> : <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Entrar no painel</Text>}
      </Pressable>
      <Pressable onPress={() => router.replace('/(auth)/login')} style={{ alignItems: 'center', marginTop: 20, padding: 9 }}>
        <Text style={{ color: theme.colors.primaryLight, fontWeight: '800' }}>Voltar ao login do cidadão</Text>
      </Pressable>
    </View>
  </ScrollView>;
}
