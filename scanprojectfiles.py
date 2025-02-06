#!/usr/bin/env python3
import os
import sys

# Set of folder names to exclude from scanning.
# Modify this list to add or remove directories as needed.
EXCLUDE_DIRS = {
    'env',
    'venv',
    'node_modules',
    'bower_components',
    'static',
    'lib',
    'libraries',
    '.git',
    '.hg',
    # add other folders you want to exclude
}

def scan_directory(root, output_file):
    """
    Recursively scans the given root directory, writing all folder and file paths to output_file.
    Excludes any directories whose name is in EXCLUDE_DIRS.
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        for dirpath, dirnames, filenames in os.walk(root):
            # Exclude unwanted directories from recursion.
            # This modifies dirnames in place so os.walk will skip them.
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

            # Write the directory path.
            # os.path.relpath is used so the output is relative to the scanned root.
            rel_dir = os.path.relpath(dirpath, root)
            if rel_dir == ".":
                rel_dir = root
            f.write(f"Directory: {rel_dir}\n")

            # Write each file path.
            for filename in filenames:
                # Construct the relative file path.
                rel_file = os.path.join(rel_dir, filename)
                f.write(f"    {rel_file}\n")
    print(f"Scan complete! Results saved to {output_file}")

def main():
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
