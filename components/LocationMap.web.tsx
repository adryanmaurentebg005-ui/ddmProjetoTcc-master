import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../constants/theme';
import { useAppTheme } from '../contexts/ThemeContext';

interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationMapProps {
  onConfirmLocation?: (location: SelectedLocation) => void;
  onBack?: () => void;
}

export default function LocationMap({ onConfirmLocation, onBack }: LocationMapProps) {
  useAppTheme();
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [address, setAddress] = React.useState('Localização manual ou por GPS');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const useBrowserLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Este navegador não oferece geolocalização. Informe as coordenadas manualmente.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setAddress('Localização obtida pelo navegador');
        setLoading(false);
      },
      () => {
        setError('Não foi possível obter sua localização. Informe as coordenadas manualmente.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const confirm = () => {
    const lat = latitude.trim() === '' ? NaN : Number(latitude);
    const lng = longitude.trim() === '' ? NaN : Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      setError('Informe uma latitude e longitude válidas.');
      return;
    }
    setError(null);
    onConfirmLocation?.({ latitude: lat, longitude: lng, address: address.trim() || 'Localização informada no navegador' });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topControls}>
        <Pressable style={styles.floatingButton} onPress={onBack} accessibilityLabel="Voltar">
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Selecionar localização</Text>
      </View>

      <View style={styles.card}>
        <MaterialCommunityIcons name="crosshairs-gps" size={44} color={theme.colors.primaryLight} />
        <Text style={styles.subtitle}>Use o GPS do navegador ou informe as coordenadas.</Text>
        <Pressable style={styles.locationButton} onPress={useBrowserLocation} disabled={loading}>
          {loading ? <ActivityIndicator color={'#FFFFFF'} /> : <MaterialCommunityIcons name="crosshairs-gps" size={20} color={'#FFFFFF'} />}
          <Text style={styles.locationButtonText}>{loading ? 'Localizando...' : 'Usar minha localização'}</Text>
        </Pressable>

        <Text style={styles.label}>Latitude</Text>
        <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" placeholder="Ex.: -23.550520" />
        <Text style={styles.label}>Longitude</Text>
        <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" placeholder="Ex.: -46.633308" />
        <Text style={styles.label}>Endereço ou referência</Text>
        <TextInput style={[styles.input, styles.addressInput]} value={address} onChangeText={setAddress} placeholder="Rua, bairro ou referência" />

        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.confirmButton} onPress={confirm}>
          <MaterialCommunityIcons name="map-marker-check" size={20} color={'#FFFFFF'} />
          <Text style={styles.confirmButtonText}>Confirmar localização</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  topControls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 24 },
  floatingButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, flex: 1 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, alignItems: 'center' },
  subtitle: { marginTop: 10, marginBottom: 18, color: theme.colors.textSecondary, textAlign: 'center' },
  locationButton: { minHeight: 48, width: '100%', borderRadius: 12, backgroundColor: theme.colors.primaryLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
  locationButtonText: { color: theme.colors.surface, fontWeight: '800' },
  label: { alignSelf: 'flex-start', color: theme.colors.text, fontWeight: '700', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 13, marginBottom: 14, backgroundColor: theme.colors.surface, color: theme.colors.inputText },
  addressInput: { minHeight: 70 },
  error: { color: theme.colors.error, marginBottom: 12, alignSelf: 'stretch' },
  confirmButton: { minHeight: 48, width: '100%', borderRadius: 12, backgroundColor: theme.colors.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmButtonText: { color: theme.colors.surface, fontWeight: '800' },
});
