import os

# Define the absolute paths
START_DIR = r"C:\MonCode\KonnaxionV2\konnaxion"
OUTPUT_FILE = r"C:\MonCode\KonnaxionV2\configOutput.txt"

###############################################################################
# Adjust these according to the folders you want to keep (relative to START_DIR)
###############################################################################
# For example, if your directory structure under START_DIR is:
#   C:\MonCode\KonnaxionV2\konnaxion\config\...
#   C:\MonCode\KonnaxionV2\konnaxion\konnaxion_project\...
# then set INCLUDED_FOLDERS as below.
INCLUDED_FOLDERS = {
    "config",             # relative path from START_DIR
    #"konnaxion_project",  # relative path from START_DIR
    # Add additional folders as needed
}

# Only gather files with these extensions
ALLOWED_EXTENSIONS = {".py", ".html", ".css", ".js", ".txt"}

def list_files(directory):
    """
    Walk the directory (and subdirectories) to collect files from INCLUDED_FOLDERS
    with extensions from ALLOWED_EXTENSIONS.
    """
    file_list = []

    for root, _, files in os.walk(directory):
        # Get the path of the folder relative to the start directory
        relative_root = os.path.relpath(root, directory)

        # Skip the root itself if needed
        if relative_root == ".":
            continue

        # Check if the relative root starts with one of the included folders
        if not any(relative_root.startswith(folder) for folder in INCLUDED_FOLDERS):
            continue

        # Collect files that match allowed extensions
        for filename in files:
            if any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
                full_path = os.path.join(root, filename)
                file_list.append(full_path)

    return file_list

def concatenate_files(output_file, start_dir):
    """
    Creates a text file (output_file) that first lists all included file paths,
    and then concatenates the contents of these files.
    """
    file_list = list_files(start_dir)

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
    concatenate_files(OUTPUT_FILE, START_DIR)
