'use client'

import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import type { editor } from 'monaco-editor'
import { pathToLine, lineToPath, findPathByKeyLabel } from '@/lib/path-to-line'
import { useAppStore } from '@/store/app-store'
import { useFocusContext } from '@/hooks/useFocusContext'

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
  find: () => void
}

// Simple debounce utility
function debounce<Fn extends (...args: any[]) => any>(
  fn: Fn,
  delay: number
): (...args: Parameters<Fn>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { value, onChange, onValidate, selectedPath, onCursorPositionChange, theme = 'vs-dark' },
    ref
  ) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const decorationIdsRef = useRef<string[]>([])
  const monaco = useMonaco()
  const validationErrors = useAppStore(state => state.validationErrors)
  const { setFocusedArea } = useFocusContext()
  
  useImperativeHandle(ref, () => ({
    format: () => {
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.formatDocument')?.run()
      }
    },
    getPathAtLine: (line: number) => {
      return lineToPath(value, line)
    },
    find: () => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'actions.find', {})
      }
    },
  }))
  
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      // Set focus area when editor receives focus
      const onFocusRegistration = editor.onDidFocusEditorText(() => {
        setFocusedArea('editor');
      });
      
      // Set focus area when editor loses focus
      const onBlurRegistration = editor.onDidBlurEditorText(() => {
        setFocusedArea('global');
      });
      
      // Cleanup event handlers
      return () => {
        onFocusRegistration?.dispose?.();
        onBlurRegistration?.dispose?.();
      };
    }
  }, [editorRef, setFocusedArea]);
    
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
        (monaco.languages.json as any).jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          schemas: [],
        })
      }
    }, [monaco])
    
    const handleMount = useCallback(
      (editor: editor.IStandaloneCodeEditor) => {
        editorRef.current = editor
        
        // Get full JSON text from the editor model, not from props
        const getFullJsonText = () => {
          const model = editor.getModel()
          return model ? model.getValue() : ''
        }
        
        // Update selection when cursor position changes
        const updateSelectionFromCursor = () => {
          const position = editor.getPosition()
          if (!position || !onCursorPositionChange) return
          
          // Get full JSON text directly from editor model
          const fullJsonText = getFullJsonText()
          
          // Get the word at the cursor position (the key name)
          const model = editor.getModel()
          if (!model) return
          
          const wordInfo = model.getWordAtPosition(position)
          
          if (!wordInfo || !wordInfo.word) {
            // No word at cursor, fall back to line-based path
            const path = lineToPath(fullJsonText, position.lineNumber)
            if (path) onCursorPositionChange(path)
            return
          }
          
          // Get the line content to determine if this is a key or value
          const lineContent = model.getLineContent(position.lineNumber)
          const isKey = lineContent.includes(`"${wordInfo.word}"`) && 
                        lineContent.indexOf(`"${wordInfo.word}"`) <= position.column
          
          
          if (isKey) {
            // This is a key, find the full path to this key
            const path = findPathByKeyLabel(fullJsonText, wordInfo.word, position.lineNumber)
            if (path) {
              onCursorPositionChange(path)
            } else {
              // Fallback to line-based
              const fallbackPath = lineToPath(fullJsonText, position.lineNumber)
              if (fallbackPath) onCursorPositionChange(fallbackPath)
            }
          } else {
            // This is a value, use line-based path
            const path = lineToPath(fullJsonText, position.lineNumber)
            if (path) onCursorPositionChange(path)
          }
        }
        
        // Listen to cursor changes with debounce to prevent selection jumping
        const debouncedUpdateSelection = debounce(updateSelectionFromCursor, 100) // 100ms prevents selection jumping
        editor.onDidChangeCursorPosition(debouncedUpdateSelection)
      },
      [onCursorPositionChange]
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
      if (!editorRef.current || !selectedPath || !value) return

      const location = pathToLine(value, selectedPath)
      if (!location || !location.line || !location.column) return

      // Scroll to show the selected line, but don't move cursor
      // (cursor position should only change from user typing/clicking)
      editorRef.current.revealLinesInCenter(location.line, location.line)

      const decorations = [
        {
          range: new monaco!.Range(location.line, 1, location.line, 1),
          options: {
            isWholeLine: true,
            className: 'selected-line-highlight',
            linesDecorationsClassName: 'selected-line-margin',
          },
        },
      ]

      decorationIdsRef.current = editorRef.current.deltaDecorations(
        decorationIdsRef.current || [],
        decorations
      )
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
