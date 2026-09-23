'use client';

// frontend/features/ethikos/demo-importer/ImportResultPanel.tsx

import { useLanguage } from '@/context/LanguageContext';
import type { EthikosDemoImportResponse } from "./types";

type ImportResultPanelProps = {
  title: string;
  result: EthikosDemoImportResponse | null;
};

function StatusBadge({ ok }: { ok: boolean }) {
  const { t: i18nT } = useLanguage();
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        ok
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
      ].join(" ")}
    >
      {ok ? i18nT("ui.features.ethikos.demoImporter.importresultpanel.success") : i18nT("ui.features.ethikos.demoImporter.importresultpanel.error")}
    </span>
  );
}

function EmptyState() {
  const { t: i18nT } = useLanguage();
  return (
    <p className="text-sm text-muted-foreground">
      {i18nT("ui.features.ethikos.demoImporter.importresultpanel.noResultYetPreviewImportOrReset")}
    </p>
  );
}

function SummaryGrid({
  summary,
}: {
  summary: EthikosDemoImportResponse["summary"];
}) {
  if (!summary) return null;

  const items = [
    ["Actors", summary.actors],
    ["Categories", summary.categories],
    ["Topics", summary.topics],
    ["Stances", summary.stances],
    ["Arguments", summary.arguments],
    ["Consultations", summary.consultations],
    ["Consultation votes", summary.consultation_votes],
    ["Impact items", summary.impact_items],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ErrorList({
  errors,
}: {
  errors: NonNullable<EthikosDemoImportResponse["errors"]>;
}) {
  const { t: i18nT } = useLanguage();
  if (!errors.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-red-800">{i18nT("ui.features.ethikos.demoImporter.importresultpanel.validationErrors")}</h3>

      <ul className="space-y-2">
        {errors.map((error, index) => (
          <li
            key={`${error.path}-${index}`}
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm"
          >
            <div className="font-medium text-red-900">{error.path}</div>
            <div className="text-red-800">{error.message}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WarningList({
  warnings,
}: {
  warnings: NonNullable<EthikosDemoImportResponse["warnings"]>;
}) {
  const { t: i18nT } = useLanguage();
  if (!warnings.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-yellow-800">{i18nT("ui.features.ethikos.demoImporter.importresultpanel.warnings")}</h3>

      <ul className="space-y-2">
        {warnings.map((warning, index) => (
          <li
            key={index}
            className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900"
          >
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(warning, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ObjectList({
  title,
  objects,
}: {
  title: string;
  objects?: EthikosDemoImportResponse["created"];
}) {
  const { t: i18nT } = useLanguage();
  if (!objects?.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{i18nT("ui.features.ethikos.demoImporter.importresultpanel.type")}</th>
              <th className="px-3 py-2 text-left font-medium">{i18nT("ui.features.ethikos.demoImporter.importresultpanel.id")}</th>
              <th className="px-3 py-2 text-left font-medium">{i18nT("ui.features.ethikos.demoImporter.importresultpanel.label")}</th>
            </tr>
          </thead>

          <tbody>
            {objects.map((object, index) => (
              <tr key={`${title}-${object.object_type}-${object.object_id}-${index}`}>
                <td className="border-t px-3 py-2">{object.object_type}</td>
                <td className="border-t px-3 py-2">{object.object_id}</td>
                <td className="border-t px-3 py-2">
                  {object.object_label || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ImportResultPanel({ title, result }: ImportResultPanelProps) {
  const { t: i18nT } = useLanguage();
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>

          {result?.scenario_key && (
            <p className="text-sm text-muted-foreground">
              {i18nT("ui.features.ethikos.demoImporter.importresultpanel.scenario")}{" "}
              <span className="font-mono">{result.scenario_key}</span>
            </p>
          )}
        </div>

        {result && <StatusBadge ok={result.ok} />}
      </div>

      {!result ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {typeof result.dry_run === "boolean" && (
            <div className="rounded-md border p-3 text-sm">
              {i18nT("ui.features.ethikos.demoImporter.importresultpanel.mode")}{" "}
              <span className="font-medium">
                {result.dry_run ? i18nT("ui.features.ethikos.demoImporter.importresultpanel.previewDryRun") : i18nT("ui.features.ethikos.demoImporter.importresultpanel.writeOperation")}
              </span>
            </div>
          )}

          <SummaryGrid summary={result.summary} />

          <ErrorList errors={result.errors ?? []} />
          <WarningList warnings={result.warnings ?? []} />

          <ObjectList title={i18nT("ui.features.ethikos.demoImporter.importresultpanel.created")} objects={result.created} />
          <ObjectList title={i18nT("ui.features.ethikos.demoImporter.importresultpanel.updated")} objects={result.updated} />
          <ObjectList title={i18nT("ui.features.ethikos.demoImporter.importresultpanel.deleted")} objects={result.deleted} />

          <details className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-medium">
              {i18nT("ui.features.ethikos.demoImporter.importresultpanel.rawResponse")}
            </summary>

            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}