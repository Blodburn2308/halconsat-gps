import fitz  # pymupdf
import sys
import uuid
from chroma_client import get_knowledge_collection

def extraer_texto(ruta_pdf: str) -> str:
    doc = fitz.open(ruta_pdf)
    texto_completo = ""
    for pagina in doc:
        texto_completo += pagina.get_text()
    doc.close()
    return texto_completo

def dividir_en_chunks(texto: str, tamanio: int = 500, solapamiento: int = 50) -> list:
    """
    Divide el texto en fragmentos de ~500 caracteres.
    El solapamiento de 50 caracteres evita cortar ideas a la mitad.
    """
    chunks = []
    inicio = 0
    while inicio < len(texto):
        fin = inicio + tamanio
        chunk = texto[inicio:fin].strip()
        if chunk:
            chunks.append(chunk)
        inicio = fin - solapamiento
    return chunks

def subir_a_chromadb(chunks: list, nombre_fuente: str):
    col = get_knowledge_collection()

    total_antes = col.count()
    print(f"[info] Documentos en ChromaDB antes de subir: {total_antes}")
    print(f"[info] Fragmentos extraídos del PDF: {len(chunks)}")

    ids       = [f"pdf-{uuid.uuid4().hex[:8]}" for _ in chunks]
    metadatas = [{"fuente": nombre_fuente, "chunk": i} for i, _ in enumerate(chunks)]

    col.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas
    )

    print(f"[ok] ✅ {len(chunks)} fragmentos subidos correctamente.")
    print(f"[ok] Total en ChromaDB ahora: {col.count()} documentos.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python subir_pdf.py ruta/al/archivo.pdf")
        sys.exit(1)

    ruta = sys.argv[1]
    nombre = ruta.split("/")[-1].split("\\")[-1]  # solo el nombre del archivo

    print(f"[inicio] Procesando: {nombre}")
    texto = extraer_texto(ruta)

    if not texto.strip():
        print("[error] El PDF no tiene texto extraíble. Puede ser un PDF escaneado.")
        sys.exit(1)

    print(f"[info] Texto extraído: {len(texto)} caracteres")
    chunks = dividir_en_chunks(texto)
    subir_a_chromadb(chunks, nombre)