import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { observarDenunciasDoUsuario } from '../../services/denuncias';
import { Denuncia } from '../../types';
import { ComplaintCard } from '../../components/ComplaintCard';
import { SectionHeading } from '../../components/SectionHeading';
import { theme } from '../../constants/theme';

const done = ['RESOLVIDA'];
const progress = ['EM_ANALISE', 'AGUARDANDO_INFORMACOES', 'VALIDADA', 'EM_ATENDIMENTO'];

export default function CitizenHomeScreen() {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const [complaints, setComplaints] = React.useState<Denuncia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    return observarDenunciasDoUsuario(
      user.uid,
      (items) => { setComplaints(items); setError(false); setLoading(false); },
      (err) => { console.error(err); setError(true); setLoading(false); },
    );
  }, [user?.uid]);

  const solved = complaints.filter((c) => done.includes(c.status)).length;
  const inProgress = complaints.filter((c) => progress.includes(c.status)).length;
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'cidadão';

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topbar}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]}>BEM-VINDO DE VOLTA</Text>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>Olá, {firstName} <Text style={styles.wave}>✦</Text></Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/(citizen)/perfil')} style={[styles.avatar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="account-outline" size={24} color={theme.colors.primaryLight} />
        </Pressable>
      </View>

      <LinearGradient colors={isDark ? ['#172B55', '#13223E', '#26315F'] : ['#142B64', '#2458B7', '#4C54BD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroDecoration} />
        <View style={styles.heroEyebrow}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color="#CDE5FF" />
          <Text style={styles.heroSmall}>CIDADANIA EM AÇÃO</Text>
        </View>
        <Text style={styles.heroTitle}>Uma cidade melhor começa com você.</Text>
        <Text style={styles.heroCopy}>Registre situações que precisam de atenção e acompanhe cada etapa.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Registrar nova denúncia" onPress={() => router.push('/(citizen)/denuncia/localizacao')} style={styles.heroButton}>
          <MaterialCommunityIcons name="plus-circle-outline" size={21} color="#12366E" />
          <Text style={styles.heroButtonText}>Registrar ocorrência</Text>
          <MaterialCommunityIcons name="arrow-top-right" size={19} color="#12366E" />
        </Pressable>
      </LinearGradient>

      <View style={styles.metrics}>
        <Metric icon="file-document-outline" number={complaints.length} label="Registros" tint="#3B82F6" />
        <Metric icon="progress-clock" number={inProgress} label="Em andamento" tint="#D97706" />
        <Metric icon="check-decagram-outline" number={solved} label="Resolvidos" tint="#16A34A" />
      </View>

      <SectionHeading title="Suas ocorrências" subtitle="Acompanhe suas últimas solicitações" action={
        <Pressable accessibilityRole="button" onPress={() => router.push('/(citizen)/minhas-denuncias')}>
          <Text style={[styles.allLink, { color: theme.colors.primaryLight }]}>Ver todas  →</Text>
        </Pressable>
      } />

      {loading ? <ActivityIndicator style={styles.loader} color={theme.colors.primaryLight} size="large" /> : error ? (
        <View style={[styles.empty, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="wifi-alert" size={31} color={theme.colors.error} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Não foi possível carregar</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Verifique sua conexão e tente novamente.</Text>
        </View>
      ) : complaints.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.elevated }]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={34} color={theme.colors.primaryLight} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Tudo começa por aqui</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Você ainda não registrou ocorrências. Ao registrar uma, poderá acompanhar o andamento nesta tela.</Text>
        </View>
      ) : complaints.slice(0, 3).map((item) => <ComplaintCard key={item.id} item={item} />)}

      <Pressable accessibilityRole="button" onPress={() => router.push('/(citizen)/denuncia/localizacao')} style={[styles.quickAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.quickIcon, { backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="map-marker-plus-outline" size={24} color={theme.colors.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Encontrou um problema?</Text>
          <Text style={[styles.quickText, { color: theme.colors.textSecondary }]}>Sua participação faz a diferença.</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={23} color={theme.colors.primaryLight} />
      </Pressable>
    </ScrollView>
  );
}

function Metric({ icon, number, label, tint }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; number: number; label: string; tint: string }) {
  return (
    <View style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.metricIcon, { backgroundColor: theme.colors.elevated }]}>
        <MaterialCommunityIcons name={icon} size={19} color={tint} />
      </View>
      <Text style={[styles.metricNumber, { color: theme.colors.text }]}>{number}</Text>
      <Text numberOfLines={1} style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 42, width: '100%', maxWidth: 760, alignSelf: 'center' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  eyebrow: { fontSize: 10, letterSpacing: 2.2, fontWeight: '800' },
  greeting: { fontSize: 29, fontWeight: '900', letterSpacing: -1.2, marginTop: 5 },
  wave: { color: '#5088EC' },
  avatar: { width: 48, height: 48, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  hero: { overflow: 'hidden', borderRadius: 28, padding: 25, minHeight: 290, justifyContent: 'space-between', marginBottom: 23 },
  heroDecoration: { position: 'absolute', width: 205, height: 205, borderRadius: 110, borderWidth: 43, borderColor: 'rgba(255,255,255,0.07)', right: -60, top: -76 },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroSmall: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#D9EAFF' },
  heroTitle: { marginTop: 19, color: '#FFFFFF', fontWeight: '900', fontSize: 30, letterSpacing: -0.8, lineHeight: 35, maxWidth: 330 },
  heroCopy: { color: '#DCEAFF', fontSize: 13, lineHeight: 20, maxWidth: 320, marginTop: 8, marginBottom: 19 },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, alignSelf: 'flex-start' },
  heroButtonText: { color: '#12366E', fontSize: 13, fontWeight: '800', flexShrink: 1 },
  metrics: { flexDirection: 'row', gap: 10, marginBottom: 29 },
  metric: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 20, paddingVertical: 15, paddingHorizontal: 10 },
  metricIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 11 },
  metricNumber: { fontWeight: '900', fontSize: 27, letterSpacing: -0.8 },
  metricLabel: { fontWeight: '600', fontSize: 10, marginTop: 3 },
  allLink: { fontSize: 12, fontWeight: '800' },
  loader: { paddingVertical: 35 },
  empty: { borderRadius: 23, padding: 24, borderWidth: 1, alignItems: 'center', marginBottom: 18 },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 7, textAlign: 'center' },
  emptyText: { fontSize: 13, lineHeight: 21, textAlign: 'center' },
  quickAction: { borderRadius: 21, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  quickIcon: { width: 43, height: 43, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickTitle: { fontWeight: '800', fontSize: 14 },
  quickText: { fontSize: 12, marginTop: 4 },
});
