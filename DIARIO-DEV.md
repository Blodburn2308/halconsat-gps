# Diario de Desarrollo — Halconsat GPS

## Sesión: 2026-05-16 — Integración Landing Page + Chat IA

### Contexto
Proyecto universitario Next.js 14 para empresa ficticia **HalconSat** (seguridad vehicular GPS).
El Día 1 ya estaba completo: autenticación con NextAuth, dashboards admin/cliente, login UI.
El objetivo de hoy es integrar una landing page pública con un chat de IA embebido.

---

### Estado inicial del proyecto (antes de esta sesión)

| Archivo | Estado |
|---|---|
| `src/app/page.tsx` | Redirigía directamente a `/login` — no había landing |
| `src/middleware.ts` | Solo protegía `/login`, no tenía ruta `/` como pública |
| `src/app/globals.css` | CSS base de Tailwind + shadcn/ui, sin estilos de la marca |
| `src/app/api/chat-publico/` | No existía |
| `src/components/landing/` | No existía |

---

### Cambios realizados

#### TAREA 1 — `src/middleware.ts` (REEMPLAZADO)
**Problema:** El middleware anterior no declaraba `/` como ruta pública, así que Next.js redirigía a `/login` antes de renderizar la landing.

**Solución:** Se reescribió para:
- Declarar `["/", "/login"]` como rutas públicas
- Agregar excepción para `/api/chat-publico` (no requiere auth)
- Mantener protección de rutas `/dashboard/*`
- Actualizar el `matcher` para excluir también `api/auth`

#### TAREA 2 — `src/app/globals.css` (AMPLIADO)
Se agregaron al final todos los estilos de la marca HalconSat:
- Variables CSS: `--accent #ff9a00`, `--bg #080c14`, `--surface #0d1321`, etc.
- Componentes: `.hs-navbar`, `.hs-hero`, `.hs-services`, `.hs-platform`, `.hs-cta-band`, `.hs-footer`
- Widget de chat: `.hs-chat-fab`, `.hs-chat-window`, `.hs-chat-body`, `.hs-msg`, etc.
- Animaciones: `hs-fadeUp`, `hs-fadeRight`, `hs-float`, `hs-pulse`, `hs-bounce`, `hs-orb1/2`
- Responsive: breakpoints 1024px y 768px

#### TAREA 3 — `src/app/api/chat-publico/route.ts` (CREADO)
API Route de Next.js para el chat IA público:
- Acepta `POST` con `{ mensaje, historial[] }`
- Si no hay `ANTHROPIC_API_KEY` en `.env.local`, responde con mensaje de fallback (no rompe la app)
- Llama a `claude-haiku-4-5-20251001` con system prompt especializado en HalconSat
- Mantiene hasta 6 mensajes de contexto histórico
- System prompt incluye: servicios, planes, contacto, instrucciones de tono

#### TAREA 4 — `src/components/landing/ChatWidget.tsx` (CREADO)
Componente React Client con:
- Estado: `abierto`, `mensajes`, `input`, `cargando`
- Auto-scroll al último mensaje con `useRef`
- Animación de "typing" mientras espera respuesta
- Manejo de Enter para enviar (sin Shift+Enter)
- Botón flotante con animación de pulso CSS

#### TAREA 5 — `src/app/page.tsx` (REEMPLAZADO)
La landing page completa con:
- Navbar fija con scroll effect (`scrolled` class)
- Hero section con grid 2 columnas, badge, stats animados (contador JS)
- Sección servicios: 6 cards con hover effects
- Sección "Cómo funciona": 3 pasos numerados
- CTA band con gradiente y radial glow
- Footer grid 4 columnas
- `ChatWidget` embebido
- Scroll reveal via `IntersectionObserver`

---

### Archivos creados/modificados

```
src/
├── middleware.ts                        ← MODIFICADO
├── app/
│   ├── globals.css                      ← AMPLIADO (CSS de marca al final)
│   ├── page.tsx                         ← REEMPLAZADO (ahora es la landing)
│   └── api/
│       └── chat-publico/
│           └── route.ts                 ← CREADO
└── components/
    └── landing/
        └── ChatWidget.tsx               ← CREADO
```

---

### Variables de entorno necesarias

En `.env.local` agregar:
```env
ANTHROPIC_API_KEY="sk-ant-..."
```
Sin esta variable el chat muestra un mensaje de fallback pero la landing funciona igual.

---

### Checklist de verificación (TAREA 6)

- [ ] `http://localhost:3000` → landing page (fondo oscuro `#080c14`, navbar naranja)
- [ ] Botón "Ingresar" en navbar → `/login`
- [ ] Ícono 💬 esquina inferior derecha → abre chat pop-up
- [ ] Chat responde sobre servicios HalconSat con IA
- [ ] Login admin → `/dashboard/admin`
- [ ] Login cliente → `/dashboard/cliente`
- [ ] Cerrar sesión → regresa a `/login`

---

### Próximos pasos (Día 2 futuro)
- Dashboard con mapa GPS en tiempo real
- Tabla de vehículos con estado
- Integración con datos reales o mock de telemetría
