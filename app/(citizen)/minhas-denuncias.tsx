import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { ComplaintCard } from '../../components/ComplaintCard';
import { Button } from '../../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { observarDenunciasDoUsuario, excluirDenuncia } from '../../services/denuncias';
import { Denuncia } from '../../types';
import { getNomeCategoria } from '../../constants/categorias';
import { theme } from '../../constants/theme';

const filters = [
  { key: 'TODAS', title: 'Todas' },
  { key: 'ENVIADA', title: 'Enviadas' },
  { key: 'EM_ANALISE', title: 'Em análise' },
  { key: 'RESOLVIDA', title: 'Resolvidas' },
] as const;
export default function MinhasDenunciasScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const { success } = useLocalSearchParams<{ success?: string }>();
  const { user } = useAuth();
  const [items, setItems] = React.useState<Denuncia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('TODAS');
  const [pendingDelete, setPendingDelete] = React.useState<Denuncia | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');
  React.useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    return observarDenunciasDoUsuario(user.uid, next => { setItems(next); setLoading(false); setError(false); }, err => { console.error(err); setLoading(false); setError(true); });
  }, [user?.uid]);
  const filtered = items.filter(item => {
    const q = search.trim().toLocaleLowerCase('pt-BR');
    const matches = !q || [item.titulo, item.descricao, item.protocolo, getNomeCategoria(item.categoriaId)].some(value => value.toLocaleLowerCase('pt-BR').includes(q));
    return matches && (filter === 'TODAS' || item.status === filter);
  });
  async function remove() {
    if (!user || !pendingDelete || deleting) return;
    setDeleting(true); setFeedback('');
    try { await excluirDenuncia(pendingDelete.id, user.uid); setItems(current => current.filter(item => item.id !== pendingDelete.id)); setFeedback('Ocorrência excluída com sucesso.'); setPendingDelete(null); }
    catch { setFeedback('Não foi possível excluir a ocorrência.'); }
    finally { setDeleting(false); }
  }
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}><Text style={[styles.kicker, { color: theme.colors.primaryLight }]}>ACOMPANHAMENTO</Text><Text style={[styles.title, { color: theme.colors.text }]}>Meus registros</Text><Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{items.length} {items.length === 1 ? 'ocorrência registrada' : 'ocorrências registradas'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Nova denúncia" onPress={() => router.push('/(citizen)/denuncia/localizacao')} style={[styles.add, { backgroundColor: theme.colors.primaryLight }]}><MaterialCommunityIcons name="plus" size={27} color="#FFFFFF"/></Pressable>
      </View>
      <View style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <MaterialCommunityIcons name="magnify" size={23} color={theme.colors.textSecondary}/>
        <TextInput accessibilityLabel="Buscar ocorrências" style={[styles.searchInput, { color: theme.colors.text }]} placeholder="Buscar ocorrências..." placeholderTextColor={theme.colors.placeholder} value={search} onChangeText={setSearch}/>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map(f => <Pressable key={f.key} accessibilityRole="button" accessibilityState={{ selected: filter === f.key }} onPress={() => setFilter(f.key)} style={[styles.chip, { backgroundColor: filter === f.key ? theme.colors.primaryLight : theme.colors.surface, borderColor: filter === f.key ? theme.colors.primaryLight : theme.colors.border }]}>
          <Text style={{ fontWeight: '800', fontSize: 12, color: filter === f.key ? '#FFFFFF' : theme.colors.textSecondary }}>{f.title}</Text>
        </Pressable>)}
      </ScrollView>
      {success === '1' ? <Text style={[styles.feedback, { color: theme.colors.success }]}>Ocorrência registrada com sucesso.</Text> : null}
      {feedback ? <Text style={[styles.feedback, { color: theme.colors.text }]}>{feedback}</Text> : null}
    </View>
    <ScrollView contentContainerStyle={styles.list}>
      {loading ? <ActivityIndicator color={theme.colors.primaryLight} size="large"/> : error ? <Text style={{ color: theme.colors.error }}>Não foi possível carregar seus registros.</Text> : filtered.length === 0 ?
        <View style={[styles.empty, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><MaterialCommunityIcons name="clipboard-search-outline" size={39} color={theme.colors.primaryLight}/><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nenhum registro encontrado</Text><Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Tente outro filtro ou registre uma nova ocorrência.</Text></View> :
        filtered.map(item => <View key={item.id} style={{ marginBottom: 5 }}><ComplaintCard item={item}/><Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${item.titulo}`} onPress={() => setPendingDelete(item)} style={styles.delete}><MaterialCommunityIcons name="trash-can-outline" size={17} color={theme.colors.error}/><Text style={{ color: theme.colors.error, fontSize: 12, fontWeight: '800' }}>Excluir registro</Text></Pressable></View>)
      }
    </ScrollView>
    <Modal visible={Boolean(pendingDelete)} transparent animationType="fade" onRequestClose={() => !deleting && setPendingDelete(null)}>
      <View style={[styles.backdrop, { paddingBottom: Math.max(insets.bottom, 20) }]}><View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Excluir ocorrência?</Text>
        <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>Essa ação é permanente. Deseja excluir o registro {pendingDelete?.protocolo}?</Text>
        <View style={styles.actions}><Button title="Cancelar" variant="secondary" disabled={deleting} onPress={() => setPendingDelete(null)} style={{ flex: 1 }}/><Button title="Excluir" variant="danger" loading={deleting} onPress={remove} style={{ flex: 1 }}/></View>
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 25, maxWidth: 760, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 23 },
  kicker: { fontSize: 10, letterSpacing: 2, fontWeight: '900' },
  title: { fontSize: 29, letterSpacing: -1, fontWeight: '900', marginTop: 6 },
  subtitle: { fontSize: 13, marginTop: 5 },
  add: { width: 49, height: 49, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  search: { minHeight: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 13 },
  filters: { flexDirection: 'row', gap: 8, paddingVertical: 17 },
  chip: { borderWidth: 1, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 99 },
  list: { paddingHorizontal: 20, paddingBottom: 36, maxWidth: 760, width: '100%', alignSelf: 'center' },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: -4, marginBottom: 12, paddingVertical: 7, paddingHorizontal: 5 },
  empty: { borderRadius: 23, padding: 28, alignItems: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 13 },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 7 },
  feedback: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,12,30,0.65)', justifyContent: 'center', padding: 22 },
  modal: { borderRadius: 23, padding: 23 },
  modalTitle: { fontSize: 21, fontWeight: '900' },
  modalText: { lineHeight: 22, marginTop: 10, marginBottom: 22 },
  actions: { flexDirection: 'row', gap: 10 },
});
