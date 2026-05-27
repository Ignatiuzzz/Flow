# Herramienta para Auditores - Backend

Backend desarrollado con FastAPI y MongoDB.

## Requisitos

- Python 3.11 o superior
- MongoDB local o MongoDB Atlas
- Windows PowerShell o CMD

## Instalación en Windows

Entrar a la carpeta backend:

```powershell
cd backend
```

Crear entorno virtual:

```powershell
python -m venv venv
```

Activar entorno virtual:

```powershell
.\venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la activación:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

Crear archivo `.env`:

```powershell
Copy-Item .env.example .env
```

Ejecutar backend:

```powershell
uvicorn app.main:app --reload
```

Abrir documentación:

```txt
http://127.0.0.1:8000/docs
```

## Estructura del proyecto

```txt
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── uploads/
├── scripts/
├── .env.example
├── .gitignore
└── requirements.txt
```

Flujo:
cd backend

python -m venv venv

en una terminal de powershell: .\venv\Scripts\Activate.ps1

pip install -r requirements.txt

Copy-Item .env.example .env

uvicorn app.main:app --reload