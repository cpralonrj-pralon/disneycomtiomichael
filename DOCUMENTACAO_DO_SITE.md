# 🏰 Disney com Tio Michael - Documentação do Projeto

Este documento serve como um guia completo sobre as funcionalidades, tecnologias e estrutura do site **Disney com Tio Michael**.

---

## 🛠 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e performática:

*   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (para alta velocidade e performance).
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (design responsivo e customizável).
*   **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL cloud).
*   **Autenticação:** Supabase Auth (Google & Magic Link).
*   **Armazenamento de Arquivos:** Supabase Storage (para fotos da galeria e viagens).
*   **Inteligência Artificial:** Google Gemini API (para o Chatbot).
*   **Hospedagem:** GitHub Pages (Deploy automatizado via GitHub Actions).

---

## 🌟 Funcionalidades Públicas (Área do Cliente)

A experiência do usuário foi desenhada para ser mágica, fluida e informativa.

### 1. Seção Hero (Topo)
*   Apresentação impactante com imagens dos parques.
*   Botões de ação rápida ("Falar no WhatsApp", "Ver Roteiros").
*   Design responsivo que se adapta a celulares e computadores.

### 2. Próximas Aventuras (Roteiros)
*   Exibe os pacotes de viagem cadastrados no sistema.
*   **Modal de Detalhes:** Ao clicar em um card, abre-se uma janela com o itinerário detalhado, preços e datas.
*   Integração direta com o banco de dados (o que você muda no Admin, reflete aqui).

### 3. Os Destinos (Marquee Infinito)
*   Mostra os parques (Disney, Universal, etc.) em um carrossel contínuo.
*   **Desktop:** As imagens "correm" sozinhas infinitamente.
*   **Mobile:** Um sistema híbrido inteligente:
    *   As imagens passam sozinhas (Auto-scroll).
    *   O usuário pode tocar e arrastar (Swipe) para controlar a velocidade.

### 4. Galeria de Fotos
*   Exibe momentos reais das viagens em formato "Polaroid".
*   Mesma tecnologia de carrossel infinito dos Destinos.
*   As fotos são carregadas dinamicamente do Painel Administrativo.

### 5. Chatbot Inteligente (Tio Michael AI) 🤖
O site possui um assistente virtual no canto inferior direito com dois modos:
*   **Suporte Mágico (IA):** Usa a inteligência do **Google Gemini** para responder dúvidas sobre roteiros, preços e dicas de Orlando 24/7.
*   **Atendimento Humano:** Permite que o visitante solicite falar com uma pessoa real. A mensagem é salva no sistema e um alerta é enviado para a equipe.
*   **Notificação de Blog:** Se houver um post novo no dia, o ícone do chat avisa o usuário.

### 6. Blog e Depoimentos
*   Área para artigos e dicas de viagem.
*   Seção de prova social com comentários de clientes satisfeitos.

### 7. Formulário de Contato e Newsletter
*   Captura Leads (Nome, Email, Telefone) diretamente para o banco de dados.
*   Link direto para o WhatsApp oficial.

---

## 🔐 Painel Administrativo (Área Restrita)

Acessível através da rota `/disneycomtiomichael/?admin=true` (ou clicando no cadeado no rodapé se habilitado). Requer login.

### Funcionalidades do Admin:

1.  **Dashboard:** Visão geral de viagens ativas e leads recentes.
2.  **Gerenciar Viagens:**
    *   Criar novos pacotes.
    *   Editar preços, datas, imagens e itinerários.
    *   Excluir viagens antigas.
3.  **Gerenciar Galeria:**
    *   Fazer upload de fotos novas.
    *   Adicionar legendas.
    *   Remover fotos.
4.  **Gerenciar Destinos (Parques):**
    *   Adicionar ou remover parques que aparecem no carrossel.
5.  **Leads (Contatos):**
    *   Lista de todas as pessoas que preencheram o formulário de contato.
6.  **Gerenciar Posts (Blog):**
    *   Escrever, editar e publicar artigos para o blog.

---

## ⚙️ Manutenção e Atualização

### Como atualizar o site (Deploy)
Sempre que fizer alterações no código, siga estes passos no terminal para enviar as mudanças para a internet:

1.  **Adicionar arquivos:**
    ```bash
    git add .
    ```
2.  **Salvar alterações (Commit):**
    ```bash
    git commit -m "Descreva o que você mudou"
    ```
3.  **Enviar para o GitHub (Push):**
    ```bash
    git push
    ```

O **GitHub Actions** irá detectar a mudança e atualizar o site automaticamente em cerca de 2 a 5 minutos.

### Variáveis de Ambiente
O site depende de algumas chaves secretas (API Keys) que estão configuradas no repositório do GitHub (Settings > Secrets):
*   `VITE_SUPABASE_URL`: Endereço do banco de dados.
*   `VITE_SUPABASE_ANON_KEY`: Chave pública do banco.
*   `VITE_GEMINI_API_KEY`: Chave da Inteligência Artificial.

---

**Desenvolvido com carinho para Tio Michael Orlando Travel.** 🏰✨
