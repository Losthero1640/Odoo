import asyncio
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import db_manager
from services.chat_service import chat_service
from services.vector_indexer import vector_indexer
from services.notification_service import notification_service
from services.notification_service import NotificationType, NotificationPriority
from services.rag_service import rag_service

async def example_chat_conversation():
    print("Example Chat Conversation")
    messages = [
        "I'm looking for a marvel spiderman shirt",
        "What sizes do you have?",
        "Is it comfortable for daily wear?",
        "What's your return policy?",
        "Can you recommend something similar?"
    ]
    
    user_id = "example_user_123"
    session_id = "example_session_456"
    
    for i, message in enumerate(messages, 1):
        print(f"\n👤 User {i}: {message}")
        
        # Process message
        response = await chat_service.process_message(message, user_id, session_id)
        
        print(f" Assistant: {response['response']}")
        print(f"   Confidence: {response['confidence']:.2f}")
        print(f"   Sources: {len(response['sources'])} found")
        
        await asyncio.sleep(1)

async def example_semantic_search():
    """Example of semantic search functionality"""
    print("\n Example Semantic Search")
    
    queries = [
        "comfortable cotton shirts",
        "winter jackets for men",
        "blue jeans under $50",
        "formal wear for women",
        "casual summer dresses"
    ]
    
    for query in queries:
        print(f"\nSearching for: '{query}'")
        
        results = await db_manager.semantic_search(query, top_k=3)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"  {i}. {result.get('name', 'Unknown')} (Score: {result.get('score', 0):.3f})")
                print(f"     Type: {result.get('type', 'unknown')}")
                print(f"     Category: {result.get('category', 'N/A')}")
        else:
            print("  No results found")
        
        await asyncio.sleep(0.5)

async def example_vector_indexing():
    """Example of vector indexing functionality"""
    print("\n Example Vector Indexing")
    
    # Get index statistics
    stats = await vector_indexer.get_index_stats()
    
    if stats['status'] == 'success':
        print(f"Total vectors: {stats['total_vectors']}")
        print(f"Dimension: {stats['dimension']}")
        print(f"Index size: {stats['index_size_mb']:.2f} MB")
        print(f"Embedding method: {stats['embedding_method']}")
        
        if stats['type_counts']:
            print("\nData type distribution:")
            for data_type, count in stats['type_counts'].items():
                print(f"  {data_type}: {count}")
    else:
        print(f"Failed to get stats: {stats.get('error', 'Unknown error')}")

async def example_notifications():
    print("\nExample Notifications")
    print("=" * 40)
    
    notification_examples = [
        {
            'type': 'order_update',
            'title': 'Order Shipped',
            'message': 'Your order #12345 has been shipped and is on its way!',
            'recipients': ['user_123'],
            'channels': ['in_app', 'email'],
            'priority': 'high'
        },
        {
            'type': 'product_restock',
            'title': 'Item Back in Stock',
            'message': 'The Blue Cotton T-Shirt is back in stock in your size!',
            'recipients': ['user_123'],
            'channels': ['in_app', 'email'],
            'priority': 'medium'
        },
        {
            'type': 'promotion',
            'title': 'Special Offer',
            'message': 'Get 20% off on all winter jackets this week!',
            'recipients': ['user_123', 'user_456'],
            'channels': ['in_app', 'email', 'sms'],
            'priority': 'low'
        }
    ]
    
    for i, notification_data in enumerate(notification_examples, 1):
        print(f"\nCreating notification {i}: {notification_data['title']}")
        
        result = await notification_service.create_notification(
            title=notification_data['title'],
            message=notification_data['message'],
            recipients=notification_data['recipients'],
            notification_type=NotificationType(notification_data.get('type')) if notification_data.get('type') is not None else NotificationType("order_update"),
            channels=notification_data.get('channels') or [],
            priority=NotificationPriority(notification_data.get('priority')) if notification_data.get('priority') is not None else NotificationPriority("medium")
        )
        
        if result and 'id' in result:
            print(f"   Created notification ID: {result['id']}")
            
            # Get notification details
            notification = await notification_service.get_notification(result['id'])
            if notification:
                print(f"  Status: {notification.get('status', 'unknown')}")
                print(f"  Channels: {', '.join(notification.get('channels', []))}")
        else:
            print(f" Failed to create notification")

async def example_rag_functionality():
    """Example of RAG (Retrieval-Augmented Generation) functionality"""
    print("\nExample RAG Functionality")
    
    # Test RAG with different queries
    rag_queries = [
        "What's the best shirt for my Goa trip?",
        "Tell me about your return policy",
        "I need help with sizing",
        "What are your most popular products?",
        "How long does shipping take?"
    ]
    
    for query in rag_queries:
        print(f"\nQuery: {query}")
        
        # Process with RAG
        response = await rag_service.process_chat_message(query, "rag_test_user", "rag_test_session")
        
        print(f"Response: {response['response'][:200]}...")
        print(f"Confidence: {response['confidence']:.2f}")
        
        if response['sources']:
            print(f"Sources used: {len(response['sources'])}")
            for source in response['sources'][:2]:  # Show first 2 sources
                print(f"  - {source.get('name', 'Unknown')} ({source.get('type', 'unknown')})")
        
        await asyncio.sleep(1)

async def example_embedding_generation():
    """Example of embedding generation"""
    print("\nExample Embedding Generation")
    
    # Test texts
    test_texts = [
        "Blue cotton t-shirt",
        "Winter jacket for men",
        "Comfortable jeans",
        "Summer dress for women",
        "Formal business shirt"
    ]
    
    print("Generating embeddings for product descriptions...")
    
    for text in test_texts:
        embedding = rag_service.create_embedding(text)
        print(f"'{text}': {len(embedding)}-dimensional vector")
        print(f"  First 5 values: {embedding[:5]}")
        print()

async def main():
    """Main example function"""
    print(" AI Assistant System Examples")
    
    
    try:
        # Connect to database
        await db_manager.connect()
        print(" Connected to database")
        
        # Run examples
        await example_chat_conversation()
        await example_semantic_search()
        await example_vector_indexing()
        await example_notifications()
        await example_rag_functionality()
        await example_embedding_generation()
        
        print("\n" + "=" * 50)
        print(" All examples completed successfully!")
        print("=" * 50)
        
    except Exception as e:
        print(f" Error running examples: {e}")
    finally:
        # Cleanup
        await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(main()) 