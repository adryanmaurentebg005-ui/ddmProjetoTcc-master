import { router, useLocalSearchParams } from 'expo-router';
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
import { CATEGORIAS_DENUNCIA } from '../../../constants/categorias';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../contexts/ThemeContext';

export default function NovaDenunciaScreen() {
  const { isDark } = useAppTheme();
  const styles = React.useMemo(createStyles, [isDark]);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    address?: string;
  }>();
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);
  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && Boolean(params.address);
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
  const categoryName = CATEGORIAS_DENUNCIA.find((item) => item.id === category)?.nome ?? 'Outro';

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
      console.error('Falha ao registrar ocorrência:', saveError);
      setShowConfirmation(false);
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a denúncia. Tente novamente.');
    } finally {
      setPhotoUploading(false);
      setLoading(false);
    }
  };

  const requestSubmit = () => {
    if (title.trim().length < 3 || description.trim().length < 10) {
      setError('Informe um título com pelo menos 3 caracteres e uma descrição com pelo menos 10.');
      return;
    }
    if (!hasLocation) { setError('Confirme a localização antes de enviar.'); return; }
    if (title.trim().length > 120 || description.trim().length > 5000) { setError('Título ou descrição muito longos.'); return; }
    setError(null);
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 36 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao início" onPress={() => router.replace("/(citizen)/home")} style={[styles.backButton, { backgroundColor: theme.colors.elevated }]}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.primaryLight}
            />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Nova denúncia</Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Informe o problema encontrado
          </Text>
        </View>
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
        <View style={[styles.confirmedLocation, { backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="map-marker-check" size={22} color={theme.colors.primaryLight} />
          <View style={styles.confirmedLocationText}>
            <Text style={[styles.confirmedLocationTitle, { color: theme.colors.text }]}>{hasLocation ? 'Localização confirmada' : 'Localização não informada'}</Text>
            <Text style={[styles.confirmedLocationAddress, { color: theme.colors.textSecondary }]}>{params.address ?? 'Volte e selecione o local da ocorrência.'}</Text>
            <Text style={[styles.confirmedLocationCoordinates, { color: theme.colors.textSecondary }]}>
              {hasLocation ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Latitude e longitude serão salvas após a confirmação.'}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(citizen)/denuncia/localizacao")} accessibilityLabel="Alterar localização">
            <MaterialCommunityIcons name="pencil" size={20} color="#17366B" />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>Título</Text>

        <TextInput
          placeholder="Ex.: Buraco na rua"
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.input, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border, color: theme.colors.inputText }]}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Categoria</Text>

        <Pressable style={[styles.select, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]} onPress={() => setShowCategoryModal(true)}>
          <Text style={[styles.selectText, { color: theme.colors.text }]}>
            {categoryName}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={theme.colors.textSecondary}
          />
        </Pressable>

        <Text style={[styles.label, { color: theme.colors.text }]}>Descrição</Text>

        <TextInput
          placeholder="Descreva o problema"
          placeholderTextColor={theme.colors.placeholder}
          multiline
          numberOfLines={5}
          style={[styles.input, styles.textArea, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border, color: theme.colors.inputText }]}
          value={description}
          onChangeText={setDescription}
        />

        <View style={[styles.registrationNotice, { backgroundColor: theme.colors.elevated }]}>
          <MaterialCommunityIcons name="clock-check-outline" size={20} color="#285CC1" />
          <View style={styles.registrationNoticeContent}>
            <Text style={[styles.registrationNoticeText, { color: theme.colors.textSecondary }]}>Data e hora da ocorrência: {registrationDate.toLocaleString('pt-BR')}</Text>
            <Pressable onPress={openDatePicker} style={styles.timePickerButton}>
              <Text style={[styles.timePickerButtonText, { color: theme.colors.textSecondary }]}>Abrir seletor de horário</Text>
            </Pressable>
          </View>
        </View>
        {showDatePicker && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={[styles.modalBackdrop, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, maxHeight: '85%' }]}>
                <MaterialCommunityIcons name="calendar-clock" size={29} color={theme.colors.primaryLight} />
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Selecionar data e horário</Text>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>Informe quando a ocorrência aconteceu.</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border, color: theme.colors.inputText }]} value={fallbackDate} onChangeText={setFallbackDate} placeholder="DD/MM/AAAA" placeholderTextColor={theme.colors.placeholder} />
                <TextInput style={[styles.input, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border, color: theme.colors.inputText }]} value={fallbackTime} onChangeText={setFallbackTime} placeholder="HH:MM" placeholderTextColor={theme.colors.placeholder} />
                <View style={styles.modalActions}>
                  <Pressable style={styles.cancelButton} onPress={() => setShowDatePicker(false)}><Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancelar</Text></Pressable>
                  <Pressable style={styles.confirmButton} onPress={() => {
                    const [day, month, year] = fallbackDate.split('/').map(Number);
                    const [hours, minutes] = fallbackTime.split(':').map(Number);
                    const selectedDate = new Date(year, month - 1, day, hours, minutes);
                    if (Number.isFinite(selectedDate.getTime()) && selectedDate.getDate() === day && selectedDate.getMonth() === month - 1 && selectedDate.getFullYear() === year && selectedDate.getHours() === hours && selectedDate.getMinutes() === minutes && selectedDate <= new Date()) { setRegistrationDate(selectedDate); setError(null); } else { setError('Informe uma data e hora válidas, que não estejam no futuro.'); return; }
                    setShowDatePicker(false);
                  }}><Text style={styles.confirmText}>Confirmar</Text></Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {error && <View accessibilityRole="alert" style={{ backgroundColor: theme.colors.elevated, padding: 14, borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}><MaterialCommunityIcons name="alert-circle-outline" size={21} color={theme.colors.error} /><Text style={[styles.error, { flex: 1, marginBottom: 0, color: theme.colors.error }]}>{error}</Text></View>}

        <Text style={[styles.label, { color: theme.colors.text }]}>Foto da ocorrência</Text>
        {photoUri && !process.env.EXPO_PUBLIC_IMGBB_API_KEY ? <View style={{ padding: 12, borderRadius: 13, backgroundColor: theme.colors.elevated, marginBottom: 12 }}><Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 19 }}>O envio de fotos não está configurado neste aplicativo. Remova o anexo para registrar a denúncia sem foto, ou configure o serviço de imagens.</Text></View> : null}
        {photoUri ? (
          <View style={[styles.photoContainer, { borderColor: theme.colors.border }]}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Pressable style={[styles.photoButton, { backgroundColor: theme.colors.elevated }]} onPress={escolherImagem}>
              <Text style={[styles.photoButtonText, { color: theme.colors.textSecondary }]}>Trocar foto</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.photoButton} onPress={escolherImagem}>
            <MaterialCommunityIcons name="camera-plus" size={22} color="#285CC1" />
            <Text style={[styles.photoButtonText, { color: theme.colors.textSecondary }]}>Selecionar foto</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={[styles.primaryButton, !hasLocation && styles.disabledButton]} disabled={!hasLocation || loading} onPress={requestSubmit}>
        <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>{hasLocation ? 'ENVIAR DENÚNCIA' : 'SELECIONE UMA LOCALIZAÇÃO'}</Text>
      </Pressable>

      <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <View style={[styles.modalBackdrop, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, maxHeight: '85%' }]}>
            <MaterialCommunityIcons name="shape-outline" size={27} color={theme.colors.primaryLight} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Selecione a categoria</Text>
            {CATEGORIAS_DENUNCIA.map((item) => <Pressable key={item.id} style={[styles.modalOption, { borderBottomColor: theme.colors.border }]} onPress={() => { setCategory(item.id); setShowCategoryModal(false); }}><Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{item.nome}</Text></Pressable>) }
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmation} transparent animationType="fade" onRequestClose={() => setShowConfirmation(false)}>
        <View style={[styles.modalBackdrop, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, maxHeight: '85%' }]}>
            <MaterialCommunityIcons name="check-decagram-outline" size={30} color={theme.colors.primaryLight} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Confirmar denúncia</Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>Tem certeza que deseja enviar esta denúncia?</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowConfirmation(false)}><Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancelar</Text></Pressable>
              <Pressable style={styles.confirmButton} onPress={submit} disabled={loading}><Text style={styles.confirmText}>{loading ? 'Salvando...' : 'Confirmar'}</Text></Pressable>
            </View>
            {loading && <ActivityIndicator style={styles.loader} color="#285CC1" />}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FC',
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
    fontWeight: '900',
    color: '#17366B',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#667891',
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },

  confirmedLocation: {
    borderRadius: 14,
    backgroundColor: '#EDF3FC',
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
    fontWeight: '900',
    color: '#17366B',
    marginBottom: 4,
  },

  confirmedLocationAddress: {
    fontSize: 14,
    lineHeight: 19,
    color: '#344662',
  },

  confirmedLocationCoordinates: {
    fontSize: 12,
    color: '#667891',
    marginTop: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#17366B',
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DCE4F0',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    fontSize: 16,
    color: '#13213B',
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  select: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DCE4F0',
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  selectText: {
    fontSize: 16,
    color: '#667891',
  },
  registrationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDF3FC',
    borderRadius: 15,
    padding: 12,
    marginBottom: 4,
  },
  registrationNoticeText: {
    flex: 1,
    color: '#344662',
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
    color: '#285CC1',
    fontSize: 13,
    fontWeight: '700',
  },

  locationCard: {
    minHeight: 90,
    borderRadius: 14,
    backgroundColor: '#EDF3FC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCE9FC',
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
    color: '#17366B',
    marginBottom: 4,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#667891',
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#285CC1',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
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
    color: '#17366B',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  modalText: {
    color: '#344662',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8F3',
  },
  modalOptionText: {
    color: '#17366B',
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
    color: '#667891',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#285CC1',
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
    borderColor: '#DCE4F0',
    borderRadius: 15,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginTop: 8,
  },
  photoContainer: {
    borderWidth: 1,
    borderColor: '#DCE4F0',
    borderRadius: 15,
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
    backgroundColor: '#EDF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#285CC1',
    fontWeight: '700',
    marginTop: 4,
  },
});