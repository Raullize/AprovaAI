import {
  PrismaClient,
  ExamCategory,
  ExamStatus,
  TopicStatus,
  LevelStatus,
} from '@prisma/client';
import {
  buildSeedUuid,
  buildSingleChoiceQuestion,
  QuestionSeed,
  upsertQuestions,
} from './seedHelpers';

type PromptSeed = {
  focus: string;
  correct: string;
  explanation: string;
};

function pickDistractors(bank: readonly string[], index: number) {
  return [0, 1, 2, 3].map((offset) => bank[(index + offset) % bank.length]);
}

function buildEnemQuestions(params: {
  prefix: string;
  topicName: string;
  prompts: readonly PromptSeed[];
  distractorBank: readonly string[];
}): QuestionSeed[] {
  return params.prompts.map((prompt, index) =>
    buildSingleChoiceQuestion({
      id: `${params.prefix}-${String(index + 1).padStart(2, '0')}`,
      content: `No contexto de ${params.topicName}, assinale a alternativa que melhor representa ${prompt.focus}.`,
      explanation: prompt.explanation,
      correct: prompt.correct,
      distractors: pickDistractors(params.distractorBank, index),
      correctOrder: (index % 5) + 1,
    }),
  );
}

export async function seedEnemContent(prisma: PrismaClient) {
  const enemExam = await prisma.exam.upsert({
    where: { slug: 'enem' },
    update: {},
    create: {
      id: buildSeedUuid('exam:enem'),
      name: 'ENEM',
      slug: 'enem',
      description:
        'Trilha inicial de preparação para o Exame Nacional do Ensino Médio com questões organizadas por áreas e níveis.',
      status: ExamStatus.ACTIVE,
      order: 2,
      iconKey: 'graduation-cap',
      colorScheme: 'emerald',
      category: ExamCategory.VESTIBULAR,
    },
  });

  const topicBlueprints = [
    {
      id: 'enem-topic-1',
      name: 'Linguagens e Códigos',
      slug: 'linguagens-e-codigos',
      description:
        'Leitura, interpretação textual, gêneros discursivos e elementos de linguagem.',
      order: 1,
      iconKey: 'book-open',
      colorScheme: 'violet',
      distractorBank: [
        'A memorização isolada de conceitos sem análise do contexto.',
        'A leitura literal sem considerar a intenção comunicativa.',
        'A desconsideração dos elementos de coesão e progressão textual.',
        'A interpretação baseada apenas em opinião pessoal do leitor.',
        'A análise focada exclusivamente na forma gráfica do texto.',
      ],
      levels: [
        {
          id: 'enem-t1-lvl1',
          name: 'Fundamentos de Interpretação',
          slug: 'fundamentos-de-interpretacao',
          description:
            'Questões introdutórias sobre leitura, linguagem e sentidos no texto.',
          order: 1,
          xpReward: 100,
          timeLimit: 900,
          prompts: [
            { focus: 'o reconhecimento da ideia principal de um texto dissertativo', correct: 'identificar a tese defendida pelo autor ao longo do texto', explanation: 'Em textos dissertativos, a compreensão da tese é central para reconhecer o posicionamento construído pelo autor.' },
            { focus: 'a função de um título em um texto jornalístico', correct: 'antecipar o tema e orientar a leitura do conteúdo principal', explanation: 'O título organiza a expectativa do leitor e apresenta uma síntese temática do texto.' },
            { focus: 'a interpretação de uma tirinha com humor verbal', correct: 'perceber o duplo sentido que produz o efeito cômico', explanation: 'Em tirinhas, o humor frequentemente decorre de ambiguidades e trocas de sentido.' },
            { focus: 'a identificação do público-alvo de uma campanha publicitária', correct: 'observar vocabulário, imagens e intenção comunicativa da peça', explanation: 'Campanhas publicitárias mobilizam escolhas linguísticas e visuais compatíveis com o público pretendido.' },
            { focus: 'a diferença entre fato e opinião em um texto opinativo', correct: 'distinguir informações verificáveis de posicionamentos avaliativos', explanation: 'A separação entre fato e opinião auxilia a leitura crítica e a compreensão argumentativa.' },
            { focus: 'o papel dos conectivos em um parágrafo', correct: 'estabelecer relações lógicas entre ideias e organizar a progressão textual', explanation: 'Conectivos explicitam oposição, causa, consequência e outras relações de sentido.' },
            { focus: 'a interpretação de linguagem conotativa', correct: 'considerar o sentido figurado construído pelo contexto', explanation: 'A conotação depende do uso contextual e não apenas do significado literal das palavras.' },
            { focus: 'o objetivo de um infográfico informativo', correct: 'articular linguagem verbal e visual para facilitar a compreensão de dados', explanation: 'Infográficos sintetizam informações por meio de recursos multimodais.' },
            { focus: 'a presença de intertextualidade em um texto', correct: 'reconhecer referências ou diálogos com outros textos', explanation: 'A intertextualidade ocorre quando um texto mobiliza outro para produzir sentido.' },
            { focus: 'a finalidade de uma crônica cotidiana', correct: 'refletir sobre situações do dia a dia com linguagem autoral', explanation: 'A crônica costuma observar fatos cotidianos sob um olhar subjetivo e reflexivo.' },
          ],
        },
        {
          id: 'enem-t1-lvl2',
          name: 'Leitura e Análise Aplicada',
          slug: 'leitura-e-analise-aplicada',
          description:
            'Questões aplicadas de leitura crítica, gêneros e recursos expressivos.',
          order: 2,
          xpReward: 120,
          timeLimit: 900,
          prompts: [
            { focus: 'a análise do efeito argumentativo de uma metáfora em artigo de opinião', correct: 'avaliar como a metáfora reforça o ponto de vista do autor', explanation: 'A metáfora não é apenas estética; ela pode intensificar a argumentação e orientar a leitura.' },
            { focus: 'a leitura crítica de uma postagem em rede social', correct: 'considerar intenção, contexto de circulação e possíveis vieses', explanation: 'A leitura crítica em ambientes digitais exige observar autoria, propósito e contexto social.' },
            { focus: 'a interpretação de ironia em texto opinativo', correct: 'perceber a distância entre o que é dito literalmente e o sentido pretendido', explanation: 'A ironia produz sentido pela oposição entre enunciado literal e intenção comunicativa.' },
            { focus: 'a comparação entre dois gêneros que tratam do mesmo tema', correct: 'observar diferenças de linguagem, finalidade e público-alvo', explanation: 'Gêneros distintos constroem sentidos diferentes mesmo ao abordar o mesmo assunto.' },
            { focus: 'o impacto de recursos visuais em uma campanha de conscientização', correct: 'analisar como a composição visual potencializa a mensagem verbal', explanation: 'Elementos visuais ampliam persuasão, foco e compreensão da campanha.' },
            { focus: 'a identificação de preconceitos linguísticos em um texto', correct: 'reconhecer juízos de valor sobre variedades legítimas da língua', explanation: 'Preconceito linguístico ocorre quando variedades da língua são tratadas como inferiores.' },
            { focus: 'a leitura de uma canção como texto multimodal', correct: 'relacionar letra, contexto e efeitos de linguagem na construção de sentido', explanation: 'A canção mobiliza linguagem verbal, ritmo e contexto cultural para produzir significados.' },
            { focus: 'a interpretação de charge sobre tema político', correct: 'relacionar humor, crítica social e contexto histórico da publicação', explanation: 'Charges dependem do contexto para que o leitor compreenda a crítica construída.' },
            { focus: 'a função discursiva de perguntas retóricas em um texto', correct: 'provocar reflexão e fortalecer a argumentação sem exigir resposta direta', explanation: 'Perguntas retóricas funcionam como recurso persuasivo e organizador do discurso.' },
            { focus: 'a análise de discurso de divulgação científica', correct: 'identificar como conceitos complexos são adaptados para linguagem acessível', explanation: 'Textos de divulgação científica aproximam o conhecimento técnico do público amplo.' },
          ],
        },
      ],
    },
    {
      id: 'enem-topic-2',
      name: 'Matemática e suas Tecnologias',
      slug: 'matematica-e-suas-tecnologias',
      description:
        'Problemas com porcentagem, proporcionalidade, geometria e interpretação de gráficos.',
      order: 2,
      iconKey: 'calculator',
      colorScheme: 'orange',
      distractorBank: [
        'Aplicar a operação inversa sem verificar a grandeza envolvida.',
        'Desconsiderar a proporcionalidade entre as variáveis do problema.',
        'Interpretar o valor apresentado fora da unidade solicitada.',
        'Utilizar soma simples em uma situação que exige razão ou porcentagem.',
        'Ignorar as restrições e condições descritas no enunciado.',
      ],
      levels: [
        {
          id: 'enem-t2-lvl1',
          name: 'Fundamentos Matemáticos',
          slug: 'fundamentos-matematicos',
          description:
            'Questões introdutórias sobre porcentagem, razão e leitura de dados.',
          order: 1,
          xpReward: 100,
          timeLimit: 900,
          prompts: [
            { focus: 'o cálculo de desconto percentual em uma compra', correct: 'aplicar a porcentagem sobre o valor inicial antes de obter o preço final', explanation: 'Descontos percentuais são calculados sobre o valor original da mercadoria.' },
            { focus: 'a leitura correta de um gráfico de barras', correct: 'comparar as alturas das barras respeitando a escala indicada', explanation: 'A leitura de gráficos exige atenção à escala e à variável representada.' },
            { focus: 'a identificação de grandezas diretamente proporcionais', correct: 'verificar se o aumento de uma implica aumento proporcional da outra', explanation: 'Grandezas diretamente proporcionais variam na mesma razão.' },
            { focus: 'o cálculo da média aritmética simples', correct: 'somar todos os valores e dividir pela quantidade de elementos', explanation: 'A média simples é a razão entre soma dos valores e quantidade de termos.' },
            { focus: 'a interpretação de fração como parte de um todo', correct: 'relacionar numerador e denominador à divisão da unidade em partes iguais', explanation: 'A fração representa quantas partes iguais são consideradas em relação ao total.' },
            { focus: 'o uso de regra de três simples em uma situação cotidiana', correct: 'montar a proporção entre grandezas correspondentes antes de resolver', explanation: 'A regra de três depende da correta relação entre os dados informados.' },
            { focus: 'a leitura de tabela com dados percentuais', correct: 'observar o total de referência antes de comparar os percentuais', explanation: 'Percentuais só podem ser comparados adequadamente quando a base é compreendida.' },
            { focus: 'o cálculo de perímetro em uma figura plana', correct: 'somar as medidas de todos os lados da figura', explanation: 'Perímetro corresponde ao contorno total da figura geométrica.' },
            { focus: 'a identificação de um crescimento linear em tabela numérica', correct: 'perceber a variação constante entre valores consecutivos', explanation: 'Funções lineares exibem taxa de variação constante.' },
            { focus: 'a conversão de unidades de medida em problemas práticos', correct: 'manter consistência entre as unidades antes de efetuar o cálculo', explanation: 'Erros de conversão comprometem todo o desenvolvimento da resolução.' },
          ],
        },
        {
          id: 'enem-t2-lvl2',
          name: 'Resolução Aplicada de Problemas',
          slug: 'resolucao-aplicada-de-problemas',
          description:
            'Questões aplicadas com interpretação matemática em contextos reais.',
          order: 2,
          xpReward: 120,
          timeLimit: 900,
          prompts: [
            { focus: 'a análise de um gráfico de linha sobre consumo de água', correct: 'interpretar tendência, pico e queda com base na variação temporal', explanation: 'Gráficos de linha permitem observar comportamento ao longo do tempo.' },
            { focus: 'o uso de porcentagem acumulada em reajustes sucessivos', correct: 'calcular cada variação sobre o valor atualizado da etapa anterior', explanation: 'Reajustes sucessivos não podem ser tratados como simples soma de percentuais.' },
            { focus: 'a comparação entre propostas de financiamento', correct: 'considerar valor total, número de parcelas e juros implícitos', explanation: 'A comparação financeira exige observar o custo final e não apenas a parcela.' },
            { focus: 'o cálculo de área em situação de planejamento urbano', correct: 'relacionar a fórmula geométrica ao formato descrito no problema', explanation: 'Problemas aplicados exigem identificar corretamente a figura envolvida.' },
            { focus: 'a interpretação de escalas em mapas e plantas', correct: 'converter a medida representada para a dimensão real correspondente', explanation: 'Escalas estabelecem proporção entre representação e realidade.' },
            { focus: 'a leitura de gráfico setorial em pesquisa de opinião', correct: 'relacionar cada setor à parcela proporcional do total', explanation: 'No gráfico setorial, o tamanho do setor representa parte do conjunto analisado.' },
            { focus: 'a utilização de equação do primeiro grau em problema cotidiano', correct: 'traduzir a relação verbal do enunciado em expressão algébrica', explanation: 'Modelar o problema em linguagem algébrica é etapa essencial da resolução.' },
            { focus: 'a análise de razão entre distância e tempo', correct: 'reconhecer a relação com o conceito de velocidade média', explanation: 'Velocidade média expressa a razão entre deslocamento total e tempo gasto.' },
            { focus: 'a interpretação de progressão em uma sequência numérica', correct: 'identificar a regularidade para prever o próximo termo', explanation: 'Sequências exigem reconhecimento de padrão e estrutura de repetição.' },
            { focus: 'a tomada de decisão com base em dados estatísticos', correct: 'avaliar os indicadores numéricos em relação ao contexto do problema', explanation: 'No ENEM, estatística costuma aparecer vinculada à leitura crítica de situações reais.' },
          ],
        },
      ],
    },
    {
      id: 'enem-topic-3',
      name: 'Ciências Humanas',
      slug: 'ciencias-humanas',
      description:
        'História, geografia, sociologia e filosofia aplicadas à leitura de fenômenos sociais.',
      order: 3,
      iconKey: 'landmark',
      colorScheme: 'amber',
      distractorBank: [
        'Interpretar o processo histórico como fenômeno isolado e sem contexto.',
        'Desconsiderar os fatores sociais, econômicos e culturais envolvidos.',
        'Reduzir o tema a uma explicação exclusivamente individual.',
        'Ignorar a relação entre espaço geográfico e dinâmica social.',
        'Confundir consequência histórica com causa imediata do fenômeno.',
      ],
      levels: [
        {
          id: 'enem-t3-lvl1',
          name: 'Fundamentos de Ciências Humanas',
          slug: 'fundamentos-de-ciencias-humanas',
          description:
            'Questões introdutórias sobre processos históricos, sociais e geográficos.',
          order: 1,
          xpReward: 100,
          timeLimit: 900,
          prompts: [
            { focus: 'a relação entre industrialização e urbanização', correct: 'reconhecer que a concentração de atividades econômicas atrai população para as cidades', explanation: 'Industrialização e urbanização se articulam historicamente por geração de empregos e infraestrutura.' },
            { focus: 'o papel da cidadania em sociedades democráticas', correct: 'envolver participação social, direitos e deveres dos indivíduos', explanation: 'Cidadania ultrapassa o voto e envolve participação ativa na vida pública.' },
            { focus: 'a importância das fontes históricas', correct: 'compreender que elas permitem interpretar acontecimentos do passado', explanation: 'Fontes históricas sustentam a construção do conhecimento histórico.' },
            { focus: 'o conceito de território em geografia', correct: 'associar espaço geográfico a relações de poder e controle', explanation: 'Território não é apenas área física, mas espaço marcado por disputas e domínio.' },
            { focus: 'a função dos movimentos sociais', correct: 'mobilizar reivindicações coletivas e promover participação política', explanation: 'Movimentos sociais expressam demandas coletivas e disputas por direitos.' },
            { focus: 'a formação da diversidade cultural brasileira', correct: 'reconhecer contribuições indígenas, africanas e europeias', explanation: 'A formação social brasileira resulta de múltiplas matrizes históricas e culturais.' },
            { focus: 'a diferença entre Estado e governo', correct: 'entender o Estado como estrutura permanente e o governo como gestão temporária', explanation: 'Estado e governo são conceitos distintos, embora relacionados politicamente.' },
            { focus: 'a interpretação de mapas temáticos', correct: 'relacionar legenda, escala e fenômeno representado', explanation: 'Mapas temáticos exigem leitura dos elementos cartográficos e do tema exibido.' },
            { focus: 'a noção de desigualdade social', correct: 'considerar distribuição desigual de renda, acesso e oportunidades', explanation: 'Desigualdade social envolve fatores econômicos, territoriais e institucionais.' },
            { focus: 'o sentido histórico da escravidão no Brasil', correct: 'reconhecer seu impacto estrutural na formação social brasileira', explanation: 'A escravidão deixou marcas profundas na organização social e econômica do país.' },
          ],
        },
        {
          id: 'enem-t3-lvl2',
          name: 'Análise Social e Histórica Aplicada',
          slug: 'analise-social-e-historica-aplicada',
          description:
            'Questões aplicadas com leitura crítica de fenômenos políticos e sociais.',
          order: 2,
          xpReward: 120,
          timeLimit: 900,
          prompts: [
            { focus: 'a interpretação de charge sobre democracia', correct: 'relacionar humor gráfico à crítica das instituições políticas', explanation: 'Charges políticas operam por síntese visual e crítica contextualizada.' },
            { focus: 'o impacto da globalização nas relações de trabalho', correct: 'associar integração econômica a transformações produtivas e sociais', explanation: 'Globalização influencia produção, circulação de bens e reorganização do trabalho.' },
            { focus: 'a análise de migrações internas no Brasil', correct: 'considerar fatores econômicos, regionais e históricos do deslocamento populacional', explanation: 'Migrações resultam de múltiplos fatores, não apenas escolha individual.' },
            { focus: 'a leitura crítica de um gráfico de distribuição de renda', correct: 'avaliar a concentração de riqueza entre grupos sociais', explanation: 'Indicadores de renda ajudam a identificar níveis de desigualdade e concentração econômica.' },
            { focus: 'a influência dos meios de comunicação na vida social', correct: 'reconhecer sua atuação na circulação de informações e formação de opinião', explanation: 'Mídia e comunicação têm papel relevante na construção de representações sociais.' },
            { focus: 'a relação entre expansão agrícola e impactos ambientais', correct: 'considerar uso da terra, pressão econômica e transformação do espaço', explanation: 'Expansão agrícola altera paisagens, recursos naturais e dinâmicas locais.' },
            { focus: 'a função social da escola em perspectiva sociológica', correct: 'entender a escola como espaço de formação, socialização e disputa de sentidos', explanation: 'A escola participa da formação cidadã e da reprodução/transformação social.' },
            { focus: 'a análise de direitos humanos em contexto contemporâneo', correct: 'observar universalidade, dignidade e proteção contra violações', explanation: 'Direitos humanos estruturam marcos éticos e jurídicos de proteção social.' },
            { focus: 'a interpretação de texto filosófico sobre ética', correct: 'identificar o problema moral discutido e a posição defendida', explanation: 'Textos filosóficos exigem leitura conceitual e atenção ao argumento central.' },
            { focus: 'a leitura de conflitos territoriais contemporâneos', correct: 'relacionar disputas de poder, recursos e identidade', explanation: 'Conflitos territoriais envolvem fatores políticos, econômicos e culturais.' },
          ],
        },
      ],
    },
    {
      id: 'enem-topic-4',
      name: 'Ciências da Natureza',
      slug: 'ciencias-da-natureza',
      description:
        'Biologia, química e física aplicadas à interpretação de fenômenos naturais.',
      order: 4,
      iconKey: 'flask-conical',
      colorScheme: 'teal',
      distractorBank: [
        'Ignorar a relação entre causa e efeito descrita no fenômeno.',
        'Interpretar o processo apenas por memorização de fórmula isolada.',
        'Desconsiderar as condições experimentais apresentadas no enunciado.',
        'Confundir transformação física com transformação química sem analisar o contexto.',
        'Tomar o resultado observado como independente das variáveis do sistema.',
      ],
      levels: [
        {
          id: 'enem-t4-lvl1',
          name: 'Fundamentos de Ciências da Natureza',
          slug: 'fundamentos-de-ciencias-da-natureza',
          description:
            'Questões introdutórias de física, química e biologia contextualizadas.',
          order: 1,
          xpReward: 100,
          timeLimit: 900,
          prompts: [
            { focus: 'a importância da fotossíntese para os ecossistemas', correct: 'reconhecer que ela converte energia luminosa em energia química', explanation: 'A fotossíntese sustenta cadeias alimentares por produzir matéria orgânica.' },
            { focus: 'a distinção entre mistura homogênea e heterogênea', correct: 'observar a uniformidade visual e a quantidade de fases presentes', explanation: 'A classificação depende do aspecto e da organização das fases da mistura.' },
            { focus: 'o conceito de força em física', correct: 'entender a força como interação capaz de alterar o movimento ou deformar corpos', explanation: 'Força está relacionada às interações entre corpos e seus efeitos.' },
            { focus: 'a função da água no organismo humano', correct: 'associar sua presença a transporte de substâncias e equilíbrio fisiológico', explanation: 'A água participa de processos vitais como transporte, regulação térmica e metabolismo.' },
            { focus: 'a interpretação de cadeia alimentar simples', correct: 'reconhecer a transferência de matéria e energia entre os níveis tróficos', explanation: 'Cadeias alimentares representam relações alimentares entre os seres vivos.' },
            { focus: 'a identificação de transformação química no cotidiano', correct: 'perceber a formação de novas substâncias no processo', explanation: 'Transformações químicas alteram a composição das substâncias iniciais.' },
            { focus: 'a noção de velocidade média em movimento', correct: 'relacionar deslocamento total e tempo gasto no percurso', explanation: 'Velocidade média resulta da razão entre variação de espaço e tempo.' },
            { focus: 'o papel dos decompositores no ambiente', correct: 'promover reciclagem da matéria orgânica nos ecossistemas', explanation: 'Decompositores devolvem nutrientes ao ambiente e fecham ciclos biogeoquímicos.' },
            { focus: 'a condução de eletricidade em materiais', correct: 'associar a condução à movimentação de cargas elétricas', explanation: 'A propriedade condutora depende da estrutura do material e da mobilidade das cargas.' },
            { focus: 'a função dos indicadores ácido-base', correct: 'sinalizar variações de acidez e basicidade por mudança observável', explanation: 'Indicadores revelam, por exemplo, mudanças de pH em diferentes soluções.' },
          ],
        },
        {
          id: 'enem-t4-lvl2',
          name: 'Interpretação Aplicada em Ciências',
          slug: 'interpretacao-aplicada-em-ciencias',
          description:
            'Questões aplicadas com análise de fenômenos e situações do cotidiano.',
          order: 2,
          xpReward: 120,
          timeLimit: 900,
          prompts: [
            { focus: 'a leitura de experimento sobre germinação de sementes', correct: 'identificar a variável testada e seu efeito sobre o resultado', explanation: 'Experimentos exigem análise de variáveis controladas e observadas.' },
            { focus: 'a interpretação de gráfico de consumo de energia', correct: 'relacionar variações de consumo ao comportamento do sistema analisado', explanation: 'Gráficos científicos pedem leitura integrada entre dado e contexto.' },
            { focus: 'o uso de conceitos de densidade em situação cotidiana', correct: 'considerar a relação entre massa e volume para explicar o fenômeno', explanation: 'Densidade ajuda a compreender flutuação, separação e comportamento de materiais.' },
            { focus: 'a discussão sobre vacinação em saúde pública', correct: 'reconhecer seu papel preventivo no controle de doenças infecciosas', explanation: 'Vacinação é estratégia coletiva e individual de prevenção epidemiológica.' },
            { focus: 'a análise de impactos ambientais causados pelo descarte inadequado de resíduos', correct: 'relacionar resíduos a contaminação e desequilíbrio ambiental', explanation: 'Descarte inadequado compromete solo, água, saúde e ecossistemas.' },
            { focus: 'a interpretação de rótulo nutricional em alimentos', correct: 'observar composição, porção e valores energéticos informados', explanation: 'Rótulos exigem leitura comparativa e compreensão de unidades e porções.' },
            { focus: 'a aplicação do conceito de calor em trocas térmicas', correct: 'entender calor como energia transferida entre corpos com temperaturas diferentes', explanation: 'Trocas térmicas dependem de diferença de temperatura entre sistemas.' },
            { focus: 'a compreensão do efeito estufa em perspectiva científica', correct: 'reconhecer seu caráter natural e o agravamento por ações humanas', explanation: 'O efeito estufa é natural, mas pode ser intensificado pela emissão de gases.' },
            { focus: 'a interpretação de reações químicas em processos industriais', correct: 'avaliar reagentes, produtos e condições do processo', explanation: 'Processos industriais dependem do controle de variáveis e do rendimento das reações.' },
            { focus: 'a leitura de texto sobre biotecnologia', correct: 'relacionar inovação técnica a aplicações na saúde, produção e meio ambiente', explanation: 'Biotecnologia envolve aplicação de conhecimentos biológicos em diferentes setores.' },
          ],
        },
      ],
    },
    {
      id: 'enem-topic-5',
      name: 'Interpretação e Atualidades',
      slug: 'interpretacao-e-atualidades',
      description:
        'Leitura crítica de temas contemporâneos, cidadania, tecnologia e sociedade.',
      order: 5,
      iconKey: 'newspaper',
      colorScheme: 'rose',
      distractorBank: [
        'Reduzir o debate a uma opinião descontextualizada.',
        'Desconsiderar os impactos coletivos do tema discutido.',
        'Interpretar o problema sem relacioná-lo a fatores sociais mais amplos.',
        'Tomar a informação apresentada como neutra sem análise crítica.',
        'Ignorar a dimensão histórica e política envolvida na questão.',
      ],
      levels: [
        {
          id: 'enem-t5-lvl1',
          name: 'Leitura Crítica de Temas Contemporâneos',
          slug: 'leitura-critica-de-temas-contemporaneos',
          description:
            'Questões introdutórias sobre atualidades, cidadania e tecnologia.',
          order: 1,
          xpReward: 100,
          timeLimit: 900,
          prompts: [
            { focus: 'o impacto das redes sociais na circulação de informações', correct: 'considerar velocidade de disseminação e necessidade de verificação de fontes', explanation: 'Redes sociais ampliam circulação de informação, mas exigem leitura crítica.' },
            { focus: 'a importância da educação midiática', correct: 'desenvolver leitura crítica diante de conteúdos digitais e informacionais', explanation: 'Educação midiática contribui para análise de fontes, discursos e desinformação.' },
            { focus: 'o debate sobre sustentabilidade no cotidiano', correct: 'relacionar consumo, descarte e responsabilidade socioambiental', explanation: 'Sustentabilidade envolve práticas individuais e coletivas com impacto ambiental.' },
            { focus: 'a noção de cidadania digital', correct: 'associar uso ético da tecnologia a direitos e responsabilidades no ambiente online', explanation: 'Cidadania digital envolve convivência, segurança e responsabilidade nas redes.' },
            { focus: 'a relevância das políticas públicas para inclusão social', correct: 'reconhecer sua função na redução de desigualdades e garantia de direitos', explanation: 'Políticas públicas estruturam ações coletivas para enfrentar problemas sociais.' },
            { focus: 'a interpretação de notícia sobre mudanças climáticas', correct: 'relacionar o evento noticiado a causas e impactos ambientais amplos', explanation: 'O ENEM costuma cobrar leitura integrada entre notícia e contexto global.' },
            { focus: 'o papel da ciência no enfrentamento de crises sociais', correct: 'reconhecer a produção de conhecimento como base para decisões coletivas', explanation: 'Ciência orienta políticas, prevenção e soluções em contextos complexos.' },
            { focus: 'a discussão sobre consumo consciente', correct: 'avaliar escolhas individuais à luz de impactos sociais e ambientais', explanation: 'Consumo consciente envolve responsabilidade sobre cadeia produtiva e descarte.' },
            { focus: 'o conceito de diversidade em ambientes sociais', correct: 'valorizar pluralidade de experiências, culturas e identidades', explanation: 'Diversidade implica reconhecimento e respeito às diferenças.' },
            { focus: 'a leitura de infográfico sobre indicadores sociais', correct: 'articular dados numéricos e contexto para interpretar a realidade apresentada', explanation: 'Indicadores sociais exigem interpretação quantitativa e qualitativa.' },
          ],
        },
        {
          id: 'enem-t5-lvl2',
          name: 'Atualidades Aplicadas e Argumentação',
          slug: 'atualidades-aplicadas-e-argumentacao',
          description:
            'Questões aplicadas com leitura crítica de problemas contemporâneos.',
          order: 2,
          xpReward: 120,
          timeLimit: 900,
          prompts: [
            { focus: 'a análise de fake news em contexto eleitoral', correct: 'avaliar fonte, intenção e impacto social da desinformação', explanation: 'Desinformação afeta debate público e processos democráticos.' },
            { focus: 'o debate sobre inteligência artificial e trabalho', correct: 'relacionar inovação tecnológica a transformações profissionais e éticas', explanation: 'IA impacta produtividade, qualificação e discussões regulatórias.' },
            { focus: 'a interpretação de editorial sobre mobilidade urbana', correct: 'identificar a tese e as soluções defendidas para o problema coletivo', explanation: 'Editoriais articulam posicionamento institucional e argumentação.' },
            { focus: 'a leitura crítica de dados sobre evasão escolar', correct: 'considerar fatores estruturais, sociais e econômicos relacionados ao fenômeno', explanation: 'Evasão escolar é multidimensional e não pode ser explicada por uma única causa.' },
            { focus: 'a análise do papel das energias renováveis', correct: 'relacionar transição energética a sustentabilidade e planejamento econômico', explanation: 'Energia renovável envolve debate ambiental, tecnológico e produtivo.' },
            { focus: 'a discussão sobre privacidade de dados em plataformas digitais', correct: 'reconhecer a tensão entre uso de serviços e proteção da informação pessoal', explanation: 'Privacidade digital tornou-se tema central nas sociedades conectadas.' },
            { focus: 'a interpretação de campanha pública sobre saúde mental', correct: 'observar linguagem, objetivo e sensibilização social pretendida', explanation: 'Campanhas públicas articulam informação, prevenção e mudança de percepção social.' },
            { focus: 'a leitura de texto sobre desigualdade territorial', correct: 'relacionar infraestrutura, acesso e distribuição desigual de oportunidades', explanation: 'Desigualdade territorial envolve espaço, políticas públicas e desenvolvimento.' },
            { focus: 'a análise de proposta de intervenção social', correct: 'avaliar viabilidade, objetivo e impacto esperado da medida', explanation: 'Questões argumentativas exigem observar coerência entre problema e solução.' },
            { focus: 'a interpretação de reportagem sobre inovação na educação', correct: 'associar tecnologia educacional a mediação pedagógica e acesso', explanation: 'Tecnologia na educação depende de contexto, intencionalidade e inclusão.' },
          ],
        },
      ],
    },
  ] as const;

  for (const topicBlueprint of topicBlueprints) {
    const topic = await prisma.topic.upsert({
      where: {
        examId_slug: { examId: enemExam.id, slug: topicBlueprint.slug },
      },
      update: {},
      create: {
        id: buildSeedUuid(`topic:enem:${topicBlueprint.slug}`),
        name: topicBlueprint.name,
        slug: topicBlueprint.slug,
        description: topicBlueprint.description,
        status: TopicStatus.ACTIVE,
        order: topicBlueprint.order,
        examId: enemExam.id,
        iconKey: topicBlueprint.iconKey,
        colorScheme: topicBlueprint.colorScheme,
      },
    });

    for (const levelBlueprint of topicBlueprint.levels) {
      const level = await prisma.level.upsert({
        where: {
          topicId_slug: { topicId: topic.id, slug: levelBlueprint.slug },
        },
        update: {},
        create: {
          id: buildSeedUuid(
            `level:enem:${topicBlueprint.slug}:${levelBlueprint.slug}`,
          ),
          name: levelBlueprint.name,
          slug: levelBlueprint.slug,
          description: levelBlueprint.description,
          order: levelBlueprint.order,
          topicId: topic.id,
          status: LevelStatus.ACTIVE,
          xpReward: levelBlueprint.xpReward,
          passingPercentage: 70.0,
          timeLimit: levelBlueprint.timeLimit,
        },
      });

      const questions = buildEnemQuestions({
        prefix: `${topicBlueprint.slug}:${levelBlueprint.slug}`,
        topicName: `${topicBlueprint.name} no ENEM`,
        prompts: levelBlueprint.prompts,
        distractorBank: topicBlueprint.distractorBank,
      });

      await upsertQuestions(prisma, questions, level.id);
    }
  }

  console.log(
    '✓ Conteúdo ENEM seeded: 1 exame, 5 tópicos, 10 níveis e 100 questões.',
  );
}
