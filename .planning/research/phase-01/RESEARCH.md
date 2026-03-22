# Phase 1 Research: Foundation for JSON.engine

**Date:** March 22, 2026  
**Tech Stack:** Next.js 14, React Flow, Monaco Editor, File System Access API, Tailwind CSS

---

## 1. Next.js 14 App Router Best Practices

### Architecture Overview

Next.js 14 with App Router uses a **server-first** approach. All components are Server Components by default unless explicitly marked with `'use client'`.

### Key Best Practices

#### 1.1 Folder Structure

```
app/
├── layout.tsx              # Root layout (Server Component)
├── page.tsx                # Home page
├── (marketing)/            # Route group (doesn't affect URL)
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── (dashboard)/            # Separate section with own layout
│   ├── layout.tsx          # Dashboard layout
│   └── page.tsx
├── ide/                    # Editor route
│   └── page.tsx
└── globals.css
```

**Why route groups matter:** Use `(parentheses)` to organize routes without affecting URL structure. Perfect for separating marketing pages from app functionality.

#### 1.2 Server vs Client Components

**Server Components (Default):**
```tsx
// app/layout.tsx - Server Component by default
export default async function RootLayout({ children }) {
  const data = await fetch('https://api.example.com/data');
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Client Components (When needed):**
```tsx
// Only use 'use client' when you need:
// - useState, useEffect
// - Event handlers (onClick, onChange)
// - Browser APIs (window, document, localStorage)
'use client';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Gotcha:** Don't put `'use client'` in root layout.tsx - it makes the entire app client-side, defeating the purpose of Server Components.

#### 1.3 Layouts vs Templates

**Layouts (`layout.tsx`):**
- Persist across route changes (maintain state)
- Support nesting
- Best for: headers, footers, sidebars, navigation

**Templates (custom pattern):**
- Re-render on route changes
- No state persistence
- Best for: highly dynamic content that needs fresh state

**Recommendation:** Use layouts for your TopAppBar and SideNavBar to maintain state during navigation.

#### 1.4 Loading & Error States

```tsx
// app/ide/loading.tsx - automatic loading UI
export default function Loading() {
  return <div>Loading editor...</div>;
}

// app/ide/error.tsx - automatic error boundary
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 1.5 Metadata Configuration

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON.engine - Visual JSON Editor',
  description: 'Build and edit JSON with a visual canvas',
};
```

---

## 2. React Flow Integration Patterns

### SSR/SSG Support (React Flow 12+)

React Flow 12 introduced proper SSR/SSG support. This is critical for Next.js App Router compatibility.

### Installation

```bash
npm install reactflow@latest
```

### Basic Integration with Next.js App Router

```tsx
// app/flow/page.tsx
'use client'; // Required: React Flow needs browser APIs

import { useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Node 2' } },
];

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px]">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
```

### Server-Side Rendering Configuration

For SSR/SSG, pass initial dimensions to ReactFlowProvider:

```tsx
<ReactFlowProvider
  initialNodes={nodes}
  initialEdges={edges}
  initialWidth={1000}
  initialHeight={500}
  fitView
>
  <App />
</ReactFlowProvider>
```

### Gotchas

1. **Always use `'use client'`**: React Flow requires browser APIs (window, document, ResizeObserver)
2. **CSS Import**: Import `reactflow/dist/style.css` in your component or globals.css
3. **Container Dimensions**: Parent container must have explicit height (React Flow doesn't auto-size)
4. **Provider Placement**: Wrap with ReactFlowProvider at the appropriate layout level for shared state
5. **Hydration Mismatch**: Use `initialNodes`/`initialEdges` props for SSR to prevent hydration errors

### Performance Considerations

- Use `memo()` for custom node types to prevent unnecessary re-renders
- Implement virtualization for large graphs (1000+ nodes)
- Consider `nodeTypes` and `edgeTypes` for custom rendering

---

## 3. File System Access API

### Browser Support (2026)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ 86+ | Full support |
| Edge | ✅ 86+ | Full support |
| Opera | ✅ 91+ | Full support |
| Firefox | ❌ | Not supported |
| Safari | ❌ | Not supported |
| iOS Safari | ❌ | Not supported |
| Android Chrome | ❌ | Not supported |

**Source:** caniuse.com/native-filesystem-api

### Implementation Strategy

**Use the `browser-fs-access` ponyfill** for graceful fallbacks:

```bash
npm install browser-fs-access
```

### Feature Detection

```ts
import { fileOpen, fileSave, directoryOpen, supported } from 'browser-fs-access';

// Check if native API is available
if (supported) {
  console.log('Using native File System Access API');
} else {
  console.log('Using legacy fallback (input elements)');
}
```

### File Operations

#### Opening a File

```ts
async function openFile() {
  try {
    const blob = await fileOpen({
      mimeTypes: ['application/json', '.json'],
      multiple: false,
    });
    const text = await blob.text();
    return text;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('User cancelled file selection');
    } else if (err.name === 'SecurityError') {
      console.log('Security error - permission denied');
    } else {
      console.error('Error opening file:', err);
    }
    throw err;
  }
}
```

#### Saving a File

```ts
async function saveFile(content: string, suggestedName: string = 'data.json') {
  try {
    const blob = new Blob([content], { type: 'application/json' });
    await fileSave(blob, {
      fileName: suggestedName,
      extensions: ['.json'],
      mimeTypes: ['application/json'],
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('User cancelled save dialog');
    } else {
      console.error('Error saving file:', err);
    }
    throw err;
  }
}
```

#### Opening a Directory

```ts
async function openDirectory() {
  try {
    const handles = await directoryOpen({
      recursive: true,
      skipDirectory: (dir) => dir.name.startsWith('.'),
    });
    return handles;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('User cancelled directory selection');
    }
    throw err;
  }
}
```

### Persisting File Handles

Store file handles in IndexedDB for re-opening files without prompts:

```ts
// Store handle
async function storeFileHandle(handle: FileSystemFileHandle) {
  const db = await openDB('JSONEngineDB', 1, {
    upgrade(db) {
      db.createObjectStore('fileHandles', { keyPath: 'id' });
    },
  });
  await db.put('fileHandles', { id: 'current', handle });
}

// Retrieve handle
async function getFileHandle() {
  const db = await openDB('JSONEngineDB', 1);
  const record = await db.get('fileHandles', 'current');
  return record?.handle;
}
```

**Important:** Handle permissions on retrieval - users may have moved/deleted files.

### Security Requirements

1. **HTTPS Required:** File System Access API only works in secure contexts (HTTPS or localhost)
2. **User Gesture:** File pickers must be triggered by user actions (click, keypress)
3. **Permissions:** Users must explicitly grant read/write permissions
4. **Sandbox:** Cannot access arbitrary file system paths without user selection

### Fallback Strategy

For unsupported browsers (Firefox, Safari):

```tsx
function FileOperations() {
  const handleOpen = async () => {
    if (supported) {
      // Use File System Access API
      const blob = await fileOpen({ mimeTypes: ['application/json'] });
      const text = await blob.text();
      setContent(text);
    } else {
      // Fallback: traditional file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          setContent(text);
        }
      };
      input.click();
    }
  };

  return <button onClick={handleOpen}>Open File</button>;
}
```

### Gotchas

1. **Not available in iframes** (cross-origin)
2. **Permissions can be revoked** - handle `SecurityError` gracefully
3. **Mobile browsers** - limited support, directory picker particularly problematic
4. **Handle cloning** - storing handles in IndexedDB doesn't work in all browsers
5. **Private/Incognito mode** - IndexedDB may be blocked

---

## 4. Monaco Editor Lazy Loading Strategies

### Recommended Package: `@monaco-editor/react`

```bash
npm install @monaco-editor/react
```

This package handles Monaco setup without webpack configuration.

### Next.js App Router Integration

#### Method 1: Dynamic Import (Recommended)

```tsx
// app/ide/editor.tsx
'use client';

import { useRef } from 'react';
import Editor from '@monaco-editor/react';

export function CodeEditor() {
  const editorRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });

    // Add custom commands
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        const value = editor.getValue();
        console.log('Saving:', value);
      }
    );
  };

  const handleBeforeMount = (monaco) => {
    // Configure Monaco before editor mounts
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  return (
    <Editor
      height="90vh"
      defaultLanguage="json"
      defaultValue="// Load your JSON here"
      theme="vs-dark"
      onMount={handleEditorMount}
      beforeMount={handleBeforeMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
```

#### Method 2: With Next.js Dynamic (SSR Disabled)

For pages where Monaco is conditionally loaded:

```tsx
// app/ide/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const Editor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

export default function IDEPage() {
  const [code, setCode] = useState('{}');

  return (
    <div className="h-screen">
      <Editor
        height="80vh"
        defaultLanguage="json"
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
      />
    </div>
  );
}
```

### Bundle Size Optimization

Monaco Editor is large (~30MB uncompressed). Optimization strategies:

#### 1. Lazy Load Monaco

Monaco is already lazy-loaded by `@monaco-editor/react` - it only loads when the component mounts.

#### 2. Configure webpack (if needed)

```js
// next.config.js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['json', 'javascript', 'typescript', 'markdown'],
          filename: 'static/[name].worker.js',
        })
      );
    }
    return config;
  },
};
```

#### 3. Load Only Required Languages

```tsx
import { loader } from '@monaco-editor/react';

// Configure before mount
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
  },
});
```

#### 4. Use CDN Loading (Optional)

```tsx
import { loader } from '@monaco-editor/react';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' },
});
```

### Worker Configuration

Monaco uses web workers for language features. With Next.js App Router:

```tsx
// No special configuration needed with @monaco-editor/react
// The package handles worker loading automatically

// For custom worker setup:
import { loader } from '@monaco-editor/react';

loader.init().then((monaco) => {
  // Workers are loaded from CDN or local bundle
  // No manual configuration needed
});
```

### Gotchas

1. **SSR Incompatibility**: Monaco requires `window` and `document` - always use `'use client'`
2. **Dynamic Import Required**: In App Router, use dynamic imports with `ssr: false` for conditional loading
3. **Container Size**: Parent must have explicit height for editor to render correctly
4. **Memory Leaks**: Call `editor.dispose()` in cleanup if manually creating editor instances
5. **Turbopack Issues**: Some dynamic import patterns fail with Turbopack - use webpack for Monaco
6. **Hydration**: Don't access Monaco APIs in server components

### Performance Tips

- Enable `automaticLayout: true` for responsive resizing
- Disable unused features (minimap, code folding) to reduce memory
- Use `useMonaco` hook to access Monaco instance without re-renders
- Implement virtualization for multiple editor instances

---

## 5. Tailwind CSS Dark Mode Implementation

### Configuration

#### Tailwind CSS v3 (Standard)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### Tailwind CSS v4 (Next.js 15+)

```css
/* app/globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### Implementation with next-themes (Recommended)

```bash
npm install next-themes
```

#### Theme Provider Setup

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### Root Layout

```tsx
// app/layout.tsx
import { ThemeProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Why `suppressHydrationWarning`**: next-themes modifies the HTML class on client-side, causing hydration mismatch. This attribute silences the warning for the `<html>` tag only.

#### Theme Toggle Component

```tsx
// components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - only render after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-6 h-6" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
```

#### Alternative: CSS-Based Icon Switching

No hydration warning with pure CSS:

```tsx
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  <Sun className="hidden [html.dark_&]:block w-5 h-5" />
  <Moon className="block [html.dark_&]:hidden w-5 h-5" />
</button>
```

### Manual Implementation (Without next-themes)

```tsx
// components/theme-provider.tsx
'use client';

import { useEffect, useState } from 'react';

export function ThemeProvider({ children }) {
  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkTheme(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkTheme]);

  return (
    <div>
      <button onClick={() => setDarkTheme(!darkTheme)}>
        Toggle Theme
      </button>
      {children}
    </div>
  );
}
```

### Using Dark Mode in Components

```tsx
// Basic usage
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>

// With CSS variables (Recommended for consistency)
// globals.css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #3b82f6;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --primary: #60a5fa;
}

// Component
<div className="bg-[var(--background)] text-[var(--foreground)]">
  Content
</div>
```

### Gotchas

1. **Flash of Unstyled Content (FOUC)**: Use `next-themes` with `disableTransitionOnChange` to prevent visible theme flash
2. **Hydration Mismatch**: Always use `suppressHydrationWarning` on `<html>` tag when using next-themes
3. **System Preference**: Respect `prefers-color-scheme` for initial theme, then allow user override
4. **@custom-variant in v4**: Required to prevent `prefers-color-scheme` from interfering with manual toggle
5. **LocalStorage**: Check localStorage before mount to avoid theme reset on page reload
6. **Component Mounting**: Don't access `useTheme()` hook in server components

### Best Practices

1. **Use CSS Variables**: Define theme colors as CSS variables for easier maintenance
2. **Test on Real Devices**: System preference detection varies across browsers/OS
3. **Provide Clear Toggle**: Place theme toggle in TopAppBar or settings menu
4. **Respect User Choice**: Store preference in localStorage, override system default
5. **Avoid Hardcoded Colors**: Use semantic color names (background, foreground, primary)

---

## Summary: Recommended Stack Configuration

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "reactflow": "^12.x",
    "@monaco-editor/react": "^4.x",
    "browser-fs-access": "^0.38.x",
    "next-themes": "^0.3.x",
    "tailwindcss": "^3.x || ^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x"
  }
}
```

### Key Takeaways

1. **Next.js 14**: Server-first, use `'use client'` sparingly for interactivity
2. **React Flow**: Requires client components, SSR support via initial props
3. **File System Access**: Use `browser-fs-access` ponyfill for cross-browser support
4. **Monaco Editor**: Lazy load with `@monaco-editor/react`, disable SSR
5. **Tailwind Dark Mode**: Use `next-themes` for production-ready theme switching
