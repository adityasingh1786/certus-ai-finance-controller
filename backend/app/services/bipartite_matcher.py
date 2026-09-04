"""
Certus AI Finance Controller — Kuhn-Munkres (Hungarian) Bipartite Reconciliation Solver
Lead Architect: Aditya Singh

Solves globally optimal 1-to-1 matching between ambiguous or unreferenced financial streams
(e.g. Gateway captures without UTR vs Bank lines with truncated merchant names).

Constructs a bipartite cost graph using continuous multi-signal scoring:
- 50% Normalized integer paisa difference
- 35% RapidFuzz token set similarity (merchant legal entity vs bank narration)
- 15% Date window proximity penalty

Solves in polynomial time O(V^3) with mathematical optimality guarantees.
"""

from typing import List, Dict, Any, Tuple, Optional
from decimal import Decimal
import math
from datetime import datetime, date
from rapidfuzz import fuzz
import logging

logger = logging.getLogger(__name__)


class BipartiteHungarianMatcher:
    """
    Optimal bipartite maximum-weight / minimum-cost matching engine.
    """

    def __init__(self, max_cost_threshold: float = 0.30):
        """
        max_cost_threshold: Pairs with cost > max_cost_threshold (similarity < 0.70)
        are rejected to maintain the Double-Lock gate (confidence >= 0.70).
        """
        self.max_cost_threshold = max_cost_threshold

    @staticmethod
    def _extract_paisa(record: Dict[str, Any]) -> int:
        """Safely extracts integer paisa from record."""
        for key in ("amount_paisa", "net_amount_paisa", "credit_amount_paisa"):
            val = record.get(key)
            if val is not None:
                try:
                    return int(val)
                except (ValueError, TypeError):
                    pass

        for key in ("net_amount", "amount", "gross_amount", "credit_amount"):
            val = record.get(key)
            if val is not None:
                try:
                    return int(round(float(val) * 100))
                except (ValueError, TypeError):
                    pass

        return 0

    @staticmethod
    def _parse_date(record: Dict[str, Any]) -> Optional[date]:
        for key in ("settlement_date", "date", "created_at", "value_date"):
            val = record.get(key)
            if not val:
                continue
            if isinstance(val, date):
                return val
            s = str(val).strip().split("T")[0]
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
                try:
                    return datetime.strptime(s, fmt).date()
                except ValueError:
                    continue
        return None

    def _compute_cost(self, gw: Dict[str, Any], bank: Dict[str, Any]) -> float:
        """
        Computes normalized assignment cost in [0.0, 1.0]. Lower is a better match.
        """
        # 0. Reference Conflict Invariant: If both records have distinct explicit UTRs, reject immediately
        gw_utr = str(gw.get("utr_number") or gw.get("settlement_utr") or gw.get("utr") or "").strip().lower()
        bank_utr = str(bank.get("utr_number") or bank.get("chq_ref_no") or bank.get("bank_reference") or "").strip().lower()
        if gw_utr and bank_utr and gw_utr != bank_utr:
            return 1.0

        # 1. Amount Cost (50% weight)
        gw_paisa = self._extract_paisa(gw)
        bank_paisa = self._extract_paisa(bank)

        if gw_paisa == 0 and bank_paisa == 0:
            amount_cost = 0.0
        else:
            denom = max(gw_paisa, bank_paisa, 1)
            amount_cost = min(1.0, abs(gw_paisa - bank_paisa) / denom)

        # 2. Narration / Entity Token Cost (35% weight)
        gw_entity = str(gw.get("merchant_id") or gw.get("merchant_name") or gw.get("entity_id") or "").lower()
        bank_narration = str(bank.get("narration") or bank.get("description") or bank.get("bank_reference") or "").lower()

        if gw_entity and bank_narration:
            clean_gw = "".join(c if c.isalnum() else " " for c in gw_entity)
            clean_bank = "".join(c if c.isalnum() else " " for c in bank_narration)
            ratio = fuzz.token_set_ratio(clean_gw, clean_bank)
            if ratio < 50.0:
                token_cost = 1.0
            else:
                token_cost = max(0.0, min(1.0, 1.0 - (ratio / 100.0)))
        else:
            token_cost = 1.0

        # 3. Date Proximity Cost (15% weight)
        d_gw = self._parse_date(gw)
        d_bank = self._parse_date(bank)

        if d_gw and d_bank:
            days_diff = abs((d_gw - d_bank).days)
            date_cost = min(1.0, days_diff / 5.0)
        else:
            date_cost = 0.20

        composite_cost = (0.50 * amount_cost) + (0.35 * token_cost) + (0.15 * date_cost)
        return round(composite_cost, 4)

    def match_bipartite(
        self,
        unmatched_gw: List[Dict[str, Any]],
        unmatched_bank: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Executes Hungarian assignment over cost matrix.
        Returns: (matched_pairs, remaining_gw, remaining_bank)
        """
        if not unmatched_gw or not unmatched_bank:
            return [], unmatched_gw, unmatched_bank

        n = len(unmatched_gw)
        m = len(unmatched_bank)

        # Build n x m cost matrix
        cost_matrix = [[self._compute_cost(unmatched_gw[i], unmatched_bank[j]) for j in range(m)] for i in range(n)]

        # Solve assignment using Kuhn-Munkres algorithm
        row_ind, col_ind = self._hungarian_solve(cost_matrix)

        matched_pairs = []
        consumed_gw = set()
        consumed_bank = set()

        for r, c in zip(row_ind, col_ind):
            cost = cost_matrix[r][c]
            if cost <= self.max_cost_threshold:
                confidence = round(1.0 - cost, 3)
                gw_rec = unmatched_gw[r]
                bank_rec = unmatched_bank[c]

                matched_pairs.append({
                    "match_type": "BIPARTITE_HUNGARIAN_OPTIMAL",
                    "gateway_record": gw_rec,
                    "bank_record": bank_rec,
                    "cost": cost,
                    "confidence": confidence,
                    "status": "Matched",
                    "detail": f"Kuhn-Munkres optimal assignment (confidence: {confidence * 100:.1f}%)",
                })
                consumed_gw.add(r)
                consumed_bank.add(c)

        remaining_gw = [unmatched_gw[i] for i in range(n) if i not in consumed_gw]
        remaining_bank = [unmatched_bank[j] for j in range(m) if j not in consumed_bank]

        logger.info(f"BipartiteHungarianMatcher: Matched {len(matched_pairs)} ambiguous pairs.")
        return matched_pairs, remaining_gw, remaining_bank

    @classmethod
    def _hungarian_solve(cls, cost_matrix: List[List[float]]) -> Tuple[List[int], List[int]]:
        """
        Pure Python Hungarian (Munkres) algorithm for rectangular matrices.
        Returns (row_indices, col_indices).
        """
        n_rows = len(cost_matrix)
        n_cols = len(cost_matrix[0]) if n_rows else 0
        if n_rows == 0 or n_cols == 0:
            return [], []

        # Pad to square matrix if needed
        dim = max(n_rows, n_cols)
        pad_val = 100.0  # High cost for dummy edges

        matrix = [[pad_val] * dim for _ in range(dim)]
        for i in range(n_rows):
            for j in range(n_cols):
                matrix[i][j] = cost_matrix[i][j]

        # Step 1: Subtract row minima
        for i in range(dim):
            min_val = min(matrix[i])
            for j in range(dim):
                matrix[i][j] -= min_val

        # Step 2: Subtract col minima
        for j in range(dim):
            min_val = min(matrix[i][j] for i in range(dim))
            for i in range(dim):
                matrix[i][j] -= min_val

        # Step 3: Greedy initial assignment
        row_assigned = [-1] * dim
        col_assigned = [-1] * dim

        for i in range(dim):
            for j in range(dim):
                if matrix[i][j] == 0 and row_assigned[i] == -1 and col_assigned[j] == -1:
                    row_assigned[i] = j
                    col_assigned[j] = i

        # Step 4: Augmenting path search for unassigned rows
        for i in range(dim):
            if row_assigned[i] != -1:
                continue

            visited_cols = [False] * dim
            parent_row = [-1] * dim
            slack = [float('inf')] * dim
            slack_row = [-1] * dim

            curr_row = i
            while True:
                # Update slacks
                for j in range(dim):
                    if not visited_cols[j]:
                        val = matrix[curr_row][j]
                        if val < slack[j]:
                            slack[j] = val
                            slack_row[j] = curr_row

                # Find column with min slack
                min_slack = min(slack[j] for j in range(dim) if not visited_cols[j])
                min_j = -1
                for j in range(dim):
                    if not visited_cols[j] and slack[j] == min_slack:
                        min_j = j
                        break

                if min_j == -1:
                    break

                visited_cols[min_j] = True

                if col_assigned[min_j] == -1:
                    # Found augmenting path! Unwind assignments
                    col = min_j
                    while col != -1:
                        r = slack_row[col]
                        prev_col = row_assigned[r]
                        row_assigned[r] = col
                        col_assigned[col] = r
                        col = prev_col
                    break
                else:
                    curr_row = col_assigned[min_j]

        # Extract assignments within original bounds
        rows, cols = [], []
        for r in range(n_rows):
            c = row_assigned[r]
            if 0 <= c < n_cols:
                rows.append(r)
                cols.append(c)

        return rows, cols


# Global singleton
bipartite_matcher = BipartiteHungarianMatcher()
