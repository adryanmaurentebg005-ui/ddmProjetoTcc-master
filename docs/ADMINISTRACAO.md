# Painel administrativo

O painel usa o **Firebase Authentication** existente e verifica permissões na coleção `administradores` do Firestore. Não há senha de administrador fixa, bypass por e-mail nem cadastro administrativo público.

## Criar o primeiro administrador

1. No Firebase Console do projeto `ddmmassa`, em **Authentication > Users**, crie o usuário administrador com e-mail e senha (ou use uma conta já existente).
2. Copie o **UID** dessa conta.
3. No Firestore, crie a coleção `administradores`, documento com ID **exatamente igual ao UID** e campo booleano `ativo: true`. Faça isso **somente pelo Console/Admin SDK**, nunca pelo aplicativo.
4. Publique as regras atualizadas de `firestore.rules` no Firebase Console ou com `firebase deploy --only firestore:rules`, após revisar as regras.
5. Faça logout/login e toque em **Acesso administrativo** na tela de login. Contas comuns não conseguem abrir o painel ou consultar todas as denúncias.

## Recursos
- Resumo global, busca por título/protocolo/endereço e filtros por status.
- Atualização de status: em análise, validada, em andamento, aguardando informações, solucionada ou recusada.
- Observação administrativa, confirmação de exclusão e dados em tempo real.
- Segurança aplicada **no servidor**, pelas regras Firestore, e não apenas ocultando botões.

## Atenção
- Não configure `administradores` com `allow write: if request.auth != null`; isso permitiria que qualquer usuário se tornasse administrador.
- As regras precisam ser publicadas manualmente; commitar o arquivo **não altera** as regras em produção.
- A exclusão é permanente; para ambiente real, prefira exclusão lógica e histórico auditável.
- Teste as regras com Firebase Emulator Suite antes de produção.
