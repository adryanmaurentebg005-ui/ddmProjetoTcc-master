import { InfoRow, ScreenShell, Surface } from '../../../components/ScreenShell';

export default function AjudaScreen() {
  return <ScreenShell title="Como podemos ajudar?" subtitle="Tudo o que você precisa para registrar e acompanhar uma ocorrência." icon="lifebuoy">
    <Surface>
      <InfoRow icon="map-marker-outline" title="1. Informe o local" description="Escolha o ponto da ocorrência no mapa e confirme o endereço."/>
      <InfoRow icon="text-box-edit-outline" title="2. Descreva o problema" description="Adicione um título claro, uma descrição e a categoria correspondente."/>
      <InfoRow icon="camera-outline" title="3. Anexe uma foto" description="Uma imagem pode ajudar a identificar o problema. O anexo é opcional."/>
      <InfoRow icon="check-circle-outline" title="4. Acompanhe o registro" description="Depois do envio, acompanhe o status em Minhas denúncias."/>
    </Surface>
  </ScreenShell>;
}
