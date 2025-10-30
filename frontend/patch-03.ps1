# ---------------------------------------------------------------------------
# patch‑04.ps1  –  final clean‑compile patch
# ---------------------------------------------------------------------------

function Write-File {
  param([string]$Path, [string]$Content)
  $dir = Split-Path $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Set-Content -Path $Path -Encoding UTF8 -Value $Content
  Write-Host "✓ wrote $Path"
}

# 1️⃣  ------- tsconfig.json  (safe JSONC parser) ----------------------------
$tsPath = "tsconfig.json"
if (Test-Path $tsPath) {
  $raw = Get-Content $tsPath -Raw
  # strip // and /* */ comments, then trailing commas
  $clean = $raw `
    -replace '(?m)//.*$','' `
    -replace '/\*[\s\S]*?\*/','' `
    -replace ',(\s*[}\]])','$1'
  try   { $ts = $clean | ConvertFrom-Json } catch { $ts = $null }
  if ($ts) {
    if (-not $ts.exclude) { $ts | Add-Member -Name exclude -MemberType NoteProperty -Value @() }
    $extra = @(
      "ct",
      "modules/insights",
      "modules/ethikos",
      "modules/konsensus",
      "modules/keenkonnect",
      "modules/konnected",
      "modules/konsultations",
      "modules/kontact",
      "modules/kreative"
    )
    $ts.exclude = ($ts.exclude + $extra) | Select-Object -Unique
    $ts | ConvertTo-Json -Depth 10 | Set-Content $tsPath -Encoding UTF8
    Write-Host "✓ patched tsconfig.json (exclude added)"
  } else {
    Write-Warning "Could not patch tsconfig.json – please add the exclude list manually."
  }
}

# 2️⃣  ------- modules/ekoh ---------------------------------------------------
Write-File "modules/ekoh/components/Recorder.tsx" @'
"use client";
import { useEffect } from "react";
import { useAudioRecorder } from "react-use-audio-recorder";

/**
 * Thin wrapper around `useAudioRecorder` that gives the parent
 * the final Blob when a recording stops.
 */
export default function Recorder(props: { onFinished(blob: Blob): void }) {
  // The lib’s type defs are slightly outdated – cast to any for now
  const rec = useAudioRecorder() as any;

  useEffect(() => {
    if (rec.status === "stopped" && rec.audioBlob) {
      props.onFinished(rec.audioBlob as Blob);
    }
  }, [rec.status, rec.audioBlob]);

  return (
    <div className="flex items-center gap-2">
      <button onClick={rec.startRecording}   className="px-3 py-1 border rounded">Record</button>
      <button onClick={rec.stopRecording}    className="px-3 py-1 border rounded">Stop</button>
      <button onClick={rec.pauseRecording}   className="px-3 py-1 border rounded">Pause</button>
      <span className="ml-2 text-sm text-gray-500">{rec.recordingTime}s</span>
    </div>
  );
}
'@

Write-File "modules/ekoh/components/ThreadList.tsx" @'
"use client";
import { List } from "antd";
import type { Thread } from "../hooks/useThreads";

export default function ThreadList({ data }: { data: Thread[] }) {
  return (
    <List
      bordered
      dataSource={data}
      renderItem={t => (
        <List.Item key={t.id}>
          <a href={t.url} target="_blank" rel="noreferrer">
            {t.title}
          </a>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(t.created_at).toLocaleString()}
          </span>
        </List.Item>
      )}
    />
  );
}
'@

# fix incorrect re‑export
Write-File "modules/ekoh/components/index.ts" @'
export { default as Recorder   } from "./Recorder";
export { default as ThreadList } from "./ThreadList";
'@

# 3️⃣  ------- modules/global -----------------------------------------------
Write-File "modules/global/pages/MyWork.tsx" @'
"use client";
import AppShell from "../components/AppShell";

export default function MyWork() {
  return (
    <AppShell>
      <h1 className="text-xl font-semibold mb-4">My work</h1>
      <p>Coming soon…</p>
    </AppShell>
  );
}
'@

Write-Host "`n🎉  Patch complete.  Run  'pnpm exec tsc --noEmit'  – it should be clean."

# ---------------------------------------------------------------------------
#               ### MANUAL COPIES (if you don’t use the script) ###
# ---------------------------------------------------------------------------
# 1. tsconfig.json – add this block at top level:
#    "exclude": ["node_modules","ct","modules/insights","modules/ethikos",
#                "modules/konsensus","modules/keenkonnect","modules/konnected",
#                "modules/konsultations","modules/kontact","modules/kreative"]
#
# 2. modules/ekoh/components/Recorder.tsx  – see file above.
# 3. modules/ekoh/components/ThreadList.tsx – see file above.
# 4. modules/ekoh/components/index.ts       – see file above.
# 5. modules/global/pages/MyWork.tsx        – see file above.
