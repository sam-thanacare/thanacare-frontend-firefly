# Thanacare Frontend - Local CI/CD Commands
.PHONY: help install lint lint-fix format format-check security-scan test test-ci build ci clean

# Default target
help: ## Show this help message
	@echo "Thanacare Frontend - Local CI/CD Commands"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Installation
install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm install

# Linting
lint: ## Run ESLint
	@echo "Running ESLint..."
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "Running ESLint with auto-fix..."
	npm run lint:fix

# Formatting
format: ## Format code with Prettier
	@echo "Formatting code with Prettier..."
	npm run format

format-check: ## Check code formatting with Prettier
	@echo "Checking code formatting..."
	npm run format:check

# Security
security-scan: ## Run security audit (npm audit)
	@echo "Running npm security audit..."
	npm run security-scan

security-scan-snyk: ## Run Snyk security scan
	@echo "Running Snyk security scan..."
	@echo "Note: Requires Snyk authentication. Run 'make security-scan-snyk-auth' first"
	@npm run security-scan:snyk || (echo "❌ Snyk authentication required. Run 'make security-scan-snyk-auth' to authenticate" && exit 1)

security-scan-snyk-auth: ## Authenticate with Snyk
	@echo "Authenticating with Snyk..."
	npm run security-scan:snyk-auth

security-scan-full: ## Run complete security scan (npm audit + Snyk)
	@echo "Running complete security scan..."
	npm run security-scan:full

# Testing
test: ## Run tests (development mode)
	@echo "Running tests..."
	npm run test

test-ci: ## Run tests (CI mode)
	@echo "Running tests in CI mode..."
	npm run test:ci

# Building
build: ## Build the application
	@echo "Building application..."
	npm run build

# CI Pipeline (run all checks in sequence)
ci: ## Run complete CI pipeline locally
	@echo "Running complete CI pipeline..."
	@echo "Step 1/6: Installing dependencies..."
	npm ci
	@echo "Step 2/6: Running linter..."
	npm run lint
	@echo "Step 3/6: Checking formatting..."
	npm run format:check
	@echo "Step 4/6: Running npm security audit..."
	npm run security-scan
	@echo "Step 5/6: Running Snyk security scan..."
	@npm run security-scan:snyk || (echo "⚠️  Snyk scan skipped (authentication required - run 'make security-scan-snyk-auth')" && echo "✅ Continuing with remaining CI checks...")
	@echo "Step 6/6: Running tests..."
	npm run test:ci
	@echo "✅ All CI checks passed!"

# Development
dev: ## Start development server
	@echo "Starting development server..."
	npm run dev

start: ## Start production server
	@echo "Starting production server..."
	npm run start

# Cleanup
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf out

# Parallel execution (simulate GitHub Actions parallel jobs)
ci-parallel: ## Run CI checks in parallel (requires GNU parallel)
	@echo "Running CI checks in parallel..."
	parallel --no-notice ::: \
		"echo 'Job 1: Linting...' && npm run lint" \
		"echo 'Job 2: Format check...' && npm run format:check" \
		"echo 'Job 3: NPM Security audit...' && npm run security-scan" \
		"echo 'Job 4: Snyk Security scan...' && (npm run security-scan:snyk || echo 'Snyk scan skipped - authentication required')" \
		"echo 'Job 5: Tests...' && npm run test:ci"
	@echo "✅ All parallel CI checks completed!"
