"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Header } from "@/components/layout/Header";
import type {
  ChangeProgram,
  ChangeProgramSection,
  Communication,
  CommunicationStatus,
  Feedback,
  FeedbackSentiment,
  KPI,
  KpiCategory,
  Risk,
  RiskStatus,
  Stakeholder,
  Training,
  TrainingStatus,
} from "@/types/change-management";

const COMMUNICATION_STATUS_ORDER: CommunicationStatus[] = [
  "Planificado",
  "En progreso",
  "Completado",
];
const TRAINING_STATUS_ORDER: TrainingStatus[] = [
  "Planificado",
  "En progreso",
  "Completado",
];
const RISK_STATUS_ORDER: RiskStatus[] = [
  "En observación",
  "Mitigando",
  "Escalado",
  "Cerrado",
];

const statusStyles: Record<string, string> = {
  Planificado:
    "bg-bytebot-bronze-light-a3 text-bytebot-bronze-light-12 border border-bytebot-bronze-light-6",
  "En progreso":
    "bg-bytebot-green-4 text-bytebot-green-11 border border-bytebot-green-8",
  Completado:
    "bg-bytebot-green-3 text-bytebot-green-11 border border-bytebot-green-7",
  "En observación":
    "bg-bytebot-bronze-light-2 text-bytebot-bronze-dark-11 border border-bytebot-bronze-light-6",
  Mitigando:
    "bg-bytebot-green-3 text-bytebot-green-11 border border-bytebot-green-7",
  Escalado:
    "bg-bytebot-red-light-3 text-bytebot-red-light-12 border border-bytebot-red-light-6",
  Cerrado:
    "bg-bytebot-bronze-light-3 text-bytebot-bronze-dark-11 border border-bytebot-bronze-light-7",
};

const sentimentStyles: Record<FeedbackSentiment, string> = {
  Positivo: "bg-bytebot-green-3 text-bytebot-green-11 border border-bytebot-green-7",
  Neutral:
    "bg-bytebot-bronze-light-2 text-bytebot-bronze-dark-10 border border-bytebot-bronze-light-6",
  Negativo:
    "bg-bytebot-red-light-3 text-bytebot-red-light-12 border border-bytebot-red-light-6",
};

type StakeholderDraft = Omit<Stakeholder, "id">;
type CommunicationDraft = Omit<Communication, "id">;
type TrainingDraft = Omit<Training, "id">;
type RiskDraft = Omit<Risk, "id">;
type KpiDraft = Omit<KPI, "id">;
type FeedbackDraft = Omit<Feedback, "id">;

type SavingState = Record<ChangeProgramSection, boolean>;

const defaultSavingState: SavingState = {
  stakeholders: false,
  communications: false,
  trainings: false,
  risks: false,
  kpis: false,
  feedback: false,
};

const nowIsoDate = () => new Date().toISOString().slice(0, 10);

const emptyStakeholder: StakeholderDraft = {
  name: "",
  role: "",
  segment: "",
  area: "",
  influence: "Media",
  supportLevel: "Neutral",
  needs: "",
  engagementStrategy: "",
  engagementScore: 60,
};

const emptyCommunication: CommunicationDraft = {
  title: "",
  objective: "",
  audience: "",
  channel: "",
  owner: "",
  sendDate: nowIsoDate(),
  status: "Planificado",
  keyMessage: "",
  successMetric: "",
};

const emptyTraining: TrainingDraft = {
  title: "",
  audience: "",
  modality: "Virtual",
  date: nowIsoDate(),
  responsible: "",
  status: "Planificado",
  competency: "",
  materials: "",
};

const emptyRisk: RiskDraft = {
  name: "",
  category: "",
  probability: "Media",
  impact: "Medio",
  mitigation: "",
  owner: "",
  earlyWarning: "",
  status: "En observación",
};

const emptyKpi: KpiDraft = {
  name: "",
  description: "",
  baseline: "",
  target: "",
  frequency: "Mensual",
  dataSource: "",
  owner: "",
  category: "Adopción",
};

const emptyFeedback: FeedbackDraft = {
  source: "",
  channel: "",
  sentiment: "Neutral",
  comment: "",
  followUp: "",
  date: nowIsoDate(),
  owner: "",
};

const categoryLabels: Record<KpiCategory, string> = {
  Adopción: "bg-bytebot-green-3 text-bytebot-green-11",
  Comunicación: "bg-bytebot-bronze-light-2 text-bytebot-bronze-dark-11",
  Formación: "bg-bytebot-bronze-light-a3 text-bytebot-bronze-light-12",
  Experiencia: "bg-bytebot-red-light-3 text-bytebot-red-light-12",
};

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ChangeManagementPage() {
  const [program, setProgram] = useState<ChangeProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<SavingState>(defaultSavingState);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [stakeholderDraft, setStakeholderDraft] =
    useState<StakeholderDraft>(emptyStakeholder);
  const [communicationDraft, setCommunicationDraft] =
    useState<CommunicationDraft>(emptyCommunication);
  const [trainingDraft, setTrainingDraft] =
    useState<TrainingDraft>(emptyTraining);
  const [riskDraft, setRiskDraft] = useState<RiskDraft>(emptyRisk);
  const [kpiDraft, setKpiDraft] = useState<KpiDraft>(emptyKpi);
  const [feedbackDraft, setFeedbackDraft] =
    useState<FeedbackDraft>(emptyFeedback);

  const fetchProgram = useCallback(
    async (withLoader = true) => {
      if (withLoader) {
        setLoading(true);
      }
      try {
        const response = await fetch("/api/change-management");
        if (!response.ok) {
          throw new Error("Solicitud fallida");
        }
        const data = (await response.json()) as ChangeProgram;
        setProgram(data);
        setError(null);
      } catch (err) {
        console.error("Error cargando el programa", err);
        setError(
          "No fue posible cargar la información del programa. Intenta de nuevo más tarde.",
        );
      } finally {
        if (withLoader) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void fetchProgram();
  }, [fetchProgram]);

  const handleSubmit = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      section: ChangeProgramSection,
      payload: unknown,
      reset: () => void,
    ) => {
      event.preventDefault();
      setSaving((prev) => ({ ...prev, [section]: true }));
      try {
        const response = await fetch(`/api/change-management/${section}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Error guardando información");
        }

        reset();
        await fetchProgram(false);
      } catch (err) {
        console.error(`Error guardando datos en ${section}`, err);
        setError(
          "No fue posible guardar la información. Revisa los datos e inténtalo nuevamente.",
        );
      } finally {
        setSaving((prev) => ({ ...prev, [section]: false }));
      }
    },
    [fetchProgram],
  );

  const handleStatusChange = useCallback(
    async (
      section: "communications" | "trainings" | "risks",
      id: string,
      current: string,
      options: readonly string[],
    ) => {
      const currentIndex = options.findIndex((value) => value === current);
      const nextValue =
        currentIndex === -1
          ? options[0]
          : options[(currentIndex + 1) % options.length];
      setStatusLoading(`${section}-${id}`);
      try {
        const response = await fetch(`/api/change-management/${section}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, updates: { status: nextValue } }),
        });
        if (!response.ok) {
          throw new Error("Error actualizando estado");
        }
        await fetchProgram(false);
      } catch (err) {
        console.error(`No fue posible actualizar ${section}`, err);
        setError(
          "No fue posible actualizar el estado. Refresca la página o intenta más tarde.",
        );
      } finally {
        setStatusLoading(null);
      }
    },
    [fetchProgram],
  );

  const healthScore = useMemo(() => {
    if (!program) {
      return null;
    }
    const adoptionKpi = program.kpis.find(
      (item) => item.name === "Índice de adopción digital",
    );
    const engagementAvg =
      program.stakeholders.reduce((acc, item) => acc + item.engagementScore, 0) /
      Math.max(program.stakeholders.length, 1);
    return {
      adoptionTarget: adoptionKpi?.target ?? "",
      engagementAvg: Math.round(engagementAvg),
    };
  }, [program]);

  return (
    <div className="flex min-h-screen flex-col bg-bytebot-bronze-light-2">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
          {loading && (
            <div className="rounded-2xl border border-bytebot-bronze-light-6 bg-white p-6 text-sm text-bytebot-bronze-dark-11">
              Cargando programa de cambio...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-bytebot-red-light-6 bg-bytebot-red-light-3/70 p-4 text-sm text-bytebot-red-light-12">
              {error}
            </div>
          )}

          {program && (
            <>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-bytebot-bronze-dark-9">
                      Programa
                    </p>
                    <h1 className="text-2xl font-semibold text-bytebot-bronze-light-12">
                      {program.overview.initiative}
                    </h1>
                    <p className="max-w-2xl text-sm text-bytebot-bronze-dark-11">
                      {program.overview.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-bytebot-bronze-light-6 bg-bytebot-bronze-light-2 p-4 text-sm text-bytebot-bronze-dark-11">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                        Patrocinio
                      </p>
                      <p className="text-base font-semibold text-bytebot-bronze-light-12">
                        {program.overview.sponsor}
                      </p>
                    </div>
                    {healthScore && (
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                            Meta de adopción
                          </p>
                          <p className="text-base font-semibold text-bytebot-bronze-light-12">
                            {healthScore.adoptionTarget}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                            Compromiso promedio
                          </p>
                          <p className="text-base font-semibold text-bytebot-bronze-light-12">
                            {healthScore.engagementAvg}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4 text-sm text-bytebot-bronze-dark-11">
                  <p className="mb-2 text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                    Narrativa
                  </p>
                  <p>{program.overview.narrative}</p>
                </div>
                <p className="mt-4 text-xs text-bytebot-bronze-dark-8">
                  Última actualización: {formatDate(program.lastUpdated)}
                </p>
              </section>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                    Principios guía
                  </h2>
                  <ul className="mt-4 space-y-3 text-sm text-bytebot-bronze-dark-11">
                    {program.overview.principles.map((principle) => (
                      <li
                        key={principle}
                        className="flex items-start gap-3 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 px-3 py-2"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-bytebot-green-9" />
                        <span>{principle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                    Objetivos y métricas
                  </h2>
                  <ul className="mt-4 space-y-3 text-sm text-bytebot-bronze-dark-11">
                    {program.overview.objectives.map((objective) => (
                      <li
                        key={objective}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 px-3 py-2"
                      >
                        {objective}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-3">
                    <p className="text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                      Indicadores clave
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-bytebot-bronze-dark-11">
                      {program.overview.successMetrics.map((metric) => (
                        <li key={metric}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      Hoja de ruta del cambio
                    </h2>
                    <p className="text-sm text-bytebot-bronze-dark-10">
                      Seguimiento de hitos, duración y enfoque principal en cada fase.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {program.overview.roadmap.map((item) => (
                    <div
                      key={item.id}
                      className="flex h-full flex-col justify-between rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                            {item.stage}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[item.status] ??
                              "bg-bytebot-bronze-light-3 text-bytebot-bronze-dark-11"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm text-bytebot-bronze-dark-11">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-3 text-xs text-bytebot-bronze-dark-9">
                        {formatDate(item.startDate)} – {formatDate(item.endDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                  Estado de preparación
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {program.overview.readiness.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                            {item.dimension}
                          </p>
                          <p className="mt-2 text-xs text-bytebot-bronze-dark-10">
                            Estado actual
                          </p>
                          <p className="text-sm text-bytebot-bronze-dark-11">
                            {item.currentState}
                          </p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs text-bytebot-bronze-dark-10">
                          {item.owner}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-bytebot-bronze-dark-10">Meta</p>
                      <p className="text-sm text-bytebot-bronze-dark-11">
                        {item.targetState}
                      </p>
                      <p className="mt-3 text-xs text-bytebot-bronze-dark-10">
                        Acciones clave
                      </p>
                      <p className="text-sm text-bytebot-bronze-dark-11">
                        {item.actions}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      Stakeholders críticos
                    </h2>
                    <span className="text-xs text-bytebot-bronze-dark-9">
                      Seguimiento de planes de relacionamiento
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {program.stakeholders.map((stakeholder) => (
                      <div
                        key={stakeholder.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                              {stakeholder.name}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-bytebot-bronze-dark-9">
                              {stakeholder.role} · {stakeholder.segment}
                            </p>
                            <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                              {stakeholder.needs}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="rounded-full border border-bytebot-bronze-light-6 bg-white px-3 py-1 text-xs text-bytebot-bronze-dark-9">
                              {stakeholder.area}
                            </div>
                            <div className="flex gap-2 text-xs text-bytebot-bronze-dark-10">
                              <span>{stakeholder.influence} influencia</span>
                              <span>·</span>
                              <span>{stakeholder.supportLevel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-bytebot-bronze-dark-10">
                            <span>Plan de relacionamiento</span>
                            <span>{stakeholder.engagementScore}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-bytebot-bronze-light-4">
                            <div
                              className="h-full rounded-full bg-bytebot-green-8"
                              style={{ width: `${stakeholder.engagementScore}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-bytebot-bronze-dark-10">
                            {stakeholder.engagementStrategy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    onSubmit={(event) =>
                      handleSubmit(event, "stakeholders", stakeholderDraft, () =>
                        setStakeholderDraft(emptyStakeholder),
                      )
                    }
                  >
                    <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Registrar stakeholder
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Nombre
                        <input
                          type="text"
                          required
                          value={stakeholderDraft.name}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Rol
                        <input
                          type="text"
                          required
                          value={stakeholderDraft.role}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              role: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Segmento
                        <input
                          type="text"
                          required
                          value={stakeholderDraft.segment}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              segment: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Área
                        <input
                          type="text"
                          required
                          value={stakeholderDraft.area}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              area: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Influencia
                        <select
                          value={stakeholderDraft.influence}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              influence: event.target.value as StakeholderDraft["influence"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          <option value="Alta">Alta</option>
                          <option value="Media">Media</option>
                          <option value="Baja">Baja</option>
                        </select>
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Nivel de apoyo
                        <select
                          value={stakeholderDraft.supportLevel}
                          onChange={(event) =>
                            setStakeholderDraft((prev) => ({
                              ...prev,
                              supportLevel: event.target
                                .value as StakeholderDraft["supportLevel"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          <option value="Aliada">Aliada</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Resistente">Resistente</option>
                        </select>
                      </label>
                    </div>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Necesidades principales
                      <textarea
                        required
                        value={stakeholderDraft.needs}
                        onChange={(event) =>
                          setStakeholderDraft((prev) => ({
                            ...prev,
                            needs: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Plan de relacionamiento
                      <textarea
                        required
                        value={stakeholderDraft.engagementStrategy}
                        onChange={(event) =>
                          setStakeholderDraft((prev) => ({
                            ...prev,
                            engagementStrategy: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Puntaje de compromiso (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stakeholderDraft.engagementScore}
                        onChange={(event) =>
                          setStakeholderDraft((prev) => ({
                            ...prev,
                            engagementScore: Number(event.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={saving.stakeholders}
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving.stakeholders ? "Guardando..." : "Agregar stakeholder"}
                    </button>
                  </form>
                </div>
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      Plan de comunicaciones
                    </h2>
                    <span className="text-xs text-bytebot-bronze-dark-9">
                      Toca el estado para avanzar
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {program.communications.map((communication) => (
                      <div
                        key={communication.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                              {communication.title}
                            </p>
                            <p className="text-xs text-bytebot-bronze-dark-9">
                              {communication.audience} · {communication.channel}
                            </p>
                            <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                              {communication.keyMessage}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  "communications",
                                  communication.id,
                                  communication.status,
                                  COMMUNICATION_STATUS_ORDER,
                                )
                              }
                              disabled={
                                statusLoading === `communications-${communication.id}`
                              }
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                statusStyles[communication.status] ??
                                "bg-bytebot-bronze-light-3 text-bytebot-bronze-dark-11"
                              } ${
                                statusLoading === `communications-${communication.id}`
                                  ? "opacity-60"
                                  : "hover:opacity-90"
                              }`}
                            >
                              {statusLoading === `communications-${communication.id}`
                                ? "Actualizando..."
                                : communication.status}
                            </button>
                            <div className="rounded-full bg-white px-3 py-1 text-xs text-bytebot-bronze-dark-9">
                              {formatDate(communication.sendDate)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-bytebot-bronze-dark-10">
                          Responsable: {communication.owner} · Métrica: {" "}
                          {communication.successMetric}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    onSubmit={(event) =>
                      handleSubmit(event, "communications", communicationDraft, () =>
                        setCommunicationDraft(emptyCommunication),
                      )
                    }
                  >
                    <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Añadir comunicación
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Título
                        <input
                          type="text"
                          required
                          value={communicationDraft.title}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Objetivo
                        <input
                          type="text"
                          required
                          value={communicationDraft.objective}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              objective: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Audiencia
                        <input
                          type="text"
                          required
                          value={communicationDraft.audience}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              audience: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Canal
                        <input
                          type="text"
                          required
                          value={communicationDraft.channel}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              channel: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Responsable
                        <input
                          type="text"
                          required
                          value={communicationDraft.owner}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              owner: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Fecha de envío
                        <input
                          type="date"
                          required
                          value={communicationDraft.sendDate}
                          onChange={(event) =>
                            setCommunicationDraft((prev) => ({
                              ...prev,
                              sendDate: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                    </div>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Mensaje clave
                      <textarea
                        required
                        value={communicationDraft.keyMessage}
                        onChange={(event) =>
                          setCommunicationDraft((prev) => ({
                            ...prev,
                            keyMessage: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Métrica de éxito
                      <textarea
                        required
                        value={communicationDraft.successMetric}
                        onChange={(event) =>
                          setCommunicationDraft((prev) => ({
                            ...prev,
                            successMetric: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Estado
                      <select
                        value={communicationDraft.status}
                        onChange={(event) =>
                          setCommunicationDraft((prev) => ({
                            ...prev,
                            status: event.target
                              .value as CommunicationDraft["status"],
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      >
                        {COMMUNICATION_STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      disabled={saving.communications}
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving.communications
                        ? "Guardando..."
                        : "Agregar comunicación"}
                    </button>
                  </form>
                </div>
              </section>
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      Formación y acompañamiento
                    </h2>
                    <span className="text-xs text-bytebot-bronze-dark-9">
                      Avanza el estado desde aquí
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {program.trainings.map((training) => (
                      <div
                        key={training.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                              {training.title}
                            </p>
                            <p className="text-xs text-bytebot-bronze-dark-9">
                              {training.audience} · {training.modality}
                            </p>
                            <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                              {training.materials}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  "trainings",
                                  training.id,
                                  training.status,
                                  TRAINING_STATUS_ORDER,
                                )
                              }
                              disabled={statusLoading === `trainings-${training.id}`}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                statusStyles[training.status] ??
                                "bg-bytebot-bronze-light-3 text-bytebot-bronze-dark-11"
                              } ${
                                statusLoading === `trainings-${training.id}`
                                  ? "opacity-60"
                                  : "hover:opacity-90"
                              }`}
                            >
                              {statusLoading === `trainings-${training.id}`
                                ? "Actualizando..."
                                : training.status}
                            </button>
                            <div className="rounded-full bg-white px-3 py-1 text-xs text-bytebot-bronze-dark-9">
                              {formatDate(training.date)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-bytebot-bronze-dark-10">
                          Responsable: {training.responsible} · Competencia: {" "}
                          {training.competency}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    onSubmit={(event) =>
                      handleSubmit(event, "trainings", trainingDraft, () =>
                        setTrainingDraft(emptyTraining),
                      )
                    }
                  >
                    <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Planificar formación
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Título
                        <input
                          type="text"
                          required
                          value={trainingDraft.title}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Audiencia
                        <input
                          type="text"
                          required
                          value={trainingDraft.audience}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              audience: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Modalidad
                        <select
                          value={trainingDraft.modality}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              modality: event.target.value as TrainingDraft["modality"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Virtual">Virtual</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Fecha
                        <input
                          type="date"
                          required
                          value={trainingDraft.date}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              date: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Responsable
                        <input
                          type="text"
                          required
                          value={trainingDraft.responsible}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              responsible: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Estado
                        <select
                          value={trainingDraft.status}
                          onChange={(event) =>
                            setTrainingDraft((prev) => ({
                              ...prev,
                              status: event.target.value as TrainingDraft["status"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          {TRAINING_STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Competencia que habilita
                      <input
                        type="text"
                        required
                        value={trainingDraft.competency}
                        onChange={(event) =>
                          setTrainingDraft((prev) => ({
                            ...prev,
                            competency: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Materiales
                      <textarea
                        required
                        value={trainingDraft.materials}
                        onChange={(event) =>
                          setTrainingDraft((prev) => ({
                            ...prev,
                            materials: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={saving.trainings}
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving.trainings ? "Guardando..." : "Agregar sesión"}
                    </button>
                  </form>
                </div>
                <div className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      Riesgos y alertas
                    </h2>
                    <span className="text-xs text-bytebot-bronze-dark-9">
                      Clic para cambiar estatus
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {program.risks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                              {risk.name}
                            </p>
                            <p className="text-xs text-bytebot-bronze-dark-9">
                              Categoría: {risk.category}
                            </p>
                            <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                              {risk.earlyWarning}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  "risks",
                                  risk.id,
                                  risk.status,
                                  RISK_STATUS_ORDER,
                                )
                              }
                              disabled={statusLoading === `risks-${risk.id}`}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                statusStyles[risk.status] ??
                                "bg-bytebot-bronze-light-3 text-bytebot-bronze-dark-11"
                              } ${
                                statusLoading === `risks-${risk.id}`
                                  ? "opacity-60"
                                  : "hover:opacity-90"
                              }`}
                            >
                              {statusLoading === `risks-${risk.id}`
                                ? "Actualizando..."
                                : risk.status}
                            </button>
                            <div className="rounded-full bg-white px-3 py-1 text-xs text-bytebot-bronze-dark-9">
                              Responsable: {risk.owner}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-bytebot-bronze-dark-10">
                          <span>Probabilidad: {risk.probability}</span>
                          <span>Impacto: {risk.impact}</span>
                          <span>Plan de mitigación: {risk.mitigation}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    onSubmit={(event) =>
                      handleSubmit(event, "risks", riskDraft, () =>
                        setRiskDraft(emptyRisk),
                      )
                    }
                  >
                    <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Registrar riesgo
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Nombre
                        <input
                          type="text"
                          required
                          value={riskDraft.name}
                          onChange={(event) =>
                            setRiskDraft((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Categoría
                        <input
                          type="text"
                          required
                          value={riskDraft.category}
                          onChange={(event) =>
                            setRiskDraft((prev) => ({
                              ...prev,
                              category: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        />
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Probabilidad
                        <select
                          value={riskDraft.probability}
                          onChange={(event) =>
                            setRiskDraft((prev) => ({
                              ...prev,
                              probability: event.target.value as RiskDraft["probability"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          <option value="Alta">Alta</option>
                          <option value="Media">Media</option>
                          <option value="Baja">Baja</option>
                        </select>
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Impacto
                        <select
                          value={riskDraft.impact}
                          onChange={(event) =>
                            setRiskDraft((prev) => ({
                              ...prev,
                              impact: event.target.value as RiskDraft["impact"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          <option value="Alto">Alto</option>
                          <option value="Medio">Medio</option>
                          <option value="Bajo">Bajo</option>
                        </select>
                      </label>
                      <label className="text-xs text-bytebot-bronze-dark-9">
                        Estado
                        <select
                          value={riskDraft.status}
                          onChange={(event) =>
                            setRiskDraft((prev) => ({
                              ...prev,
                              status: event.target.value as RiskDraft["status"],
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                        >
                          {RISK_STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Señal temprana
                      <textarea
                        required
                        value={riskDraft.earlyWarning}
                        onChange={(event) =>
                          setRiskDraft((prev) => ({
                            ...prev,
                            earlyWarning: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Plan de mitigación
                      <textarea
                        required
                        value={riskDraft.mitigation}
                        onChange={(event) =>
                          setRiskDraft((prev) => ({
                            ...prev,
                            mitigation: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Responsable
                      <input
                        type="text"
                        required
                        value={riskDraft.owner}
                        onChange={(event) =>
                          setRiskDraft((prev) => ({
                            ...prev,
                            owner: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={saving.risks}
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving.risks ? "Guardando..." : "Registrar riesgo"}
                    </button>
                  </form>
                </div>
              </section>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                      KPIs de adopción y experiencia
                    </h2>
                    <p className="text-sm text-bytebot-bronze-dark-10">
                      Seguimiento de resultados clave vinculados a la estrategia de cambio.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {program.kpis.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                            {kpi.name}
                          </p>
                          <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                            {kpi.description}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            categoryLabels[kpi.category]
                          }`}
                        >
                          {kpi.category}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-bytebot-bronze-dark-10">
                        <span>Base: {kpi.baseline}</span>
                        <span>Meta: {kpi.target}</span>
                        <span>Frecuencia: {kpi.frequency}</span>
                        <span>Fuente: {kpi.dataSource}</span>
                        <span>Responsable: {kpi.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                  onSubmit={(event) =>
                    handleSubmit(event, "kpis", kpiDraft, () =>
                      setKpiDraft(emptyKpi),
                    )
                  }
                >
                  <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                    Registrar KPI
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Nombre
                      <input
                        type="text"
                        required
                        value={kpiDraft.name}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Descripción
                      <textarea
                        required
                        value={kpiDraft.description}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Línea base
                      <input
                        type="text"
                        required
                        value={kpiDraft.baseline}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            baseline: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Meta
                      <input
                        type="text"
                        required
                        value={kpiDraft.target}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            target: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Frecuencia
                      <select
                        value={kpiDraft.frequency}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            frequency: event.target.value as KpiDraft["frequency"],
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      >
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Trimestral">Trimestral</option>
                      </select>
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Fuente de datos
                      <input
                        type="text"
                        required
                        value={kpiDraft.dataSource}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            dataSource: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Responsable
                      <input
                        type="text"
                        required
                        value={kpiDraft.owner}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            owner: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Categoría
                      <select
                        value={kpiDraft.category}
                        onChange={(event) =>
                          setKpiDraft((prev) => ({
                            ...prev,
                            category: event.target.value as KpiDraft["category"],
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      >
                        <option value="Adopción">Adopción</option>
                        <option value="Comunicación">Comunicación</option>
                        <option value="Formación">Formación</option>
                        <option value="Experiencia">Experiencia</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving.kpis}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving.kpis ? "Guardando..." : "Agregar KPI"}
                  </button>
                </form>
              </section>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                    Feedback y termómetro de cambio
                  </h2>
                  <span className="text-xs text-bytebot-bronze-dark-9">
                    Registro de percepciones por canal
                  </span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {program.feedback.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                            {item.source}
                          </p>
                          <p className="text-xs text-bytebot-bronze-dark-9">
                            {item.channel}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            sentimentStyles[item.sentiment]
                          }`}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-bytebot-bronze-dark-11">
                        {item.comment}
                      </p>
                      <div className="mt-3 text-xs text-bytebot-bronze-dark-9">
                        Seguimiento: {item.followUp}
                      </div>
                      <div className="mt-2 text-xs text-bytebot-bronze-dark-9">
                        Fecha: {formatDate(item.date)} · Responsable: {item.owner}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  className="mt-6 grid gap-4 rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                  onSubmit={(event) =>
                    handleSubmit(event, "feedback", feedbackDraft, () =>
                      setFeedbackDraft(emptyFeedback),
                    )
                  }
                >
                  <h3 className="text-sm font-semibold text-bytebot-bronze-light-12">
                    Capturar nueva retroalimentación
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Fuente
                      <input
                        type="text"
                        required
                        value={feedbackDraft.source}
                        onChange={(event) =>
                          setFeedbackDraft((prev) => ({
                            ...prev,
                            source: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Canal
                      <input
                        type="text"
                        required
                        value={feedbackDraft.channel}
                        onChange={(event) =>
                          setFeedbackDraft((prev) => ({
                            ...prev,
                            channel: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Sentimiento
                      <select
                        value={feedbackDraft.sentiment}
                        onChange={(event) =>
                          setFeedbackDraft((prev) => ({
                            ...prev,
                            sentiment: event.target.value as FeedbackDraft["sentiment"],
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      >
                        <option value="Positivo">Positivo</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negativo">Negativo</option>
                      </select>
                    </label>
                    <label className="text-xs text-bytebot-bronze-dark-9">
                      Fecha
                      <input
                        type="date"
                        required
                        value={feedbackDraft.date}
                        onChange={(event) =>
                          setFeedbackDraft((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                      />
                    </label>
                  </div>
                  <label className="text-xs text-bytebot-bronze-dark-9">
                    Comentario
                    <textarea
                      required
                      value={feedbackDraft.comment}
                      onChange={(event) =>
                        setFeedbackDraft((prev) => ({
                          ...prev,
                          comment: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                    />
                  </label>
                  <label className="text-xs text-bytebot-bronze-dark-9">
                    Plan de seguimiento
                    <textarea
                      required
                      value={feedbackDraft.followUp}
                      onChange={(event) =>
                        setFeedbackDraft((prev) => ({
                          ...prev,
                          followUp: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                    />
                  </label>
                  <label className="text-xs text-bytebot-bronze-dark-9">
                    Responsable
                    <input
                      type="text"
                      required
                      value={feedbackDraft.owner}
                      onChange={(event) =>
                        setFeedbackDraft((prev) => ({
                          ...prev,
                          owner: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-bytebot-bronze-light-6 bg-white px-3 py-2 text-sm text-bytebot-bronze-light-12 focus:outline-none focus:ring-2 focus:ring-bytebot-green-7"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving.feedback}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-bytebot-green-8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bytebot-green-9 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving.feedback ? "Guardando..." : "Registrar feedback"}
                  </button>
                </form>
              </section>
              <section className="rounded-3xl border border-bytebot-bronze-light-6 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-bytebot-bronze-light-12">
                  Red de acompañamiento y soporte
                </h2>
                <div className="mt-4 grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Embajadores activos
                    </p>
                    {program.enablement.champions.map((champion) => (
                      <div
                        key={champion.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                          {champion.name}
                        </p>
                        <p className="text-xs text-bytebot-bronze-dark-9">
                          {champion.area}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Enfoque: {champion.focus}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Estado: {champion.status}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Contacto: {champion.contact}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Canales de soporte
                    </p>
                    {program.enablement.supportChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                          {channel.name}
                        </p>
                        <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                          {channel.description}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Disponibilidad: {channel.availability}
                        </p>
                        <p className="mt-1 text-xs text-bytebot-bronze-dark-9">
                          Owner: {channel.owner}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                      Playbooks de adopción
                    </p>
                    {program.enablement.adoptionPlaybooks.map((playbook) => (
                      <div
                        key={playbook.id}
                        className="rounded-2xl border border-bytebot-bronze-light-5 bg-bytebot-bronze-light-2 p-4"
                      >
                        <p className="text-sm font-semibold text-bytebot-bronze-light-12">
                          {playbook.name}
                        </p>
                        <p className="mt-2 text-sm text-bytebot-bronze-dark-11">
                          {playbook.objective}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Frecuencia: {playbook.cadence}
                        </p>
                        <p className="mt-1 text-xs text-bytebot-bronze-dark-9">
                          Owner: {playbook.owner}
                        </p>
                        <p className="mt-2 text-xs text-bytebot-bronze-dark-9">
                          Entregables:
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-bytebot-bronze-dark-10">
                          {playbook.deliverables.map((deliverable) => (
                            <li key={deliverable}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
