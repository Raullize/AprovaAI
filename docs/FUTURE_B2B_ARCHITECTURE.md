# Arquitetura Multi-Tenant (B2B) - Proposta Futura

Este documento descreve a proposta de arquitetura para suportar contas organizacionais (B2B) no AprovaAI, permitindo que escolas e cursinhos comprem licenças e gerenciem seus próprios alunos.

## Status Atual
No momento, a plataforma opera exclusivamente no modelo **B2C** (Business-to-Consumer), onde cada usuário é um aluno avulso com seu próprio plano de assinatura (FREE ou PREMIUM). Não há conceito de "turmas" ou "escolas".

## Proposta de Evolução (v2.0)

Para suportar instituições (escolas/cursinhos), a arquitetura precisará evoluir para um modelo de **Multi-Tenancy** (Multilocatário).

### 1. Entidade Organização (Tenant)
Criar uma entidade central que representa a instituição que compra o acesso.

```prisma
enum OrgStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model Organization {
  id             String    @id @default(uuid()) @map("id")
  name           String    @map("name")
  slug           String    @unique @map("slug") // Para subdomínios (ex: aprovaai.com/escola-x)
  maxLicenses    Int       @default(0) @map("max_licenses")
  activeLicenses Int       @default(0) @map("active_licenses")
  status         OrgStatus @default(ACTIVE) @map("status")
  createdAt      DateTime  @default(now()) @map("created_at")
  
  users          User[]
  exams          Exam[]    // Exames exclusivos da organização

  @@map("organizations")
}
```

### 2. Extensão do Modelo User
O usuário precisa ser associado à organização e ter papéis mais granulares.

```prisma
enum UserRole {
  USER          // Aluno
  ORG_ADMIN     // Diretor/Coordenador da Escola
  ORG_TEACHER   // Professor (vê relatórios)
  SUPER_ADMIN   // Administrador do AprovaAI
}

model User {
  // ... campos atuais
  role             UserRole         @default(USER) @map("role")
  
  // Relacionamento opcional (pois o sistema continuará atendendo B2C)
  organizationId   String?          @map("organization_id")
  organization     Organization?    @relation(fields: [organizationId], references: [id])
  classroomId      String?          @map("classroom_id") // Para turmas
}
```

### 3. Conteúdo Exclusivo (Private Content)
Para permitir que professores criem simulados apenas para seus alunos, as entidades de conteúdo (`Exam`, `Topic`, etc.) precisarão de um filtro de `organizationId`.

```prisma
model Exam {
  // ... campos atuais
  
  // Se nulo = Exame global do AprovaAI (disponível para todos)
  // Se preenchido = Exame privado da escola
  organizationId String? @map("organization_id")
  organization   Organization? @relation(fields: [organizationId], references: [id])
}
```

## Regras de Negócio e Impactos

### Autorização e Assinaturas
- **Alunos B2C:** Continuam dependendo do seu próprio `subscriptionPlan`.
- **Alunos B2B:** Herdam o status PREMIUM baseado na validade do contrato da `Organization`. O `subscriptionPlan` individual do aluno pode ser ignorado ou sincronizado automaticamente.

### Consultas (Queries)
Toda listagem de conteúdo (`GET /exams`) precisará de um filtro inteligente:
```typescript
// Pseudo-código do filtro
const whereClause = {
  OR: [
    { organizationId: null }, // Conteúdo global
    { organizationId: user.organizationId } // Conteúdo da escola do usuário
  ]
}
```

## Considerações Finais
Implementar o Multi-Tenancy afeta profundamente a camada de autorização e as consultas ao banco de dados. É recomendado que essa transição seja feita apenas após a validação completa do modelo B2C, garantindo que o fluxo principal de estudos e simulados esteja maduro.