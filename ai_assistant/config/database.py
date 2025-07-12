import os
from motor.motor_asyncio import AsyncIOMotorClient
import faiss
import numpy as np
from typing import List, Dict, Any
import pickle
import json
import base64

class DatabaseManager:
    def __init__(self):
        self.mongo_url = os.getenv("MONGODB_URL")
        self.db_name = os.getenv("DB_NAME", "Odoo DB")
        self.client = None
        self.db = None
        self.vector_index = None
        self.vector_dimension = 384  # For all-MiniLM-L6-v2
        
    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(self.mongo_url)
            self.db = self.client[self.db_name]
            print("Connected to MongoDB")
            await self.initialize_vector_index()
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    async def initialize_vector_index(self):
        try:
            if self.db is None:
                raise Exception("Database connection is not established")
            index_data = await self.db.vector_index.find_one({"name": "main_index"})
            
            if index_data:
                index_bytes = base64.b64decode(index_data["index_data"])
                self.vector_index = faiss.read_index_from_buffer(index_bytes)
                
                mapping_data = await self.db.vector_mapping.find({}).to_list(length=None)
                self.vector_mapping = [doc["metadata"] for doc in mapping_data]
                
                print(f"Loaded existing vector index from MongoDB with {len(self.vector_mapping)} entries")
            else:
                self.vector_index = faiss.IndexFlatIP(self.vector_dimension)
                self.vector_mapping = []
                print("Created new vector index")
        except Exception as e:
            print(f"Error initializing vector index: {e}")
            self.vector_index = faiss.IndexFlatIP(self.vector_dimension)
            self.vector_mapping = []
    
    async def save_vector_index(self):
        try:
            if not self.vector_index or self.db is None:
                print("Database connection is not established or vector index is missing.")
                return
                
            # Save FAISS index to MongoDB
            index_bytes = faiss.write_index_to_buffer(self.vector_index)
            index_b64 = base64.b64encode(index_bytes).decode('utf-8')
            
            await self.db.vector_index.update_one(
                {"name": "main_index"},
                {
                    "$set": {
                        "name": "main_index",
                        "index_data": index_b64,
                        "dimension": self.vector_dimension,
                        "updated_at": self._get_current_timestamp()
                    }
                },
                upsert=True
            )
            await self.db.vector_mapping.delete_many({})
            
            # new mapping
            if self.vector_mapping:
                mapping_docs = [
                    {
                        "index": i,
                        "metadata": metadata,
                        "created_at": self._get_current_timestamp()
                    }
                    for i, metadata in enumerate(self.vector_mapping)
                ]
                await self.db.vector_mapping.insert_many(mapping_docs)
            
            print(f"Vector index saved to MongoDB with {len(self.vector_mapping)} entries")
        except Exception as e:
            print(f"Error saving vector index to MongoDB: {e}")
    
    async def add_to_vector_index(self, embedding: List[float], metadata: Dict[str, Any]):
        embedding_array = np.array([embedding], dtype=np.float32)
        if self.vector_index is None:
            await self.initialize_vector_index()
        if self.vector_index is not None:
            self.vector_index.add(embedding_array)
            self.vector_mapping.append(metadata)
            await self.save_vector_index()
        else:
            print("Failed to initialize vector index")
            
    
    async def semantic_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        from config.embeddings import get_embedding
        
        if not self.vector_index or len(self.vector_mapping) == 0:
            print("Vector index is empty")
            return []
        query_embedding = await get_embedding(query)
        query_array = np.array([query_embedding], dtype=np.float32)
            
        # Perform search
        scores, indices = self.vector_index.search(query_array, top_k)
            
        results = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx < len(self.vector_mapping):
                result = self.vector_mapping[idx].copy()
                result['score'] = float(score)
                result['rank'] = i + 1
                results.append(result)
            
        return results
        
    async def get_products_for_indexing(self) -> List[Dict[str, Any]]:
        if self.db is None:
            raise Exception("Database connection is not established")
        products = await self.db.products.find({}).to_list(length=None)
        return products

    async def get_orders_for_indexing(self) -> List[Dict[str, Any]]:
        if self.db is None:
            raise Exception("Database connection is not established")
        orders = await self.db.orders.find({}).to_list(length=None)
        return orders
    
    async def get_users_for_indexing(self) -> List[Dict[str, Any]]:
        if self.db is None:
            raise Exception("Database connection is not established")
        users = await self.db.users.find({}).to_list(length=None)
        return users
    
    def _get_current_timestamp(self):
        from datetime import datetime
        return datetime.isoformat(datetime.now())
    
db_manager = DatabaseManager() 