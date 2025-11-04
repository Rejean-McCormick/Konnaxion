import os

# fichiers à lire (relatifs à la racine du projet frontend)
FILES = [
    "services/_request.ts",
    "services/decide.ts",
    "services/deliberate.ts",
    "services/pulse.ts",
    "services/audit.ts",
    "services/index.ts",
    "src/types/index.ts",
    "components/compat/Icon.tsx",
    "components/compat/Comment.tsx",
    "components/Loading.tsx",
    "context/ThemeContext.tsx",
]

OUTPUT_FILE = "concat_output.txt"


def main():
    root = os.getcwd()
    output_lines = []

    for path in FILES:
        abs_path = os.path.join(root, path)
        output_lines.append(f"### {path}")
        if os.path.exists(abs_path):
            try:
                with open(abs_path, "r", encoding="utf-8") as f:
                    content = f.read()
                output_lines.append(content)
                output_lines.append("\n\n")  # séparation
            except Exception as e:
                output_lines.append(f"[ERREUR: impossible de lire {path}: {e}]\n\n")
        else:
            output_lines.append(f"[ABSENT: {path}]\n\n")

    out_path = os.path.join(root, OUTPUT_FILE)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))

    print(f"Fichier généré: {out_path}")
    print("Résumé:")
    for path in FILES:
        status = "OK" if os.path.exists(os.path.join(root, path)) else "ABSENT"
        print(f" - {path}: {status}")


if __name__ == "__main__":
    main()
