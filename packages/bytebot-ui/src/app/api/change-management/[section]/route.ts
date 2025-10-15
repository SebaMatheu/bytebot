import { NextResponse, type NextRequest } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import {
  addSectionItem,
  updateSectionItem,
} from "@/lib/change-management-store";
import type {
  ChangeProgramSection,
  SectionInputMap,
  SectionUpdateMap,
} from "@/types/change-management";

const SECTION_NAMES: ChangeProgramSection[] = [
  "stakeholders",
  "communications",
  "trainings",
  "risks",
  "kpis",
  "feedback",
];

const baseSchemas = {
  stakeholders: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    segment: z.string().min(1),
    area: z.string().min(1),
    influence: z.enum(["Alta", "Media", "Baja"]),
    supportLevel: z.enum(["Aliada", "Neutral", "Resistente"]),
    needs: z.string().min(1),
    engagementStrategy: z.string().min(1),
    engagementScore: z.number().min(0).max(100),
  }),
  communications: z.object({
    title: z.string().min(1),
    objective: z.string().min(1),
    audience: z.string().min(1),
    channel: z.string().min(1),
    owner: z.string().min(1),
    sendDate: z.string().min(1),
    status: z.enum(["Planificado", "En progreso", "Completado"]),
    keyMessage: z.string().min(1),
    successMetric: z.string().min(1),
  }),
  trainings: z.object({
    title: z.string().min(1),
    audience: z.string().min(1),
    modality: z.enum(["Presencial", "Virtual", "Híbrido"]),
    date: z.string().min(1),
    responsible: z.string().min(1),
    status: z.enum(["Planificado", "En progreso", "Completado"]),
    competency: z.string().min(1),
    materials: z.string().min(1),
  }),
  risks: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    probability: z.enum(["Alta", "Media", "Baja"]),
    impact: z.enum(["Alto", "Medio", "Bajo"]),
    mitigation: z.string().min(1),
    owner: z.string().min(1),
    earlyWarning: z.string().min(1),
    status: z.enum(["En observación", "Mitigando", "Escalado", "Cerrado"]),
  }),
  kpis: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    baseline: z.string().min(1),
    target: z.string().min(1),
    frequency: z.enum(["Semanal", "Quincenal", "Mensual", "Trimestral"]),
    dataSource: z.string().min(1),
    owner: z.string().min(1),
    category: z.enum(["Adopción", "Comunicación", "Formación", "Experiencia"]),
  }),
  feedback: z.object({
    source: z.string().min(1),
    channel: z.string().min(1),
    sentiment: z.enum(["Positivo", "Neutral", "Negativo"]),
    comment: z.string().min(1),
    followUp: z.string().min(1),
    date: z.string().min(1),
    owner: z.string().min(1),
  }),
} satisfies Record<
  ChangeProgramSection,
  z.ZodObject<Record<string, z.ZodTypeAny>>
>;

const updateSchemas = {
  stakeholders: baseSchemas.stakeholders.partial(),
  communications: baseSchemas.communications.partial(),
  trainings: baseSchemas.trainings.partial(),
  risks: baseSchemas.risks.partial(),
  kpis: baseSchemas.kpis.partial(),
  feedback: baseSchemas.feedback.partial(),
} satisfies Record<ChangeProgramSection, z.ZodTypeAny>;

function getSectionFromParams(value: string): ChangeProgramSection | null {
  return SECTION_NAMES.includes(value as ChangeProgramSection)
    ? (value as ChangeProgramSection)
    : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { section: string } },
) {
  noStore();
  const section = getSectionFromParams(params.section);
  if (!section) {
    return NextResponse.json(
      { error: "Sección no soportada" },
      { status: 400 },
    );
  }

  const schema = baseSchemas[section];
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await addSectionItem(
      section,
      parsed.data as SectionInputMap[typeof section],
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(`Error creando registro en ${section}`, error);
    return NextResponse.json(
      { error: "No fue posible guardar la información" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { section: string } },
) {
  noStore();
  const section = getSectionFromParams(params.section);
  if (!section) {
    return NextResponse.json(
      { error: "Sección no soportada" },
      { status: 400 },
    );
  }

  const schema = updateSchemas[section];
  const payload = await request.json();
  const parsed = z
    .object({
      id: z.string().min(1),
      updates: schema,
    })
    .safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const updated = await updateSectionItem(
      section,
      parsed.data.id,
      parsed.data.updates as SectionUpdateMap[typeof section],
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Error actualizando registro en ${section}`, error);
    return NextResponse.json(
      { error: "No fue posible actualizar la información" },
      { status: 500 },
    );
  }
}
