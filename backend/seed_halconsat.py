from chroma_client import get_knowledge_collection

DOCS = [
    {"id":"hk-001","text":"Halconsat es una empresa ecuatoriana de seguridad vehicular con rastreo GPS en tiempo real para vehículos particulares y flotas. Ubicada en Ibarra, opera a nivel nacional.","metadata":{"categoria":"empresa"}},
    {"id":"hk-002","text":"Servicios de Halconsat: rastreo GPS en tiempo real, alertas de robo vehicular, geocercas, historial de rutas, control de velocidad y botón SOS para emergencias.","metadata":{"categoria":"servicios"}},
    {"id":"hk-003","text":"Alerta de Robo: se genera cuando hay movimiento del vehículo fuera del horario autorizado o cuando el sensor de vibración detecta movimiento sin ignición.","metadata":{"categoria":"eventos"}},
    {"id":"hk-004","text":"Geocercas: zonas geográficas virtuales definidas por el cliente. Cuando el vehículo entra o sale, el sistema genera un evento automáticamente.","metadata":{"categoria":"eventos"}},
    {"id":"hk-005","text":"El dispositivo GPS envía posición cada 30 segundos en movimiento y cada 5 minutos estacionado. Tiene batería de respaldo de 8 horas.","metadata":{"categoria":"dispositivo"}},
    {"id":"hk-006","text":"SOS: cuando se activa, envía alertas al centro de monitoreo y contactos de emergencia con ubicación exacta en tiempo real.","metadata":{"categoria":"eventos"}},
    {"id":"hk-007","text":"Estados del dispositivo: Activo (señal normal), Inactivo (apagado o sin suscripción), Sin señal (zona sin cobertura o interferencia).","metadata":{"categoria":"dispositivo"}},
    {"id":"hk-008","text":"Control de velocidad: alerta cuando el vehículo supera el límite configurado. Por defecto 120 km/h en carretera y 60 km/h en zona urbana.","metadata":{"categoria":"eventos"}},
    {"id":"hk-009","text":"Para registrar un dispositivo GPS se necesita: ID del dispositivo, placa del vehículo, nombre del propietario y dirección de instalación.","metadata":{"categoria":"registro"}},
    {"id":"hk-010","text":"Planes Halconsat — Básico: rastreo + historial 30 días. Estándar: básico + geocercas + alertas velocidad. Premium: estándar + SOS + monitoreo 24/7.","metadata":{"categoria":"planes"}},
]

def seed_knowledge():
    col = get_knowledge_collection()
    if col.count() > 0:
        print(f"[seed] Ya hay {col.count()} documentos. OK.")
        return
    print("[seed] Cargando conocimiento Halconsat...")
    col.add(
        ids=[d["id"] for d in DOCS],
        documents=[d["text"] for d in DOCS],
        metadatas=[d["metadata"] for d in DOCS]
    )
    print(f"[seed] ✅ {len(DOCS)} documentos cargados.")