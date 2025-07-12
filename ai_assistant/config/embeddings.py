import os
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
import asyncio
# import google.generativeai as genai
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

_model = None
def get_model():
    global _model
    if _model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        print(f"Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
        print("Embedding model loaded successfully")
    return _model

async def get_embedding(text: str) -> List[float]:
    model = get_model()
    embedding = await asyncio.to_thread(model.encode, text)
    return embedding.tolist()

async def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    model = get_model()
    embeddings = await asyncio.to_thread(model.encode, texts)
    return [e.tolist() for e in embeddings]

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    vec1_array = np.array(vec1)
    vec2_array = np.array(vec2)
    
    dot_product = np.dot(vec1_array, vec2_array)
    norm1 = np.linalg.norm(vec1_array)
    norm2 = np.linalg.norm(vec2_array)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2) 