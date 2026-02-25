<- [Voltar para README.md](../README.md)

# Testando a API com Insomnia

Este guia explica como testar os CRUDs da aplicação AprovaAI utilizando o Insomnia, incluindo a configuração de autenticação necessária devido às particularidades do NextAuth.

## 1. Configuração Inicial

### Importar a Coleção
1.  Baixe/Localize o arquivo [`docs/insomnia/insomnia_collection.json`](./insomnia/insomnia_collection.json) no projeto.
2.  Abra o **Insomnia**.
3.  Clique em **Settings/Preferences** (ícone de engrenagem) ou no menu da aplicação.
4.  Vá em **Data** > **Import Data** > **From File**.
5.  Selecione o arquivo JSON.

### Configurar Variáveis de Ambiente
1.  No Insomnia, clique em **No Environment** (canto superior esquerdo) e selecione **Manage Environments**.
2.  Selecione o ambiente **"Localhost"**.
3.  Verifique a variável `base_url`: deve ser `http://localhost:3000` (ou a porta que seu servidor estiver rodando).

---

## 2. Autenticação (Passo Crítico)

O NextAuth utiliza cookies e redirecionamentos que exigem atenção especial em clientes de API.

### Passo 1: Obter CSRF Token
O NextAuth exige um token CSRF para operações de segurança (Login/Logout).
1.  Abra a pasta **Autenticação**.
2.  Execute a requisição **"Obter CSRF Token"**.
3.  No JSON de resposta, copie o valor do campo `csrfToken`.
4.  Vá nas variáveis de ambiente (**Manage Environments** > **Localhost**) e cole esse valor na variável `csrf_token`.

### Passo 2: Fazer Login
1.  Execute a requisição **"Login (Obter Cookie)"**.
2.  **Resultado Esperado:**
    *   Status: `302 Found`
    *   Corpo: `No body returned for response`
    *   **ISSO É SUCESSO!** Significa que o servidor aceitou a senha e tentou redirecionar.
    *   *Nota:* Configuramos esta requisição para **não seguir redirecionamentos** (`Follow Redirects: Off`) para evitar erros visuais de HTML no Insomnia.
3.  O Insomnia capturará automaticamente o cookie `next-auth.session-token`.

### Passo 3: Validar Autenticação
Para ter certeza visual que você está logado:
1.  Execute a requisição **"Verificar Token (Me)"**.
2.  Se tudo deu certo, você receberá um JSON com seus dados:
    ```json
    {
      "authenticated": true,
      "user": { "name": "...", "email": "admin@aprovaai.com", ... }
    }
    ```

---

## 3. Testando os CRUDs

Com a autenticação validada, você pode testar todos os endpoints. As pastas estão organizadas por entidade:

### Exames (Exams)
*   **Listar:** Retorna todos os exames.
*   **Criar:** Envia um JSON para criar um novo exame (ex: "AWS Cloud Practitioner").
    *   *Dica:* Após criar, copie o `id` retornado e atualize a variável `exam_id` no ambiente para testar o "Obter", "Atualizar" e "Deletar".
*   **Atualizar/Deletar:** Usa o `exam_id` configurado.

### Tópicos, Níveis e Questões
O fluxo é hierárquico. Para criar um Tópico, você precisa de um `examId`. Para criar um Nível, precisa de um `topicId`, e assim por diante.
1.  Crie um Pai (ex: Exame).
2.  Copie o ID para a variável de ambiente correspondente.
3.  Crie o Filho (ex: Tópico) usando esse ID.

---

## 4. Troubleshooting (Problemas Comuns)

### Erro "CSRF Token Mismatch" no Login
*   O token CSRF muda a cada inicialização ou tempo. Execute **"Obter CSRF Token"** novamente e atualize a variável de ambiente.

### Erro "Não autenticado" (401)
*   Seu cookie expirou ou não foi salvo.
*   Refaça o processo de **Login**.
*   Certifique-se de que a requisição de Login retornou status `302`.

### Erro "Application error: client-side exception" (HTML)
*   Isso ocorre se o Insomnia tentar renderizar a página de login do Next.js.
*   **Solução:** Nas configurações da requisição (aba Auth/Settings), certifique-se que **"Follow Redirects"** está desmarcado (Off).

<- [Voltar para README.md](../README.md)
