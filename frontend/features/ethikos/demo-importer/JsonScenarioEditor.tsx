"use client";

import { useLanguage } from '@/context/LanguageContext';
import { ChangeEvent, useMemo, useRef } from "react";

import type { EthikosDemoScenario } from "./types";

export type JsonScenarioEditorProps = {
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};

type ParsedJsonState =
  | {
      ok: true;
      scenario: Partial<EthikosDemoScenario>;
      error: null;
    }
  | {
      ok: false;
      scenario: null;
      error: string;
    };

function parseJson(value: string): ParsedJsonState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      scenario: null,
      error: "",
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<EthikosDemoScenario>;

    return {
      ok: true,
      scenario: parsed,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      scenario: null,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

export function JsonScenarioEditor({
  value,
  onChange,
  errorMessage,
}: JsonScenarioEditorProps) {
  const { t: i18nT } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsedState = useMemo(() => parseJson(value), [value]);

  const scenarioSummary = useMemo(() => {
    if (!parsedState.ok) {
      return null;
    }

    const scenario = parsedState.scenario;

    return {
      schemaVersion: scenario.schema_version || "—",
      scenarioKey: scenario.scenario_key || "—",
      scenarioTitle: scenario.scenario_title || "—",
      mode: scenario.mode || "—",
      actors: scenario.actors?.length ?? 0,
      categories: scenario.categories?.length ?? 0,
      topics: scenario.topics?.length ?? 0,
      stances: scenario.stances?.length ?? 0,
      arguments: scenario.arguments?.length ?? 0,
      consultations: scenario.consultations?.length ?? 0,
      consultationVotes: scenario.consultation_votes?.length ?? 0,
      impactItems: scenario.impact_items?.length ?? 0,
    };
  }, [parsedState]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    onChange(text);

    // Allow re-uploading the same file later.
    event.target.value = "";
  }

  function handleFormatJson() {
    if (!value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Keep text unchanged. Parse error is already shown below.
    }
  }

  function handleClear() {
    onChange("");
  }

  function handleLoadFileClick() {
    fileInputRef.current?.click();
  }

  const localParseError =
    value.trim() && !parsedState.ok ? parsedState.error : undefined;

  const visibleErrorMessage = errorMessage || localParseError;

  return (
    <section
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.demoScenarioJson")}
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              maxWidth: 720,
              color: "var(--muted-foreground, #666)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.pasteOrUploadAnEthikosDemoScenario")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button type="button" onClick={handleLoadFileClick}>
            {i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.uploadJson")}
          </button>

          <button type="button" onClick={handleFormatJson}>
            {i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.format")}
          </button>

          <button type="button" onClick={handleClear}>
            {i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.clear")}
          </button>
        </div>
      </div>

      {scenarioSummary && (
        <div
          style={{
            display: "grid",
            gap: 8,
            padding: 12,
            border: "1px solid var(--border, #ddd)",
            borderRadius: 8,
            background: "var(--card, #fff)",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 4,
            }}
          >
            <strong>{scenarioSummary.scenarioTitle}</strong>

            <span style={{ color: "var(--muted-foreground, #666)" }}>
              {scenarioSummary.scenarioKey} · {scenarioSummary.schemaVersion} ·{" "}
              {scenarioSummary.mode}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              color: "var(--muted-foreground, #666)",
            }}
          >
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.actors")} {scenarioSummary.actors}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.categories")} {scenarioSummary.categories}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.topics")} {scenarioSummary.topics}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.stances")} {scenarioSummary.stances}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.arguments")} {scenarioSummary.arguments}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.consultations")} {scenarioSummary.consultations}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.votes")} {scenarioSummary.consultationVotes}</span>
            <span>{i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.impact")} {scenarioSummary.impactItems}</span>
          </div>
        </div>
      )}

      {visibleErrorMessage && (
        <div
          role="alert"
          style={{
            padding: 12,
            border: "1px solid var(--destructive, #b42318)",
            borderRadius: 8,
            color: "var(--destructive, #b42318)",
            background: "rgba(180, 35, 24, 0.06)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {visibleErrorMessage}
        </div>
      )}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder={i18nT("ui.features.ethikos.demoImporter.jsonscenarioeditor.schemaVersionEthikosDemoScenarioV1Scenario")}
        style={{
          width: "100%",
          minHeight: 520,
          resize: "vertical",
          padding: 16,
          border: "1px solid var(--border, #ddd)",
          borderRadius: 8,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          background: "var(--background, #fff)",
          color: "var(--foreground, #111)",
        }}
      />
    </section>
  );
}