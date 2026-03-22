# Phase 1: Foundation - Context

**Phase:** 1 - Foundation
**Goal:** Working Next.js app with Tailwind styling, basic layout, and file open/save
**Requirements:** FILE-01 through FILE-06, UIUX-01 through UIUX-03

---

## Research Summary

**Next.js 14 App Router:**
- Use App Router for file-based routing
- Server Components by default, Client Components with 'use client'
- API routes in app/api/ directory
- Layout in app/layout.tsx, page in app/page.tsx

**React Flow Integration:**
- Install with `npm install reactflow`
- Requires 'use client' directive
- Handle zoom/pan via React Flow Controls component
- Custom nodes for JSON types (Object, Array, String, etc.)

**File System Access API:**
- Chrome/Edge: Full support
- Safari: Partial support
- Firefox: Not supported (use fallback)
- Always implement fallback with traditional file input

**Monaco Editor Lazy Loading:**
- Use @monaco-editor/react with `@loadable/component` or dynamic import
- Split bundle: Monaco loads on demand
- Reduces initial bundle from ~1.5MB to ~300KB

**Tailwind Dark Mode:**
- Config: `darkMode: 'class'`
- Apply `.dark` class to html element
- Use custom colors from design tokens

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Client Components for layout | React Flow and Monaco require 'use client' |
| Dynamic import for Monaco | Reduces initial bundle size significantly |
| localStorage for recent files | Simple, synchronous, sufficient for MVP |
| File input fallback | Required for Firefox and older browsers |
| Strict TypeScript | Catches errors early, better DX |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| File System API permissions | Clear prompts, graceful fallback |
| Monaco bundle size | Lazy load, CodeMirror fallback if needed |
| React Flow SSR issues | Mark as client component |

---

## External References

- Next.js 14 Docs: https://nextjs.org/docs
- React Flow Docs: https://reactflow.dev/
- Monaco React: https://github.com/suren-atoyan/monaco-react
- File System Access API: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

---
*Created: 2026-03-22*
