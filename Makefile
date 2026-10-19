.PHONY: dev test seed install clean
SHELL := /bin/bash

install:
	cd frontend && npm install --legacy-peer-deps
	./ml-service/venv/bin/pip install -r ml-service/requirements.txt
	./backend/venv/bin/pip install -r backend/requirements.txt

seed:
	./backend/venv/bin/python backend/seed_demo.py

test:
	@echo "=== Testing ML Service ==="
	cd ml-service && ./venv/bin/pytest tests/ -v
	@echo "=== Testing Core Backend ==="
	./backend/venv/bin/pytest backend/tests/ -v
	@echo "=== Testing Frontend UI ==="
	cd frontend && npm test

build:
	cd frontend && npm run build

dev:
	@echo "Starting full platform: frontend (:3000), backend (:9000), ml-service (:8000)..."
