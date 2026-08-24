"""
Tool: search_transaction_history
Read-only tool that performs fuzzy and semantic search over transaction narrations and metadata.
"""

from typing import Any, Dict, List
from rapidfuzz import fuzz

def search_transaction_history_tool(
    ingestion_service,
    query: str,
    limit: int = 10,
) -> Dict[str, Any]:
    """
    Searches both settled records and quarantine logs using fuzzy narration matching.
    """
    if not ingestion_service or not query:
        return {"query": query, "total_matches": 0, "results": [], "cited_record_ids": []}

    all_records = ingestion_service.get_all_records()
    quarantine_records = ingestion_service.get_quarantine_records()

    matches = []
    q_lower = query.lower()

    # Search in verified settlement records
    for r in all_records:
        narration = str(r.get("narration") or "").lower()
        merchant = str(r.get("merchant_name") or r.get("merchant_id") or "").lower()
        txn_id = str(r.get("transaction_id") or "").lower()
        order_id = str(r.get("order_id") or "").lower()

        score = max(
            fuzz.partial_ratio(q_lower, narration),
            fuzz.partial_ratio(q_lower, merchant),
            fuzz.partial_ratio(q_lower, txn_id),
            fuzz.partial_ratio(q_lower, order_id),
        )

        if score >= 60 or q_lower in narration or q_lower in merchant or q_lower in txn_id:
            matches.append({
                "record_type": "settled",
                "transaction_id": r.get("transaction_id"),
                "merchant": r.get("merchant_name") or r.get("merchant_id"),
                "net_amount": str(r.get("net_amount")),
                "date": str(r.get("settlement_date")),
                "status": r.get("status"),
                "narration": r.get("narration"),
                "match_score": score,
            })

    # Search in quarantine records
    for q in quarantine_records:
        reason = str(q.get("reason_detail") or q.get("reason_code") or "").lower()
        raw = str(q.get("raw_record_json") or "").lower()
        cid = q.get("transaction_id") or q.get("record_id")

        if fuzz.partial_ratio(q_lower, reason) >= 60 or q_lower in reason or q_lower in raw:
            matches.append({
                "record_type": "quarantined",
                "transaction_id": cid,
                "reason_code": q.get("reason_code"),
                "reason_detail": q.get("reason_detail"),
                "flagged_by": q.get("flagged_by"),
                "is_resolved": q.get("is_resolved", False),
                "match_score": 75,
            })

    # Sort by match score descending
    matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    top_matches = matches[:limit]
    cited_ids = [m["transaction_id"] for m in top_matches if m.get("transaction_id")]

    return {
        "query": query,
        "total_matches": len(matches),
        "results": top_matches,
        "cited_record_ids": list(dict.fromkeys(cited_ids)),
    }
