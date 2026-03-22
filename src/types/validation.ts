export interface ValidationError {
  path: string
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  schemaPath?: string
}
