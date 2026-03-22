import { memo } from 'react';

export const CodeEditorLoader = memo(() => (
  <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4 p-8">
      <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      <div className="text-text-on-surface-variant font-body">Loading editor...</div>
    </div>
  </div>
));

CodeEditorLoader.displayName = 'CodeEditorLoader';