# Segurança e Dados de Clientes

Este projeto vai lidar com leads e dados de clientes. A regra de base é simples: o front-end não deve armazenar dados sensíveis, chaves privadas, tokens, listas de clientes ou leads completos.

## Dados previstos

- Nome
- WhatsApp
- Cidade e estado
- Tipo de peça procurada ou vendida
- Marca, modelo e observações técnicas
- Fotos enviadas pelo cliente, quando houver backend preparado para isso

## Regras do projeto

- Não salvar leads em `localStorage`, `sessionStorage`, cookies ou arquivos estáticos.
- Não colocar tokens, webhooks, senhas ou credenciais no JavaScript servido ao navegador.
- Usar variáveis de ambiente apenas no servidor/backend.
- Enviar leads para uma API própria ou provedor confiável via backend, nunca direto do navegador para uma URL secreta.
- Coletar apenas os campos necessários para contato e atendimento.
- Exibir aviso de privacidade perto do formulário antes do envio.
- Tratar upload de imagens somente no backend, com limite de tamanho, tipo permitido e validação.
- Validar dados no front-end para usabilidade e no backend para segurança.
- Registrar consentimento do lead com data, origem e finalidade do contato.

## API Autorizada

- Rotas `/api/*` não são públicas.
- A API exige `Authorization: Bearer <token>` ou `x-api-key: <token>`.
- O token deve ficar somente no ambiente do servidor em `API_AUTH_TOKEN`.
- Se `API_AUTH_TOKEN` não estiver configurado, a API fica indisponível.
- O servidor local aceita apenas host `127.0.0.1` ou `localhost` na porta configurada.
- O corpo das requisições de API tem limite para reduzir abuso.

## Controles mínimos do backend futuro

- HTTPS obrigatório em produção.
- Rate limit nos endpoints de lead.
- Proteção contra spam com honeypot e, se necessário, captcha.
- Validação de payload com schema.
- Sanitização de textos antes de salvar ou renderizar.
- Banco com acesso restrito e backups protegidos.
- Logs sem dados sensíveis desnecessários.
- Política de retenção para apagar leads antigos.

## Headers de segurança

O servidor local já aplica headers básicos:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options`

Em produção, esses headers devem ser configurados também na hospedagem ou CDN.
