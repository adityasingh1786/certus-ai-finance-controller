import uvicorn
import sys
import os

if __name__ == "__main__":
    # Ensure current directory is on sys.path
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
