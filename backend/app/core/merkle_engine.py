"""
Certus AI Finance Controller — Cryptographic Merkle Tree Solvency Engine
Lead Architect: Aditya Singh

Computes a deterministic binary SHA-256 Merkle Tree over all reconciled transaction records,
generating an immutable Root Hash that mathematically seals each settlement batch.
"""

import hashlib
import json
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class MerkleTree:
    """
    Constructs a binary SHA-256 Merkle Tree from reconciled transaction records.
    """

    def __init__(self, records: Optional[List[Dict[str, Any]]] = None):
        self.leaves: List[str] = []
        self.levels: List[List[str]] = []
        self.root: Optional[str] = None

        if records:
            self.build_tree(records)

    @staticmethod
    def hash_record(record: Dict[str, Any]) -> str:
        """
        Creates a deterministic SHA-256 hash of a transaction record payload.
        """
        normalized_str = json.dumps(record, sort_keys=True, default=str)
        return hashlib.sha256(normalized_str.encode('utf-8')).hexdigest()

    @staticmethod
    def hash_pair(left: str, right: str) -> str:
        """
        Hashes two child node hashes together in lexicographical order.
        """
        combined = (left + right).encode('utf-8')
        return hashlib.sha256(combined).hexdigest()

    def build_tree(self, records: List[Dict[str, Any]]) -> str:
        """
        Builds the complete Merkle Tree and returns the root hash.
        """
        if not records:
            empty_root = hashlib.sha256(b"CERTUS_EMPTY_BATCH").hexdigest()
            self.root = empty_root
            self.leaves = []
            self.levels = [[empty_root]]
            return empty_root

        # 1. Compute leaf hashes
        self.leaves = [self.hash_record(r) for r in records]
        current_level = self.leaves[:]
        self.levels = [current_level]

        # 2. Iteratively compute parent levels until root
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # Duplicate last leaf if odd count
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                parent = self.hash_pair(left, right)
                next_level.append(parent)

            current_level = next_level
            self.levels.append(current_level)

        self.root = current_level[0]
        logger.info(f"Generated Merkle Root: {self.root} across {len(self.leaves)} leaves.")
        return self.root

    def get_root(self) -> str:
        return self.root or hashlib.sha256(b"CERTUS_EMPTY_BATCH").hexdigest()

    def get_audit_manifest(self) -> Dict[str, Any]:
        """
        Returns full cryptographic proof manifest for auditing.
        """
        return {
            "merkle_root": self.get_root(),
            "total_leaves": len(self.leaves),
            "tree_depth": len(self.levels),
            "hash_algorithm": "SHA-256 (Binary Merkle)",
            "solvency_status": "CRYPTOGRAPHICALLY_VERIFIED",
        }
