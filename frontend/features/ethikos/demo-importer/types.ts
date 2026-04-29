// frontend/features/ethikos/demo-importer/types.ts

export const ETHIKOS_DEMO_SCHEMA_VERSION = "ethikos-demo-scenario/v1" as const;

export const ETHIKOS_DEMO_IMPORT_MODES = [
  "replace_scenario",
  "append_scenario",
] as const;

export const ETHIKOS_DEMO_TOPIC_STATUSES = [
  "open",
  "closed",
  "archived",
] as const;

export const ETHIKOS_DEMO_CONSULTATION_STATUSES = [
  "open",
  "closed",
  "archived",
] as const;

export const ETHIKOS_DEMO_ARGUMENT_SIDES = [
  "pro",
  "con",
  "neutral",
] as const;

export const ETHIKOS_DEMO_STANCE_MIN = -3 as const;
export const ETHIKOS_DEMO_STANCE_MAX = 3 as const;

export type EthikosDemoSchemaVersion = typeof ETHIKOS_DEMO_SCHEMA_VERSION;

export type EthikosDemoImportMode =
  (typeof ETHIKOS_DEMO_IMPORT_MODES)[number];

export type EthikosDemoTopicStatus =
  (typeof ETHIKOS_DEMO_TOPIC_STATUSES)[number];

export type EthikosDemoConsultationStatus =
  (typeof ETHIKOS_DEMO_CONSULTATION_STATUSES)[number];

export type EthikosDemoArgumentSide =
  | (typeof ETHIKOS_DEMO_ARGUMENT_SIDES)[number]
  | null;

export type EthikosDemoScenario = {
  schema_version: EthikosDemoSchemaVersion;
  scenario_key: string;
  scenario_title: string;
  mode: EthikosDemoImportMode;
  metadata?: Record<string, unknown>;

  actors: EthikosDemoActor[];
  categories: EthikosDemoCategory[];
  topics: EthikosDemoTopic[];
  stances: EthikosDemoStance[];
  arguments: EthikosDemoArgument[];
  consultations: EthikosDemoConsultation[];
  consultation_votes: EthikosDemoConsultationVote[];
  impact_items: EthikosDemoImpactItem[];
};

export type EthikosDemoActor = {
  key: string;
  username: string;
  display_name: string;
  email?: string;
  role?: string;
  is_ethikos_elite?: boolean;
};

export type EthikosDemoCategory = {
  key: string;
  name: string;
  description?: string;
};

export type EthikosDemoTopic = {
  key: string;
  title: string;
  description?: string;
  status: EthikosDemoTopicStatus;
  category: string;
  start_date?: string;
  end_date?: string;
};

export type EthikosDemoStance = {
  topic: string;
  actor: string;
  value: number;
};

export type EthikosDemoArgument = {
  key: string;
  topic: string;
  actor: string;
  side?: EthikosDemoArgumentSide;
  parent?: string;
  content: string;
};

export type EthikosDemoConsultation = {
  key: string;
  title: string;
  status: EthikosDemoConsultationStatus;
  open_date: string;
  close_date: string;
  options?: EthikosDemoConsultationOption[];
};

export type EthikosDemoConsultationOption = {
  key: string;
  label: string;
  description?: string;
};

export type EthikosDemoConsultationVote = {
  consultation: string;
  actor: string;
  option?: string;
  raw_value: number;
  weighted_value: number;
};

export type EthikosDemoImpactItem = {
  consultation: string;
  action: string;
  status: string;
  date: string;
};

export type EthikosDemoImportSummary = {
  actors: number;
  categories: number;
  topics: number;
  stances: number;
  arguments: number;
  consultations: number;
  consultation_votes: number;
  impact_items: number;
};

export type EthikosDemoImportError = {
  path: string;
  message: string;
};

export type EthikosDemoImportObjectRecord = {
  object_type: string;
  object_id: number;
  object_label?: string;
};

export type EthikosDemoImportWarning = {
  path?: string;
  message: string;
};

export type EthikosDemoImportResponse = {
  ok: boolean;
  dry_run?: boolean;
  scenario_key?: string;
  summary?: EthikosDemoImportSummary;
  errors?: EthikosDemoImportError[];
  warnings?: EthikosDemoImportWarning[];
  created?: EthikosDemoImportObjectRecord[];
  updated?: EthikosDemoImportObjectRecord[];
  deleted?: EthikosDemoImportObjectRecord[];
};

export type EthikosDemoResetRequest = {
  scenario_key: string;
};

export type EthikosDemoJsonParseResult =
  | {
      ok: true;
      scenario: EthikosDemoScenario;
      error: null;
    }
  | {
      ok: false;
      scenario: null;
      error: string;
    };

export function parseEthikosDemoScenarioJson(
  jsonText: string,
): EthikosDemoJsonParseResult {
  try {
    const parsed = JSON.parse(jsonText) as EthikosDemoScenario;

    return {
      ok: true,
      scenario: parsed,
      error: null,
    };
  } catch {
    return {
      ok: false,
      scenario: null,
      error: "Invalid JSON.",
    };
  }
}

export function isEthikosDemoScenario(
  value: unknown,
): value is EthikosDemoScenario {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EthikosDemoScenario>;

  return (
    candidate.schema_version === ETHIKOS_DEMO_SCHEMA_VERSION &&
    typeof candidate.scenario_key === "string" &&
    typeof candidate.scenario_title === "string" &&
    ETHIKOS_DEMO_IMPORT_MODES.includes(
      candidate.mode as EthikosDemoImportMode,
    ) &&
    Array.isArray(candidate.actors) &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.topics) &&
    Array.isArray(candidate.stances) &&
    Array.isArray(candidate.arguments) &&
    Array.isArray(candidate.consultations) &&
    Array.isArray(candidate.consultation_votes) &&
    Array.isArray(candidate.impact_items)
  );
}