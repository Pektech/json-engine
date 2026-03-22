# Contributing to JSON.engine

Thank you for your interest in contributing! This document provides guidelines for development setup, coding standards, and the PR process.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Install Playwright: `npx playwright install`
4. Start dev server: `npm run dev`
5. Run tests: `npm test`

## Coding Standards

### TypeScript
- Use strict mode
- Explicit types for function parameters and returns
- No `any` — use `unknown` or proper types
- Interface naming: PascalCase

### React Components
- Function components with arrow functions
- Props interface named `{ComponentName}Props`
- Named exports for reusable components

### Design Tokens
- Use Tailwind classes from design system
- NO 1px solid borders for layout (use background shifts)
- Follow the "no-line" rule

See `.planning/codebase/CONVENTIONS.md` for complete conventions.

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Add tests for new functionality
4. Run the security audit: `npm run security:check`
5. Ensure all tests pass: `npm test && npm run test:e2e`
6. Update CHANGELOG.md with your changes
7. Submit PR with clear description

## Security

- Never commit secrets or tokens
- Security audits run automatically on PRs
- Tokens must be memory-only (no localStorage)

## Questions?

Open an issue for discussion before major changes.