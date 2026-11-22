import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ScreenShell, Surface, InfoRow } from '../../components/ScreenShell';
import { useAuth } from '../../contexts/AuthContext';
import { observarDenunciasDoUsuario } from '../../services/denuncias';
import { Denuncia } from '../../types';
import { theme } from '../../constants/theme';

export default function NotificacoesScreen() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Denuncia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    return observarDenunciasDoUsuario(user.uid, (next) => { setItems(next); setLoading(false); }, () => { setError(true); setLoading(false); });
  }, [user?.uid]);
  return <ScreenShell title="Atualizações" subtitle="Acompanhe os registros vinculados à sua conta." icon="bell-outline">
    <Surface>
      {loading ? <ActivityIndicator color={theme.colors.primaryLight}/> : error ? <Text style={{ color: theme.colors.error }}>Não foi possível carregar suas ocorrências.</Text> : items.length === 0 ?
        <InfoRow icon="bell-sleep-outline" title="Sem atualizações" description="Quando você registrar ocorrências, elas aparecerão aqui."/> :
        items.slice(0, 15).map(item => <View key={item.id}><InfoRow icon="clipboard-check-outline" title={item.titulo} description={`Status atual: ${item.status.replace(/_/g, ' ')} · Protocolo ${item.protocolo}`}/></View>)
      }
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 19, marginTop: 14 }}>Este painel mostra o estado atual dos seus registros. Notificações push e histórico de mudanças ainda não estão disponíveis.</Text>
    </Surface>
  </ScreenShell>;
}
