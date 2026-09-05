# FILE: PATCH_ETHIKOS_DELIVERY_308.pyw
from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path
from tkinter import Tk, messagebox


ROOT = Path(r"C:\mycode\Konnaxion\Konnaxion")
SPEC = ROOT / "frontend" / "tests" / "ethikos-delivery-workflow.spec.ts"


def popup(kind: str, title: str, text: str) -> None:
    root = Tk()
    root.withdraw()
    try:
        if kind == "error":
            messagebox.showerror(title, text)
        else:
            messagebox.showinfo(title, text)
    finally:
        root.destroy()


def main() -> int:
    if not SPEC.exists():
        popup(
            "error",
            "Konnaxion delivery 308 hotfix",
            f"Fichier introuvable :\n{SPEC}",
        )
        return 2

    text = SPEC.read_text(encoding="utf-8-sig")

    # Idempotent marker.
    marker = "response.status() >= 200 &&\n      response.status() < 300 &&"
    if text.count(marker) >= 2:
        popup(
            "info",
            "Konnaxion delivery 308 hotfix",
            "Le correctif 308 est déjà installé.",
        )
        return 0

    # Both saveAuthenticatedStance() and castPublicVote() wait on the same
    # canonical POST. A redirect response can arrive before the final 2xx;
    # Playwright waitForResponse must therefore match the final success only.
    pattern = re.compile(
        r"""(\(response\)\s*=>\s*\n\s*)"""
        r"""(response\.request\(\)\.method\(\)\s*===\s*'POST'\s*&&\s*\n\s*)"""
        r"""(/\\/api\\/ethikos\\/stances\\/[^\\n]*\.test\(response\.url\(\)\),)""",
        re.MULTILINE,
    )

    def replacement(match: re.Match[str]) -> str:
        indent_match = re.search(r"\n(\s*)response\.request", match.group(0))
        indent = indent_match.group(1) if indent_match else "      "

        return (
            match.group(1)
            + f"response.status() >= 200 &&\n"
            + f"{indent}response.status() < 300 &&\n"
            + f"{indent}"
            + match.group(2).lstrip()
            + f"{indent}"
            + match.group(3)
        )

    patched, count = pattern.subn(replacement, text)

    if count != 2:
        popup(
            "error",
            "Konnaxion delivery 308 hotfix",
            "Je m'attendais à corriger exactement 2 attentes POST "
            "(save stance + public vote).\n\n"
            f"Occurrences trouvées : {count}\n"
            "Aucun fichier n'a été modifié.",
        )
        return 3

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = SPEC.with_name(f"{SPEC.name}.bak_308_{stamp}")
    shutil.copy2(SPEC, backup)

    SPEC.write_text(patched, encoding="utf-8", newline="\n")

    # Verify exactly two final-success predicates are present after write.
    verify = SPEC.read_text(encoding="utf-8")
    success_predicates = verify.count("response.status() >= 200 &&")
    if success_predicates < 2:
        shutil.copy2(backup, SPEC)
        popup(
            "error",
            "Konnaxion delivery 308 hotfix",
            "Validation du patch échouée. Le backup a été restauré.",
        )
        return 4

    popup(
        "info",
        "Konnaxion delivery 308 hotfix",
        "Correctif installé.\n\n"
        "Le test attend maintenant la réponse POST finale 2xx "
        "et ignore le 308 intermédiaire.\n\n"
        f"Backup :\n{backup}\n\n"
        "Relance RUN_ETHIKOS_DELIVERY_WORKFLOW_ONECLICK.pyw.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
