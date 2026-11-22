import { ScreenShell, Surface, InfoRow } from '../../components/ScreenShell';
export default function ModeratorDashboardScreen() {
  return <ScreenShell title="Moderação" subtitle="Análise e acompanhamento de solicitações." icon="clipboard-check-outline">
    <Surface><InfoRow icon="file-search-outline" title="Fila de análise" description="A moderação requer autorização por papel e acesso seguro às denúncias encaminhadas."/></Surface>
    <Surface><InfoRow icon="progress-check" title="Acompanhamento" description="Os indicadores serão exibidos após a integração com o fluxo de atendimento."/></Surface>
  </ScreenShell>;
}
