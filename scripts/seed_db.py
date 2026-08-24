"""
Database Seeding Script — AI Finance Controller
Populates the database with initial mock balances and synthetic records.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.session import init_db
from app.services.ingestion_service import IngestionService


async def seed_database_async():
    print("[INIT] Initializing database schema...")
    init_db()

    data_dir = Path(__file__).resolve().parent.parent / "data" / "synthetic"
    batch_csv = data_dir / "full_batch.csv"

    if not batch_csv.exists():
        print(f"[WARN] Synthetic batch file not found at {batch_csv}")
        return

    print(f"[SEED] Seeding synthetic dataset from {batch_csv}...")
    with open(batch_csv, "rb") as f:
        file_bytes = f.read()

    ingestion_svc = IngestionService()
    res = await ingestion_svc.ingest_file(
        file_content=file_bytes,
        filename="full_batch.csv",
        content_type="text/csv",
    )

    batch_id = res["batch_id"]
    summary = ingestion_svc.get_batch_summary(batch_id)

    print("[SUCCESS] Seeding complete!")
    print(f"   Batch ID: {batch_id}")
    print(f"   Total records: {summary.get('total', 0)}")
    print(f"   Passed records: {summary.get('passed', 0)}")
    print(f"   Quarantined records: {summary.get('quarantined', 0)}")


def main():
    asyncio.run(seed_database_async())


if __name__ == "__main__":
    main()
