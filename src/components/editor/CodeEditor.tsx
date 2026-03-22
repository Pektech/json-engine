'use client'

import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { pathToLine, lineToPath } from '@/lib/path-to-line'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  onValidate?: (markers: editor.IMarker[]) => void
  selectedPath?: string | null
  onCursorPositionChange?: (path: string | null) => void
  theme?: 'vs-dark' | 'light'
}

export interface CodeEditorHandle {
  format: () => void
  getPathAtLine: (line: number) => string | null
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { value, onChange, onValidate, selectedPath, onCursorPositionChange, theme = 'vs-dark' },
    ref
  ) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monaco = useMonaco()
    
    useImperativeHandle(ref, () => ({
      format: () => {
        if (editorRef.current) {
          editorRef.current.getAction('editor.action.formatDocument')?.run()
        }
      },
      getPathAtLine: (line: number) => {
        return lineToPath(value, line)
      },
    }))
    
    const handleBeforeMount = useCallback(() => {
      if (monaco) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          schemas: [],
        })
      }
    }, [monaco])
    
    const handleMount = useCallback(
      (editor: editor.IStandaloneCodeEditor) => {
        editorRef.current = editor
        
        editor.onDidChangeCursorPosition(() => {
          const position = editor.getPosition()
          if (position && onCursorPositionChange) {
            const path = lineToPath(value, position.lineNumber)
            onCursorPositionChange(path)
          }
        })
      },
      [value, onCursorPositionChange]
    )
    
    const handleChange = useCallback(
      (newValue: string | undefined) => {
        if (onChange && newValue !== undefined) {
          onChange(newValue)
        }
      },
      [onChange]
    )
    
    const handleValidate = useCallback(
      (markers: editor.IMarker[]) => {
        if (onValidate) {
          onValidate(markers)
        }
      },
      [onValidate]
    )
    
    useEffect(() => {
      if (editorRef.current && selectedPath) {
        const location = pathToLine(value, selectedPath)
        if (location) {
          editorRef.current.revealLineInCenter(location.line)
          editorRef.current.setPosition({
            lineNumber: location.line,
            column: location.column,
          })
        }
      }
    }, [selectedPath, value])
    
    return (
      <Editor
        height="100%"
        language="json"
        theme={theme}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        onValidate={handleValidate}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          folding: true,
          lineNumbers: 'on',
          glyphMargin: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
        }}
      />
    )
  }
)
