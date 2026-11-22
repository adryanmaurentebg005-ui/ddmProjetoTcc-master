import { InfoRow, ScreenShell, Surface } from '../../../components/ScreenShell';

export default function SobreScreen() {
  return <ScreenShell title="Uma cidade melhor" subtitle="Tecnologia e participação cidadã no mesmo lugar." icon="city-variant-outline">
    <Surface>
      <InfoRow icon="hand-heart-outline" title="Nossa proposta" description="Facilitar o registro de problemas urbanos e dar visibilidade ao acompanhamento de cada solicitação."/>
      <InfoRow icon="shield-account-outline" title="Privacidade" description="Suas ocorrências são vinculadas à sua conta e protegidas por regras de acesso no banco de dados."/>
      <InfoRow icon="information-outline" title="Sobre o sistema" description="Aplicativo desenvolvido como projeto acadêmico. O atendimento efetivo depende da integração com os órgãos responsáveis."/>
    </Surface>
  </ScreenShell>;
}
