from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time, uuid
from datetime import datetime
from chroma_client import get_collection, get_knowledge_collection
from seed_halconsat import seed_knowledge

app = FastAPI(title="Halconsat GPS Backend")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000","https://*.vercel.app"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.on_event("startup")
async def startup():
    seed_knowledge()
    print("[startup] Backend listo ✅")

class RegistroGPS(BaseModel):
    dispositivo_id: str
    placa: str
    tipo_evento: str
    ubicacion: str
    descripcion: str
    estado_dispositivo: str
    velocidad: float
    usuario_email: str
    usuario_rol: str

class BusquedaQuery(BaseModel):
    query: str
    usuario_email: str
    usuario_rol: str
    n_results: Optional[int] = 5

@app.get("/")
def root():
    return {"status":"ok","servicio":"Halconsat GPS Backend"}

@app.post("/registros")
def crear_registro(r: RegistroGPS):
    col = get_collection()
    texto = f"{r.tipo_evento}: {r.descripcion}. Ubicación: {r.ubicacion}. Placa: {r.placa}"
    rid = f"reg-{uuid.uuid4().hex[:8]}"
    ahora = datetime.utcnow().isoformat()
    inicio = time.time()
    try:
        col.add(
            ids=[rid],
            documents=[texto],
            metadatas=[{
                "dispositivo_id": r.dispositivo_id,
                "placa": r.placa,
                "tipo_evento": r.tipo_evento,
                "ubicacion": r.ubicacion,
                "descripcion": r.descripcion,
                "estado_dispositivo": r.estado_dispositivo,
                "velocidad": r.velocidad,
                "usuario_email": r.usuario_email,
                "usuario_rol": r.usuario_rol,
                "fecha_hora": ahora,
                "exitoso": True,
            }]
        )
        return {"id":rid,"latencia_ms":round((time.time()-inicio)*1000,2),"fecha_hora":ahora,"exitoso":True}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error":str(e),"exitoso":False})

@app.get("/registros")
def listar_registros(usuario_email: str = None, usuario_rol: str = "cliente"):
    col = get_collection()
    if col.count() == 0:
        return {"registros":[],"total":0}
    res = col.get(include=["documents","metadatas"])
    registros = []
    for i, meta in enumerate(res["metadatas"]):
        if usuario_rol != "admin" and meta.get("usuario_email") != usuario_email:
            continue
        registros.append({"id":res["ids"][i],"texto":res["documents"][i],**meta})
    registros.sort(key=lambda x: x.get("fecha_hora",""), reverse=True)
    return {"registros":registros,"total":len(registros)}

@app.post("/buscar")
def buscar(q: BusquedaQuery):
    col = get_collection()
    if col.count() == 0:
        return {"resultados":[],"mensaje":"Sin registros aún"}
    inicio = time.time()
    where = None if q.usuario_rol == "admin" else {"usuario_email": q.usuario_email}
    res = col.query(
        query_texts=[q.query],
        n_results=min(q.n_results, col.count()),
        where=where,
        include=["documents","metadatas","distances"]
    )
    latencia = round((time.time()-inicio)*1000, 2)
    items = []
    for i in range(len(res["ids"][0])):
        items.append({
            "id": res["ids"][0][i],
            "texto": res["documents"][0][i],
            "similitud": round(1 - res["distances"][0][i], 3),
            **res["metadatas"][0][i]
        })
    return {"resultados":items,"total":len(items),"latencia_ms":latencia}

@app.get("/metricas")
def metricas(usuario_email: str = None, usuario_rol: str = "admin"):
    col = get_collection()
    total = col.count()
    if total == 0:
        return {"total_registros":0,"registros_por_usuario":{},"exitosos":0,"errores":0,"tasa_exito":100.0,"vectores_almacenados":0}
    todos = col.get(include=["metadatas"])
    por_usuario, exitosos, errores = {}, 0, 0
    for m in todos["metadatas"]:
        email = m.get("usuario_email","desconocido")
        por_usuario[email] = por_usuario.get(email, 0) + 1
        if m.get("exitoso", True): exitosos += 1
        else: errores += 1
    return {
        "total_registros": total,
        "registros_por_usuario": por_usuario,
        "exitosos": exitosos,
        "errores": errores,
        "tasa_exito": round((exitosos/total)*100, 1),
        "vectores_almacenados": total,
        "dimension_vector": 384,
        "uso_estimado_mb": round((total*384*4)/(1024*1024), 3)
    }

# ─── LOG DE CONVERSACIONES DEL AGENTE ───────────────────────────────────────

class ChatLog(BaseModel):
    usuario_email: str
    usuario_rol: str
    pregunta: str
    respuesta: str
    registros_usados: int
    latencia_ms: float

chat_logs: list = []   # En memoria (Día 3). En Día 4 se mueve a ChromaDB.

@app.post("/chat-log")
def guardar_log(log: ChatLog):
    entrada = {
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "fecha_hora": datetime.utcnow().isoformat(),
        **log.dict()
    }
    chat_logs.append(entrada)
    return {"guardado": True, "total_logs": len(chat_logs)}

@app.get("/chat-log")
def obtener_logs(usuario_email: str = None, usuario_rol: str = "admin"):
    if usuario_rol == "admin":
        return {"logs": chat_logs, "total": len(chat_logs)}
    filtrados = [l for l in chat_logs if l.get("usuario_email") == usuario_email]
    return {"logs": filtrados, "total": len(filtrados)}

@app.get("/chat-log/metricas")
def metricas_chat():
    if not chat_logs:
        return {"total_consultas": 0, "latencia_promedio_ms": 0, "usuarios_unicos": 0}
    latencias = [l["latencia_ms"] for l in chat_logs]
    usuarios = set(l["usuario_email"] for l in chat_logs)
    return {
        "total_consultas": len(chat_logs),
        "latencia_promedio_ms": round(sum(latencias) / len(latencias), 2),
        "usuarios_unicos": len(usuarios),
        "ultima_consulta": chat_logs[-1]["fecha_hora"] if chat_logs else None
    }

@app.get("/metricas/completas")
def metricas_completas(usuario_email: str = None, usuario_rol: str = "admin"):
    col = get_collection()
    total = col.count()

    # Valores vacíos si no hay registros
    if total == 0:
        return {
            "total_registros": 0,
            "registros_por_usuario": {},
            "latencia_promedio_ms": 0,
            "errores": 0,
            "exitosos": 0,
            "tasa_exito": 100.0,
            "vectores_almacenados": 0,
            "dimension_vector": 384,
            "uso_mb": 0,
            "duplicados_detectados": 0,
            "consultas_agente": len(chat_logs),
            "latencia_agente_ms": 0,
            "similitud_promedio": 0,
            "registros_por_dia": {},
            "latencias_lista": [],
        }

    todos = col.get(include=["metadatas"])
    metas = todos["metadatas"]

    por_usuario = {}
    exitosos = 0
    errores = 0
    latencias = []
    duplicados = 0
    por_dia = {}

    for m in metas:
        # Filtrar por usuario si es cliente
        if usuario_rol != "admin" and m.get("usuario_email") != usuario_email:
            continue

        email = m.get("usuario_email", "desconocido")
        por_usuario[email] = por_usuario.get(email, 0) + 1

        if m.get("exitoso", True):
            exitosos += 1
        else:
            errores += 1

        if m.get("latencia_ms"):
            latencias.append(float(m["latencia_ms"]))

        if m.get("duplicado"):
            duplicados += 1

        # Agrupar por día
        fecha = m.get("fecha_hora", "")[:10]
        if fecha:
            por_dia[fecha] = por_dia.get(fecha, 0) + 1

    total_filtrado = exitosos + errores

    # Métricas del agente desde chat_logs
    logs_usuario = chat_logs if usuario_rol == "admin" else [
        l for l in chat_logs if l.get("usuario_email") == usuario_email
    ]
    latencias_agente = [l["latencia_ms"] for l in logs_usuario if l.get("latencia_ms")]

    return {
        "total_registros": total_filtrado if usuario_rol != "admin" else total,
        "registros_por_usuario": por_usuario,
        "latencia_promedio_ms": round(sum(latencias) / len(latencias), 2) if latencias else 0,
        "errores": errores,
        "exitosos": exitosos,
        "tasa_exito": round((exitosos / total_filtrado) * 100, 1) if total_filtrado > 0 else 100.0,
        "vectores_almacenados": total,
        "dimension_vector": 384,
        "uso_mb": round((total * 384 * 4) / (1024 * 1024), 3),
        "duplicados_detectados": duplicados,
        "consultas_agente": len(logs_usuario),
        "latencia_agente_ms": round(sum(latencias_agente) / len(latencias_agente), 2) if latencias_agente else 0,
        "similitud_promedio": 0.87,  # valor representativo — se mejora en Día 5
        "registros_por_dia": dict(sorted(por_dia.items())),
        "latencias_lista": latencias[-10:],  # últimas 10 para la gráfica de línea
    }