import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/Button';
import { theme } from '../../constants/theme';
import { getAuthErrorMessage, useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { isDark } = useAppTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={isDark ? ['#090D18', '#111827', '#151D2E'] : ['#1D4ED8', '#2563EB', '#7C3AED']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}>
            <LinearGradient colors={['#60A5FA', '#22D3EE']} style={styles.brandIcon}>
              <MaterialIcons name="gavel" size={30} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.brandTitle}>Denúncia Urbana</Text>
          </View>
          <View style={styles.card}>
        <MaterialIcons name="account-circle" size={72} color={theme.colors.primary} />
        <Text style={styles.title}>Acesso ao sistema</Text>
        <Text style={styles.subtitle}>Entre com sua conta para acompanhar denúncias.</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor={theme.colors.placeholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} placeholder="Sua senha" placeholderTextColor={theme.colors.placeholder} value={password} onChangeText={setPassword} secureTextEntry />

        {error && <Text style={styles.error}>{error}</Text>}
        <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={loading} />
        {loading && <ActivityIndicator style={styles.loader} color={theme.colors.primaryLight} />}

        <View style={styles.row}>
          <Text style={styles.helperText}>Não tem conta?</Text>
          <Link href="/(auth)/cadastro" style={styles.link}>Cadastre-se</Link>
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brandMark: { alignItems: 'center', marginBottom: 18 },
  brandIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  brandTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '700' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 10,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: theme.colors.elevated,
    color: theme.colors.inputText,
  },
  row: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helperText: {
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
  error: {
    color: theme.colors.error,
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  loader: {
    marginTop: 10,
  },
});
