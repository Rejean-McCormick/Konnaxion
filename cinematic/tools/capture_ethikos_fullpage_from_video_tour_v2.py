from __future__ import annotations

import json
import shutil
import sys
import time
from pathlib import Path

from cinematic_engine.actions.builtin import BUILTIN_ACTIONS
from cinematic_engine.core.contracts import load_cues, load_targets, load_timeline
from cinematic_engine.core.project import discover_project_for_tour, load_tour
from cinematic_engine.core.timeline import compile_timeline

SCRIPT_VERSION = "ETHIKOS_FULLPAGE_FROM_VIDEO_TOUR_V2"

# Exact event indices from the proven Ethikos V4.1.3 video timeline.
# Capture happens AFTER the same action the video runner executes.
CAPTURE_AFTER = {
    2:  ("01-konnaxion-home.png", "Konnaxion — accueil"),
    5:  ("02-ethikos-deliberation-list.png", "Ethikos — sujets de délibération"),
    10: ("03-canada-us-topic-card.png", "Sujet Canada–États-Unis"),
    15: ("04-canada-us-question.png", "Question stratégique Canada–États-Unis"),
    18: ("05-king-klown-proposal.png", "Proposition King Klown"),
    20: ("06-rejean-governance-reply.png", "Réponse de Réjean"),
    22: ("07-already-announced.png", "Annonce déjà faite"),
    24: ("08-ai-infrastructure-announcement.png", "Annonce infrastructure IA"),
    26: ("09-moderation-inquisitor.png", "Intervention de modération"),
    31: ("10-ekoh-public-rating.png", "EkoH — statut public"),
    33: ("11-ekoh-contextual-alignment.png", "EkoH — alignement contextuel"),
    35: ("12-ekoh-domain-expertise.png", "EkoH — expertise par domaine"),
    39: ("13-emergent-question.png", "Question émergente"),
    42: ("14-strategic-ai-access-question.png", "Question d’accès aux services IA stratégiques"),
    44: ("15-conflict-disclosure.png", "Déclaration de conflit"),
    49: ("16-conflict-background-context.png", "Contexte documentaire du conflit"),
    53: ("17-fictional-demo-context.png", "Mention de contexte fictif"),
    55: ("18-voluntary-recusal.png", "Récusation volontaire"),
    57: ("19-smart-vote-panel.png", "Smart Vote — panneau"),
    62: ("20-baseline-reading.png", "Smart Vote — lecture baseline"),
    63: ("21-expertise-reading.png", "Smart Vote — lecture expertise"),
    65: ("22-expertise-follows-question.png", "Expertise pertinente à la question"),
    67: ("23-king-klown-recused.png", "King Klown récusé"),
    71: ("24-pulse-overview.png", "Ethikos Pulse — vue d’ensemble"),
}


def find_repo_root() -> Path:
    # .../cinematic/tools/this_file.py -> repository root
    return Path(__file__).resolve().parents[2]


def clean_highlight(page) -> None:
    # Normally highlight() already removes itself after duration_ms. This is just a safety net.
    try:
        page.evaluate(
            "document.querySelectorAll('[data-cinematic-engine-highlight]').forEach(n => n.removeAttribute('data-cinematic-engine-highlight'))"
        )
    except Exception:
        pass


def save_manifest(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    root = find_repo_root()
    tour_dir = root / "cinematic" / "tours" / "ethikos-v413"
    preview_tour = tour_dir / "tour.preview.json"
    fallback_tour = tour_dir / "tour.json"
    tour_file = preview_tour if preview_tour.exists() else fallback_tour

    if not tour_file.exists():
        print(f"ERROR: aucun tour Ethikos trouvé: {preview_tour} / {fallback_tour}")
        return 2

    tour = load_tour(tour_file)
    project = discover_project_for_tour(tour)
    cues = load_cues(tour.cues_path, require_complete=True)
    targets = load_targets(tour.targets_path)
    timeline = load_timeline(tour.timeline_path)
    events = compile_timeline(timeline, cues, targets)

    out_dir = tour_dir / "screenshots-fullpage-from-video"
    shutil.rmtree(out_dir, ignore_errors=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[SCRIPT] {SCRIPT_VERSION}")
    print(f"[TOUR]   {tour_file}")
    print(f"[TIMELINE] {tour.timeline_path}")
    print(f"[TARGETS]  {tour.targets_path}")
    print(f"[BASE URL] {project.base_url}")
    print(f"[MODE] mêmes actions + mêmes timings que la vidéo; screenshot full_page après événements sélectionnés")
    print()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: Python Playwright absent. Utilise le même environnement que RUN_V413_PREVIEW_WITH_OVERLAY.cmd.")
        return 2

    manifest: list[dict] = []
    page = None

    try:
        with sync_playwright() as pw:
            browser_type = getattr(pw, project.browser_engine, pw.chromium)
            browser = browser_type.launch(headless=project.headless)
            context_kwargs = {
                "viewport": {"width": project.width, "height": project.height},
            }
            if tour.storage_state_path and tour.storage_state_path.exists():
                context_kwargs["storage_state"] = str(tour.storage_state_path)
                print(f"[AUTH] {tour.storage_state_path}")
            else:
                print("[AUTH] aucun storage_state trouvé")

            context = browser.new_context(**context_kwargs)
            page = context.new_page()
            page.set_default_timeout(15000)

            started_ns = time.perf_counter_ns()
            paused_ns = 0

            for pos, event in enumerate(events, start=1):
                target_ns = started_ns + paused_ns + event.at_ms * 1_000_000
                remaining_ns = target_ns - time.perf_counter_ns()
                if remaining_ns > 0:
                    time.sleep(remaining_ns / 1_000_000_000)

                target = event.payload.get("target")
                label = target or event.payload.get("path", "")
                print(f"[{pos:02d}/{len(events):02d}] {event.at_ms/1000:8.3f}s  {event.action:<12} {label}")

                handler = BUILTIN_ACTIONS.get(event.action)
                if not handler:
                    raise RuntimeError(f"Unknown action: {event.action}")
                handler(page, event.payload, targets, project.base_url)

                if event.index in CAPTURE_AFTER:
                    filename, shot_label = CAPTURE_AFTER[event.index]
                    clean_highlight(page)
                    # Let React/layout settle, while PAUSING the cinematic clock so the
                    # following demo action keeps the same relative timing as the video.
                    cap_started = time.perf_counter_ns()
                    page.wait_for_timeout(250)
                    shot_path = out_dir / filename
                    page.screenshot(
                        path=str(shot_path),
                        full_page=True,
                        animations="disabled",
                        caret="hide",
                        scale="css",
                    )
                    paused_ns += time.perf_counter_ns() - cap_started
                    manifest.append({
                        "order": len(manifest) + 1,
                        "file": filename,
                        "label": shot_label,
                        "url": page.url,
                        "after_event_index": event.index,
                        "after_action": event.action,
                        "after_target": target,
                    })
                    print(f"           [SHOT {len(manifest):02d}] {filename}")

            save_manifest(
                out_dir / "_manifest.json",
                {
                    "script_version": SCRIPT_VERSION,
                    "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "source_tour": str(tour_file),
                    "source_timeline": str(tour.timeline_path),
                    "source_targets": str(tour.targets_path),
                    "base_url": project.base_url,
                    "viewport": f"{project.width}x{project.height}",
                    "capture_mode": "fullPage",
                    "count": len(manifest),
                    "screenshots": manifest,
                },
            )

            context.close()
            browser.close()

    except Exception as exc:
        print("\nERROR capture Ethikos depuis le modèle vidéo")
        print(f"{type(exc).__name__}: {exc}")
        if page is not None:
            try:
                error_path = out_dir / "_ERROR.png"
                page.screenshot(path=str(error_path), full_page=True, animations="disabled", caret="hide", scale="css")
                print(f"Diagnostic: {error_path}")
                print(f"URL: {page.url}")
            except Exception:
                pass
        return 1

    print(f"\nOK — {len(manifest)} captures full-page créées dans:")
    print(out_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
