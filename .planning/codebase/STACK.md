# Technology Stack

## Project Overview
**JSON.engine** - A visual JSON editor for OpenClaw configuration management.
**Status:** Pre-implementation (design/spec phase)

---

## Core Technologies (Planned)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14 (App Router) | React framework with file-based routing |
| Language | TypeScript | 5.x+ | Type-safe development |
| UI Runtime | React | 18 | Component model, hooks |
| Styling | Tailwind CSS | 3.x+ | Utility-first CSS with design tokens |
| Canvas | React Flow | Latest | Node graph visualization library |
| Code Editor | Monaco Editor | Latest | VS Code editor engine |
| State | Zustand | Latest | Lightweight state management |
| Validation | AJV | Latest | JSON Schema validation |

---

## Current Project Files

### Documentation
- `SPEC.md` - Complete product specification (476 lines)
- `json_design/DESIGN.md` - Design system specification (89 lines)
- `json_design/code.html` - HTML prototype/mockup (320 lines)
- `json_design/screen.png` - Design screenshot reference

### Configuration
- Uses CDN-based Tailwind via `cdn.tailwindcss.com`
- No `package.json`, `tsconfig.json`, or build config yet
- No dependencies installed

---

## Runtime Requirements

### Build Time
- Node.js 18+
- npm/yarn/pnpm
- Next.js build pipeline

### Browser Support
- Modern browsers with ES2020+ support
- File System Access API (with fallback)

---

## External Dependencies (CDN-based in prototype)

### Fonts
- **Inter** (400, 500, 600, 700) - UI text
- **Space Grotesk** (300, 400, 500, 600, 700) - Labels, technical text
- **Material Symbols Outlined** - Icon system

### Libraries (CDN)
- Tailwind CSS with custom configuration
- Google Fonts API

---

## Planned npm Dependencies

### Production
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "reactflow": "^11.x",
  "@monaco-editor/react": "^4.x",
  "zustand": "^4.x",
  "ajv": "^8.x",
  "tailwindcss": "^3.x",
  "@types/node": "^20.x",
  "@types/react": "^18.x"
}
```

### Development
```json
{
  "typescript": "^5.x",
  "eslint": "^8.x",
  "eslint-config-next": "^14.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x"
}
```

---

## Schema Sources

### OpenClaw Integration
- Gateway API: `config.schema.lookup` action
- Source: TypeBox definitions in `src/line/config-schema.ts`
- Fallback: Bundled JSON Schema (Phase 2)

---

## Environment Variables (Planned)

```env
# OpenClaw Gateway
OPENCLAW_GATEWAY_URL=http://localhost:8080
OPENCLAW_API_TOKEN=xxx

# Editor
EDITOR_THEME=dark
AUTO_SAVE_INTERVAL=30000
```

---

## Build Artifacts (Expected)

```
.next/
├── static/           # Static assets
├── server/           # Server-side code
└── [dynamic routes]  # Page bundles
```
