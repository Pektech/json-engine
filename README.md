# JSON.engine

A visual JSON editor for OpenClaw configuration management. Edit complex JSON configurations with immediate visual feedback and validation.

## Features

- **Visual Node Canvas**: See your JSON structure as an interactive graph
- **Code Editor**: Full Monaco Editor integration with syntax highlighting
- **Bidirectional Sync**: Changes in editor instantly reflect on canvas
- **Schema Validation**: Real-time validation against OpenClaw schemas
- **Keyboard Shortcuts**: Power-user friendly shortcuts (Ctrl+O, Ctrl+S, etc.)
- **File Operations**: Open and save files via File System Access API
- **Dark Theme**: Easy on the eyes for long editing sessions with Material Design 3 tokens
- **Undo/Redo**: Full undo and redo support for both graph and editor changes
- **Split View**: Draggable divider for adjustable editor/canvas layout
- **Copy/Paste**: Right-click context menu with copy/paste operations for canvas nodes

## Prerequisites

- Node.js 20+ 
- npm 10+
- Modern browser with File System Access API support (Chrome, Edge)

## Quickest Start (No Install Required)
The fastest way to run JSON.engine is using `npx`, which downloads and runs the pre-built server instantly:

```bash
npx @pekton/json-engine
# Server will start at http://localhost:3030
```

## Installation

### Clone from GitHub

```bash
git clone https://github.com/[user]/json-engine.git
cd json-engine
npm install
npm run dev
```

### Docker

```bash
docker build -t json-engine .
docker run -p 3030:3030 json-engine
```

### Development Setup

```bash
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

## Getting Started

New to JSON.engine? Here is a quick guide to get you editing in under a minute.

### For Non-Developers

1. **Open the app**: just run npx @pekton/json-engine
2. **Open a file**: Press `Ctrl+O` and select any JSON file from your computer
3. **Edit visually**: Click on nodes in the canvas to select and edit values
4. **Edit in code**: Use the code editor on the left for direct text editing
5. **Save your work**: Press `Ctrl+S` to save changes back to your file

### Tips

- Both the canvas and editor stay in sync. Edit in either place.
- Use `Ctrl+Z` to undo mistakes
- Drag the divider to resize the editor and canvas areas
- Right-click on nodes for copy/paste options

## Screenshots

![Screenshot from 2026-04-29 19-41-41](../../../../home/richard-leddy/Pictures/Screenshots/Screenshot from 2026-04-29 19-41-41.png)
![Screenshot from 2026-04-29 19-40-56](../../../../home/richard-leddy/Pictures/Screenshots/Screenshot from 2026-04-29 19-40-56.png)
![Screenshot from 2026-04-29 19-40-29](../../../../home/richard-leddy/Pictures/Screenshots/Screenshot from 2026-04-29 19-40-29.png)


## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save file |
| `Ctrl+Shift+F` | Search in canvas |
| `Ctrl+F` | Find in editor (Monaco) |
| `F1` | Show keyboard shortcuts |
| `Ctrl+Z` | Undo (graph and editor) |
| `Ctrl+Shift+Z` | Redo (graph and editor) |
| `Ctrl+Y` | Redo - alternative shortcut (graph and editor) |

## Browser Support

JSON.engine requires a modern browser with File System Access API support.

### Supported Browsers

- **Chrome** 86+ (recommended)
- **Edge** 86+ (recommended)

### Not Supported

- Safari (no File System Access API)
- Firefox (no File System Access API)
- Mobile browsers

The File System Access API allows the app to open and save files directly to your computer without uploading to a server.

- Gateway tokens are stored memory-only (never in localStorage)
- Security audits run automatically in CI
- No hardcoded secrets in source code

## License

[MIT License](LICENSE)
