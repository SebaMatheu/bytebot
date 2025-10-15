export type StakeholderInfluence = "Alta" | "Media" | "Baja";
export type StakeholderSupportLevel = "Aliada" | "Neutral" | "Resistente";

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  segment: string;
  area: string;
  influence: StakeholderInfluence;
  supportLevel: StakeholderSupportLevel;
  needs: string;
  engagementStrategy: string;
  engagementScore: number;
}

export type CommunicationStatus = "Planificado" | "En progreso" | "Completado";

export interface Communication {
  id: string;
  title: string;
  objective: string;
  audience: string;
  channel: string;
  owner: string;
  sendDate: string;
  status: CommunicationStatus;
  keyMessage: string;
  successMetric: string;
}

export type TrainingStatus = "Planificado" | "En progreso" | "Completado";
export type TrainingModality = "Presencial" | "Virtual" | "Híbrido";

export interface Training {
  id: string;
  title: string;
  audience: string;
  modality: TrainingModality;
  date: string;
  responsible: string;
  status: TrainingStatus;
  competency: string;
  materials: string;
}

export type RiskProbability = "Alta" | "Media" | "Baja";
export type RiskImpact = "Alto" | "Medio" | "Bajo";
export type RiskStatus = "En observación" | "Mitigando" | "Escalado" | "Cerrado";

export interface Risk {
  id: string;
  name: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigation: string;
  owner: string;
  earlyWarning: string;
  status: RiskStatus;
}

export type KpiFrequency = "Semanal" | "Quincenal" | "Mensual" | "Trimestral";
export type KpiCategory = "Adopción" | "Comunicación" | "Formación" | "Experiencia";

export interface KPI {
  id: string;
  name: string;
  description: string;
  baseline: string;
  target: string;
  frequency: KpiFrequency;
  dataSource: string;
  owner: string;
  category: KpiCategory;
}

export type FeedbackSentiment = "Positivo" | "Neutral" | "Negativo";

export interface Feedback {
  id: string;
  source: string;
  channel: string;
  sentiment: FeedbackSentiment;
  comment: string;
  followUp: string;
  date: string;
  owner: string;
}

export interface RoadmapItem {
  id: string;
  stage: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CommunicationStatus;
}

export interface ReadinessItem {
  id: string;
  dimension: string;
  currentState: string;
  targetState: string;
  actions: string;
  owner: string;
}

export interface Overview {
  initiative: string;
  sponsor: string;
  purpose: string;
  narrative: string;
  principles: string[];
  objectives: string[];
  valueDrivers: string[];
  changeApproach: string[];
  successMetrics: string[];
  roadmap: RoadmapItem[];
  readiness: ReadinessItem[];
}

export interface Champion {
  id: string;
  name: string;
  area: string;
  focus: string;
  status: "Activo" | "En formación";
  contact: string;
}

export interface SupportChannel {
  id: string;
  name: string;
  description: string;
  availability: string;
  owner: string;
}

export interface AdoptionPlaybook {
  id: string;
  name: string;
  objective: string;
  cadence: string;
  owner: string;
  deliverables: string[];
}

export interface Enablement {
  champions: Champion[];
  supportChannels: SupportChannel[];
  adoptionPlaybooks: AdoptionPlaybook[];
}

export interface ChangeProgram {
  overview: Overview;
  stakeholders: Stakeholder[];
  communications: Communication[];
  trainings: Training[];
  risks: Risk[];
  kpis: KPI[];
  feedback: Feedback[];
  enablement: Enablement;
  lastUpdated: string;
}

export type ChangeProgramSection =
  | "stakeholders"
  | "communications"
  | "trainings"
  | "risks"
  | "kpis"
  | "feedback";

export type SectionEntityMap = {
  stakeholders: Stakeholder;
  communications: Communication;
  trainings: Training;
  risks: Risk;
  kpis: KPI;
  feedback: Feedback;
};

export type SectionInputMap = {
  [K in ChangeProgramSection]: Omit<SectionEntityMap[K], "id">;
};

export type SectionUpdateMap = {
  [K in ChangeProgramSection]: Partial<Omit<SectionEntityMap[K], "id">>;
};
