Instala el paquete que falta en Next.js y crea estos dos archivos:

1. src/app/api/registros/route.ts — recibe POST con datos GPS del formulario, 
   los reenvía a http://localhost:8000/registros agregando usuario_email y 
   usuario_rol desde la sesión de NextAuth. También tiene GET que llama a 
   http://localhost:8000/registros con los parámetros del usuario actual.

2. src/app/api/metricas/route.ts — GET que llama a 
   http://localhost:8000/metricas con email y rol del usuario en sesión.

3. src/app/registros/nuevo/page.tsx — formulario "use client" con campos: 
   dispositivo_id, placa, tipo_evento (select), ubicacion, descripcion 
   (textarea con badge "se convierte en vector"), estado_dispositivo (select), 
   velocidad (number). Al enviar hace POST a /api/registros y muestra 
   la latencia_ms devuelta. Colores de marca: navy #1A3C5E, azul #2E86AB.

4. Actualizar src/app/dashboard/layout.tsx para agregar el link 
   "Nuevo Registro" con href="/registros/nuevo" en los links del cliente.

5. Actualizar src/app/dashboard/admin/page.tsx para que en el useEffect 
   haga fetch a /api/metricas y muestre los valores reales en las cards.