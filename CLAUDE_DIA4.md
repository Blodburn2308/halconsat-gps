Día 5 — tareas finales del proyecto Halconsat. Ejecuta en orden:

TAREA 1: Crea src/app/dashboard/admin/registros/page.tsx — 
página que hace fetch a /api/registros y muestra TODOS los registros 
de todos los usuarios en una tabla con columnas: ID, Dispositivo, Placa, 
Tipo Evento, Usuario, Fecha, Latencia ms, Estado. Agrega filtro por 
tipo_evento con un select. Colores de marca #1A3C5E y #2E86AB.

TAREA 2: Actualiza src/app/dashboard/layout.tsx — 
agrega en los links del admin: { href: "/dashboard/admin/registros", 
label: "Todos los Registros", icon: "📋" }

TAREA 3: Crea src/app/dashboard/cliente/registros/page.tsx — 
igual que la del admin pero solo muestra los registros del cliente 
en sesión. Agrega link en sidebar cliente: 
{ href: "/dashboard/cliente/registros", label: "Mis Registros", icon: "📋" }

TAREA 4: Actualiza src/app/registros/nuevo/page.tsx — 
después de un registro exitoso, muestra un resumen con: ID generado, 
latencia de inserción en ms, fecha y hora, y un badge que diga 
"Vector generado correctamente en ChromaDB". 
Agrega botón "Ver mis registros" que lleva a /dashboard/cliente/registros.

TAREA 5: Crea public/screenshots/ (carpeta vacía con .gitkeep)
y actualiza README.md con estas secciones:
- Descripción del proyecto Halconsat
- Tech stack completo
- Instrucciones de instalación local (paso a paso)
- Variables de entorno necesarias (.env.local)
- Cómo correr el backend Python
- Cómo correr Next.js
- URL de producción en Vercel
- Créditos: metodología XP, ChromaDB, Groq API

TAREA 6: Ejecuta tsc --noEmit para verificar tipos.
Luego: git add . && git commit -m "feat: Day5 - registros CRUD, README final, feedback de inserción"
Y: git push origin johan