'use client'

import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { pathToLine, lineToPath } from '@/lib/path-to-line'
import { useAppStore } from '@/store/app-store'

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
    const validationErrors = useAppStore(state => state.validationErrors)
    
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
    
    useEffect(() => {
      if (monaco && editorRef.current) {
        const model = editorRef.current.getModel()
        if (model) {
          const markers = validationErrors.map((error): editor.IMarkerData => ({
            severity: error.severity === 'error' 
              ? monaco.MarkerSeverity.Error 
              : monaco.MarkerSeverity.Warning,
            message: error.message,
            startLineNumber: error.line,
            startColumn: error.column,
            endLineNumber: error.line,
            endColumn: error.column + 1,
            source: 'json-validation',
          }))
          
          monaco.editor.setModelMarkers(model, 'validation', markers)
        }
      }
    }, [monaco, validationErrors])
    
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

export default CodeEditor;
