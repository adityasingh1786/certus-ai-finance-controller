# 📜 Changelog

All notable changes to the **Certus AI Finance Controller** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-25 (Initial Release)

### Added
- **Multi-Source Reconciliation Engine**: Hybrid RapidFuzz token-set matching and 50/30/20 weighted heuristic scoring for Gateway, Bank CMS, and ERP streams.
- **Double-Lock Verification Gate**: Strict consensus validation requiring composite confidence $\ge 0.75$ and adherence to 55 invariant rules.
- **Autonomous Controller Copilot**: Dual-Loop ReAct AI agent with 4-tier structured executive reporting (`⚡ Executive Summary`, `📊 Verified Ledger Evidence`, `🔍 Root-Cause Diagnosis`, `🛠️ Remediation Playbook`).
- **Interactive Spatial UI**: High-density 5-tab financial controller dashboard with interactive quarantine drawer, 3D bento analytics, and Web Audio feedback.
- **Air-Gapped Forensic Fail-Safe**: Deterministic local rule engine providing complete audit reports directly from SQLite WAL without cloud LLM dependencies.
- **Developer Tooling & Benchmarking**: Real-time performance test suite (`benchmarks/benchmark_reconciler.py`), `Makefile`, and `pyproject.toml`.
