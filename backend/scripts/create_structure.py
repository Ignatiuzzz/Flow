from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


folders = [
    "app",
    "app/models",
    "app/schemas",
    "app/controllers",
    "app/routes",
    "app/services",
    "app/utils",
    "app/uploads",
    "app/uploads/documents",
    "app/uploads/exports",
    "app/uploads/exports/pdf",
    "app/uploads/exports/excel",
    "app/uploads/exports/word",
    "app/uploads/temp",
]


files = [
    "app/__init__.py",
    "app/models/__init__.py",
    "app/schemas/__init__.py",
    "app/controllers/__init__.py",
    "app/routes/__init__.py",
    "app/services/__init__.py",
    "app/utils/__init__.py",

    "app/main.py",
    "app/config.py",
    "app/database.py",
    "app/routes/health_routes.py",

    "app/uploads/documents/.gitkeep",
    "app/uploads/exports/pdf/.gitkeep",
    "app/uploads/exports/excel/.gitkeep",
    "app/uploads/exports/word/.gitkeep",
    "app/uploads/temp/.gitkeep",

    ".env",
    ".env.example",
    ".gitignore",
    "README.md",
]


def create_project_structure():
    for folder in folders:
        folder_path = BASE_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)

    for file in files:
        file_path = BASE_DIR / file
        file_path.touch(exist_ok=True)

    print("Estructura del backend creada correctamente.")


if __name__ == "__main__":
    create_project_structure()