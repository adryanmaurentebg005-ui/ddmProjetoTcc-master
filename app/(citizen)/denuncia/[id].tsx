import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBadge } from '../../../components/StatusBadge';
import { atualizarDenuncia, buscarDenuncia } from '../../../services/denuncias';
import { useAuth } from '../../../contexts/AuthContext';
import { Denuncia } from '../../../types';
import { theme } from '../../../constants/theme';

export default function DenunciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [denuncia, setDenuncia] = React.useState<Denuncia | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editedTitulo, setEditedTitulo] = React.useState('');
  const [editedDescricao, setEditedDescricao] = React.useState('');
  const { user } = useAuth();

  React.useEffect(() => {
    if (id) buscarDenuncia(id).then(setDenuncia).catch(console.error);
  }, [id]);

  const handleEdit = () => {
    if (denuncia) {
      setEditedTitulo(denuncia.titulo);
      setEditedDescricao(denuncia.descricao);
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    if (!denuncia || !user) return;
    try {
      await atualizarDenuncia(denuncia.id, user.uid, {
        titulo: editedTitulo.trim(),
        descricao: editedDescricao.trim(),
      });
      setDenuncia((prev) => (prev ? { ...prev, titulo: editedTitulo.trim(), descricao: editedDescricao.trim() } : null));
      setModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!denuncia) return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primaryLight} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialIcons name="assignment" size={28} color={theme.colors.primary} />
        <Text style={styles.title}>{denuncia.titulo}</Text>
      </View>

      <StatusBadge status={denuncia.status} />

      <View style={styles.card}>
        <Text style={styles.label}>Protocolo</Text>
        <Text style={styles.value}>{denuncia.protocolo}</Text>

        <Text style={styles.label}>Categoria</Text>
        <Text style={styles.value}>{denuncia.categoriaId}</Text>

        <Text style={styles.label}>Descrição</Text>
        <Text style={styles.value}>{denuncia.descricao}</Text>

        <Text style={styles.label}>Localização</Text>
        <Text style={styles.label}>Registrada em</Text>
        <Text style={styles.value}>{new Date(denuncia.data).toLocaleString('pt-BR')}</Text>
        <Text style={styles.label}>Data e hora da ocorrência</Text>
        <Text style={styles.value}>{new Date(denuncia.dataOcorrencia ?? denuncia.data).toLocaleString('pt-BR')}</Text>
        <Text style={styles.label}>Localização</Text>
        <Text style={styles.value}>{denuncia.localizacao?.endereco ?? 'Não informada'}</Text>

        <Pressable style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Denúncia</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={editedTitulo}
              onChangeText={setEditedTitulo}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              value={editedDescricao}
              onChangeText={setEditedDescricao}
              multiline
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '800',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
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
  editButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
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
