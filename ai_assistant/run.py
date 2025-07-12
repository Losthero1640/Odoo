import os
import sys
import asyncio
import uvicorn
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
load_dotenv()

def main():
    try:
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "8000"))
        
        print(f"Starting AI Assistant on {host}:{port}")
        print("Press Ctrl+C to stop the server")
        
        uvicorn.run(
            "ai_assistant.api.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\nShutting down AI Assistant...")
    except Exception as e:
        print(f"Error starting AI Assistant: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 