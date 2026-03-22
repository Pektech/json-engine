# External Integrations

## Overview
JSON.engine integrates with OpenClaw gateway for configuration management and schema validation.

---

## OpenClaw Gateway API

### Connection
- **Protocol:** HTTP/HTTPS
- **Base URL:** Configurable (default: `http://localhost:8080`)
- **Authentication:** Gateway token (stored securely)

### Planned Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/config/schema` | Fetch JSON schema | Planned |
| GET | `/api/config/current` | Get running config | Planned |
| POST | `/api/config/validate` | Validate proposed config | Planned |
| POST | `/api/config/apply` | Apply new config | Planned |
| GET | `/api/config/diff` | Compare configs | Planned |

### Schema Query Action
```typescript
// config.schema.lookup
{
  "path": "agents.defaults",
  "schema": { "type": "object", "additionalProperties": false },
  "hint": {
    "label": "Agent Defaults",
    "help": "Shared default settings...",
    "tags": ["advanced"]
  },
  "children": [...]
}
```

---

## File System Integration

### File System Access API
- Primary method for local file operations
- Native browser API for reading/writing files
- Requires user permission

### Fallback Methods
- Drag-and-drop file upload
- Traditional file input (`<input type="file">`)
- Download link for save operations

### Supported Operations
- Open `openclaw.json` files
- Save to same location
- Watch for external changes
- Auto-backup before saves

---

## Schema Sources

### 1. Gateway API (Online)
- Query from running OpenClaw instance
- Always matches gateway version
- Includes human-readable hints

### 2. Bundled Schema (Offline)
- Generated from TypeBox definitions at build time
- Fallback when gateway unavailable
- Version-specific

### 3. Custom URL
- User-provided schema location
- For custom OpenClaw setups

---

## Export Formats

### Phase 1 (MVP)
- JSON (native)

### Future Phases
- YAML
- JavaScript module

---

## External Services (CDN)

| Service | URL | Purpose |
|---------|-----|---------|
| Tailwind CDN | cdn.tailwindcss.com | Utility CSS |
| Google Fonts | fonts.googleapis.com | Typography |
| Google Icons | fonts.gstatic.com | Material Symbols |

---

## Security Considerations

### Authentication
- Gateway token stored in editor settings
- Secure storage required
- No hardcoded credentials

### Secrets Handling
- API keys and tokens in config files
- Masked display in editor
- Encrypted at rest (planned)

---

## Integration Priority

1. **Phase 1:** File System Access, Schema loading from gateway
2. **Phase 2:** Bundled offline schema, cross-file references
3. **Phase 3:** Live config push, gateway restart controls
4. **Phase 4:** Git integration
