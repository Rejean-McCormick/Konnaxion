import os

# List of key configuration and specificity files.
# Adjust paths if necessary to match your project’s structure.
INCLUDED_FILES = [
    # Project Entry Point and Core Setup
    "manage.py",

    # Django Server & Application Configuration
    "konnaxion/config/asgi.py",
    "konnaxion/config/wsgi.py",
    "konnaxion/config/urls.py",
    "konnaxion/config/api_router.py",
    "konnaxion/config/celery_app.py",
    "konnaxion/config/websocket.py",

    # Settings Modules
    "konnaxion/config/settings/base.py",
    "konnaxion/config/settings/local.py",
    "konnaxion/config/settings/production.py",
    "konnaxion/config/settings/test.py",

    # Environment Variables (dotenv files)
    ".envs/.local/.django",
    ".envs/.local/.postgres",
    ".envs/.production/.django",
    ".envs/.production/.postgres",

    # Dependency, Build, and Deployment Configurations
    # Python dependencies
    "konnaxion/requirements.txt",
    # (If you want to include more, you can also add files from the "konnaxion/requirements/" folder)
    "pyproject.toml",
    
    # Node/Frontend dependencies and build tools
    "konnaxion/package.json",
    "konnaxion/package-lock.json",
    "konnaxion/webpack/common.config.js",
    "konnaxion/webpack/dev.config.js",
    "konnaxion/webpack/prod.config.js",
    
    # Docker and Containerization Files
    "konnaxion/docker-compose.docs.yml",
    "konnaxion/docker-compose.local.yml",
    "konnaxion/docker-compose.production.yml",
    # Example Dockerfiles (you can add more as needed)
    "konnaxion/compose/local/django/Dockerfile",
    "konnaxion/compose/production/django/Dockerfile",
    "konnaxion/compose/production/nginx/Dockerfile",
    
    # Other Deployment Helpers
    "konnaxion/Procfile",
    "konnaxion/justfile",
    "konnaxion/merge_production_dotenvs_in_dotenv.py",

    # Documentation and Meta Files
    "konnaxion/README.md",
    # (Include key documentation files; here we add a few examples from the docs folder)
    "konnaxion/docs/conf.py",
    "konnaxion/docs/howto.rst",
    "konnaxion/docs/index.rst",
    "konnaxion/docs/make.bat",
    "konnaxion/docs/Makefile",
    "konnaxion/docs/users.rst",
    "konnaxion/docs/__init__.py",

    # Additional (Optional) Configuration/Dev Files
    "konnaxion/.editorconfig",
    "konnaxion/.gitattributes",
    "konnaxion/.gitignore",
    "konnaxion/.pre-commit-config.yaml",
    "konnaxion/.python-version",
    

]

def concatenate_files(output_file="merged_config_files.txt"):
    """
    Create a single output file that lists all the included files and,
    for each, writes its filename followed by its content.
    """
    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.write("=== List of Configuration Files ===\n")
        for file_path in INCLUDED_FILES:
            outfile.write(f"{file_path}\n")
        
        outfile.write("\n=== File Contents ===\n")
        
        for file_path in INCLUDED_FILES:
            outfile.write(f"\n--- {file_path} ---\n\n")
            if not os.path.exists(file_path):
                outfile.write("** File not found **\n")
                continue

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    outfile.write(f.read())
            except Exception as e:
                outfile.write(f"** Error reading file: {e} **\n")
    
    print(f"Files have been concatenated into '{output_file}'")

if __name__ == "__main__":
    concatenate_files()
