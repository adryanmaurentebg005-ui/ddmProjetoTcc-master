import { Link, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../contexts/AuthContext';
import { criarDenuncia } from '../../../services/denuncias';
import { theme } from '../../../constants/theme';
import { enviarImagemParaImgBB } from '../../../services/imagens';

const categories = [
  ['buraco', 'Buraco na via'],
  ['iluminacao', 'Iluminação pública'],
  ['lixo', 'Lixo e resíduos'],
  ['calcada', 'Calçada'],
  ['semaforo', 'Semáforo'],
  ['alagamento', 'Alagamento'],
  ['outro', 'Outro'],
] as const;

export default function NovaDenunciaScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    address?: string;
  }>();
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);
  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && Boolean(params.address);
  const { user } = useAuth();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('outro');
  const [registrationDate, setRegistrationDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [fallbackDate, setFallbackDate] = React.useState('');
  const [fallbackTime, setFallbackTime] = React.useState('');
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const [photoBase64, setPhotoBase64] = React.useState<string | null>(null);
  const categoryName = categories.find(([id]) => id === category)?.[1] ?? 'Outro';

  const openDatePicker = () => {
    setFallbackDate(registrationDate.toLocaleDateString('pt-BR'));
    setFallbackTime(registrationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setShowDatePicker(true);
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let fotos: Array<{ id: string; uri: string }> = [];
      if (photoUri) {
        setPhotoUploading(true);
        const photoUrl = await enviarImagemParaImgBB(photoUri, photoBase64);
        fotos = [{ id: `foto-${Date.now()}`, uri: photoUrl }];
      }
      await criarDenuncia({
        titulo: title.trim(),
        categoriaId: category,
        descricao: description.trim(),
        dataOcorrencia: registrationDate,
        usuarioId: user.uid,
        localizacao: hasLocation ? { latitude, longitude, endereco: String(params.address) } : undefined,
        fotos,
      });
      setShowConfirmation(false);
      router.replace({ pathname: '/(citizen)/minhas-denuncias', params: { success: '1' } });
    } catch (saveError) {
      console.error(saveError);
      setError('Não foi possível salvar a denúncia. Tente novamente.');
    } finally {
      setPhotoUploading(false);
      setLoading(false);
    }
  };

  const requestSubmit = () => {
    if (!title.trim() || !description.trim()) {
      setError('Preencha o título e a descrição.');
      return;
    }
    setShowConfirmation(true);
  };

  const escolherImagem = async () => {
    try {
      const ImagePicker = require('expo-image-picker') as typeof import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Permita o acesso às fotos para anexar uma imagem à denúncia.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 ?? null);
        setError(null);
      }
    } catch {
      setError('As fotos precisam de um development build recompilado. Recompile o aplicativo antes de usar esta função.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#123B65"
            />
          </Pressable>
        </Link>

        <View style={styles.headerText}>
          <Text style={styles.title}>Nova denúncia</Text>

          <Text style={styles.subtitle}>
            Informe o problema encontrado
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.confirmedLocation}>
          <MaterialCommunityIcons name="map-marker-check" size={22} color="#1976D2" />
          <View style={styles.confirmedLocationText}>
            <Text style={styles.confirmedLocationTitle}>{hasLocation ? 'Localização confirmada' : 'Localização não informada'}</Text>
            <Text style={styles.confirmedLocationAddress}>{params.address ?? 'Volte e selecione o local da ocorrência.'}</Text>
            <Text style={styles.confirmedLocationCoordinates}>
              {hasLocation ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Latitude e longitude serão salvas após a confirmação.'}
            </Text>
          </View>
          <Link href="/(citizen)/denuncia/localizacao" asChild>
            <Pressable accessibilityLabel="Alterar localização">
            <MaterialCommunityIcons name="pencil" size={20} color="#123B65" />
            </Pressable>
          </Link>
        </View>

        <Text style={styles.label}>Título</Text>

        <TextInput
          placeholder="Ex.: Buraco na rua"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Categoria</Text>

        <Pressable style={styles.select} onPress={() => setShowCategoryModal(true)}>
          <Text style={styles.selectText}>
            {categoryName}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color="#667085"
          />
        </Pressable>

        <Text style={styles.label}>Descrição</Text>

        <TextInput
          placeholder="Descreva o problema"
          placeholderTextColor="#98A2B3"
          multiline
          numberOfLines={5}
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.registrationNotice}>
          <MaterialCommunityIcons name="clock-check-outline" size={20} color="#1976D2" />
          <View style={styles.registrationNoticeContent}>
            <Text style={styles.registrationNoticeText}>Data e hora da ocorrência: {registrationDate.toLocaleString('pt-BR')}</Text>
            <Pressable onPress={openDatePicker} style={styles.timePickerButton}>
              <Text style={styles.timePickerButtonText}>Abrir seletor de horário</Text>
            </Pressable>
          </View>
        </View>
        {showDatePicker && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Selecionar data e horário</Text>
                <Text style={styles.modalText}>Informe quando a ocorrência aconteceu.</Text>
                <TextInput style={styles.input} value={fallbackDate} onChangeText={setFallbackDate} placeholder="DD/MM/AAAA" placeholderTextColor="#98A2B3" />
                <TextInput style={styles.input} value={fallbackTime} onChangeText={setFallbackTime} placeholder="HH:MM" placeholderTextColor="#98A2B3" />
                <View style={styles.modalActions}>
                  <Pressable style={styles.cancelButton} onPress={() => setShowDatePicker(false)}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
                  <Pressable style={styles.confirmButton} onPress={() => {
                    const [day, month, year] = fallbackDate.split('/').map(Number);
                    const [hours, minutes] = fallbackTime.split(':').map(Number);
                    const selectedDate = new Date(year, month - 1, day, hours, minutes);
                    if (Number.isFinite(selectedDate.getTime())) setRegistrationDate(selectedDate);
                    setShowDatePicker(false);
                  }}><Text style={styles.confirmText}>Confirmar</Text></Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>Foto da ocorrência</Text>
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Pressable style={styles.photoButton} onPress={escolherImagem}>
              <Text style={styles.photoButtonText}>Trocar foto</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.photoButton} onPress={escolherImagem}>
            <MaterialCommunityIcons name="camera-plus" size={22} color="#1976D2" />
            <Text style={styles.photoButtonText}>Selecionar foto</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={[styles.primaryButton, !hasLocation && styles.disabledButton]} disabled={!hasLocation || loading} onPress={requestSubmit}>
        <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>{hasLocation ? 'ENVIAR DENÚNCIA' : 'SELECIONE UMA LOCALIZAÇÃO'}</Text>
      </Pressable>

      <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecione a categoria</Text>
            {categories.map(([id, name]) => <Pressable key={id} style={styles.modalOption} onPress={() => { setCategory(id); setShowCategoryModal(false); }}><Text style={styles.modalOptionText}>{name}</Text></Pressable>)}
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmation} transparent animationType="fade" onRequestClose={() => setShowConfirmation(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar denúncia</Text>
            <Text style={styles.modalText}>Tem certeza que deseja enviar esta denúncia?</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowConfirmation(false)}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
              <Pressable style={styles.confirmButton} onPress={submit} disabled={loading}><Text style={styles.confirmText}>{loading ? 'Salvando...' : 'Confirmar'}</Text></Pressable>
            </View>
            {loading && <ActivityIndicator style={styles.loader} color="#1976D2" />}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    paddingTop: theme.spacing.screenTop,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#123B65',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#667085',
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },

  confirmedLocation: {
    borderRadius: 14,
    backgroundColor: '#F2F7FC',
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  confirmedLocationText: {
    flex: 1,
  },

  confirmedLocationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#123B65',
    marginBottom: 4,
  },

  confirmedLocationAddress: {
    fontSize: 14,
    lineHeight: 19,
    color: '#344054',
  },

  confirmedLocationCoordinates: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123B65',
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    fontSize: 16,
    color: '#101828',
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  select: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  selectText: {
    fontSize: 16,
    color: '#667085',
  },
  registrationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2F7FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  registrationNoticeText: {
    flex: 1,
    color: '#344054',
    fontSize: 13,
    lineHeight: 18,
  },
  registrationNoticeContent: {
    flex: 1,
  },
  timePickerButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  timePickerButtonText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '700',
  },

  locationCard: {
    minHeight: 90,
    borderRadius: 14,
    backgroundColor: '#F2F7FC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCEBFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  locationContent: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#123B65',
    marginBottom: 4,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#667085',
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#1976D2',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.5,
  },
  error: {
    color: '#D32F2F',
    marginTop: -8,
    marginBottom: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },
  modalTitle: {
    color: '#123B65',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalText: {
    color: '#344054',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC',
  },
  modalOptionText: {
    color: '#123B65',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: '#667085',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#1976D2',
    borderRadius: 10,
    padding: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loader: {
    marginTop: 12,
  },
  imageUploader: {
    marginTop: 16,
  },
  imageUploadButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  photoContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 18,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoButton: {
    padding: 12,
    backgroundColor: '#F2F7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#1976D2',
    fontWeight: '700',
    marginTop: 4,
  },
});