# JSON.engine

A visual JSON editor for OpenClaw configuration management. Edit complex JSON configurations with immediate visual feedback and validation.

## Features

- **Visual Node Canvas**: See your JSON structure as an interactive graph
- **Code Editor**: Full Monaco Editor integration with syntax highlighting
- **Bidirectional Sync**: Changes in editor instantly reflect on canvas
- **Schema Validation**: Real-time validation against OpenClaw schemas
- **Keyboard Shortcuts**: Power-user friendly shortcuts (Ctrl+O, Ctrl+S, etc.)
- **File Operations**: Open and save files via File System Access API
- **Dark Theme**: Easy on the eyes for long editing sessions

## Prerequisites

- Node.js 20+ 
- npm 10+
- Modern browser with File System Access API support (Chrome, Edge)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd json-engine

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

## Development

```bash
# Start dev server on port 3030
npm run dev

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run security audit
npm run security:check
```

## Usage

1. Open the application in your browser (http://localhost:3030)
2. Press `Ctrl+O` or click Open to select a JSON file
3. Edit in the code editor or click nodes on the canvas
4. Press `Ctrl+S` to save your changes
5. Press `F1` to see all keyboard shortcuts

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save file |
| `Ctrl+Shift+F` | Search in canvas |
| `Ctrl+F` | Find in editor (Monaco) |
| `F1` | Show keyboard shortcuts |

## Security

- Gateway tokens are stored memory-only (never in localStorage)
- Security audits run automatically in CI
- No hardcoded secrets in source code

## License

[License information]