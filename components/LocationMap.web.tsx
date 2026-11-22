import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
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
          <MaterialCommunityIcons name="arrow-left" size={24} color="#123B65" />
        </Pressable>
        <Text style={styles.title}>Selecionar localização</Text>
      </View>

      <View style={styles.card}>
        <MaterialCommunityIcons name="crosshairs-gps" size={44} color="#1976D2" />
        <Text style={styles.subtitle}>Use o GPS do navegador ou informe as coordenadas.</Text>
        <Pressable style={styles.locationButton} onPress={useBrowserLocation} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FFFFFF" />}
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
          <MaterialCommunityIcons name="map-marker-check" size={20} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>Confirmar localização</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF0F6', padding: 20 },
  topControls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 24 },
  floatingButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#123B65', flex: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  subtitle: { marginTop: 10, marginBottom: 18, color: '#667085', textAlign: 'center' },
  locationButton: { minHeight: 48, width: '100%', borderRadius: 12, backgroundColor: '#1976D2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
  locationButtonText: { color: '#FFFFFF', fontWeight: '800' },
  label: { alignSelf: 'flex-start', color: '#123B65', fontWeight: '700', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 12, padding: 13, marginBottom: 14, backgroundColor: '#FFFFFF', color: '#101828' },
  addressInput: { minHeight: 70 },
  error: { color: '#B42318', marginBottom: 12, alignSelf: 'stretch' },
  confirmButton: { minHeight: 48, width: '100%', borderRadius: 12, backgroundColor: '#123B65', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '800' },
});
