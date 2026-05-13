# DEVLOG — Halconsat GPS

Registro de cambios por sesión de trabajo. Cada entrada documenta **qué** se hizo, **por qué** y con **qué fin**.

---

## Día 1 — 2026-05-12 · Auth con roles + estructura de páginas

**Objetivo del día:** Dejar el sistema de autenticación funcionando con dos roles (admin / cliente) y las páginas base del dashboard.

---

### [T1] Instalación de NextAuth v5 (beta)
- **Qué:** `npm install next-auth@beta`
- **Por qué:** NextAuth v5 es compatible con Next.js 15/16 App Router. La versión estable (v4) no soporta el nuevo sistema de middleware y Server Components.
- **Fin:** Proveer autenticación con sesiones JWT sin necesidad de base de datos en esta etapa.

---

### [T2] Instalación de componentes shadcn faltantes
- **Qué:** `input`, `label`, `card`, `badge` agregados vía CLI de shadcn.
- **Por qué:** El formulario de login y los dashboards los requieren. Solo existía `button.tsx`.
- **Fin:** Tener los bloques visuales listos para construir la UI.

---

### [T3] Creación de `src/auth.ts`
- **Qué:** Configuración central de NextAuth con proveedor `Credentials` y usuarios hardcodeados.
- **Por qué:** En Día 1 no hay base de datos; los usuarios de prueba se definen en memoria para poder validar el flujo completo.
- **Fin:** Exportar `auth`, `signIn`, `signOut`, `handlers` para usar en toda la app. Los callbacks JWT/session propagan el campo `role` al token y a la sesión.

---

### [T4] Creación de `src/app/api/auth/[...nextauth]/route.ts`
- **Qué:** Route handler que expone los endpoints GET y POST de NextAuth.
- **Por qué:** Next.js App Router no tiene un handler mágico; hay que registrarlo explícitamente en la carpeta `api/auth/[...nextauth]`.
- **Fin:** Que `signIn()`, `signOut()` y la sesión funcionen desde el cliente.

---

### [T5] Creación de `src/middleware.ts`
- **Qué:** Middleware de Next.js que protege rutas usando la sesión de NextAuth.
- **Por qué:** Sin middleware, cualquier usuario podría acceder a `/dashboard/admin` directamente.
- **Fin:** Redirigir automáticamente: no autenticado → `/login`; cliente en ruta admin → `/dashboard/cliente`; ya autenticado en `/login` → su dashboard.

---

### [T6] Reemplazo de `src/app/page.tsx`
- **Qué:** La página raíz (`/`) ahora lee la sesión y redirige según el rol.
- **Por qué:** El usuario nunca debe ver la página de inicio genérica de Next.js.
- **Fin:** Punto de entrada inteligente — admin va a su dashboard, cliente al suyo, sin sesión va al login.

---

### [T7] Creación de `src/app/login/page.tsx`
- **Qué:** Formulario de login con UI de marca Halconsat. Incluye botones de demo para rellenar credenciales.
- **Por qué:** Es la única entrada pública del sistema.
- **Fin:** Autenticar al usuario, obtener su rol y redirigirlo al dashboard correcto.

---

### [T8] Creación de `src/app/dashboard/layout.tsx`
- **Qué:** Layout compartido del dashboard con sidebar lateral de navegación.
- **Por qué:** Admin y cliente tienen links distintos pero comparten el mismo shell visual. Un layout evita duplicar código.
- **Fin:** Sidebar con navegación dinámica según rol, info del usuario y botón de cerrar sesión.

---

### [T9] Creación de `src/app/dashboard/admin/page.tsx`
- **Qué:** Dashboard del administrador con 4 métricas del sistema.
- **Por qué:** El admin necesita una vista global: registros, usuarios, consultas al agente, tasa de éxito.
- **Fin:** Vista base de métricas (en 0 por ahora). Se conectará a ChromaDB el Día 2.

---

### [T10] Creación de `src/app/dashboard/cliente/page.tsx`
- **Qué:** Dashboard del cliente con sus dispositivos GPS y métricas propias.
- **Por qué:** El cliente solo ve sus datos, no los de otros usuarios.
- **Fin:** Vista base del cliente. El botón de registro GPS se habilitará el Día 2.

---

### [Verificación] Pruebas manuales y commit
- **Qué:** Correr `npm run dev` y verificar 5 flujos de navegación.
- **Fin:** Confirmar que auth, roles, redirecciones y UI funcionan antes de subir a GitHub.
