import asyncio
import os
import sys
from pathlib import Path

# Add backend root to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.agent.llm_client import UnifiedLLMClient


async def test_llm():
    client = UnifiedLLMClient()
    print("Testing live LLM generation with configured keys...")
    res = await client.generate_response(
        prompt="Explain what a 3-way financial reconciliation is in one brief sentence.",
        preferred_provider="auto",
    )
    print(f"Active Provider : {res.get('provider')}")
    print(f"Confidence      : {res.get('confidence')}")
    print(f"Confidence Src  : {res.get('confidence_source')}")
    # Encode cleanly for Windows terminal
    text = str(res.get('content', '')).encode('ascii', 'ignore').decode('ascii')
    print(f"Response Text   : {text[:200]}")


if __name__ == "__main__":
    asyncio.run(test_llm())
