# Denúncia Urbana

Aplicativo de registro e acompanhamento de ocorrências urbanas desenvolvido em **Expo + React Native + TypeScript**, com **Firebase Authentication** e **Cloud Firestore**.

## Executar

```bash
npm ci
npx expo start
```

Para os recursos nativos de mapa e outras bibliotecas que exigem módulos nativos, use um **development build**, não presuma compatibilidade com Expo Go.

## Segurança e implantação

- Revise e implante `firestore.rules` no projeto Firebase de destino: `firebase deploy --only firestore:rules`. **Regras no GitHub não se aplicam automaticamente ao projeto em produção.**
- O usuário autenticado só pode acessar suas próprias denúncias; atualizações feitas pelo cliente ficam limitadas aos campos título, descrição e categoria.
- A configuração pública do Firebase no aplicativo não é uma credencial administrativa. A proteção real depende das regras do Firestore e dos controles de autenticação.
- Nunca armazene segredos em variáveis `EXPO_PUBLIC_*`: elas ficam disponíveis no aplicativo compilado. O upload de imagens para o ImgBB no código legado usa `EXPO_PUBLIC_IMGBB_API_KEY` e deve migrar para endpoint seguro antes de uso em produção.
- Revogue e substitua qualquer credencial privada que tenha sido publicada no histórico do repositório.
- O cadastro e acompanhamento de ocorrências estão disponíveis para cidadãos. Dashboards de administração e moderação, mapa e notificações ainda exigem funcionalidades reais e controles de acesso baseados em papéis — não os trate como módulos finalizados.

## Melhorias nesta revisão

- Home redesenhada com resumo de ocorrências e acesso rápido ao registro.
- Componentes reutilizáveis para cartões de denúncia e títulos de seções.
- Regras de autorização no Firestore reforçadas para impedir manipulação do fluxo pelo cidadão.
- Melhorias de navegação, feedback de carregamento/erro e documentação.

## Próximas etapas

Criar testes automatizados (incluindo testes das regras do Firestore no Emulator), completar a navegação por perfis e substituir o upload público de imagens por um serviço autenticado.
