# Tio Michael - Assistente de Viagens (Orlando)

Este é o site oficial e chatbot do "Tio Michael", um assistente virtual especializado em roteiros para Orlando, Disney e Universal.

## Funcionalidades Principais

- **Chatbot com IA (Gemini):** Responde dúvidas sobre parques e roteiros.
- **Atendimento Humano (Realtime):** Transbordo para atendimento humano com alerta via WhatsApp.
- **Painel Administrativo:** Interface para responder clientes em tempo real.
- **Integrações:** Supabase (Auth, Database, Realtime, Edge Functions) e Evolution API (WhatsApp).

## Como Rodar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz e adicione:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_gemini
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
   ```

3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

## Deploy (Supabase Edge Functions)

Para que o envio de WhatsApp funcione, é necessário fazer o deploy das funções:

```bash
npx supabase functions deploy send-support-alert --no-verify-jwt
```

## Credenciais Necessárias (Supabase Secrets)

- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE`
- `ADMIN_PHONE`
