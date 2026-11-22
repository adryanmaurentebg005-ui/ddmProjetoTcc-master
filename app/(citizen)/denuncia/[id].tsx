import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBadge } from '../../../components/StatusBadge';
import { atualizarDenuncia } from '../../../services/denuncias';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Denuncia } from '../../../types';
import { theme } from '../../../constants/theme';
import { CATEGORIAS_DENUNCIA, getNomeCategoria } from '../../../constants/categorias';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../contexts/ThemeContext';

export default function DenunciaDetailScreen() {
  const { isDark } = useAppTheme();
  const styles = React.useMemo(createStyles, [isDark]);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [denuncia, setDenuncia] = React.useState<Denuncia | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editedTitulo, setEditedTitulo] = React.useState('');
  const [editedDescricao, setEditedDescricao] = React.useState('');
  const [editedCategoriaId, setEditedCategoriaId] = React.useState('outro');
  const [categoryModalVisible, setCategoryModalVisible] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editSuccess, setEditSuccess] = React.useState<string | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    if (!id) { setLoading(false); return; }
    const unsubscribe = onSnapshot(doc(db, 'denuncias', id), snapshot => {
      if (!active) return;
      const data = snapshot.data();
      if (!data) { setDenuncia(null); setLoading(false); return; }
      const asIso = (value: any) => value?.toDate?.()?.toISOString?.() ?? String(value ?? '');
      setDenuncia({ id: snapshot.id, titulo: String(data.titulo ?? ''), descricao: String(data.descricao ?? ''), categoriaId: String(data.categoriaId ?? 'outro'), protocolo: String(data.protocolo ?? snapshot.id), status: data.status ?? 'ENVIADA', usuarioId: String(data.usuarioId ?? ''), data: asIso(data.data), dataOcorrencia: asIso(data.dataOcorrencia ?? data.data), localizacao: data.localizacao ?? {}, fotos: Array.isArray(data.fotos) ? data.fotos : [], historico: [], observacaoAdmin: typeof data.observacaoAdmin === 'string' ? data.observacaoAdmin : undefined, atualizadoEm: asIso(data.atualizadoEm) });
      setLoading(false); setLoadError(false);
    }, error => { console.error(error); if (active) { setLoadError(true); setLoading(false); } });
    return () => { active = false; unsubscribe(); };
  }, [id]);

  const handleEdit = () => {
    if (denuncia) {
      setEditedTitulo(denuncia.titulo);
      setEditedDescricao(denuncia.descricao);
      setEditedCategoriaId(denuncia.categoriaId);
      setEditError(null);
      setEditSuccess(null);
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    if (!denuncia || !user) return;
    const titulo = editedTitulo.trim();
    const descricao = editedDescricao.trim();

    if (!titulo) {
      setEditError('Informe o título da denúncia.');
      return;
    }
    if (!descricao) {
      setEditError('Informe a descrição da denúncia.');
      return;
    }
    if (!editedCategoriaId) {
      setEditError('Selecione uma categoria.');
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await atualizarDenuncia(denuncia.id, user.uid, {
        titulo,
        descricao,
        categoriaId: editedCategoriaId,
      });
      setDenuncia((prev) => (prev ? { ...prev, titulo, descricao, categoriaId: editedCategoriaId } : null));
      setEditSuccess('Denúncia atualizada com sucesso.');
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      setEditError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primaryLight} /></View>;
  if (!denuncia) return <View style={styles.loading}><Text style={{ color: theme.colors.text }}>{loadError ? 'Falha ao carregar a ocorrência.' : 'Ocorrência não encontrada.'}</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialIcons name="assignment" size={28} color={theme.colors.primary} />
        <Text style={styles.title}>{denuncia.titulo}</Text>
      </View>

      <StatusBadge status={denuncia.status} />
      {denuncia.observacaoAdmin?.trim() ? <View style={[styles.card, { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.elevated }]} accessibilityRole="summary">
        <Text style={{ color: theme.colors.primaryLight, fontWeight: '900', fontSize: 16 }}>Resposta da administração</Text>
        <Text style={{ color: theme.colors.text, marginTop: 10, lineHeight: 23, fontSize: 15 }}>{denuncia.observacaoAdmin}</Text>
        {denuncia.atualizadoEm && !Number.isNaN(new Date(denuncia.atualizadoEm).getTime()) ? <Text style={{ color: theme.colors.textSecondary, marginTop: 10, fontSize: 12 }}>Atualizada em {new Date(denuncia.atualizadoEm).toLocaleString('pt-BR')}</Text> : null}
      </View> : null}

      <View style={styles.card}>
        <Text style={styles.label}>Protocolo</Text>
        <Text style={styles.value}>{denuncia.protocolo}</Text>

        <Text style={styles.label}>Categoria</Text>
        <Text style={styles.value}>{getNomeCategoria(denuncia.categoriaId)}</Text>

        <Text style={styles.label}>Descrição</Text>
        <Text style={styles.value}>{denuncia.descricao}</Text>

        <Text style={styles.label}>Registrada em</Text>
        <Text style={styles.value}>{new Date(denuncia.data).toLocaleString('pt-BR')}</Text>
        <Text style={styles.label}>Data e hora da ocorrência</Text>
        <Text style={styles.value}>{new Date(denuncia.dataOcorrencia ?? denuncia.data).toLocaleString('pt-BR')}</Text>
        <Text style={styles.label}>Localização</Text>
        <Text style={styles.value}>{denuncia.localizacao?.endereco ?? 'Não informada'}</Text>

        <Text style={styles.label}>Foto da ocorrência</Text>
        {denuncia.fotos?.[0]?.uri ? (
          <Image
            source={{ uri: denuncia.fotos[0].uri }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel="Foto da ocorrência"
          />
        ) : (
          <Text style={styles.value}>Nenhuma foto anexada.</Text>
        )}

        {editSuccess && <Text style={[styles.successMessage, { backgroundColor: theme.colors.elevated }]}>{editSuccess}</Text>}

        <Pressable style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Editar denúncia</Text>

            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={editedTitulo}
              onChangeText={setEditedTitulo}
            />

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedDescricao}
              onChangeText={setEditedDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Categoria *</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Selecionar categoria"
              style={styles.categorySelect}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.categorySelectText}>{getNomeCategoria(editedCategoriaId)}</Text>
              <MaterialIcons name="expand-more" size={22} color={theme.colors.textSecondary} />
            </Pressable>

            {editError && <Text style={styles.errorMessage}>{editError}</Text>}

            <View style={styles.modalButtons}>
              <Pressable style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
              </Pressable>
              <Pressable style={[styles.cancelButton, saving && styles.disabledButton]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.categoryModalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Selecione a categoria</Text>
            {CATEGORIAS_DENUNCIA.map((item) => (
              <Pressable
                key={item.id}
                style={styles.categoryOption}
                onPress={() => {
                  setEditedCategoriaId(item.id);
                  setCategoryModalVisible(false);
                  setEditError(null);
                }}
              >
                <Text style={styles.categoryOptionText}>{item.nome}</Text>
                {editedCategoriaId === item.id && <MaterialIcons name="check" size={20} color={theme.colors.primaryLight} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: theme.spacing.screenTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginTop: 12,
  },
  value: {
    color: theme.colors.text,
    marginTop: 4,
    fontSize: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    marginTop: 8,
    backgroundColor: theme.colors.border,
  },
  editButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxWidth: 480,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 96,
  },
  categorySelect: {
    minHeight: 48,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  categoryModalContent: {
    paddingVertical: 12,
  },
  categoryOption: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryOptionText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  successMessage: {
    marginTop: 12,
    color: theme.colors.success,
    backgroundColor: '#EAF6EA',
    borderRadius: 8,
    padding: 10,
  },
  errorMessage: {
    marginTop: 12,
    color: theme.colors.error,
  },
  disabledButton: {
    opacity: 0.55,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
});
