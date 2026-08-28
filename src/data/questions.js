export const dimensions = [
  { id: "estrategia", short: "Estratégia & Posicionamento", description: "Clareza de ICP, proposta de valor e mercado-alvo." },
  { id: "processos", short: "Processos & Funil", description: "Mapeamento das etapas de vendas e gestão de pipeline." },
  { id: "geracao_leads", short: "Geração de Demandas", description: "Canais de aquisição de clientes e previsibilidade." },
  { id: "execucao", short: "Execução & Vendas", description: "Qualificação, negociação, contorno de objeções e fechamento." },
  { id: "gestao", short: "Gestão & Pessoas", description: "Metas, indicadores (KPIs), rituais e liderança comercial." },
  { id: "tecnologia", short: "Tecnologia & Dados", description: "Uso de CRM, automações e inteligência de dados." }
];

export const answerOptions = [
  { value: 1, label: "Inexistente / Informal", helper: "Não há padrão, depende do improviso individual." },
  { value: 2, label: "Em estruturação", helper: "Existe intenção e ações isoladas, mas sem consistência." },
  { value: 3, label: "Parcialmente definido", helper: "Funciona para parte da equipe, com acompanhamento pontual." },
  { value: 4, label: "Estruturado e Praticado", helper: "Processo claro, rodando com disciplina e métricas." },
  { value: 5, label: "Otimizado e Escalável", helper: "Melhoria contínua, automação e alta previsibilidade." }
];

export const questions = [
  // Estratégia (3)
  { id: "q1", dimension: "estrategia", text: "A empresa possui um Perfil de Cliente Ideal (ICP) e proposta de valor claramente definidos?" },
  { id: "q2", dimension: "estrategia", text: "A estratégia de precificação e margem de contribuição é revisada com frequência?" },
  { id: "q3", dimension: "estrategia", text: "Existe diferenciação clara em relação aos principais concorrentes do mercado?" },
  // Processos (3)
  { id: "q4", dimension: "processos", text: "O funil de vendas possui etapas bem mapeadas e critérios claros de passagem?" },
  { id: "q5", dimension: "processos", text: "Há um Playbook de Vendas padronizado para orientação dos vendedores?" },
  { id: "q6", dimension: "processos", text: "O tempo de ciclo de vendas (da prospecção ao fechamento) é monitorado?" },
  // Geração de Leads (3)
  { id: "q7", dimension: "geracao_leads", text: "Existem múltiplos canais ativos e previsíveis para atração de novos clientes?" },
  { id: "q8", dimension: "geracao_leads", text: "A qualificação de leads antes do repasse para vendas é feita sistematicamente?" },
  { id: "q9", dimension: "geracao_leads", text: "A taxa de conversão de leads em oportunidades qualificadas é acompanhada?" },
  // Execução (3)
  { id: "q10", dimension: "execucao", text: "A equipe utiliza técnicas estruturadas para investigação de dores e negociação?" },
  { id: "q11", dimension: "execucao", text: "Existe um processo padrão para contorno de objeções e follow-up consistente?" },
  { id: "q12", dimension: "execucao", text: "A taxa de conversão de propostas enviadas em vendas fechadas atinge a meta?" },
  // Gestão (3)
  { id: "q13", dimension: "gestao", text: "As metas individuais e da equipe são desdobradas em indicadores diários/semanais?" },
  { id: "q14", dimension: "gestao", text: "Ocorrem rituais regulares de 1-on-1, alinhamento matinal e feedback individual?" },
  { id: "q15", dimension: "gestao", text: "Existe um programa contínuo de treinamento e Onboarding para novos vendedores?" },
  // Tecnologia (3)
  { id: "q16", dimension: "tecnologia", text: "A equipe utiliza o CRM diariamente com 100% das oportunidades registradas?" },
  { id: "q17", dimension: "tecnologia", text: "As decisões comerciais são tomadas com base nos relatórios e dados do CRM?" },
  { id: "q18", dimension: "tecnologia", text: "Há automações ativas para tarefas repetitivas (mensagens, lembretes, e-mails)?" }
];
