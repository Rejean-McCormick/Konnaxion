import os

###############################################################################
# Adjust these according to the folders you want to keep
###############################################################################
INCLUDED_FOLDERS = {
    "config",             # e.g. config/settings, config/asgi.py, config/wsgi.py, config/urls.py, etc.
    "konnaxion_project",  # your main Django app(s) and custom apps like users, core, etc.
    # Add additional folders if you want (e.g., if your apps are in a folder named "ethikos")
}

# Only gather files with these extensions
ALLOWED_EXTENSIONS = {".py", ".html", ".css", ".js", ".txt"}

def list_files(directory="."):
    """Walk the entire project, but only collect files in INCLUDED_FOLDERS with ALLOWED_EXTENSIONS."""
    file_list = []

    for root, _, files in os.walk(directory):
        # Get the path of the folder relative to the project root
        relative_root = os.path.relpath(root, directory)

        # If "." it means we are at the project root; skip if not desired
        if relative_root == ".":
            continue

        # Check if this root starts with one of the included folders
        if not any(relative_root.startswith(folder) for folder in INCLUDED_FOLDERS):
            continue

        # Now gather only files with allowed extensions
        for filename in files:
            if any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
                full_path = os.path.join(root, filename)
                file_list.append(full_path)

    return file_list

def concatenate_files(output_file="merged_output.txt"):
    """Create a text file that lists all included files, then concatenates their contents."""
    file_list = list_files()

    with open(output_file, "w", encoding="utf-8") as outfile:
        # 1. Write the list of all included files
        outfile.write("File System Structure (Included Folders Only):\n")
        for file_path in file_list:
            outfile.write(f"{file_path}\n")

        # 2. Write the content of each file below
        outfile.write("\n--- Concatenated Files ---\n")
        for file_path in file_list:
            # Avoid reading the output file into itself
            if os.path.abspath(file_path) == os.path.abspath(output_file):
                continue

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                    outfile.write(f"\n--- {file_path} ---\n\n")
                    outfile.write(infile.read())
                    outfile.write("\n")
            except Exception as e:
                print(f"Skipping {file_path} due to error: {e}")

if __name__ == "__main__":
    concatenate_files()
