# Concerns & Technical Debt

## Overview
Known issues, risks, and areas requiring attention in JSON.engine.

---

## Current State Risks

### 1. Pre-Implementation Phase
**Status:** No production code exists yet
**Risk Level:** Medium
**Concern:** Specification and design are complete, but implementation complexity may exceed estimates.
**Mitigation:**
- Follow phased approach (MVP → v2 → v3)
- Prioritize core features in Phase 1
- Defer complex features (git, offline schema) to later phases

### 2. Monaco Editor Bundle Size
**Risk Level:** High
**Concern:** Monaco Editor is large and may impact initial load time.
**Impact:** User experience, especially on slower connections
**Mitigation:**
- Lazy load editor panel (load on first use)
- Consider lighter alternative (CodeMirror 6) if performance issues arise
- Implement code splitting

### 3. Complex JSON Performance
**Risk Level:** Medium
**Concern:** Large JSON files (>10KB) may cause canvas rendering issues.
**Impact:** Frame rate drops, UI unresponsiveness
**Mitigation:**
- Virtual rendering for large documents
- Collapse nodes by default for deep nesting
- Performance budget: 2 second render for 10KB files
- Implement lazy node loading

### 4. Schema Drift
**Risk Level:** Medium
**Concern:** OpenClaw gateway schema may change, causing validation mismatches.
**Impact:** False positives/negatives in validation
**Mitigation:**
- Bundle schema with editor for offline use (Phase 2)
- Version checking between editor and gateway
- Allow custom schema URLs

---

## Technical Debt (Anticipated)

### Phase 1 (MVP) - Conscious Simplifications
1. **No Offline Schema**
   - Only gateway API for schema (requires connection)
   - Debt: Users cannot edit without gateway connection
   - Resolution: Phase 2 - bundled offline schema

2. **Single File Only**
   - No multi-file project support
   - Debt: Cannot work with complex multi-file configs
   - Resolution: Phase 2 - project workspace

3. **No Undo/Redo**
   - Simple edit history only
   - Debt: User mistakes harder to recover from
   - Resolution: Phase 2 - full undo/redo stack

4. **Limited Error Recovery**
   - Basic error messages
   - Debt: Users may struggle to fix complex errors
   - Resolution: Phase 3 - enhanced error guidance

---

## Security Concerns

### 1. API Token Storage
**Risk Level:** High
**Concern:** OpenClaw gateway token must be stored securely.
**Current Plan:** Store in editor settings (localStorage or secure storage API)
**Recommendation:**
- Evaluate secure storage options
- Never log or expose tokens
- Implement token rotation if gateway supports it

### 2. Secrets in Config Files
**Risk Level:** Medium
**Concern:** API keys and credentials visible in editor.
**Current Plan:** Masked display, no encryption at rest
**Recommendation:**
- Mask sensitive fields by default
- Add "reveal" toggle
- Consider encryption for at-rest storage (Phase 4)

### 3. File System Access
**Risk Level:** Low
**Concern:** File System Access API requires explicit user permission.
**Mitigation:** Clear permission prompts, fallback to traditional file input

---

## Performance Concerns

### 1. Canvas Rendering
| Metric | Target | Risk |
|--------|--------|------|
| Initial load | < 2s for 10KB | Medium |
| Zoom/pan | 60fps | Medium |
| Node selection | < 100ms | Low |

### 2. Validation Latency
| Operation | Target | Risk |
|-----------|--------|------|
| JSON parse | < 50ms | Low |
| Schema validation | < 500ms | Medium |
| Error display | < 100ms | Low |

### 3. Memory Usage
**Concern:** Large node graphs may consume significant memory.
**Mitigation:**
- Node pooling
- Virtual scrolling
- Aggressive cleanup of off-screen nodes

---

## Browser Compatibility

### File System Access API
**Support:** Chrome/Edge 86+, Opera, partial Safari
**Risk:** Firefox users need fallback
**Mitigation:** Implement drag-drop + traditional file input fallback

### Monaco Editor
**Support:** Modern browsers (ES2020+)
**Risk:** Older browsers may have issues
**Mitigation:** Feature detection, graceful degradation

---

## Open Questions (From SPEC.md)

1. **Mobile Support** ❓
   - Is mobile editing a use case?
   - Current design is desktop-first

2. **Multiple Gateways** ❓
   - How to handle dev/staging/prod connections?
   - Profile switching UI needed?

3. **Schema Version Mismatch** ❓
   - Warning or auto-update?
   - How to handle breaking changes?

4. **Partial Schema Loading** ❓
   - Load on-demand vs all-at-once?
   - Performance vs completeness tradeoff

---

## Fragile Areas (Post-Implementation Watch)

### React Flow Integration
- Custom node types may break on library updates
- Position persistence across sessions
- Edge cases in auto-layout algorithms

### Monaco Sync
- Bidirectional sync complexity
- Cursor position preservation
- Large document handling

### Gateway API Changes
- OpenClaw API versioning
- Backward compatibility requirements
- Error response format changes

---

## Recommendations

### Before Phase 1 Release
1. Load test with 50KB+ JSON files
2. Security audit of token handling
3. Cross-browser testing (Chrome, Firefox, Safari, Edge)
4. Accessibility audit (keyboard navigation, screen readers)

### Monitoring (Post-Release)
1. Performance metrics (load time, FPS)
2. Error rates (validation, parsing, API)
3. User adoption metrics
4. Support ticket themes
