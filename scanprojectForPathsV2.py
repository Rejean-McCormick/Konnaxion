#!/usr/bin/env python3
import os
import sys

# Set of folder names to exclude from scanning.
EXCLUDE_DIRS = {
    'env', 'venv', 'node_modules', 'bower_components', 'static', 'lib', 'libraries',
    '.git', '.hg', '.venv', '__pycache__', '.vscode', '.idea', '.envs', 'bin',
    'staticfiles', 'dist', 'build', 'coverage', '.nyc_output', '.next', '.turbo',
    '.pytest_cache', 'test-output'
    # ajouter d’autres dossiers spécifiques si besoin
}


def scan_directory(root: str, output_file: str) -> None:
    """
    Recursively scans *root*, writing absolute paths of every directory and file
    to *output_file*, while skipping any directory whose base name is in
    EXCLUDE_DIRS.
    """
    root = os.path.abspath(root)                   # ensure we work with an absolute root

    with open(output_file, 'w', encoding='utf-8') as f:
        for dirpath, dirnames, filenames in os.walk(root):
            # Exclude unwanted directories from recursion.
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

            # Write the absolute directory path.
            f.write(f"Directory: {dirpath}\n")

            # Write the absolute path for each file inside the directory.
            for filename in filenames:
                full_path = os.path.join(dirpath, filename)
                f.write(f"    {full_path}\n")

    print(f"Scan complete! Results saved to {output_file}")

def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python scan_project.py [directory_to_scan] [output_file.txt]")
        sys.exit(1)

    root_directory = sys.argv[1]
    output_filename = sys.argv[2]

    if not os.path.isdir(root_directory):
        print(f"Error: {root_directory} is not a valid directory.")
        sys.exit(1)

    scan_directory(root_directory, output_filename)

if __name__ == '__main__':
    main()
