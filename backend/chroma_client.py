"""
Reemplazo ligero de chromadb usando numpy + sentence-transformers.
Expone exactamente el mismo API que usaban main.py y seed_halconsat.py.
No requiere compiladores C++ ni Visual Studio.
"""
import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer


# ─── Embedding function (mismo API que chromadb) ────────────────────────────

class _SentenceTransformerEF:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self._model_name = model_name
        self._model = None              # carga lazy al primer uso

    def _get_model(self):
        if self._model is None:
            self._model = SentenceTransformer(self._model_name)
        return self._model

    def __call__(self, input):          # chromadb pasa lista de strings
        return self._get_model().encode(input, show_progress_bar=False).tolist()


class embedding_functions:              # namespace que importa chroma_client
    SentenceTransformerEmbeddingFunction = _SentenceTransformerEF


# ─── Collection ─────────────────────────────────────────────────────────────

class _Collection:
    def __init__(self, name: str, store_path: str, embedding_fn):
        self.name = name
        self._ef = embedding_fn
        self._file = Path(store_path) / f"{name}.json"
        self._file.parent.mkdir(parents=True, exist_ok=True)
        self._load()

    def _load(self):
        if self._file.exists():
            d = json.loads(self._file.read_text(encoding="utf-8"))
            self._ids       = d["ids"]
            self._documents = d["documents"]
            self._metadatas = d["metadatas"]
            self._embeddings = d["embeddings"]
        else:
            self._ids, self._documents, self._metadatas, self._embeddings = [], [], [], []

    def _save(self):
        self._file.write_text(json.dumps({
            "ids": self._ids,
            "documents": self._documents,
            "metadatas": self._metadatas,
            "embeddings": self._embeddings,
        }, ensure_ascii=False), encoding="utf-8")

    # ── API chromadb ────────────────────────────────────────────────────────

    def count(self) -> int:
        return len(self._ids)

    def add(self, ids, documents, metadatas=None):
        embs = self._ef(documents)
        metas = metadatas or [{} for _ in ids]
        for rid, doc, emb, meta in zip(ids, documents, embs, metas):
            if rid not in self._ids:
                self._ids.append(rid)
                self._documents.append(doc)
                self._metadatas.append(meta)
                self._embeddings.append(emb)
        self._save()

    def get(self, include=None):
        result = {"ids": list(self._ids)}
        if include is None or "documents" in include:
            result["documents"] = list(self._documents)
        if include is None or "metadatas" in include:
            result["metadatas"] = list(self._metadatas)
        return result

    def query(self, query_texts, n_results=5, where=None, include=None):
        if not self._ids:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        q_emb = np.array(self._ef(query_texts)[0])
        all_embs = np.array(self._embeddings)

        # similitud coseno → distancia coseno
        norms = np.linalg.norm(all_embs, axis=1) * np.linalg.norm(q_emb)
        norms = np.where(norms == 0, 1e-10, norms)
        distances = 1.0 - (all_embs @ q_emb) / norms

        # filtro where
        indices = range(len(self._ids))
        if where:
            indices = [i for i in indices
                       if all(self._metadatas[i].get(k) == v for k, v in where.items())]

        top = sorted(indices, key=lambda i: distances[i])[:n_results]

        return {
            "ids":       [[self._ids[i]       for i in top]],
            "documents": [[self._documents[i]  for i in top]],
            "metadatas": [[self._metadatas[i]  for i in top]],
            "distances": [[float(distances[i]) for i in top]],
        }


# ─── PersistentClient ────────────────────────────────────────────────────────

class _PersistentClient:
    def __init__(self, path="./chroma_data"):
        self._path = path
        self._cols: dict[str, _Collection] = {}

    def get_or_create_collection(self, name, embedding_function=None, metadata=None):
        if name not in self._cols:
            self._cols[name] = _Collection(name, self._path, embedding_function)
        return self._cols[name]


# ─── Módulo público (mismo API que `import chromadb`) ───────────────────────

def PersistentClient(path="./chroma_data"):
    return _PersistentClient(path)


# ─── Instancias compartidas (igual que antes) ────────────────────────────────

client = PersistentClient(path="./chroma_data")

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


def get_collection():
    return client.get_or_create_collection(
        name="halconsat_gps",
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def get_knowledge_collection():
    return client.get_or_create_collection(
        name="halconsat_knowledge",
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )
