# Odoo
# AI Assistant System with Gemini API Integration

A comprehensive AI assistant system for the clothing brand, featuring semantic search, chat functionality, and notification services using Google's Gemini API and sentence transformers for embeddings.

## 🚀 Features

- **Semantic Search**: Advanced vector-based search using FAISS and sentence transformers
- **AI Chat**: Intelligent conversations using Google's Gemini API with RAG (Retrieval-Augmented Generation)
- **Vector Database**: MongoDB-based vector storage with FAISS indexing
- **Notification System**: Multi-channel notifications (in-app, email, SMS)
- **Background Processing**: Celery-based task queue for async operations
- **RESTful API**: FastAPI endpoints for easy integration

## 🏗️ Architecture

```
AI Assistant System
├── RAG Engine (rag.py)
│   ├── Gemini API Integration
│   ├── Sentence Transformers Embeddings
│   └── Context Retrieval
├── Vector Database
│   ├── FAISS Index
│   ├── MongoDB Storage
│   └── Semantic Search
├── Chat Service
│   ├── Message Processing
│   ├── Conversation History
│   └── Response Generation
├── Notification Service
│   ├── Multi-channel Delivery
│   ├── Priority Management
│   └── Background Processing
└── API Layer
    ├── FastAPI Endpoints
    ├── WebSocket Support
    └── Integration Hooks
```

## 📋 Prerequisites

- Python 3.8+
- MongoDB 4.4+
- Redis (for Celery)
- Google API Key (for Gemini)

## 🛠️ Installation

1. **Clone and navigate to the AI assistant directory:**
   ```bash
   cd ai_assistant
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Configure your environment variables:**
   ```env
   # Database Configuration
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=clothing_brand
   
   # Google Gemini API Configuration
   GOOGLE_API_KEY=your_google_api_key_here
   
   # Embedding Model Configuration
   EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   
   # Redis Configuration (for Celery)
   REDIS_URL=redis://localhost:6379
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   ```

## 🔑 Getting Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file as `GOOGLE_API_KEY`

## 🚀 Quick Start

1. **Start the AI Assistant server:**
   ```bash
   python run.py
   ```

2. **Start Celery worker (in a new terminal):**
   ```bash
   celery -A ai_assistant.tasks.celery_tasks worker --loglevel=info
   ```

3. **Test the system:**
   ```bash
   python test_system.py
   ```

4. **Run examples:**
   ```bash
   python example_usage.py
   ```

## 📚 API Endpoints

### Chat Endpoints
- `POST /chat` - Send a message and get AI response
- `GET /chat/history/{session_id}` - Get conversation history
- `GET /chat/sessions/{user_id}` - Get user's chat sessions

### Search Endpoints
- `GET /search` - Semantic search across indexed content
- `POST /search/advanced` - Advanced search with filters

### Notification Endpoints
- `POST /notifications` - Create a new notification
- `GET /notifications/{user_id}` - Get user's notifications
- `PUT /notifications/{id}/read` - Mark notification as read

### Indexing Endpoints
- `POST /index/products` - Index all products
- `POST /index/orders` - Index all orders
- `POST /index/users` - Index all users
- `POST /index/full` - Full reindex of all data
- `GET /index/stats` - Get indexing statistics

## 🧠 RAG System

The RAG (Retrieval-Augmented Generation) system combines:

1. **Retrieval**: Semantic search using sentence transformers
2. **Generation**: Response generation using Google's Gemini API
3. **Context**: Relevant product and order information
4. **History**: Conversation context for follow-up questions

### Key Components

- **`rag.py`**: Main RAG implementation with Gemini integration
- **Embeddings**: Using `all-MiniLM-L6-v2` for 384-dimensional vectors
- **Vector Index**: FAISS for fast similarity search
- **Context Retrieval**: Top-k relevant documents
- **Response Generation**: Gemini API with structured prompts

## 🔍 Semantic Search

The system provides powerful semantic search capabilities:

- **Product Search**: Find products by description, features, or use case
- **Order Search**: Search through order history and status
- **User Search**: Find users by name, email, or role
- **Hybrid Search**: Combine semantic and keyword search

## 🔔 Notification System

Multi-channel notification delivery:

- **In-App**: Real-time notifications in the web interface
- **Email**: SMTP-based email delivery
- **SMS**: Text message notifications (requires SMS provider)
- **Priority Levels**: High, medium, low priority handling
- **Background Processing**: Celery-based async delivery

## 🔧 Integration with Node.js Backend

The AI assistant integrates seamlessly with your existing Node.js backend:

1. **HTTP Communication**: RESTful API endpoints
2. **Automatic Indexing**: Triggers on data changes
3. **Real-time Updates**: WebSocket support for live updates
4. **Shared Database**: Uses the same MongoDB instance

### Backend Integration Points

- Product creation/updates trigger automatic reindexing
- Order status changes trigger notifications
- User actions can trigger AI assistant responses
- Search queries are routed through the AI assistant

## 📊 Monitoring and Logging

- **Health Checks**: `/health` endpoint for system status
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: API usage and search statistics

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_system.py
```

Tests cover:
- Database connectivity
- Embedding generation
- Gemini API integration
- Vector indexing
- Chat functionality
- Notification system
- Semantic search

## 📈 Performance Optimization

- **Batch Processing**: Efficient embedding generation
- **Caching**: Redis-based response caching
- **Async Operations**: Non-blocking I/O operations
- **Index Optimization**: FAISS index tuning
- **Connection Pooling**: Database connection management

## 🔒 Security

- **API Key Management**: Secure environment variable storage
- **Input Validation**: Pydantic models for data validation
- **Rate Limiting**: Request throttling to prevent abuse
- **Error Handling**: Secure error messages without data leakage

## 🚀 Deployment

### Production Setup

1. **Environment Configuration:**
   ```bash
   # Production environment variables
   MONGODB_URL=mongodb://your-production-mongo
   REDIS_URL=redis://your-production-redis
   GOOGLE_API_KEY=your-production-api-key
   LOG_LEVEL=WARNING
   ```

2. **Process Management:**
   ```bash
   # Start AI Assistant
   python run.py
   
   # Start Celery worker
   celery -A ai_assistant.tasks.celery_tasks worker --loglevel=info
   
   # Start Celery beat (for scheduled tasks)
   celery -A ai_assistant.tasks.celery_tasks beat --loglevel=info
   ```

3. **Monitoring:**
   - Set up health checks
   - Monitor API response times
   - Track error rates
   - Monitor vector index performance

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "run.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Gemini API Errors:**
   - Verify your API key is correct
   - Check API quota limits
   - Ensure proper environment variable setup

2. **Embedding Generation Issues:**
   - Verify sentence-transformers installation
   - Check model download permissions
   - Monitor memory usage

3. **Database Connection Issues:**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure network connectivity

4. **Vector Index Problems:**
   - Rebuild index if corrupted
   - Check disk space for index storage
   - Monitor index performance

### Getting Help

- Check the logs for detailed error messages
- Run the test suite to identify issues
- Review the example usage for correct implementation
- Ensure all dependencies are properly installed

## 🎯 Next Steps

1. **Customize Prompts**: Modify RAG prompts for your specific use case
2. **Add More Data Sources**: Integrate additional content for better responses
3. **Implement Analytics**: Add usage tracking and performance metrics
4. **Enhance UI**: Create a chat interface for the AI assistant
5. **Scale Up**: Implement clustering for high-traffic scenarios

---

**Built with ❤️ for the Odoo Hackathon** 

Problem Statement 3
ReWear- Communitiy Clothing Exchange

Pattanaik Ayushman ALok - ayushmanpattanaik001@gmail.com
Bishal Kumar Hota - biahalhota264@gmail.com
Jupalli Ved Aditya - vedadityajupalli10@gmail.com
Anshuman Panda - anshumancse201@gmail.com
