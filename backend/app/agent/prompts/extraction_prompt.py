"""
AI Finance Controller — Extraction Prompts
Structured few-shot prompt for extracting JSON records from messy, unstructured settlement narrations.
"""

EXTRACTION_SYSTEM_PROMPT = """You are a strict, deterministic financial JSON extraction engine.
Your sole job is to parse messy transaction narrations, bank statements, or ERP strings into structured JSON.
Return ONLY valid JSON with no markdown wrapping, no introductory text, and no commentary.
"""

def build_extraction_prompt(raw_data: dict) -> str:
    return f"""Extract structured settlement fields from this raw record:
Raw Input:
{raw_data}

Required JSON Schema:
{{
  "transaction_id": "string (e.g. txn_...)",
  "merchant_id": "string",
  "merchant_name": "string or null",
  "order_id": "string or null",
  "invoice_number": "string or null",
  "utr_number": "string or null",
  "settlement_date": "YYYY-MM-DD",
  "gross_amount": float,
  "fee": float,
  "tax": float,
  "net_amount": float,
  "currency": "INR",
  "payment_method": "UPI | CARD | NETBANKING | WALLET | BANK_TRANSFER | OTHER",
  "status": "settled | pending | refunded",
  "narration": "cleaned string"
}}
"""
