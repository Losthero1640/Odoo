import asyncio
from typing import List, Dict, Any
from config.database import db_manager
from config.embeddings import get_embeddings_batch, get_embedding
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorIndexer:
    def __init__(self):
        self.db_manager = db_manager
    
    async def index_products(self) -> Dict[str, Any]:
        """Index all products for semantic search"""
        try:
            products = await self.db_manager.get_products_for_indexing()
            indexed_count = 0
            
            # Prepare texts for batch processing
            texts = []
            metadata_list = []
            
            for product in products:
                # Create text representation for embedding
                text_content = f"{product.get('name', '')} {product.get('description', '')} {product.get('category', '')} {product.get('brand', '')} {product.get('material', '')} {' '.join(product.get('tags', []))}"
                
                # Create metadata
                metadata = {
                    'type': 'product',
                    'id': str(product['_id']),
                    'name': product.get('name', ''),
                    'category': product.get('category', ''),
                    'brand': product.get('brand', ''),
                    'price': product.get('price', 0),
                    'gender': product.get('gender', ''),
                    'collections': product.get('collections', []),
                    'sizes': product.get('sizes', []),
                    'colors': product.get('colors', []),
                    'is_featured': product.get('isFeatured', False),
                    'is_published': product.get('isPublished', True),
                    'content': text_content
                }
                
                texts.append(text_content)
                metadata_list.append(metadata)
            
            # Get embeddings in batch
            if texts:
                embeddings = await get_embeddings_batch(texts)
                
                # Add to vector index
                for embedding, metadata in zip(embeddings, metadata_list):
                    await self.db_manager.add_to_vector_index(embedding, metadata)
                    indexed_count += 1
            
            logger.info(f"Indexed {indexed_count} products")
            return {
                'status': 'success',
                'indexed_count': indexed_count,
                'data_type': 'products'
            }
        except Exception as e:
            logger.error(f"Error indexing products: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data_type': 'products'
            }
    
    async def index_orders(self) -> Dict[str, Any]:
        """Index all orders for semantic search"""
        try:
            orders = await self.db_manager.get_orders_for_indexing()
            indexed_count = 0
            
            # Prepare texts for batch processing
            texts = []
            metadata_list = []
            
            for order in orders:
                # Create text representation for embedding
                items_text = ' '.join([f"{item.get('name', '')} {item.get('size', '')} {item.get('color', '')}" for item in order.get('orderItems', [])])
                text_content = f"Order {order.get('orderNumber', '')} {order.get('status', '')} {order.get('shippingAddress', {}).get('address', '')} {items_text}"
                
                # Create metadata
                metadata = {
                    'type': 'order',
                    'id': str(order['_id']),
                    'order_number': order.get('orderNumber', ''),
                    'status': order.get('status', ''),
                    'total_price': order.get('totalPrice', 0),
                    'user_id': str(order.get('user', '')),
                    'items_count': len(order.get('orderItems', [])),
                    'created_at': order.get('createdAt', ''),
                    'content': text_content
                }
                
                texts.append(text_content)
                metadata_list.append(metadata)
            
            # Get embeddings in batch
            if texts:
                embeddings = await get_embeddings_batch(texts)
                
                # Add to vector index
                for embedding, metadata in zip(embeddings, metadata_list):
                    await self.db_manager.add_to_vector_index(embedding, metadata)
                    indexed_count += 1
            
            logger.info(f"Indexed {indexed_count} orders")
            return {
                'status': 'success',
                'indexed_count': indexed_count,
                'data_type': 'orders'
            }
        except Exception as e:
            logger.error(f"Error indexing orders: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data_type': 'orders'
            }
    
    async def index_users(self) -> Dict[str, Any]:
        """Index all users for semantic search"""
        try:
            users = await self.db_manager.get_users_for_indexing()
            indexed_count = 0
            
            # Prepare texts for batch processing
            texts = []
            metadata_list = []
            
            for user in users:
                # Create text representation for embedding
                text_content = f"{user.get('name', '')} {user.get('email', '')} {user.get('role', '')}"
                
                # Create metadata
                metadata = {
                    'type': 'user',
                    'id': str(user['_id']),
                    'name': user.get('name', ''),
                    'email': user.get('email', ''),
                    'role': user.get('role', 'user'),
                    'is_admin': user.get('role') == 'admin',
                    'content': text_content
                }
                
                texts.append(text_content)
                metadata_list.append(metadata)
            
            # Get embeddings in batch
            if texts:
                embeddings = await get_embeddings_batch(texts)
                
                # Add to vector index
                for embedding, metadata in zip(embeddings, metadata_list):
                    await self.db_manager.add_to_vector_index(embedding, metadata)
                    indexed_count += 1
            
            logger.info(f"Indexed {indexed_count} users")
            return {
                'status': 'success',
                'indexed_count': indexed_count,
                'data_type': 'users'
            }
        except Exception as e:
            logger.error(f"Error indexing users: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data_type': 'users'
            }
    
    async def index_specific_product(self, product_id: str) -> Dict[str, Any]:
        """Index a specific product"""
        try:
            product = await self.db_manager.db.products.find_one({'_id': product_id})
            if not product:
                return {
                    'status': 'error',
                    'error': 'Product not found',
                    'data_type': 'product'
                }
            
            # Create text representation for embedding
            text_content = f"{product.get('name', '')} {product.get('description', '')} {product.get('category', '')} {product.get('brand', '')} {product.get('material', '')} {' '.join(product.get('tags', []))}"
            
            # Create metadata
            metadata = {
                'type': 'product',
                'id': str(product['_id']),
                'name': product.get('name', ''),
                'category': product.get('category', ''),
                'brand': product.get('brand', ''),
                'price': product.get('price', 0),
                'gender': product.get('gender', ''),
                'collections': product.get('collections', []),
                'sizes': product.get('sizes', []),
                'colors': product.get('colors', []),
                'is_featured': product.get('isFeatured', False),
                'is_published': product.get('isPublished', True),
                'content': text_content
            }
            
            # Get embedding
            embedding = await get_embedding(text_content)
            await self.db_manager.add_to_vector_index(embedding, metadata)
            
            logger.info(f"Indexed product: {product.get('name', '')}")
            return {
                'status': 'success',
                'indexed_count': 1,
                'data_type': 'product',
                'product_name': product.get('name', '')
            }
        except Exception as e:
            logger.error(f"Error indexing product {product_id}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data_type': 'product'
            }
    
    async def index_specific_order(self, order_id: str) -> Dict[str, Any]:
        """Index a specific order"""
        try:
            order = await self.db_manager.db.orders.find_one({'_id': order_id})
            if not order:
                return {
                    'status': 'error',
                    'error': 'Order not found',
                    'data_type': 'order'
                }
            
            # Create text representation for embedding
            items_text = ' '.join([f"{item.get('name', '')} {item.get('size', '')} {item.get('color', '')}" for item in order.get('orderItems', [])])
            text_content = f"Order {order.get('orderNumber', '')} {order.get('status', '')} {order.get('shippingAddress', {}).get('address', '')} {items_text}"
            
            # Create metadata
            metadata = {
                'type': 'order',
                'id': str(order['_id']),
                'order_number': order.get('orderNumber', ''),
                'status': order.get('status', ''),
                'total_price': order.get('totalPrice', 0),
                'user_id': str(order.get('user', '')),
                'items_count': len(order.get('orderItems', [])),
                'created_at': order.get('createdAt', ''),
                'content': text_content
            }
            
            # Get embedding
            embedding = await get_embedding(text_content)
            await self.db_manager.add_to_vector_index(embedding, metadata)
            
            logger.info(f"Indexed order: {order.get('orderNumber', '')}")
            return {
                'status': 'success',
                'indexed_count': 1,
                'data_type': 'order',
                'order_number': order.get('orderNumber', '')
            }
        except Exception as e:
            logger.error(f"Error indexing order {order_id}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'data_type': 'order'
            }
    
    async def full_reindex(self) -> Dict[str, Any]:
        """Perform full reindex of all data"""
        try:
            logger.info("Starting full reindex...")
            
            # Clear existing index
            await self.db_manager.save_vector_index()
            
            # Index all data types
            results = {}
            
            # Index products
            product_result = await self.index_products()
            results['products'] = product_result
            
            # Index orders
            order_result = await self.index_orders()
            results['orders'] = order_result
            
            # Index users
            user_result = await self.index_users()
            results['users'] = user_result
            
            # Calculate totals
            total_indexed = sum(
                result.get('indexed_count', 0) 
                for result in results.values() 
                if result.get('status') == 'success'
            )
            
            logger.info(f"Full reindex completed. Total indexed: {total_indexed}")
            
            return {
                'status': 'success',
                'total_indexed': total_indexed,
                'results': results
            }
        except Exception as e:
            logger.error(f"Error during full reindex: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector index"""
        try:
            if not self.db_manager.vector_index:
                return {
                    'status': 'error',
                    'error': 'Vector index not initialized'
                }
            
            total_vectors = self.db_manager.vector_index.ntotal
            dimension = self.db_manager.vector_dimension
            
            # Get counts by type
            type_counts = {}
            for metadata in self.db_manager.vector_mapping:
                data_type = metadata.get('type', 'unknown')
                type_counts[data_type] = type_counts.get(data_type, 0) + 1
            
            return {
                'status': 'success',
                'total_vectors': total_vectors,
                'dimension': dimension,
                'type_counts': type_counts,
                'index_size_mb': total_vectors * dimension * 4 / (1024 * 1024),  # Approximate size in MB
                'embedding_method': 'sentence_transformers'
            }
        except Exception as e:
            logger.error(f"Error getting index stats: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }

# Global vector indexer instance
vector_indexer = VectorIndexer() 