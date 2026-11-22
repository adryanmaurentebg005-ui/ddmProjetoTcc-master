import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { getNomeCategoria } from '../../constants/categorias';
import { observarTodasDenuncias, atualizarStatusAdministrativo, excluirDenunciaAdministrativa, type RegistroAdministrativo } from '../../services/administracao';
import type { DenunciaStatus } from '../../types';

const actions: { status: DenunciaStatus; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { status: 'EM_ANALISE', label: 'Em análise', icon: 'file-search-outline' },
  { status: 'VALIDADA', label: 'Validar', icon: 'check-decagram-outline' },
  { status: 'EM_ATENDIMENTO', label: 'Em andamento', icon: 'progress-wrench' },
  { status: 'AGUARDANDO_INFORMACOES', label: 'Pedir informações', icon: 'comment-question-outline' },
  { status: 'RESOLVIDA', label: 'Solucionada', icon: 'check-circle-outline' },
  { status: 'REJEITADA', label: 'Recusar', icon: 'close-circle-outline' },
];
const statuses: Record<string, string> = {
  ENVIADA: 'Recebida', EM_ANALISE: 'Em análise', VALIDADA: 'Validada',
  EM_ATENDIMENTO: 'Em andamento', AGUARDANDO_INFORMACOES: 'Aguardando informações',
  RESOLVIDA: 'Solucionada', REJEITADA: 'Recusada',
};

export default function AdminDashboardScreen() {
  useAppTheme();
  const { user, isAdmin, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [items, setItems] = React.useState<RegistroAdministrativo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('TODAS');
  const [selected, setSelected] = React.useState<RegistroAdministrativo | null>(null);
  const [pendingStatus, setPendingStatus] = React.useState<DenunciaStatus | null>(null);
  const [note, setNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (!isAdmin) return;
    return observarTodasDenuncias(next => { setItems(next); setLoading(false); setError(''); }, err => {
      setLoading(false); setError('Não foi possível carregar as denúncias. Verifique as regras do Firestore.'); console.error(err);
    });
  }, [isAdmin]);
  const filtered = items.filter(item => (filter === 'TODAS' || item.status === filter)
    && [item.titulo, item.descricao, item.protocolo, item.usuarioId, item.localizacao?.endereco ?? '']
      .join(' ').toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));
  const count = (status: string) => items.filter(item => item.status === status).length;
  async function saveStatus() {
    if (!user || !selected || !pendingStatus || saving) return;
    setSaving(true); setError('');
    try {
      await atualizarStatusAdministrativo(selected.id, pendingStatus, note, user.uid);
      setSelected(null); setPendingStatus(null); setNote('');
    } catch (err) { console.error(err); setError('Não foi possível atualizar o status.'); }
    finally { setSaving(false); }
  }
  function requestDelete(item: RegistroAdministrativo) {
    Alert.alert('Excluir definitivamente?', 'Esta ação apaga a denúncia ' + item.protocolo + ' e não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await excluirDenunciaAdministrativa(item.id); setSelected(null); }
        catch (err) { console.error(err); setError('Não foi possível excluir o registro.'); }
      } },
    ]);
  }
  const panel = { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 20, padding: 17 } as const;
  const txt = { color: theme.colors.text } as const;
  const secondary = { color: theme.colors.textSecondary } as const;
  const pill = { borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 10, paddingHorizontal: 13 } as const;
  return <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 30 + insets.bottom, maxWidth: 900, width: '100%', alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.primaryLight, fontWeight: '900', letterSpacing: 2, fontSize: 11 }}>CENTRAL DE GESTÃO</Text>
          <Text style={{ ...txt, fontWeight: '900', fontSize: 29, marginTop: 5 }}>Painel administrativo</Text>
          <Text style={{ ...secondary, marginTop: 5 }}>Acompanhe e gerencie as ocorrências da cidade.</Text>
        </View>
        <Pressable accessibilityLabel="Sair" onPress={() => void logout()} style={{ ...panel, padding: 12 }}>
          <MaterialCommunityIcons name="logout" size={24} color={theme.colors.error}/>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 23 }}>
        {[
          { label: 'Total', value: items.length, icon: 'clipboard-text-outline' as const },
          { label: 'Recebidas', value: count('ENVIADA'), icon: 'inbox-arrow-down-outline' as const },
          { label: 'Em andamento', value: count('EM_ATENDIMENTO'), icon: 'progress-wrench' as const },
          { label: 'Solucionadas', value: count('RESOLVIDA'), icon: 'check-circle-outline' as const },
        ].map(metric => <View key={metric.label} style={{ ...panel, minWidth: 145, flexGrow: 1, flexBasis: '42%' }}>
          <MaterialCommunityIcons name={metric.icon} size={24} color={theme.colors.primaryLight}/>
          <Text style={{ ...txt, fontSize: 29, fontWeight: '900', marginTop: 9 }}>{metric.value}</Text>
          <Text style={{ ...secondary, fontSize: 12, fontWeight: '700' }}>{metric.label}</Text>
        </View>)}
      </View>
      <View style={{ ...panel, marginTop: 19, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <MaterialCommunityIcons name="magnify" size={23} color={theme.colors.textSecondary}/>
        <TextInput accessibilityLabel="Pesquisar denúncias" placeholder="Título, protocolo, endereço..." placeholderTextColor={theme.colors.placeholder} value={search} onChangeText={setSearch} style={{ color: theme.colors.text, flex: 1, fontSize: 14 }}/>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 15 }} contentContainerStyle={{ gap: 8 }}>
        {[{ key: 'TODAS', title: 'Todas' }, ...Object.entries(statuses).map(([key, title]) => ({ key, title }))].map(option =>
          <Pressable key={option.key} onPress={() => setFilter(option.key)} style={{ ...pill, backgroundColor: filter === option.key ? theme.colors.primaryLight : theme.colors.surface }}>
            <Text style={{ color: filter === option.key ? '#FFFFFF' : theme.colors.text, fontWeight: '800', fontSize: 12 }}>{option.title}</Text>
          </Pressable>)}
      </ScrollView>
      <Text style={{ ...secondary, marginBottom: 13 }}>{filtered.length} registro(s) encontrado(s)</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.error, marginBottom: 13 }}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={theme.colors.primaryLight} size="large"/> : filtered.length === 0 ? <View style={panel}><Text style={secondary}>Nenhuma denúncia encontrada.</Text></View> :
        filtered.map(item => <View key={item.id} style={{ ...panel, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ color: theme.colors.primaryLight, fontSize: 12, fontWeight: '900' }}>{item.protocolo}</Text>
            <Text style={{ color: theme.colors.primaryLight, fontWeight: '800', fontSize: 11 }}>{statuses[item.status] ?? item.status}</Text>
          </View>
          <Text style={{ ...txt, fontSize: 17, fontWeight: '900', marginTop: 9 }}>{item.titulo}</Text>
          <Text numberOfLines={2} style={{ ...secondary, lineHeight: 20, marginTop: 5 }}>{item.descricao}</Text>
          <Text style={{ ...secondary, marginTop: 10, fontSize: 12 }}>{getNomeCategoria(item.categoriaId)} · {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'Sem data'}</Text>
          {item.localizacao?.endereco ? <Text numberOfLines={1} style={{ ...secondary, marginTop: 5, fontSize: 12 }}>📍 {item.localizacao.endereco}</Text> : null}
          <Pressable accessibilityRole="button" onPress={() => { setSelected(item); setNote(item.observacaoAdmin ?? ''); setPendingStatus(null); }} style={{ marginTop: 15, backgroundColor: theme.colors.primaryLight, padding: 13, borderRadius: 13, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="cog-outline" size={19} color="#FFFFFF"/><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Gerenciar denúncia</Text>
          </Pressable>
        </View>)}
    </ScrollView>
    <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => !saving && setSelected(null)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 18, paddingBottom: 18 + insets.bottom }}>
        <View style={{ ...panel, maxHeight: '85%', padding: 20 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...txt, fontSize: 21, fontWeight: '900', flex: 1 }}>Gerenciar ocorrência</Text>
              <Pressable accessibilityLabel="Fechar" disabled={saving} onPress={() => setSelected(null)}><MaterialCommunityIcons name="close" size={25} color={theme.colors.text}/></Pressable>
            </View>
            <Text style={{ ...secondary, marginTop: 7 }}>{selected?.protocolo} · {selected?.titulo}</Text>
            <Text style={{ ...secondary, marginTop: 12, lineHeight: 21 }}>{selected?.descricao}</Text>
            <Text style={{ ...txt, fontWeight: '800', marginTop: 18, marginBottom: 10 }}>Alterar situação</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
              {actions.map(action => <Pressable key={action.status} disabled={saving} onPress={() => setPendingStatus(action.status)} style={{ ...pill, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: pendingStatus === action.status ? theme.colors.primaryLight : theme.colors.elevated }}>
                <MaterialCommunityIcons name={action.icon} size={19} color={pendingStatus === action.status ? '#FFFFFF' : theme.colors.primaryLight}/>
                <Text style={{ color: pendingStatus === action.status ? '#FFFFFF' : theme.colors.text, fontWeight: '700', fontSize: 12 }}>{action.label}</Text>
              </Pressable>)}
            </View>
            <Text style={{ ...txt, fontWeight: '800', marginTop: 18, marginBottom: 8 }}>Observação administrativa</Text>
            <TextInput value={note} onChangeText={setNote} multiline maxLength={1000} placeholder="Justificativa, atualização ou encaminhamento..." placeholderTextColor={theme.colors.placeholder} style={{ ...pill, color: theme.colors.text, minHeight: 85, textAlignVertical: 'top', backgroundColor: theme.colors.elevated }}/>
            <Pressable disabled={!pendingStatus || saving} onPress={() => void saveStatus()} style={{ marginTop: 16, borderRadius: 13, backgroundColor: theme.colors.primaryLight, opacity: !pendingStatus || saving ? 0.5 : 1, padding: 15, alignItems: 'center' }}>
              {saving ? <ActivityIndicator color="#FFFFFF"/> : <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Salvar alteração</Text>}
            </Pressable>
            <Pressable disabled={saving} onPress={() => { if (selected) requestDelete(selected); }} style={{ padding: 15, alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: theme.colors.error, fontWeight: '900' }}>Excluir denúncia permanentemente</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  </View>;
}
