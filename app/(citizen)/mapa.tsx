import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { ScreenShell, Surface } from '../../components/ScreenShell';
import { ComplaintCard } from '../../components/ComplaintCard';
import { useAuth } from '../../contexts/AuthContext';
import { observarDenunciasDoUsuario } from '../../services/denuncias';
import { Denuncia } from '../../types';
import { theme } from '../../constants/theme';

export default function MapaScreen() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Denuncia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    return observarDenunciasDoUsuario(user.uid, (next) => { setItems(next.filter(d => Number.isFinite(d.localizacao?.latitude) && Number.isFinite(d.localizacao?.longitude))); setLoading(false); }, () => { setError(true); setLoading(false); });
  }, [user?.uid]);
  return <ScreenShell title="Locais registrados" subtitle="Consulte as ocorrências com localização informada." icon="map-marker-radius-outline">
    <Surface>
      <View style={styles.intro}>
        <View style={[styles.icon, { backgroundColor: theme.colors.elevated }]}><MaterialCommunityIcons name="map-marker-multiple-outline" size={30} color={theme.colors.primaryLight}/></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Seus pontos na cidade</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Os endereços ficam disponíveis na lista abaixo. Um mapa geral interativo ainda está em desenvolvimento.</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/(citizen)/denuncia/localizacao')} style={[styles.action, { backgroundColor: theme.colors.primaryLight }]}>
        <MaterialCommunityIcons name="map-marker-plus" size={20} color="#FFFFFF"/><Text style={styles.actionText}>Registrar novo local</Text>
      </Pressable>
    </Surface>
    {loading ? <ActivityIndicator color={theme.colors.primaryLight}/> : error ? <Text style={{ color: theme.colors.error }}>Falha ao carregar os registros.</Text> : items.length ? items.map(item => <ComplaintCard key={item.id} item={item}/>) : <Surface><Text style={{ color: theme.colors.textSecondary }}>Você ainda não tem ocorrências com localização registrada.</Text></Surface>}
  </ScreenShell>;
}
const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 },
  icon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '900' }, subtitle: { fontSize: 12, lineHeight: 19, marginTop: 5 },
  action: { borderRadius: 14, padding: 15, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFFFFF', fontWeight: '800' },
});
