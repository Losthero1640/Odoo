from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import logging
from config.database import db_manager

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
gemini = genai.GenerativeModel('gemini-pro')

CACHE_TTL = 3600

class RAGService:
    def __init__(self):
        self.db_manager = db_manager
        self.model = model
        self.gemini = gemini
    
    def create_embedding(self, text: str) -> List[float]:
       # embedding using sentence transformers
        return self.model.encode(text).tolist()
    
    def create_prompt(self, query: str, context: List[Dict[str, Any]], conversation_history: List[Dict[str, Any]] = None) -> str:
        # context and conversation history

        def sanitize_text(text: str) -> str:
            return text.replace("\n", " ").replace("\r", " ").strip()
        
        query = sanitize_text(query)
        history_context = ""
        if conversation_history:
            history_context = "\nPrevious conversation context:\n" + "\n".join(
                f"User: {msg['content']}\nAssistant: {msg['response']}"
                for msg in conversation_history[-3:]
            )
        
        context_json = json.dumps([
            {k: sanitize_text(str(v)) for k, v in item.items() if k in ['name', 'description', 'category', 'brand', 'price', 'gender', 'collections', 'sizes', 'colors', 'material', 'content']}
            for item in context
        ], indent=2)

        return f"""You are an expert fashion consultant and customer service representative for a premium clothing brand. Your role is to provide helpful, accurate, and engaging responses about our products, policies, and services.

{history_context}
Available Product Information:
{context_json}
User Question: {query}

Guidelines for your response:
1. Focus on helping customers find the right products for their needs
2. Provide accurate information about product features, materials, and sizing
3. Explain our policies (shipping, returns, sizing) clearly
4. If the context doesn't provide enough information, acknowledge this and provide general guidance
5. Keep the response helpful and informative
6. Include relevant product recommendations when appropriate
7. Maintain a professional yet friendly tone
8. If this is a follow-up question, maintain context from the previous conversation
9. If the question is unclear, ask for clarification
10. Always prioritize customer satisfaction and provide actionable advice

Please provide a comprehensive and helpful response:"""
    
    async def generate_response(self, query: str, context: List[Dict[str, Any]], conversation_history: List[Dict[str, Any]] = None) -> str:
        prompt = self.create_prompt(query, context, conversation_history)
        
        try:
            response = await self.gemini.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            # Fallback response
            return "I'm having trouble processing your request right now. Please try again later or contact our customer support team for assistance."
    
    async def get_relevant_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        try:
            query_embedding = self.create_embedding(query)
            results = await self.db_manager.semantic_search(query, top_k)
            return results
        except Exception as e:
            logger.error(f"Error getting context: {e}")
            return []
    
    async def process_chat_message(self, query: str, user_id: str, session_id: str = None) -> Dict[str, Any]:
        try:
            context = await self.get_relevant_context(query, top_k=3)
            conversation_history = []
            response_text = await self.generate_response(query, context, conversation_history)
            chat_session = {
                'session_id': session_id or f"session_{user_id}_{int(datetime.now().timestamp())}",
                'user_id': user_id,
                'messages': [
                    {
                        'role': 'user',
                        'content': query,
                        'timestamp': datetime.now()
                    },
                    {
                        'role': 'assistant',
                        'content': response_text,
                        'timestamp': datetime.now()
                    }
                ],
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Save to db
            if self.db_manager.db is not None:
                await self.db_manager.db.chat_sessions.update_one(
                    {'session_id': chat_session['session_id']},
                    {'$set': chat_session},
                    upsert=True
                )
            
            return {
                'response': response_text,
                'confidence': 0.9,  
                'sources': context,
                'session_id': chat_session['session_id']
            }
            
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            return {
                'response': "I'm having trouble processing your request right now. Please try again later.",
                'confidence': 0.0,
                'sources': [],
                'session_id': session_id
            }
rag_service = RAGService() 