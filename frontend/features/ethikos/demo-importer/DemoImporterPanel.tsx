"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useMemo, useState } from "react";

import {
  importEthikosDemoScenario,
  previewEthikosDemoScenario,
  resetEthikosDemoScenario,
} from "./api";
import { ImportResultPanel } from "./ImportResultPanel";
import { JsonScenarioEditor } from "./JsonScenarioEditor";
import type {
  EthikosDemoImportResponse,
  EthikosDemoScenario,
} from "./types";

type DemoImporterPanelProps = {
  initialJsonText?: string;
};

const EMPTY_SCENARIO_TEXT = `{
  "schema_version": "ethikos-demo-scenario/v1",
  "scenario_key": "public_square_demo",
  "scenario_title": "Public Square Redevelopment Demo",
  "mode": "replace_scenario",
  "metadata": {},
  "actors": [],
  "categories": [],
  "topics": [],
  "stances": [],
  "arguments": [],
  "consultations": [],
  "consultation_votes": [],
  "impact_items": []
}`;

export function DemoImporterPanel({
  initialJsonText,
}: DemoImporterPanelProps) {
  const { t: i18nT } = useLanguage();
  const [jsonText, setJsonText] = useState(
    initialJsonText ?? EMPTY_SCENARIO_TEXT,
  );

  const [previewResult, setPreviewResult] =
    useState<EthikosDemoImportResponse | null>(null);

  const [importResult, setImportResult] =
    useState<EthikosDemoImportResponse | null>(null);

  const [resetResult, setResetResult] =
    useState<EthikosDemoImportResponse | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const parsedScenario = useMemo(() => {
    try {
      return JSON.parse(jsonText) as EthikosDemoScenario;
    } catch {
      return null;
    }
  }, [jsonText]);

  const scenarioKey = parsedScenario?.scenario_key;

  function parseScenarioText(): EthikosDemoScenario | null {
    setErrorMessage(undefined);

    try {
      const parsed = JSON.parse(jsonText) as EthikosDemoScenario;

      if (!parsed || typeof parsed !== "object") {
        setErrorMessage("Scenario JSON must be an object.");
        return null;
      }

      if (!parsed.scenario_key) {
        setErrorMessage("scenario_key is required.");
        return null;
      }

      return parsed;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Invalid JSON.",
      );
      return null;
    }
  }

  async function handlePreview() {
    const scenario = parseScenarioText();

    if (!scenario) {
      return;
    }

    setIsPreviewing(true);
    setPreviewResult(null);

    try {
      const result = await previewEthikosDemoScenario(scenario);
      setPreviewResult(result);

      if (!result.ok && result.errors?.length) {
        setErrorMessage("Preview failed. See validation errors below.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Preview request failed.",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    const scenario = parseScenarioText();

    if (!scenario) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importEthikosDemoScenario(scenario);
      setImportResult(result);

      if (!result.ok && result.errors?.length) {
        setErrorMessage("Import failed. See validation errors below.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Import request failed.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function handleReset() {
    const scenario = parseScenarioText();

    if (!scenario) {
      return;
    }

    setIsResetting(true);
    setResetResult(null);

    try {
      const result = await resetEthikosDemoScenario({
        scenario_key: scenario.scenario_key,
      });

      setResetResult(result);

      if (!result.ok && result.errors?.length) {
        setErrorMessage("Reset failed. See validation errors below.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Reset request failed.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  function handleFormatJson() {
    const scenario = parseScenarioText();

    if (!scenario) {
      return;
    }

    setJsonText(JSON.stringify(scenario, null, 2));
  }

  function handleClearResults() {
    setPreviewResult(null);
    setImportResult(null);
    setResetResult(null);
    setErrorMessage(undefined);
  }

  const isBusy = isPreviewing || isImporting || isResetting;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.ethikosAdmin")}
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.demoImporter")}
          </h1>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">
          {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.pasteAnEthikosDemoScenarioJsonFile")}
        </p>
      </header>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">{i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.scenarioJson")}</h2>

            {scenarioKey ? (
              <p className="text-sm text-muted-foreground">
                {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.currentScenario")}{" "}
                <span className="font-mono">{scenarioKey}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.noValidScenarioKeyDetectedYet")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleFormatJson}
              disabled={isBusy}
              className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.formatJson")}
            </button>

            <button
              type="button"
              onClick={handleClearResults}
              disabled={isBusy}
              className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.clearResults")}
            </button>
          </div>
        </div>

        <JsonScenarioEditor
          value={jsonText}
          onChange={setJsonText}
          errorMessage={errorMessage}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isBusy}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPreviewing ? i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.previewing") : i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.preview")}
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={isBusy}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isImporting ? i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.importing") : i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.import")}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isBusy || !scenarioKey}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isResetting ? i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.resetting") : i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.resetScenario")}
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <ImportResultPanel title={i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.previewResult")} result={previewResult} />
        <ImportResultPanel title={i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.importResult")} result={importResult} />
        <ImportResultPanel title={i18nT("ui.features.ethikos.demoImporter.demoimporterpanel.resetResult")} result={resetResult} />
      </div>
    </section>
  );
}