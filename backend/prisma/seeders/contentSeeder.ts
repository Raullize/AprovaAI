import { PrismaClient, ExamCategory, ExamStatus, TopicStatus, LevelStatus, QuestionType, QuestionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertQuestions(
  questions: { id: string; content: string; explanation: string; type?: QuestionType; options: { id: string; text: string; isCorrect: boolean; order: number }[] }[],
  levelId: string,
) {
  for (const [i, q] of questions.entries()) {
    const question = await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content, explanation: q.explanation, type: q.type ?? QuestionType.SINGLE_CHOICE },
      create: {
        id: q.id,
        content: q.content,
        explanation: q.explanation,
        levelId,
        order: i + 1,
        type: q.type ?? QuestionType.SINGLE_CHOICE,
        status: QuestionStatus.ACTIVE,
      },
    });

    for (const opt of q.options) {
      await prisma.option.upsert({
        where: { id: opt.id },
        update: { text: opt.text, isCorrect: opt.isCorrect, order: opt.order },
        create: { id: opt.id, text: opt.text, isCorrect: opt.isCorrect, order: opt.order, questionId: question.id },
      });
    }
  }
}

export async function seedContent() {
  console.log('Limpando dados de exames anteriores...');
  // Limpeza em cascata a partir do Exame
  await prisma.exam.deleteMany({});

  console.log('Populando dados de exames, tópicos, níveis e questões...');

  // ─── Exame ────────────────────────────────────────────────────────────────
  const awsExam = await prisma.exam.upsert({
    where: { slug: 'aws-cpp' },
    update: {},
    create: {
      id: 'aws-cpp',
      name: 'AWS Cloud Practitioner',
      slug: 'aws-cpp',
      description: 'Conquiste a certificação inicial da AWS e impulsione sua carreira em Cloud Computing.',
      status: ExamStatus.ACTIVE,
      order: 1,
      iconKey: 'cpu',
      colorScheme: 'orange',
      category: ExamCategory.CERTIFICACOES,
    },
  });

  // ─── Tópico 1: Introdução à Cloud ────────────────────────────────────────
  const topic1 = await prisma.topic.upsert({
    where: { examId_slug: { examId: awsExam.id, slug: 'introducao-a-cloud' } },
    update: {},
    create: {
      id: 'aws-topic-1',
      name: 'Introdução à Cloud',
      slug: 'introducao-a-cloud',
      description: 'Conceitos fundamentais de computação em nuvem, modelos de serviço e implantação.',
      status: TopicStatus.ACTIVE,
      order: 1,
      examId: awsExam.id,
      iconKey: 'cloud',
      colorScheme: 'sky',
    },
  });

  // ─── Tópico 2: Segurança e Conformidade ──────────────────────────────────
  const topic2 = await prisma.topic.upsert({
    where: { examId_slug: { examId: awsExam.id, slug: 'seguranca-e-conformidade' } },
    update: {},
    create: {
      id: 'aws-topic-2',
      name: 'Segurança e Conformidade',
      slug: 'seguranca-e-conformidade',
      description: 'Modelo de responsabilidade compartilhada, IAM, e práticas de segurança na AWS.',
      status: TopicStatus.ACTIVE,
      order: 2,
      examId: awsExam.id,
      iconKey: 'shield',
      colorScheme: 'indigo',
    },
  });

  // ─── Tópico 1 › Nível 1: O que é Cloud Computing? ────────────────────────
  const lvl1 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic1.id, slug: 'o-que-e-cloud' } },
    update: {},
    create: {
      id: 'aws-t1-lvl1',
      name: 'O que é Cloud Computing?',
      slug: 'o-que-e-cloud',
      description: 'Definição, características e vantagens da computação em nuvem.',
      order: 1,
      topicId: topic1.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t1l1-01',
      content: 'Qual das seguintes opções melhor define computação em nuvem?',
      explanation: 'Computação em nuvem é a entrega de serviços de TI pela internet, incluindo servidores, armazenamento, bancos de dados, rede, software e análise.',
      options: [
        { id: 'q-t1l1-01-a', text: 'Um data center local gerenciado pela empresa', isCorrect: false, order: 1 },
        { id: 'q-t1l1-01-b', text: 'Entrega de recursos de TI sob demanda pela internet com pagamento pelo uso', isCorrect: true, order: 2 },
        { id: 'q-t1l1-01-c', text: 'Um servidor físico dedicado em colocação', isCorrect: false, order: 3 },
        { id: 'q-t1l1-01-d', text: 'Armazenamento de arquivos em dispositivos USB', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-02',
      content: 'Qual modelo de serviço em nuvem fornece infraestrutura virtualizada (servidores, rede, armazenamento)?',
      explanation: 'IaaS (Infrastructure as a Service) fornece infraestrutura de TI virtualizada pela internet, permitindo escalar e reduzir recursos conforme necessário.',
      options: [
        { id: 'q-t1l1-02-a', text: 'SaaS (Software as a Service)', isCorrect: false, order: 1 },
        { id: 'q-t1l1-02-b', text: 'PaaS (Platform as a Service)', isCorrect: false, order: 2 },
        { id: 'q-t1l1-02-c', text: 'IaaS (Infrastructure as a Service)', isCorrect: true, order: 3 },
        { id: 'q-t1l1-02-d', text: 'FaaS (Function as a Service)', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-03',
      content: 'No modelo de implantação de nuvem híbrida, o que acontece?',
      explanation: 'Nuvem híbrida combina infraestrutura local (on-premises) com recursos de nuvem pública, permitindo que dados e aplicações se movam entre elas.',
      options: [
        { id: 'q-t1l1-03-a', text: 'Toda a infraestrutura está em nuvem pública', isCorrect: false, order: 1 },
        { id: 'q-t1l1-03-b', text: 'Toda a infraestrutura é privada e local', isCorrect: false, order: 2 },
        { id: 'q-t1l1-03-c', text: 'Infraestrutura local é combinada com nuvem pública', isCorrect: true, order: 3 },
        { id: 'q-t1l1-03-d', text: 'Múltiplas nuvens públicas são utilizadas simultaneamente', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-04',
      content: 'Qual das seguintes é uma vantagem do modelo de pagamento por uso (pay-as-you-go) da nuvem?',
      explanation: 'O modelo pay-as-you-go transforma despesas de capital (CapEx) em despesas operacionais (OpEx), eliminando a necessidade de grandes investimentos iniciais em hardware.',
      options: [
        { id: 'q-t1l1-04-a', text: 'Necessidade de contratos de longo prazo', isCorrect: false, order: 1 },
        { id: 'q-t1l1-04-b', text: 'Eliminação de despesas operacionais', isCorrect: false, order: 2 },
        { id: 'q-t1l1-04-c', text: 'Grandes investimentos iniciais em hardware', isCorrect: false, order: 3 },
        { id: 'q-t1l1-04-d', text: 'Troca de CapEx por OpEx, pagando apenas pelo que usa', isCorrect: true, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-05',
      content: 'Quantas regiões geográficas a AWS possuía ao redor do mundo (aproximadamente)?',
      explanation: 'A AWS opera em dezenas de regiões geográficas ao redor do mundo, cada uma composta de múltiplas Zonas de Disponibilidade isoladas e fisicamente separadas.',
      options: [
        { id: 'q-t1l1-05-a', text: 'Menos de 5 regiões', isCorrect: false, order: 1 },
        { id: 'q-t1l1-05-b', text: 'Entre 30 e 40 regiões', isCorrect: true, order: 2 },
        { id: 'q-t1l1-05-c', text: 'Exatamente 10 regiões', isCorrect: false, order: 3 },
        { id: 'q-t1l1-05-d', text: 'Mais de 100 regiões', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-06',
      content: 'O que é uma Zona de Disponibilidade (Availability Zone) na AWS?',
      explanation: 'Uma Zona de Disponibilidade é um ou mais data centers discretos com energia, rede e conectividade redundantes dentro de uma Região AWS.',
      options: [
        { id: 'q-t1l1-06-a', text: 'Uma região geográfica completa da AWS', isCorrect: false, order: 1 },
        { id: 'q-t1l1-06-b', text: 'Um ou mais data centers isolados dentro de uma Região', isCorrect: true, order: 2 },
        { id: 'q-t1l1-06-c', text: 'Um ponto de presença (PoP) da rede CDN', isCorrect: false, order: 3 },
        { id: 'q-t1l1-06-d', text: 'Um servidor virtual isolado na nuvem', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-07',
      content: 'Qual característica da nuvem permite aumentar ou diminuir recursos automaticamente conforme a demanda?',
      explanation: 'Elasticidade é a capacidade de adquirir recursos conforme necessário e liberar quando não precisar, evitando super ou sub-provisionamento.',
      options: [
        { id: 'q-t1l1-07-a', text: 'Durabilidade', isCorrect: false, order: 1 },
        { id: 'q-t1l1-07-b', text: 'Latência', isCorrect: false, order: 2 },
        { id: 'q-t1l1-07-c', text: 'Elasticidade', isCorrect: true, order: 3 },
        { id: 'q-t1l1-07-d', text: 'Disponibilidade', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-08',
      content: 'Qual serviço AWS permite executar máquinas virtuais na nuvem?',
      explanation: 'O Amazon EC2 (Elastic Compute Cloud) fornece capacidade de computação escalável na nuvem, permitindo criar e executar máquinas virtuais (instâncias).',
      options: [
        { id: 'q-t1l1-08-a', text: 'Amazon S3', isCorrect: false, order: 1 },
        { id: 'q-t1l1-08-b', text: 'Amazon EC2', isCorrect: true, order: 2 },
        { id: 'q-t1l1-08-c', text: 'Amazon RDS', isCorrect: false, order: 3 },
        { id: 'q-t1l1-08-d', text: 'Amazon VPC', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-09',
      content: 'Qual modelo de nuvem é exclusivamente gerenciado por uma única organização?',
      explanation: 'A nuvem privada é utilizada exclusivamente por uma única organização, podendo ser hospedada internamente ou por terceiros, oferecendo maior controle e privacidade.',
      options: [
        { id: 'q-t1l1-09-a', text: 'Nuvem pública', isCorrect: false, order: 1 },
        { id: 'q-t1l1-09-b', text: 'Nuvem híbrida', isCorrect: false, order: 2 },
        { id: 'q-t1l1-09-c', text: 'Nuvem privada', isCorrect: true, order: 3 },
        { id: 'q-t1l1-09-d', text: 'Nuvem comunitária', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l1-10',
      content: 'O que significa "alta disponibilidade" no contexto da AWS?',
      explanation: 'Alta disponibilidade refere-se à capacidade de um sistema de operar continuamente com mínimo tempo de inatividade, geralmente implantando recursos em múltiplas Zonas de Disponibilidade.',
      options: [
        { id: 'q-t1l1-10-a', text: 'Acesso ao suporte técnico 24/7', isCorrect: false, order: 1 },
        { id: 'q-t1l1-10-b', text: 'Capacidade de processar grandes volumes de dados', isCorrect: false, order: 2 },
        { id: 'q-t1l1-10-c', text: 'Sistema projetado para operar continuamente com mínimo tempo de inatividade', isCorrect: true, order: 3 },
        { id: 'q-t1l1-10-d', text: 'Velocidade de conexão à internet superior', isCorrect: false, order: 4 },
      ],
    },
  ], lvl1.id);

  // ─── Tópico 1 › Nível 2: Serviços Essenciais da AWS ──────────────────────
  const lvl2 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic1.id, slug: 'servicos-essenciais' } },
    update: {},
    create: {
      id: 'aws-t1-lvl2',
      name: 'Serviços Essenciais da AWS',
      slug: 'servicos-essenciais',
      description: 'Conheça os principais serviços de computação, armazenamento e banco de dados da AWS.',
      order: 2,
      topicId: topic1.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t1l2-01',
      content: 'Qual serviço AWS é ideal para armazenar objetos estáticos como imagens, vídeos e backups?',
      explanation: 'O Amazon S3 (Simple Storage Service) é um serviço de armazenamento de objetos altamente durável (99,999999999%) e escalável.',
      options: [
        { id: 'q-t1l2-01-a', text: 'Amazon EBS', isCorrect: false, order: 1 },
        { id: 'q-t1l2-01-b', text: 'Amazon S3', isCorrect: true, order: 2 },
        { id: 'q-t1l2-01-c', text: 'Amazon EFS', isCorrect: false, order: 3 },
        { id: 'q-t1l2-01-d', text: 'AWS Storage Gateway', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-02',
      content: 'Qual serviço fornece execução de código sem necessidade de gerenciar servidores (serverless)?',
      explanation: 'AWS Lambda é um serviço de computação serverless que executa código em resposta a eventos, sem necessidade de provisionar ou gerenciar infraestrutura.',
      options: [
        { id: 'q-t1l2-02-a', text: 'Amazon EC2', isCorrect: false, order: 1 },
        { id: 'q-t1l2-02-b', text: 'AWS Elastic Beanstalk', isCorrect: false, order: 2 },
        { id: 'q-t1l2-02-c', text: 'AWS Lambda', isCorrect: true, order: 3 },
        { id: 'q-t1l2-02-d', text: 'Amazon ECS', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-03',
      content: 'Qual serviço de banco de dados relacional totalmente gerenciado a AWS oferece?',
      explanation: 'Amazon RDS (Relational Database Service) facilita a configuração e operação de bancos de dados relacionais na nuvem, suportando MySQL, PostgreSQL, Oracle, SQL Server e outros.',
      options: [
        { id: 'q-t1l2-03-a', text: 'Amazon DynamoDB', isCorrect: false, order: 1 },
        { id: 'q-t1l2-03-b', text: 'Amazon RDS', isCorrect: true, order: 2 },
        { id: 'q-t1l2-03-c', text: 'Amazon Redshift', isCorrect: false, order: 3 },
        { id: 'q-t1l2-03-d', text: 'Amazon Neptune', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-04',
      content: 'Qual serviço AWS oferece banco de dados NoSQL totalmente gerenciado com alta performance?',
      explanation: 'Amazon DynamoDB é um banco de dados NoSQL de chave-valor e documentos, totalmente gerenciado, que oferece desempenho de milissegundos em qualquer escala.',
      options: [
        { id: 'q-t1l2-04-a', text: 'Amazon RDS', isCorrect: false, order: 1 },
        { id: 'q-t1l2-04-b', text: 'Amazon Redshift', isCorrect: false, order: 2 },
        { id: 'q-t1l2-04-c', text: 'Amazon DynamoDB', isCorrect: true, order: 3 },
        { id: 'q-t1l2-04-d', text: 'Amazon Aurora', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-05',
      content: 'Qual serviço AWS provisiona uma rede virtual isolada para seus recursos?',
      explanation: 'Amazon VPC (Virtual Private Cloud) permite provisionar uma seção logicamente isolada da AWS onde você pode executar recursos em uma rede virtual definida por você.',
      options: [
        { id: 'q-t1l2-05-a', text: 'Amazon Route 53', isCorrect: false, order: 1 },
        { id: 'q-t1l2-05-b', text: 'AWS Direct Connect', isCorrect: false, order: 2 },
        { id: 'q-t1l2-05-c', text: 'Amazon CloudFront', isCorrect: false, order: 3 },
        { id: 'q-t1l2-05-d', text: 'Amazon VPC', isCorrect: true, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-06',
      content: 'Qual serviço AWS é uma CDN (Content Delivery Network) para entrega rápida de conteúdo globalmente?',
      explanation: 'Amazon CloudFront é uma CDN que entrega dados, vídeos, aplicações e APIs com baixa latência utilizando uma rede global de pontos de presença (Edge Locations).',
      options: [
        { id: 'q-t1l2-06-a', text: 'Amazon CloudFront', isCorrect: true, order: 1 },
        { id: 'q-t1l2-06-b', text: 'Amazon Route 53', isCorrect: false, order: 2 },
        { id: 'q-t1l2-06-c', text: 'AWS Global Accelerator', isCorrect: false, order: 3 },
        { id: 'q-t1l2-06-d', text: 'Amazon API Gateway', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-07',
      content: 'Qual serviço AWS é usado para gerenciar DNS e roteamento de tráfego de internet?',
      explanation: 'Amazon Route 53 é um serviço DNS escalável e de alta disponibilidade, também com capacidade de roteamento de tráfego e verificação de integridade.',
      options: [
        { id: 'q-t1l2-07-a', text: 'Amazon CloudFront', isCorrect: false, order: 1 },
        { id: 'q-t1l2-07-b', text: 'Amazon Route 53', isCorrect: true, order: 2 },
        { id: 'q-t1l2-07-c', text: 'AWS WAF', isCorrect: false, order: 3 },
        { id: 'q-t1l2-07-d', text: 'Amazon API Gateway', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-08',
      content: 'Qual tipo de volume de armazenamento o Amazon EBS fornece para instâncias EC2?',
      explanation: 'Amazon EBS (Elastic Block Store) fornece volumes de armazenamento em bloco persistentes para uso com instâncias EC2, sendo análogos a um HD virtual.',
      options: [
        { id: 'q-t1l2-08-a', text: 'Armazenamento de objetos', isCorrect: false, order: 1 },
        { id: 'q-t1l2-08-b', text: 'Armazenamento de arquivos compartilhados', isCorrect: false, order: 2 },
        { id: 'q-t1l2-08-c', text: 'Armazenamento em bloco persistente', isCorrect: true, order: 3 },
        { id: 'q-t1l2-08-d', text: 'Armazenamento em memória cache', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-09',
      content: 'O AWS Elastic Beanstalk é melhor descrito como:',
      explanation: 'AWS Elastic Beanstalk é uma plataforma PaaS que permite implantação e gerenciamento de aplicações sem se preocupar com a infraestrutura subjacente.',
      options: [
        { id: 'q-t1l2-09-a', text: 'Um banco de dados gerenciado', isCorrect: false, order: 1 },
        { id: 'q-t1l2-09-b', text: 'Uma plataforma PaaS para implantação de aplicações', isCorrect: true, order: 2 },
        { id: 'q-t1l2-09-c', text: 'Um serviço de mensageria', isCorrect: false, order: 3 },
        { id: 'q-t1l2-09-d', text: 'Um serviço de monitoramento', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l2-10',
      content: 'Qual serviço AWS oferece armazenamento de arquivos compartilhado acessível por múltiplas instâncias EC2?',
      explanation: 'Amazon EFS (Elastic File System) fornece armazenamento de arquivos elástico e simples para uso com serviços AWS e recursos on-premises, escalando automaticamente.',
      options: [
        { id: 'q-t1l2-10-a', text: 'Amazon S3', isCorrect: false, order: 1 },
        { id: 'q-t1l2-10-b', text: 'Amazon EBS', isCorrect: false, order: 2 },
        { id: 'q-t1l2-10-c', text: 'Amazon EFS', isCorrect: true, order: 3 },
        { id: 'q-t1l2-10-d', text: 'Amazon Glacier', isCorrect: false, order: 4 },
      ],
    },
  ], lvl2.id);

  // ─── Tópico 2 › Nível 3: Modelo de Responsabilidade Compartilhada ─────────
  const lvl3 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic2.id, slug: 'responsabilidade-compartilhada' } },
    update: {},
    create: {
      id: 'aws-t2-lvl1',
      name: 'Responsabilidade Compartilhada',
      slug: 'responsabilidade-compartilhada',
      description: 'Entenda quem é responsável por cada camada de segurança: AWS vs. Cliente.',
      order: 1,
      topicId: topic2.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t2l1-01',
      content: 'No modelo de responsabilidade compartilhada da AWS, qual é responsabilidade da AWS?',
      explanation: 'A AWS é responsável pela "segurança DA nuvem", incluindo a infraestrutura física (hardware, software, rede e instalações) que executa os serviços.',
      options: [
        { id: 'q-t2l1-01-a', text: 'Configuração de grupos de segurança (Security Groups)', isCorrect: false, order: 1 },
        { id: 'q-t2l1-01-b', text: 'Gerenciamento de usuários no IAM', isCorrect: false, order: 2 },
        { id: 'q-t2l1-01-c', text: 'Segurança da infraestrutura física global', isCorrect: true, order: 3 },
        { id: 'q-t2l1-01-d', text: 'Criptografia de dados em repouso pelo cliente', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-02',
      content: 'Qual das seguintes é responsabilidade do CLIENTE no modelo de responsabilidade compartilhada?',
      explanation: 'O cliente é responsável pela "segurança NA nuvem", incluindo configuração de firewalls, gerenciamento de permissões de usuário, criptografia de dados e configuração de sistemas operacionais.',
      options: [
        { id: 'q-t2l1-02-a', text: 'Manutenção dos data centers físicos', isCorrect: false, order: 1 },
        { id: 'q-t2l1-02-b', text: 'Gerenciamento da rede global da AWS', isCorrect: false, order: 2 },
        { id: 'q-t2l1-02-c', text: 'Configuração e gerenciamento do sistema operacional das instâncias EC2', isCorrect: true, order: 3 },
        { id: 'q-t2l1-02-d', text: 'Manutenção do hardware dos servidores', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-03',
      content: 'O AWS IAM (Identity and Access Management) é usado principalmente para:',
      explanation: 'O AWS IAM permite gerenciar o acesso a serviços e recursos AWS com segurança, criando usuários, grupos, funções e aplicando políticas de permissão.',
      options: [
        { id: 'q-t2l1-03-a', text: 'Monitorar a performance de instâncias EC2', isCorrect: false, order: 1 },
        { id: 'q-t2l1-03-b', text: 'Gerenciar identidades e controlar acesso a recursos AWS', isCorrect: true, order: 2 },
        { id: 'q-t2l1-03-c', text: 'Criar e gerenciar redes virtuais', isCorrect: false, order: 3 },
        { id: 'q-t2l1-03-d', text: 'Armazenar segredos e senhas de aplicações', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-04',
      content: 'Qual é a melhor prática ao usar a conta root da AWS?',
      explanation: 'A conta root deve ser usada apenas para tarefas que exigem acesso root. Para uso diário, crie usuários IAM com permissões mínimas necessárias.',
      options: [
        { id: 'q-t2l1-04-a', text: 'Usar para todas as operações diárias para máxima eficiência', isCorrect: false, order: 1 },
        { id: 'q-t2l1-04-b', text: 'Compartilhar as credenciais com a equipe de TI', isCorrect: false, order: 2 },
        { id: 'q-t2l1-04-c', text: 'Usar apenas para tarefas que exigem acesso root; criar usuários IAM para uso diário', isCorrect: true, order: 3 },
        { id: 'q-t2l1-04-d', text: 'Desativar a conta root após a criação da conta', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-05',
      content: 'O que é o princípio do "mínimo privilégio" no contexto do IAM?',
      explanation: 'O princípio do mínimo privilégio determina que usuários e serviços devem ter apenas as permissões mínimas necessárias para realizar suas tarefas.',
      options: [
        { id: 'q-t2l1-05-a', text: 'Conceder acesso total a todos os serviços para facilitar o trabalho', isCorrect: false, order: 1 },
        { id: 'q-t2l1-05-b', text: 'Conceder apenas as permissões mínimas necessárias para executar uma tarefa', isCorrect: true, order: 2 },
        { id: 'q-t2l1-05-c', text: 'Restringir o acesso apenas ao administrador', isCorrect: false, order: 3 },
        { id: 'q-t2l1-05-d', text: 'Remover todas as permissões após o uso', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-06',
      content: 'Qual serviço AWS registra todas as chamadas de API realizadas na sua conta para fins de auditoria?',
      explanation: 'AWS CloudTrail registra a atividade do usuário e chamadas de API realizadas na conta AWS, permitindo auditoria de conformidade e análise de segurança.',
      options: [
        { id: 'q-t2l1-06-a', text: 'Amazon CloudWatch', isCorrect: false, order: 1 },
        { id: 'q-t2l1-06-b', text: 'AWS Config', isCorrect: false, order: 2 },
        { id: 'q-t2l1-06-c', text: 'AWS CloudTrail', isCorrect: true, order: 3 },
        { id: 'q-t2l1-06-d', text: 'AWS Trusted Advisor', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-07',
      content: 'O que é o AWS Shield?',
      explanation: 'AWS Shield é um serviço gerenciado de proteção contra ataques DDoS (Distributed Denial of Service), disponível em dois níveis: Standard (gratuito) e Advanced.',
      options: [
        { id: 'q-t2l1-07-a', text: 'Um firewall de aplicação web', isCorrect: false, order: 1 },
        { id: 'q-t2l1-07-b', text: 'Um serviço de proteção contra ataques DDoS', isCorrect: true, order: 2 },
        { id: 'q-t2l1-07-c', text: 'Um serviço de antivírus para instâncias EC2', isCorrect: false, order: 3 },
        { id: 'q-t2l1-07-d', text: 'Um serviço de autenticação multifator', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-08',
      content: 'O que é o AWS WAF (Web Application Firewall)?',
      explanation: 'AWS WAF é um firewall de aplicação web que protege aplicações contra exploits web comuns, como injeção de SQL e Cross-Site Scripting (XSS), filtrando tráfego HTTP/HTTPS.',
      options: [
        { id: 'q-t2l1-08-a', text: 'Um serviço de proteção contra DDoS', isCorrect: false, order: 1 },
        { id: 'q-t2l1-08-b', text: 'Um firewall de rede para VPC', isCorrect: false, order: 2 },
        { id: 'q-t2l1-08-c', text: 'Um firewall que protege aplicações web filtrando tráfego HTTP/HTTPS malicioso', isCorrect: true, order: 3 },
        { id: 'q-t2l1-08-d', text: 'Um serviço de monitoramento de logs', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-09',
      content: 'Qual serviço AWS monitora recursos e aplicações em tempo real, coletando métricas e logs?',
      explanation: 'Amazon CloudWatch é um serviço de monitoramento e observabilidade que coleta dados de recursos AWS e aplicações, permitindo criar alarmes e dashboards.',
      options: [
        { id: 'q-t2l1-09-a', text: 'AWS CloudTrail', isCorrect: false, order: 1 },
        { id: 'q-t2l1-09-b', text: 'Amazon CloudWatch', isCorrect: true, order: 2 },
        { id: 'q-t2l1-09-c', text: 'AWS Config', isCorrect: false, order: 3 },
        { id: 'q-t2l1-09-d', text: 'AWS Trusted Advisor', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-10',
      content: 'O que é autenticação multifator (MFA) e por que é recomendada na AWS?',
      explanation: 'MFA adiciona uma camada extra de segurança além da senha, exigindo um segundo fator (como um código de aplicativo). É especialmente recomendada para a conta root e usuários com permissões elevadas.',
      options: [
        { id: 'q-t2l1-10-a', text: 'Um método de criptografia de dados em trânsito', isCorrect: false, order: 1 },
        { id: 'q-t2l1-10-b', text: 'Uma segunda camada de autenticação além da senha para maior segurança', isCorrect: true, order: 2 },
        { id: 'q-t2l1-10-c', text: 'Um serviço de gerenciamento de senhas corporativas', isCorrect: false, order: 3 },
        { id: 'q-t2l1-10-d', text: 'Um tipo de política de acesso do IAM', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l1-08',
      content: 'Quais das seguintes tarefas são responsabilidade exclusiva da AWS no modelo de responsabilidade compartilhada? (Selecione DUAS)',
      explanation: 'No modelo de responsabilidade compartilhada, a AWS é responsável pela "segurança DA nuvem", que inclui a segurança física das instalações, manutenção da infraestrutura de hardware (como descarte seguro de discos) e operação da rede global.',
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: 'q-t2l1-08-a', text: 'Atualização e patch do sistema operacional (Guest OS) de instâncias EC2', isCorrect: false, order: 1 },
        { id: 'q-t2l1-08-b', text: 'Manutenção física e segurança dos data centers da AWS', isCorrect: true, order: 2 },
        { id: 'q-t2l1-08-c', text: 'Configuração de regras de Security Groups', isCorrect: false, order: 3 },
        { id: 'q-t2l1-08-d', text: 'Descarte seguro de hardware de armazenamento físico', isCorrect: true, order: 4 },
        { id: 'q-t2l1-08-e', text: 'Gerenciamento de permissões de usuários no IAM', isCorrect: false, order: 5 },
      ],
    },
    {
      id: 'q-t2l1-09',
      content: 'Quais das seguintes são práticas recomendadas de segurança para a conta Root da AWS? (Selecione DUAS)',
      explanation: 'Para proteger a conta Root (que tem acesso irrestrito a todos os recursos e faturamento), você deve ativar MFA e nunca criar/usar Access Keys para ela. O acesso diário deve ser feito por usuários IAM com privilégios limitados.',
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: 'q-t2l1-09-a', text: 'Compartilhar a senha da conta Root apenas com administradores de TI', isCorrect: false, order: 1 },
        { id: 'q-t2l1-09-b', text: 'Ativar a Autenticação Multifator (MFA) na conta Root', isCorrect: true, order: 2 },
        { id: 'q-t2l1-09-c', text: 'Criar Access Keys para a conta Root para uso em scripts de automação', isCorrect: false, order: 3 },
        { id: 'q-t2l1-09-d', text: 'Usar a conta Root para tarefas de administração diárias', isCorrect: false, order: 4 },
        { id: 'q-t2l1-09-e', text: 'Excluir as Access Keys da conta Root, se existirem', isCorrect: true, order: 5 },
      ],
    },
  ], lvl3.id);

  // ─── Tópico 1 › Nível 3: Vantagens e Modelos de Nuvem ────────────────────
  const lvl1_3 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic1.id, slug: 'vantagens-modelos-nuvem' } },
    update: {},
    create: {
      id: 'aws-t1-lvl3',
      name: 'Vantagens e Modelos de Nuvem',
      slug: 'vantagens-modelos-nuvem',
      description: 'Entenda os principais modelos de implantação e as vantagens financeiras e operacionais da nuvem.',
      order: 3,
      topicId: topic1.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t1l3-01',
      content: 'Quais são as características essenciais da computação em nuvem segundo o NIST?',
      explanation: 'Segundo o NIST, as 5 características essenciais são: Autoatendimento sob demanda, Acesso amplo à rede, Pool de recursos, Rápida elasticidade e Serviço mensurado.',
      options: [
        { id: 'q-t1l3-01-a', text: 'Criptografia total, Alta disponibilidade, Escalabilidade, IA e Banco de Dados', isCorrect: false, order: 1 },
        { id: 'q-t1l3-01-b', text: 'Autoatendimento sob demanda, Acesso amplo à rede, Pool de recursos, Rápida elasticidade e Serviço mensurado', isCorrect: true, order: 2 },
        { id: 'q-t1l3-01-c', text: 'Segurança física, Firewall, Acesso VPN, Backups e Servidores dedicados', isCorrect: false, order: 3 },
        { id: 'q-t1l3-01-d', text: 'Baixo custo, Suporte técnico, Servidores Linux, Acesso SSH e Criptografia', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-02',
      content: 'Qual das seguintes opções descreve o modelo de implantação de nuvem híbrida?',
      explanation: 'Nuvem híbrida combina infraestrutura local (nuvem privada ou data center próprio) com recursos de nuvem pública, permitindo compartilhar dados e aplicações entre elas.',
      options: [
        { id: 'q-t1l3-02-a', text: 'O uso de múltiplos provedores de nuvem pública simultaneamente', isCorrect: false, order: 1 },
        { id: 'q-t1l3-02-b', text: 'Uma infraestrutura mantida integralmente no data center físico do cliente', isCorrect: false, order: 2 },
        { id: 'q-t1l3-02-c', text: 'Uma combinação de recursos locais (on-premises) e serviços de nuvem pública', isCorrect: true, order: 3 },
        { id: 'q-t1l3-02-d', text: 'Uma nuvem de uso exclusivo de uma instituição de ensino', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-03',
      content: 'Qual vantagem da nuvem refere-se à capacidade de expandir ou contrair recursos de forma rápida e automática?',
      explanation: 'Rápida elasticidade é a capacidade de dimensionar recursos dinamicamente de acordo com a demanda real da aplicação.',
      options: [
        { id: 'q-t1l3-03-a', text: 'Alta durabilidade', isCorrect: false, order: 1 },
        { id: 'q-t1l3-03-b', text: 'Rápida elasticidade', isCorrect: true, order: 2 },
        { id: 'q-t1l3-03-c', text: 'Segurança física', isCorrect: false, order: 3 },
        { id: 'q-t1l3-03-d', text: 'Conformidade global', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-04',
      content: 'O modelo SaaS (Software as a Service) é caracterizado por:',
      explanation: 'No SaaS, o provedor hospeda e gerencia a aplicação completa. O usuário final acessa o software pronto, geralmente através do navegador (ex: Office 365, Gmail).',
      options: [
        { id: 'q-t1l3-04-a', text: 'O cliente gerenciar o sistema operacional e a rede', isCorrect: false, order: 1 },
        { id: 'q-t1l3-04-b', text: 'A entrega de servidores brutos prontos para configuração', isCorrect: false, order: 2 },
        { id: 'q-t1l3-04-c', text: 'O acesso a uma aplicação pronta hospedada e totalmente gerenciada pelo provedor', isCorrect: true, order: 3 },
        { id: 'q-t1l3-04-d', text: 'Uma plataforma para desenvolvedores criarem suas próprias aplicações', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-05',
      content: 'Qual das seguintes alternativas representa um exemplo de IaaS (Infrastructure as a Service)?',
      explanation: 'Amazon EC2 fornece recursos computacionais virtuais brutos (servidores, CPU, RAM) onde você tem controle total sobre o sistema operacional, sendo um exemplo clássico de IaaS.',
      options: [
        { id: 'q-t1l3-05-a', text: 'AWS Elastic Beanstalk', isCorrect: false, order: 1 },
        { id: 'q-t1l3-05-b', text: 'Amazon EC2', isCorrect: true, order: 2 },
        { id: 'q-t1l3-05-c', text: 'Amazon RDS', isCorrect: false, order: 3 },
        { id: 'q-t1l3-05-d', text: 'AWS Lambda', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-06',
      content: 'O conceito de "economia de escala" na computação em nuvem significa que:',
      explanation: 'A AWS acumula milhões de clientes, o que permite comprar recursos em enorme quantidade por preços menores e repassar essa economia aos clientes em forma de tarifas mais baixas.',
      options: [
        { id: 'q-t1l3-06-a', text: 'Os recursos ficam mais caros conforme mais pessoas os utilizam', isCorrect: false, order: 1 },
        { id: 'q-t1l3-06-b', text: 'Os preços diminuem porque o provedor adquire recursos em grande escala e repassa a economia aos clientes', isCorrect: true, order: 2 },
        { id: 'q-t1l3-06-c', text: 'A AWS cobra um valor fixo mensal independente do uso', isCorrect: false, order: 3 },
        { id: 'q-t1l3-06-d', text: 'As empresas devem comprar seus próprios servidores físicos em grande escala', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-07',
      content: 'O que representa o modelo de serviço PaaS (Platform as a Service)?',
      explanation: 'PaaS remove a necessidade de gerenciar a infraestrutura subjacente (sistemas operacionais, servidores) e permite focar apenas no desenvolvimento e implantação das aplicações.',
      options: [
        { id: 'q-t1l3-07-a', text: 'Configuração física de cabos e roteadores', isCorrect: false, order: 1 },
        { id: 'q-t1l3-07-b', text: 'Entrega de servidores dedicados físicos sem sistema operacional', isCorrect: false, order: 2 },
        { id: 'q-t1l3-07-c', text: 'Uma plataforma que abstrai o hardware e o sistema operacional, ideal para focar apenas no código', isCorrect: true, order: 3 },
        { id: 'q-t1l3-07-d', text: 'Instalação de aplicativos como navegadores e antivírus', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-08',
      content: 'Qual modelo de implantação é de uso exclusivo de uma única organização?',
      explanation: 'Nuvem privada é a infraestrutura de nuvem criada e utilizada de forma totalmente dedicada e isolada por uma única organização.',
      options: [
        { id: 'q-t1l3-08-a', text: 'Nuvem pública', isCorrect: false, order: 1 },
        { id: 'q-t1l3-08-b', text: 'Nuvem híbrida', isCorrect: false, order: 2 },
        { id: 'q-t1l3-08-c', text: 'Nuvem privada', isCorrect: true, order: 3 },
        { id: 'q-t1l3-08-d', text: 'Nuvem comunitária compartilhada', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-09',
      content: 'Na computação em nuvem, a capacidade de recuperar sistemas após um desastre é conhecida como:',
      explanation: 'Recuperação de desastres (Disaster Recovery) é a habilidade de restaurar sistemas e dados cruciais de forma rápida em caso de falhas catastróficas.',
      options: [
        { id: 'q-t1l3-09-a', text: 'Elasticidade', isCorrect: false, order: 1 },
        { id: 'q-t1l3-09-b', text: 'Recuperação de desastres', isCorrect: true, order: 2 },
        { id: 'q-t1l3-09-c', text: 'Agilidade de mercado', isCorrect: false, order: 3 },
        { id: 'q-t1l3-09-d', text: 'Alta performance', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t1l3-10',
      content: 'Mudar de despesas de capital (CapEx) para despesas operacionais (OpEx) é um benefício financeiro da nuvem. O que descreve melhor as despesas operacionais (OpEx)?',
      explanation: 'Despesas operacionais (OpEx) são custos contínuos do dia a dia do negócio, onde você paga apenas pelos recursos que consome (pagamento por uso), sem investimento inicial massivo.',
      options: [
        { id: 'q-t1l3-10-a', text: 'Investimentos pesados e iniciais na compra de data centers físicos', isCorrect: false, order: 1 },
        { id: 'q-t1l3-10-b', text: 'Custos recorrentes de operação pagos sob demanda conforme o uso dos serviços', isCorrect: true, order: 2 },
        { id: 'q-t1l3-10-c', text: 'Contratos fixos de longa duração de licença de software', isCorrect: false, order: 3 },
        { id: 'q-t1l3-10-d', text: 'Compra de hardware físico para substituição de servidores quebrados', isCorrect: false, order: 4 },
      ],
    },
  ], lvl1_3.id);

  // ─── Tópico 2 › Nível 2: Gerenciamento de Acesso e IAM ──────────────────
  const lvl2_2 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic2.id, slug: 'identidade-acesso' } },
    update: {},
    create: {
      id: 'aws-t2-lvl2',
      name: 'Gerenciamento de Identidade e Acesso - IAM',
      slug: 'identidade-acesso',
      description: 'Aprenda a controlar de forma segura o acesso aos recursos da AWS usando usuários, grupos, roles e políticas.',
      order: 2,
      topicId: topic2.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t2l2-01',
      content: 'No AWS IAM, qual é a principal recomendação de segurança sobre as credenciais da conta root?',
      explanation: 'A conta root possui privilégios totais e irrestritos. Recomenda-se criar um usuário IAM administrativo para as tarefas diárias, habilitar MFA e nunca compartilhar as credenciais root.',
      options: [
        { id: 'q-t2l2-01-a', text: 'Excluir a conta root definitivamente', isCorrect: false, order: 1 },
        { id: 'q-t2l2-01-b', text: 'Bloquear a conta root, habilitar MFA e criar usuários IAM para o trabalho diário', isCorrect: true, order: 2 },
        { id: 'q-t2l2-01-c', text: 'Usar a conta root diariamente por conveniência', isCorrect: false, order: 3 },
        { id: 'q-t2l2-01-d', text: 'Desativar a autenticação multifator para a conta root', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-02',
      content: 'O que é uma política baseada em identidade (Identity-based policy) no IAM?',
      explanation: 'São políticas em formato JSON anexadas diretamente a usuários, grupos ou roles do IAM, definindo quais ações eles podem realizar em quais recursos.',
      options: [
        { id: 'q-t2l2-02-a', text: 'Uma política anexada a um recurso físico (ex: bucket S3)', isCorrect: false, order: 1 },
        { id: 'q-t2l2-02-b', text: 'Uma política anexada a um usuário, grupo ou role do IAM para definir permissões', isCorrect: true, order: 2 },
        { id: 'q-t2l2-02-c', text: 'Uma lista de regras de rede para a VPC', isCorrect: false, order: 3 },
        { id: 'q-t2l2-02-d', text: 'Um contrato de nível de serviço com a AWS', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-03',
      content: 'Qual recurso do IAM permite conceder permissões temporárias a serviços AWS ou usuários externos?',
      explanation: 'IAM Roles (funções) fornecem credenciais de segurança temporárias e são recomendadas para delegar acesso sem a necessidade de criar credenciais permanentes.',
      options: [
        { id: 'q-t2l2-03-a', text: 'Chaves de acesso do IAM (Access Keys)', isCorrect: false, order: 1 },
        { id: 'q-t2l2-03-b', text: 'Políticas em linha (Inline Policies)', isCorrect: false, order: 2 },
        { id: 'q-t2l2-03-c', text: 'IAM Roles (Funções)', isCorrect: true, order: 3 },
        { id: 'q-t2l2-03-d', text: 'Grupos de Usuários', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-04',
      content: 'O que define o princípio do menor privilégio (least privilege) no IAM?',
      explanation: 'O princípio do menor privilégio consiste em conceder apenas as permissões estritamente necessárias para a execução de uma determinada tarefa, reduzindo riscos de segurança.',
      options: [
        { id: 'q-t2l2-04-a', text: 'Dar acesso de administrador para agilizar o trabalho do time', isCorrect: false, order: 1 },
        { id: 'q-t2l2-04-b', text: 'Conceder apenas o nível mínimo de acesso necessário para realizar uma função', isCorrect: true, order: 2 },
        { id: 'q-t2l2-04-c', text: 'Negar todo e qualquer tipo de acesso de forma permanente', isCorrect: false, order: 3 },
        { id: 'q-t2l2-04-d', text: 'Conceder acesso total apenas para usuários com mais de um ano de casa', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-05',
      content: 'Qual das seguintes opções é usada para proteger o acesso à conta root da AWS?',
      explanation: 'Habilitar autenticação multifator (MFA) é o passo de segurança prioritário recomendado pela AWS para proteger contas root e usuários IAM contra acessos não autorizados.',
      options: [
        { id: 'q-t2l2-05-a', text: 'Configurar rotas de VPC', isCorrect: false, order: 1 },
        { id: 'q-t2l2-05-b', text: 'Habilitar MFA (Autenticação de Múltiplos Fatores)', isCorrect: true, order: 2 },
        { id: 'q-t2l2-05-c', text: 'Habilitar o AWS CloudTrail', isCorrect: false, order: 3 },
        { id: 'q-t2l2-05-d', text: 'Criar chaves SSH públicas', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-06',
      content: 'No IAM, o que é um Grupo de Usuários (User Group)?',
      explanation: 'Um Grupo de Usuários do IAM é uma coleção de usuários que compartilham as mesmas permissões. Facilita o gerenciamento de acesso anexando políticas ao grupo.',
      options: [
        { id: 'q-t2l2-06-a', text: 'Uma coleção de contas da AWS organizadas hierarquicamente', isCorrect: false, order: 1 },
        { id: 'q-t2l2-06-b', text: 'Uma coleção de usuários do IAM sob a mesma política de acesso para simplificar a gestão', isCorrect: true, order: 2 },
        { id: 'q-t2l2-06-c', text: 'Um recurso de rede para isolar tráfego na nuvem', isCorrect: false, order: 3 },
        { id: 'q-t2l2-06-d', text: 'Uma lista de e-mails de desenvolvedores cadastrados', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-07',
      content: 'Qual serviço ou recurso permite auditar quais usuários realizaram determinadas ações na conta AWS?',
      explanation: 'AWS CloudTrail monitora e registra logs de todas as chamadas de API feitas por usuários, roles ou serviços dentro da conta AWS.',
      options: [
        { id: 'q-t2l2-07-a', text: 'AWS Trusted Advisor', isCorrect: false, order: 1 },
        { id: 'q-t2l2-07-b', text: 'AWS CloudTrail', isCorrect: true, order: 2 },
        { id: 'q-t2l2-07-c', text: 'IAM Access Analyzer', isCorrect: false, order: 3 },
        { id: 'q-t2l2-07-d', text: 'Amazon Inspector', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-08',
      content: 'Como as políticas do IAM são estruturadas?',
      explanation: 'Políticas do IAM são documentos estruturados em formato JSON que definem regras de Effect (Allow/Deny), Action, Resource e Condition.',
      options: [
        { id: 'q-t2l2-08-a', text: 'Como arquivos XML de texto simples', isCorrect: false, order: 1 },
        { id: 'q-t2l2-08-b', text: 'Como documentos JSON contendo Effect, Action e Resource', isCorrect: true, order: 2 },
        { id: 'q-t2l2-08-c', text: 'Através de planilhas de acesso do Excel', isCorrect: false, order: 3 },
        { id: 'q-t2l2-08-d', text: 'Código binário criptografado', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-09',
      content: 'Qual é a principal diferença entre um Usuário do IAM e uma Role do IAM?',
      explanation: 'Um Usuário IAM possui credenciais permanentes (senha, access keys) vinculadas a uma pessoa ou app. Uma Role não tem credenciais permanentes e pode ser assumida temporariamente por qualquer entidade autorizada.',
      options: [
        { id: 'q-t2l2-09-a', text: 'Usuários têm acesso irrestrito, enquanto roles só dão acesso de leitura', isCorrect: false, order: 1 },
        { id: 'q-t2l2-09-b', text: 'Usuários possuem credenciais permanentes; Roles fornecem credenciais temporárias para quem as assume', isCorrect: true, order: 2 },
        { id: 'q-t2l2-09-c', text: 'Roles são destinadas a pessoas físicas, e usuários para serviços automatizados', isCorrect: false, order: 3 },
        { id: 'q-t2l2-09-d', text: 'Não há diferença prática entre eles', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l2-10',
      content: 'Qual recurso do IAM ajuda a analisar e validar políticas de acesso para garantir que não concedam permissões excessivas?',
      explanation: 'O IAM Access Analyzer analisa políticas e avisa se há acesso externo ou público a recursos, bem como analisa permissões concedidas de forma ampla.',
      options: [
        { id: 'q-t2l2-10-a', text: 'AWS Secrets Manager', isCorrect: false, order: 1 },
        { id: 'q-t2l2-10-b', text: 'IAM Access Analyzer', isCorrect: true, order: 2 },
        { id: 'q-t2l2-10-c', text: 'AWS Firewall Manager', isCorrect: false, order: 3 },
        { id: 'q-t2l2-10-d', text: 'AWS Security Hub', isCorrect: false, order: 4 },
      ],
    },
  ], lvl2_2.id);

  // ─── Tópico 2 › Nível 3: Criptografia e Segurança de Rede ───────────────
  const lvl2_3 = await prisma.level.upsert({
    where: { topicId_slug: { topicId: topic2.id, slug: 'criptografia-seguranca' } },
    update: {},
    create: {
      id: 'aws-t2-lvl3',
      name: 'Criptografia e Segurança de Rede',
      slug: 'criptografia-seguranca',
      description: 'Compreenda a proteção de dados em trânsito e em repouso, criptografia com KMS, e controle de portas com Security Groups e NACLs.',
      order: 3,
      topicId: topic2.id,
      status: LevelStatus.ACTIVE,
      xpReward: 100,
      passingPercentage: 70.0,
      timeLimit: 600,
    },
  });

  await upsertQuestions([
    {
      id: 'q-t2l3-01',
      content: 'Qual serviço da AWS permite criar, gerenciar e controlar as chaves de criptografia usadas para proteger seus dados?',
      explanation: 'AWS KMS (Key Management Service) é o serviço nativo que permite gerar, rodar e controlar chaves criptográficas (Customer Master Keys - CMKs) integradas a dezenas de serviços AWS.',
      options: [
        { id: 'q-t2l3-01-a', text: 'AWS Secrets Manager', isCorrect: false, order: 1 },
        { id: 'q-t2l3-01-b', text: 'AWS KMS (Key Management Service)', isCorrect: true, order: 2 },
        { id: 'q-t2l3-01-c', text: 'AWS Systems Manager Parameter Store', isCorrect: false, order: 3 },
        { id: 'q-t2l3-01-d', text: 'AWS CloudHSM', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-02',
      content: 'O que é o AWS KMS (Key Management Service)?',
      explanation: 'É um serviço gerenciado que facilita a criação e o controle de chaves de criptografia usadas para criptografar seus dados em repouso nos serviços AWS.',
      options: [
        { id: 'q-t2l3-02-a', text: 'Um serviço de controle de tráfego de rede e roteamento', isCorrect: false, order: 1 },
        { id: 'q-t2l3-02-b', text: 'Um serviço gerenciado para criação, controle e armazenamento de chaves criptográficas', isCorrect: true, order: 2 },
        { id: 'q-t2l3-02-c', text: 'Um sistema de monitoramento físico de data centers', isCorrect: false, order: 3 },
        { id: 'q-t2l3-02-d', text: 'Um firewall de borda para prevenção de exploits', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-03',
      content: 'Qual recurso atua como um firewall virtual para suas instâncias EC2, controlando o tráfego de entrada e saída no nível da instância?',
      explanation: 'Security Groups funcionam como firewalls virtuais com regras com estado (stateful), controlando tráfego no nível de interface de rede de cada instância EC2.',
      options: [
        { id: 'q-t2l3-03-a', text: 'Network Access Control List (NACL)', isCorrect: false, order: 1 },
        { id: 'q-t2l3-03-b', text: 'Security Groups (Grupos de Segurança)', isCorrect: true, order: 2 },
        { id: 'q-t2l3-03-c', text: 'Internet Gateway', isCorrect: false, order: 3 },
        { id: 'q-t2l3-03-d', text: 'Route Tables', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-04',
      content: 'Qual é a principal diferença entre um Security Group e uma Network ACL (NACL)?',
      explanation: 'Security Groups operam no nível da instância e têm estado (stateful - a resposta é permitida automaticamente). NACLs operam no nível da sub-rede e não têm estado (stateless - regras de retorno devem ser explícitas).',
      options: [
        { id: 'q-t2l3-04-a', text: 'Security Groups são pagos, NACLs são gratuitas', isCorrect: false, order: 1 },
        { id: 'q-t2l3-04-b', text: 'Security Groups têm estado (stateful) e operam no nível da instância; NACLs não têm estado (stateless) e operam no nível da sub-rede', isCorrect: true, order: 2 },
        { id: 'q-t2l3-04-c', text: 'NACLs operam dentro do sistema operacional da instância, Security Groups operam na VPC', isCorrect: false, order: 3 },
        { id: 'q-t2l3-04-d', text: 'Não há diferença técnica', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-05',
      content: 'O que significa criptografia em trânsito (in transit)?',
      explanation: 'Criptografia em trânsito refere-se à proteção de dados que se movem de um local para outro pela rede, garantindo que não sejam interceptados (ex: via SSL/TLS).',
      options: [
        { id: 'q-t2l3-05-a', text: 'Criptografar arquivos salvos em um disco rígido ou bucket S3', isCorrect: false, order: 1 },
        { id: 'q-t2l3-05-b', text: 'Proteger dados enquanto trafegam pela rede entre sistemas ou clientes', isCorrect: true, order: 2 },
        { id: 'q-t2l3-05-c', text: 'Criptografia de logs de auditoria do CloudTrail', isCorrect: false, order: 3 },
        { id: 'q-t2l3-05-d', text: 'O uso de senhas fortes de acesso', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-06',
      content: 'O que é o AWS Certificate Manager (ACM)?',
      explanation: 'AWS Certificate Manager (ACM) é o serviço que permite provisionar, gerenciar e implantar certificados SSL/TLS públicos e privados para uso com serviços AWS.',
      options: [
        { id: 'q-t2l3-06-a', text: 'Um serviço de auditoria de conformidade fiscal', isCorrect: false, order: 1 },
        { id: 'q-t2l3-06-b', text: 'Um serviço para provisionamento e gestão simplificada de certificados digitais SSL/TLS', isCorrect: true, order: 2 },
        { id: 'q-t2l3-06-c', text: 'Um repositório de documentos fiscais corporativos', isCorrect: false, order: 3 },
        { id: 'q-t2l3-06-d', text: 'Um sistema de autenticação de usuários finais', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-07',
      content: 'Qual recurso de segurança da VPC atua como um firewall no nível da sub-rede (subnet)?',
      explanation: 'Network ACLs (NACLs) funcionam como barreiras de segurança controlando o tráfego que entra e sai de uma ou mais sub-redes da sua VPC.',
      options: [
        { id: 'q-t2l3-07-a', text: 'VPC Peering connection', isCorrect: false, order: 1 },
        { id: 'q-t2l3-07-b', text: 'Network ACL (NACL)', isCorrect: true, order: 2 },
        { id: 'q-t2l3-07-c', text: 'Security Groups', isCorrect: false, order: 3 },
        { id: 'q-t2l3-07-d', text: 'NAT Gateway', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-08',
      content: 'Qual é o principal propósito do AWS CloudHSM?',
      explanation: 'AWS CloudHSM fornece armazenamento de chaves criptográficas em módulos de segurança de hardware (HSM) dedicados e validados pelo padrão FIPS 140-2 Nível 3.',
      options: [
        { id: 'q-t2l3-08-a', text: 'Monitorar tráfego HTTP malicioso em APIs', isCorrect: false, order: 1 },
        { id: 'q-t2l3-08-b', text: 'Fornecer módulos de segurança de hardware (HSM) dedicados e sob controle direto na nuvem AWS', isCorrect: true, order: 2 },
        { id: 'q-t2l3-08-c', text: 'Criptografar logs em tempo real', isCorrect: false, order: 3 },
        { id: 'q-t2l3-08-d', text: 'Análise forense de imagens de disco EC2', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-09',
      content: 'O que é criptografia em repouso (at rest)?',
      explanation: 'Refere-se à criptografia de dados que estão fisicamente armazenados de forma estática em mídias físicas (discos rígidos, unidades flash, fitas magnéticas ou buckets S3).',
      options: [
        { id: 'q-t2l3-09-a', text: 'Criptografia de dados que estão transitando via chamadas HTTPS', isCorrect: false, order: 1 },
        { id: 'q-t2l3-09-b', text: 'Criptografia de dados armazenados de forma estática em mídias de armazenamento', isCorrect: true, order: 2 },
        { id: 'q-t2l3-09-c', text: 'Processo de limpar caches de memória RAM', isCorrect: false, order: 3 },
        { id: 'q-t2l3-09-d', text: 'Uma política de expiração de senhas de acesso', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 'q-t2l3-10',
      content: 'Qual serviço AWS ajuda a detectar ameaças e atividades maliciosas na sua conta AWS analisando logs?',
      explanation: 'Amazon GuardDuty é um serviço de detecção de ameaças contínuo e inteligente que monitora logs de fluxo de VPC, DNS e logs de CloudTrail usando inteligência artificial.',
      options: [
        { id: 'q-t2l3-10-a', text: 'AWS WAF', isCorrect: false, order: 1 },
        { id: 'q-t2l3-10-b', text: 'Amazon GuardDuty', isCorrect: true, order: 2 },
        { id: 'q-t2l3-10-c', text: 'Amazon Inspector', isCorrect: false, order: 3 },
        { id: 'q-t2l3-10-d', text: 'AWS Trusted Advisor', isCorrect: false, order: 4 },
      ],
    },
  ], lvl2_3.id);

  // ─── Histórico de Simulados para o Usuário Demo ───────────────────────────
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@aprovaai.com' },
  });

  if (demoUser) {
    console.log('Seeding demo user simulation history...');

    // Limpar históricos anteriores do usuário demo para evitar duplicatas infinitas
    await prisma.examResult.deleteMany({
      where: { userId: demoUser.id },
    });

    // Obter as questões de lvl1 para criar as respostas
    const lvl1Questions = await prisma.question.findMany({
      where: { levelId: 'aws-t1-lvl1' },
      include: { options: true },
    });

    if (lvl1Questions.length >= 10) {
      // 1. Primeira tentativa (Reprovado, 5 acertos de 10, 1 estrela, 2 dias atrás)
      const date1 = new Date();
      date1.setDate(date1.getDate() - 2);

      const result1 = await prisma.examResult.create({
        data: {
          id: 'demo-history-1',
          userId: demoUser.id,
          levelId: 'aws-t1-lvl1',
          status: 'COMPLETED',
          mode: 'PRACTICE',
          score: 5,
          totalQuestions: 10,
          percentage: 50.0,
          passed: false,
          stars: 1,
          timeSpent: 250,
          createdAt: date1,
          updatedAt: date1,
        },
      });

      // Salvar respostas para a primeira tentativa (5 certas, 5 erradas)
      for (const [index, q] of lvl1Questions.entries()) {
        const isCorrect = index < 5;
        const selectedOption = q.options.find(o => o.isCorrect === isCorrect);
        if (selectedOption) {
          await prisma.examAnswer.create({
            data: {
              examResultId: result1.id,
              questionId: q.id,
              selectedOptions: [selectedOption.id],
              isCorrect,
              timeSpent: 25,
            },
          });
        }
      }

      // 2. Segunda tentativa (Aprovado, 8 acertos de 10, 2 estrelas, 1 dia atrás)
      const date2 = new Date();
      date2.setDate(date2.getDate() - 1);

      const result2 = await prisma.examResult.create({
        data: {
          id: 'demo-history-2',
          userId: demoUser.id,
          levelId: 'aws-t1-lvl1',
          status: 'COMPLETED',
          mode: 'PRACTICE',
          score: 8,
          totalQuestions: 10,
          percentage: 80.0,
          passed: true,
          stars: 2,
          timeSpent: 320,
          createdAt: date2,
          updatedAt: date2,
        },
      });

      // Salvar respostas para a segunda tentativa (8 certas, 2 erradas)
      for (const [index, q] of lvl1Questions.entries()) {
        const isCorrect = index < 8;
        const selectedOption = q.options.find(o => o.isCorrect === isCorrect);
        if (selectedOption) {
          await prisma.examAnswer.create({
            data: {
              examResultId: result2.id,
              questionId: q.id,
              selectedOptions: [selectedOption.id],
              isCorrect,
              timeSpent: 32,
            },
          });
        }
      }
    }
  }

  console.log('✓ Seed finalizado: 1 exame, 2 tópicos, 6 níveis, 60 questões + histórico demo.');
}
