#!/usr/bin/env python3
"""
scan_and_merge.py
Concatène le contenu de tous les fichiers dont l’extension figure dans
ALLOWED_EXTENSIONS, à l’intérieur du dossier pointé (et sous‑dossiers).
Écrit l’ensemble dans <dossier>/merged_output.txt puis affiche un récapitulatif.
"""

import argparse
from pathlib import Path

###############################################################################
# Extensions incluses
###############################################################################
ALLOWED_EXTENSIONS = {".py", ".html", ".css", ".js", ".txt", ".adoc", ".csv"}


def list_files(directory: Path, output_path: Path) -> list[Path]:
    """
    Parcourt directory récursivement et renvoie la liste des fichiers admissibles.
    Le fichier de sortie est exclu.
    """
    directory = directory.resolve()
    files = []

    for path in directory.rglob("*"):
        if (
            path.is_file()
            and path.suffix.lower() in ALLOWED_EXTENSIONS
            and path.resolve() != output_path
        ):
            files.append(path)

    return files


def concatenate_files(root: Path, output_name: str = "merged_output.txt") -> Path:
    """
    Écrit la liste des fichiers + leur contenu dans root/output_name.
    Renvoie le chemin absolu du fichier créé.
    """
    output_path = (root / output_name).resolve()
    file_list = list_files(root, output_path)

    with output_path.open("w", encoding="utf-8") as outfile:
        # 1. Liste des fichiers
        outfile.write("File System Structure (Included Files Only):\n")
        for fp in file_list:
            outfile.write(f"{fp.relative_to(root)}\n")

        # 2. Contenu concaténé
        outfile.write("\n--- Concatenated Files ---\n")
        for fp in file_list:
            outfile.write(f"\n--- {fp.relative_to(root)} ---\n\n")
            try:
                outfile.write(fp.read_text(encoding="utf-8", errors="ignore"))
            except Exception as e:
                print(f"Skipping {fp} ({e})")

    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concatène les fichiers d’un dossier dans merged_output.txt"
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Dossier à analyser (défaut : dossier courant).",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="merged_output.txt",
        help="Nom du fichier de sortie (défaut : merged_output.txt).",
    )
    args = parser.parse_args()

    root = Path(args.directory).expanduser().resolve()
    if not root.is_dir():
        raise SystemExit(f"Chemin invalide ou non répertoire : {root}")

    output_file = concatenate_files(root, args.output)

    # Affichage console
    print("\nFichiers inclus :")
    for fp in list_files(root, output_file):
        print(f"  • {fp.relative_to(root)}")
    print(f"\n{len(list_files(root, output_file))} fichier(s) fusionné(s).")
    print(f"Fichier créé : {output_file}")


if __name__ == "__main__":
    main()
