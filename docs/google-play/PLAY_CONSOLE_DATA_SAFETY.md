# Guia rápido — Data safety (Google Play)

Use este guia para preencher o formulário de segurança de dados da Play Console de forma consistente com o comportamento real do app.

## 1) Coleta de dados

- Verificar no fluxo real do app quais dados pessoais são inseridos/armazenados (ex.: nome e e-mail de conta).
- Marcar como coletado apenas o que de fato é tratado pelo aplicativo.

## 2) Compartilhamento de dados

- Marcar que não há venda de dados.
- Marcar que não há compartilhamento para publicidade.

## 3) Processamento e finalidade

- Finalidade principal: funcionamento da conta e dos recursos de comunicação do app.
- Sem uso para anúncios comportamentais.

## 4) Segurança no trânsito

- Confirmar se tráfego em produção ocorre sobre HTTPS e declarar de acordo.
- Se houver endpoint sem HTTPS em ambiente de desenvolvimento, não usar esse endpoint no build de produção.

## 5) Exclusão de dados

- Informar no formulário o canal de solicitação de exclusão: `privacidade@comunicafacil.app`.

## 6) Check de consistência (obrigatório)

Antes de enviar para revisão:

1. O que foi marcado no formulário confere com o comportamento real do app.
2. O texto da política de privacidade confere com o formulário.
3. O link público da política está acessível.