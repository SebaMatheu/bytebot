import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

import type {
  ChangeProgram,
  ChangeProgramSection,
  SectionEntityMap,
  SectionInputMap,
  SectionUpdateMap,
  RoadmapItem,
  ReadinessItem,
  Champion,
  SupportChannel,
  AdoptionPlaybook,
  Stakeholder,
  Communication,
  Training,
  Risk,
  KPI,
  Feedback,
} from "@/types/change-management";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "change-management.json",
);

async function ensureDirectory() {
  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
}

async function saveChangeProgram(program: ChangeProgram) {
  await ensureDirectory();
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(program, null, 2),
    "utf-8",
  );
}

function createDefaultChangeProgram(): ChangeProgram {
  const uuid = () => randomUUID();

  const roadmap: RoadmapItem[] = [
    {
      id: uuid(),
      stage: "Diagnóstico y alineación",
      description:
        "Entrevistas, mapa de stakeholders y evaluación de capacidad organizacional",
      startDate: "2025-01-13",
      endDate: "2025-02-14",
      status: "Completado",
    },
    {
      id: uuid(),
      stage: "Diseño de estrategia y narrativa",
      description:
        "Co-creación de mensajes clave, definición de casos de uso prioritarios y narrativa de cambio",
      startDate: "2025-02-17",
      endDate: "2025-03-14",
      status: "En progreso",
    },
    {
      id: uuid(),
      stage: "Activación de embajadores y pilotos",
      description:
        "Formación de líderes patrocinadores, pilotos funcionales y medición de adopción temprana",
      startDate: "2025-03-17",
      endDate: "2025-04-30",
      status: "Planificado",
    },
    {
      id: uuid(),
      stage: "Escalamiento y sostenibilidad",
      description:
        "Comunicación masiva, sesiones de refuerzo y transferencia a operación",
      startDate: "2025-05-05",
      endDate: "2025-07-25",
      status: "Planificado",
    },
  ];

  const readiness: ReadinessItem[] = [
    {
      id: uuid(),
      dimension: "Liderazgo",
      currentState: "Patrocinio activo del 60% de directores",
      targetState: "100% de líderes con narrativa unificada para abril",
      actions: "Sesiones 1:1, kit de voceros y tablero de seguimiento",
      owner: "Equipo de Gestión del Cambio",
    },
    {
      id: uuid(),
      dimension: "Procesos",
      currentState: "60% de procesos críticos documentados",
      targetState: "Procesos priorizados rediseñados al cierre del Q2",
      actions: "Talleres de co-diseño y pruebas de concepto",
      owner: "PMO Transformación",
    },
    {
      id: uuid(),
      dimension: "Personas",
      currentState: "Mapa de habilidades inicial y 30 embajadores identificados",
      targetState: "Red de 60 embajadores activos y planes individuales de adopción",
      actions: "Programa de formación, comunidad interna y sesiones de coaching",
      owner: "Recursos Humanos",
    },
    {
      id: uuid(),
      dimension: "Tecnología",
      currentState: "Plataforma desplegada al 40% de los usuarios",
      targetState: "Cobertura del 100% con soporte en línea y analítica",
      actions: "Implementación por oleadas, manuales interactivos y mesa de ayuda",
      owner: "Oficina Digital",
    },
  ];

  const champions: Champion[] = [
    {
      id: uuid(),
      name: "Patricia López",
      area: "Operaciones",
      focus: "Embajadora senior para adopción en plantas",
      status: "Activo",
      contact: "patricia.lopez@acme.com",
    },
    {
      id: uuid(),
      name: "Luis Andrade",
      area: "Finanzas",
      focus: "Mentor de nuevas formas de trabajo",
      status: "Activo",
      contact: "luis.andrade@acme.com",
    },
    {
      id: uuid(),
      name: "Cecilia Gómez",
      area: "Recursos Humanos",
      focus: "Coordinación de onboarding y refuerzo",
      status: "En formación",
      contact: "cecilia.gomez@acme.com",
    },
  ];

  const supportChannels: SupportChannel[] = [
    {
      id: uuid(),
      name: "Mesa de ayuda digital",
      description:
        "Canal de soporte multicanal con especialistas funcionales y técnicos",
      availability: "Lunes a viernes 08:00-18:00",
      owner: "Centro de Excelencia Digital",
    },
    {
      id: uuid(),
      name: "Clínicas de adopción",
      description:
        "Sesiones presenciales semanales para resolver casos reales y compartir aprendizajes",
      availability: "Martes y jueves 10:00-12:00",
      owner: "Equipo de Gestión del Cambio",
    },
    {
      id: uuid(),
      name: "Canal Teams #transformacion",
      description:
        "Comunidad abierta con recursos, testimonios y sesiones ask-me-anything",
      availability: "24/7 con curaduría diaria",
      owner: "Embajadores de área",
    },
  ];

  const adoptionPlaybooks: AdoptionPlaybook[] = [
    {
      id: uuid(),
      name: "Playbook de lanzamiento",
      objective: "Garantizar narrativa consistente y artefactos iniciales",
      cadence: "Liberación semanal",
      owner: "Oficina de Cambio",
      deliverables: [
        "Presentación ejecutiva",
        "Plantilla de comunicado",
        "Kit visual para líderes",
      ],
    },
    {
      id: uuid(),
      name: "Playbook de adopción por roles",
      objective: "Adaptar mensajes y casos de uso a cada colectivo",
      cadence: "Actualización quincenal",
      owner: "Recursos Humanos",
      deliverables: [
        "Guía de conversaciones para líderes",
        "Checklist de habilitación",
        "Historias de éxito",
      ],
    },
    {
      id: uuid(),
      name: "Playbook de sostenibilidad",
      objective: "Asegurar refuerzo y métricas post-implementación",
      cadence: "Mensual",
      owner: "PMO Transformación",
      deliverables: [
        "Tablero de seguimiento",
        "Agenda de refuerzo",
        "Plan de transferencia",
      ],
    },
  ];

  const stakeholders: Stakeholder[] = [
    {
      id: uuid(),
      name: "Mariana Castillo",
      role: "Directora General",
      segment: "Patrocinadores",
      area: "Dirección Ejecutiva",
      influence: "Alta",
      supportLevel: "Aliada",
      needs: "Visibilidad del ROI y hitos críticos",
      engagementStrategy: "Briefings quincenales con tablero ejecutivo",
      engagementScore: 92,
    },
    {
      id: uuid(),
      name: "Javier Méndez",
      role: "Gerente de Planta Norte",
      segment: "Liderazgo medio",
      area: "Operaciones",
      influence: "Alta",
      supportLevel: "Neutral",
      needs: "Casos de éxito de plantas pares y soporte local",
      engagementStrategy: "Programa de embajadores y sesiones 1:1",
      engagementScore: 68,
    },
    {
      id: uuid(),
      name: "Andrea Ruiz",
      role: "Supervisora de Turno",
      segment: "Usuarios clave",
      area: "Producción",
      influence: "Media",
      supportLevel: "Resistente",
      needs: "Capacitación práctica y acompañamiento en sitio",
      engagementStrategy: "Coaching en piso y mentores por turno",
      engagementScore: 45,
    },
  ];

  const communications: Communication[] = [
    {
      id: uuid(),
      title: "Kick-off ejecutivo",
      objective: "Alinear narrativa y próximos pasos con comité directivo",
      audience: "Comité Directivo",
      channel: "Reunión presencial",
      owner: "Oficina de Cambio",
      sendDate: "2025-02-05",
      status: "Completado",
      keyMessage: "La transformación digital habilita crecimiento sostenible",
      successMetric: "Feedback positivo del 100% de asistentes",
    },
    {
      id: uuid(),
      title: "Boletín de adopción",
      objective: "Compartir avances y próximos entrenamientos",
      audience: "Toda la organización",
      channel: "Correo + Teams",
      owner: "Comunicaciones Internas",
      sendDate: "2025-03-10",
      status: "En progreso",
      keyMessage: "Los embajadores están disponibles para acompañarte",
      successMetric: "Tasa de apertura superior al 70%",
    },
    {
      id: uuid(),
      title: "Sesiones ask-me-anything",
      objective: "Resolver dudas de usuarios clave y líderes",
      audience: "Líderes y usuarios clave",
      channel: "Live streaming",
      owner: "Equipo de Producto",
      sendDate: "2025-03-20",
      status: "Planificado",
      keyMessage: "Demostraciones en vivo de casos críticos",
      successMetric: "+50 preguntas respondidas y NPS > 60",
    },
  ];

  const trainings: Training[] = [
    {
      id: uuid(),
      title: "Operación de la nueva plataforma",
      audience: "Supervisores de planta",
      modality: "Presencial",
      date: "2025-03-18",
      responsible: "Academia Corporativa",
      status: "En progreso",
      competency: "Procesos operativos",
      materials: "Manual paso a paso y videos cortos",
    },
    {
      id: uuid(),
      title: "Analytics para líderes",
      audience: "Directores y gerentes",
      modality: "Virtual",
      date: "2025-03-25",
      responsible: "Oficina Digital",
      status: "Planificado",
      competency: "Toma de decisiones basada en datos",
      materials: "Dashboard interactivo y casos de análisis",
    },
    {
      id: uuid(),
      title: "Nuevas formas de trabajo",
      audience: "Usuarios finales",
      modality: "Híbrido",
      date: "2025-04-04",
      responsible: "Recursos Humanos",
      status: "Planificado",
      competency: "Colaboración y experiencia cliente",
      materials: "Playbook de rituales y cápsulas de video",
    },
  ];

  const risks: Risk[] = [
    {
      id: uuid(),
      name: "Resistencia de mandos medios",
      category: "Personas",
      probability: "Alta",
      impact: "Alto",
      mitigation: "Embajadores visibles, quick wins y sesiones 1:1",
      owner: "Equipo de Cambio",
      earlyWarning: "Comentarios negativos en foros y baja asistencia",
      status: "Mitigando",
    },
    {
      id: uuid(),
      name: "Sobrecarga operativa",
      category: "Procesos",
      probability: "Media",
      impact: "Alto",
      mitigation: "Planificación en oleadas y redistribución de turnos",
      owner: "Dirección de Operaciones",
      earlyWarning: "Incumplimiento de tareas y aumento de incidencias",
      status: "En observación",
    },
    {
      id: uuid(),
      name: "Integración tecnológica parcial",
      category: "Tecnología",
      probability: "Media",
      impact: "Medio",
      mitigation: "Ruta de integración priorizada y pruebas automatizadas",
      owner: "Arquitectura Empresarial",
      earlyWarning: "Errores recurrentes en interfaz",
      status: "Mitigando",
    },
  ];

  const kpis: KPI[] = [
    {
      id: uuid(),
      name: "Índice de adopción digital",
      description: "Porcentaje de usuarios que utilizan los nuevos procesos semanalmente",
      baseline: "35%",
      target: "85% al Q4 2025",
      frequency: "Mensual",
      dataSource: "Encuesta de adopción y analítica",
      owner: "PMO Transformación",
      category: "Adopción",
    },
    {
      id: uuid(),
      name: "Nivel de confianza en el cambio",
      description: "Percepción de los colaboradores respecto a la utilidad del cambio",
      baseline: "58 puntos",
      target: "+15 puntos en 4 meses",
      frequency: "Mensual",
      dataSource: "Pulse survey",
      owner: "Recursos Humanos",
      category: "Experiencia",
    },
    {
      id: uuid(),
      name: "Cobertura de comunicaciones",
      description: "Porcentaje de colectivos que reciben la narrativa completa",
      baseline: "45%",
      target: "95% al cierre del Q2",
      frequency: "Quincenal",
      dataSource: "Plataforma de envíos y CRM",
      owner: "Comunicaciones Internas",
      category: "Comunicación",
    },
    {
      id: uuid(),
      name: "Participación en formación",
      description: "Tasa de completitud de entrenamientos obligatorios",
      baseline: "20%",
      target: "80% en el primer mes",
      frequency: "Semanal",
      dataSource: "LMS corporativo",
      owner: "Academia Corporativa",
      category: "Formación",
    },
  ];

  const feedback: Feedback[] = [
    {
      id: uuid(),
      source: "Encuesta piloto Planta Norte",
      channel: "Survey",
      sentiment: "Positivo",
      comment: "Los tutoriales en video facilitaron la adopción del nuevo flujo",
      followUp: "Compartir mejores prácticas con otras plantas",
      date: "2025-02-25",
      owner: "Equipo de Cambio",
    },
    {
      id: uuid(),
      source: "Focus group Mandos Medios",
      channel: "Sesión presencial",
      sentiment: "Neutral",
      comment: "Preocupa la carga operativa durante el arranque",
      followUp: "Ajustar plan de despliegue por oleadas",
      date: "2025-03-03",
      owner: "Recursos Humanos",
    },
    {
      id: uuid(),
      source: "Canal Teams #transformacion",
      channel: "Canal digital",
      sentiment: "Negativo",
      comment: "Solicitan soporte extendido para turnos nocturnos",
      followUp: "Extender horario de mesa de ayuda y asignar mentores",
      date: "2025-03-06",
      owner: "Centro de Excelencia Digital",
    },
  ];

  const overview: ChangeProgram["overview"] = {
    initiative: "Programa integral de transformación digital 2025",
    sponsor: "Comité Ejecutivo",
    purpose:
      "Acelerar la adopción de la plataforma digital garantizando continuidad operativa y experiencia del colaborador",
    narrative:
      "La transformación pone a las personas al centro, habilita decisiones ágiles y fortalece la competitividad",
    principles: [
      "Comunicación transparente y bidireccional",
      "Decisiones basadas en evidencias",
      "Acompañamiento cercano a líderes y equipos",
      "Celebrar avances tempranos y aprendizajes",
    ],
    objectives: [
      "Lograr 85% de adopción activa de la plataforma en 6 meses",
      "Reducir incidentes operativos en 30%",
      "Elevar el NPS interno a 70 puntos",
      "Consolidar una red de 60 embajadores",
    ],
    valueDrivers: [
      "Procesos digitales integrados de punta a punta",
      "Visibilidad en tiempo real para la toma de decisiones",
      "Experiencia consistente para clientes y colaboradores",
      "Cultura de mejora continua habilitada por datos",
    ],
    changeApproach: [
      "Activación de líderes patrocinadores",
      "Segmentación de colectivos y journeys personalizados",
      "Comunicación omnicanal con narrativa modular",
      "Formación blended con refuerzo en el puesto",
    ],
    successMetrics: [
      "Adopción semanal por colectivo",
      "Índice de confianza en el cambio",
      "Tiempo de resolución en mesa de ayuda",
      "Participación en sesiones de refuerzo",
    ],
    roadmap,
    readiness,
  };

  return {
    overview,
    stakeholders,
    communications,
    trainings,
    risks,
    kpis,
    feedback,
    enablement: {
      champions,
      supportChannels,
      adoptionPlaybooks,
    },
    lastUpdated: new Date().toISOString(),
  };
}

async function readChangeProgram(): Promise<ChangeProgram> {
  await ensureDirectory();
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(raw) as ChangeProgram;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      const program = createDefaultChangeProgram();
      await saveChangeProgram(program);
      return program;
    }
    throw error;
  }
}

export async function getChangeProgram(): Promise<ChangeProgram> {
  const program = await readChangeProgram();
  return JSON.parse(JSON.stringify(program)) as ChangeProgram;
}

export async function addSectionItem<K extends ChangeProgramSection>(
  section: K,
  payload: SectionInputMap[K],
): Promise<SectionEntityMap[K]> {
  const program = await readChangeProgram();
  const newItem = {
    id: randomUUID(),
    ...payload,
  } as SectionEntityMap[K];

  (program[section] as SectionEntityMap[K][]).push(newItem);
  program.lastUpdated = new Date().toISOString();
  await saveChangeProgram(program);
  return newItem;
}

export async function updateSectionItem<K extends ChangeProgramSection>(
  section: K,
  id: string,
  updates: SectionUpdateMap[K],
): Promise<SectionEntityMap[K]> {
  const program = await readChangeProgram();
  const collection = program[section] as SectionEntityMap[K][];
  const index = collection.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error(`Registro con id ${id} no encontrado en ${section}`);
  }

  const updated = {
    ...collection[index],
    ...updates,
  } as SectionEntityMap[K];

  collection[index] = updated;
  program.lastUpdated = new Date().toISOString();
  await saveChangeProgram(program);

  return updated;
}
