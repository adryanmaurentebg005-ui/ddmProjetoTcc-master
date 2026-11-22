import { ScreenShell, Surface, InfoRow } from '../../components/ScreenShell';
export default function AdminDashboardScreen() {
  return <ScreenShell title="Administração" subtitle="Painel de gestão do sistema." icon="shield-crown-outline">
    <Surface><InfoRow icon="account-group-outline" title="Gestão de usuários" description="A gestão de papéis e permissões precisa de um serviço administrativo autenticado."/></Surface>
    <Surface><InfoRow icon="chart-box-outline" title="Relatórios" description="As métricas globais serão exibidas quando o backend administrativo estiver integrado."/></Surface>
  </ScreenShell>;
}
