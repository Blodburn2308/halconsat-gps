# Halconsat GPS

Aplicación web universitaria para **Halconsat**, una empresa ficticia de seguridad
vehicular GPS. El proyecto demuestra una arquitectura completa con autenticación
por roles, base vectorial (**ChromaDB**), agente conversacional con LLM (**Groq**)
y dashboards con métricas reales sobre los eventos GPS capturados.

Construido durante 5 días siguiendo la metodología **XP (Extreme Programming)**:
iteraciones cortas, integración continua y entregables funcionales cada día.

---

## Funcionalidades

- 🔐 Login con dos roles: **admin** y **cliente** (NextAuth, sesión JWT)
- 📍 Captura de registros GPS (placa, dispositivo, evento, ubicación, velocidad…)
- 🧠 Cada registro se convierte en un **vector de 384 dimensiones** y se guarda en ChromaDB
- 🔍 Búsqueda semántica de eventos por similitud
- 🤖 Agente conversacional: responde en lenguaje natural usando los registros del usuario
- 📊 Dashboard admin con **10 métricas** y gráficas (barras, dona, línea) en Recharts
- 📋 Vista de todos los registros (admin) y vista propia (cliente) con filtro por evento
- ✅ Feedback de inserción con ID, latencia y confirmación de generación vectorial

---

## Tech stack

**Frontend**
- Next.js 15 (App Router) + TypeScript
- React 19
- Tailwind CSS + shadcn/ui
- Recharts (gráficas)
- NextAuth v5 (auth y sesión)

**Backend**
- Python 3.11+
- FastAPI + Uvicorn
- ChromaDB (base vectorial embebida, persistente en disco)
- Sentence-Transformers (modelo `all-MiniLM-L6-v2`, 384 dim)
- Pydantic

**LLM**
- Groq API (modelo `llama-3.1-8b-instant`) vía endpoint OpenAI-compatible

**Infra**
- Despliegue web: Vercel
- Repositorio: GitHub

---

## Estructura

```
halconsat-gps/
├── src/app/
│   ├── page.tsx                          # Landing
│   ├── login/                            # Pantalla de login
│   ├── dashboard/
│   │   ├── layout.tsx                    # Sidebar con links por rol
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Dashboard con 10 métricas + Recharts
│   │   │   └── registros/page.tsx        # Tabla de todos los registros
│   │   └── cliente/
│   │       ├── page.tsx                  # Resumen del cliente
│   │       └── registros/page.tsx        # Tabla de registros propios
│   ├── registros/nuevo/page.tsx          # Formulario + feedback de inserción
│   ├── agente/page.tsx                   # Chat con el agente IA
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # NextAuth
│       ├── registros/route.ts            # CRUD proxy → backend
│       ├── metricas/route.ts             # Proxy /metricas/completas
│       └── agente/route.ts               # Búsqueda semántica + Groq
├── backend/
│   ├── main.py                           # FastAPI: registros, búsqueda, métricas, chat-log
│   ├── chroma_client.py                  # Cliente ChromaDB persistente
│   └── seed_halconsat.py                 # Carga de conocimiento base
└── public/screenshots/                   # Capturas de pantalla del proyecto
```

---

## Instalación local

### 1. Requisitos

- **Node.js 18+** y **npm**
- **Python 3.11+** y `pip`
- **Git**

### 2. Clonar el repositorio

```bash
git clone https://github.com/Blodburn2308/halconsat-gps.git
cd halconsat-gps
```

### 3. Instalar dependencias del frontend

```bash
npm install
```

### 4. Instalar dependencias del backend Python

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install fastapi uvicorn chromadb sentence-transformers pydantic
cd ..
```

### 5. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# NextAuth
AUTH_SECRET="cambia-esto-por-una-cadena-aleatoria-larga"
NEXTAUTH_URL="http://localhost:3000"

# Backend Python (FastAPI + ChromaDB)
CHROMA_BACKEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:8000"

# Groq API (LLM del agente)
GROQ_API_KEY="gsk_..."
```

> 💡 Genera `AUTH_SECRET` con: `openssl rand -base64 32`
>
> 💡 Obtén tu `GROQ_API_KEY` gratis en https://console.groq.com

---

## Cómo correr el proyecto

### Backend Python (terminal 1)

```bash
cd backend

# Activa el venv si no está activo
venv\Scripts\activate            # Windows
source venv/bin/activate         # macOS / Linux

uvicorn main:app --reload --port 8000
```

El backend queda disponible en `http://localhost:8000`.
La documentación interactiva (Swagger UI) está en `http://localhost:8000/docs`.

### Frontend Next.js (terminal 2)

```bash
npm run dev
```

Abre `http://localhost:3000` y entra con cualquiera de los usuarios de demo
definidos en `src/auth.ts` (por ejemplo, `admin@halconsat.com` o
`cliente@halconsat.com`).

---

## URL de producción

🌐 **Vercel:** _por publicar_ — el dominio definitivo se enlaza aquí cuando se
despliegue. El frontend se despliega a Vercel y el backend Python se hospeda
aparte (por ejemplo en Railway o Render) ajustando `CHROMA_BACKEND_URL` y
`BACKEND_URL` a la URL pública correspondiente.

---

## Créditos

- **Metodología:** XP (Extreme Programming) — iteraciones diarias con entregables funcionales.
- **Base vectorial:** [ChromaDB](https://www.trychroma.com/) con embeddings
  `all-MiniLM-L6-v2` de [Sentence-Transformers](https://www.sbert.net/).
- **LLM del agente:** [Groq API](https://groq.com/) sobre `llama-3.1-8b-instant`,
  invocada vía endpoint OpenAI-compatible.
- **UI:** [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/),
  [Recharts](https://recharts.org/).
- **Auth:** [NextAuth.js](https://authjs.dev/).

Proyecto académico — Halconsat es una empresa ficticia creada para fines didácticos.
