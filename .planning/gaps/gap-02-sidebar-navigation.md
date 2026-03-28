---
gap_id: gap-02
status: planned
priority: major
phase: 04-polish-release
source: 04-UAT.md Test 1
created: 2026-03-23
---

# Gap 02: Fix Sidebar Navigation View Switching

## Problem Statement

Sidebar renders but clicking navigation items does not change the active view. User reported: "sidebar is there but does not change anything".

## Root Cause Analysis

Sidebar navigation component exists but lacks:
1. View state management (no active view tracking)
2. Click handlers on navigation items
3. View switching logic to show/hide editor vs canvas vs other panels

## Affected Files

- `src/components/layout/Sidebar.tsx` - Navigation items without click handlers
- Missing: View state store/context for tracking active panel

## Fix Tasks

### Task 1: Create View State Store
**Priority:** major
**File:** `src/stores/viewStore.ts` (new)

1. Create Zustand store for view state:
```tsx
interface ViewState {
  activeView: 'editor' | 'canvas' | 'split' | 'settings';
  setActiveView: (view: ViewState['activeView']) => void;
}
```

2. Default to 'split' view (both editor and canvas visible)

### Task 2: Wire Sidebar Navigation Items
**Priority:** major
**File:** `src/components/layout/Sidebar.tsx`

1. Import `useViewStore` hook
2. Add `onClick` handlers to each navigation item:
   - Editor icon → `setActiveView('editor')`
   - Canvas/Graph icon → `setActiveView('canvas')`
   - Split view icon → `setActiveView('split')`
   - Settings icon → `setActiveView('settings')`

3. Add active state styling based on `activeView`:
   - Highlight active item with primary color
   - Dim inactive items

### Task 3: Implement View Switching in Layout
**Priority:** major
**File:** `src/components/layout/MainLayout.tsx` (or similar)

1. Read `activeView` from store
2. Conditionally render panels based on view:
   - 'editor': Show only CodeEditor (full width)
   - 'canvas': Show only NodeCanvas (full width)  
   - 'split': Show both side-by-side (existing layout)
   - 'settings': Show settings panel

3. Use CSS transitions for smooth view changes

## Verification Steps

1. Click Editor icon → Only JSON editor visible, icon highlighted
2. Click Canvas icon → Only graph canvas visible, icon highlighted
3. Click Split icon → Both panels side-by-side, icon highlighted
4. Active view persists during navigation

## Acceptance Criteria

- [ ] Sidebar navigation items have click handlers
- [ ] Clicking items switches the active view
- [ ] Active item is visually highlighted
- [ ] View switching is smooth with CSS transitions
- [ ] Split view (default) shows both editor and canvas
