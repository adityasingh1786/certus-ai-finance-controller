# Certus AI Finance Controller — Developer Automation Makefile

.PHONY: help dev test bench lint seed build clean

PYTHON ?= python
NPM ?= npm

help:  ## Show available developer targets
	@echo "================================================================"
	@echo "  Certus AI Finance Controller — Developer Automation CLI"
	@echo "================================================================"
	@echo "  make dev      - Run Backend (FastAPI) and Frontend (Vite)"
	@echo "  make test     - Run backend pytest test suite"
	@echo "  make bench    - Run live reconciliation throughput benchmark"
	@echo "  make seed     - Seed SQLite WAL database with scenarios"
	@echo "  make build    - Build production frontend assets"
	@echo "  make clean    - Clean temporary bytecode and build caches"
	@echo "================================================================"

dev:  ## Run full-stack application
	$(PYTHON) run.py

test:  ## Run backend unit and invariant tests
	cd backend && $(PYTHON) -m pytest tests/ -v

bench:  ## Run live reconciliation throughput benchmark
	cd backend && $(PYTHON) benchmarks/benchmark_reconciler.py

seed:  ## Seed SQLite WAL database with 20 scenarios
	cd backend && $(PYTHON) -c "from app.services.dataset_registry import init_db; init_db()"

build:  ## Build production frontend bundle
	cd frontend && $(NPM) run build

clean:  ## Clean temporary artifacts
	rm -rf backend/__pycache__ backend/app/**/__pycache__ frontend/dist
