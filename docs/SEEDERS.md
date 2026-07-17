# Guia de Seeders (População de Banco)

No desenvolvimento de software, *Seeders* (Semeadores) são scripts responsáveis por preencher o banco de dados com dados iniciais. Eles são fundamentais para não começarmos a desenvolver e testar o frontend com telas vazias.

## O que temos no AprovaAI?

Os seeders estão localizados na pasta `backend/prisma/seeders/` e são divididos em arquivos específicos para facilitar a manutenção:

1. **`adminSeeder.ts`**: Garante que sempre exista um usuário Administrador principal (`admin@aprovaai.com` / `admin123`) para que possamos logar e gerenciar a plataforma assim que ela subir.
2. **`usersSeeder.ts`**: Cria uma lista de usuários estudantes fictícios. Eles recebem valores variados de XP e Streak, o que é essencial para testarmos a visualização correta do **Ranking Global (Leaderboard)**.
3. **`contentSeeder.ts`**: Este é o seeder mais rico. Ele limpa os exames anteriores e popula o banco com a trilha de **AWS Cloud Practitioner**. Ele cria os Exames, os Tópicos (ex: *Introdução à Cloud*, *Segurança e Conformidade*), os Simulados com recompensas em XP e dezenas de Questões reais de múltipla escolha.
4. **`demoHistorySeeder.ts`**: Simula que o usuário "Demo" já realizou algumas provas, preenchendo o histórico de simulados concluídos dele.

## Como Executar

Se você resetou o banco ou está subindo o projeto pela primeira vez, após criar as tabelas com o `db push`, rode o seguinte comando:

```bash
cd backend
pnpm run db:seed
```

O console exibirá o progresso, informando que os usuários foram criados, os exames limpos e o novo conteúdo populado.

### Usuários Criados pelo Seeder

**Administrador:**
- Email: `admin@aprovaai.com`
- Senha: `admin123`

**Usuários Estudantes (Ranking):**
- Emails: `demo@aprovaai.com`, `ana@aprovaai.com`, `bruno@aprovaai.com`, `carla@aprovaai.com`, `diego@aprovaai.com`, `elisa@aprovaai.com`
- Senha: `demo123`
