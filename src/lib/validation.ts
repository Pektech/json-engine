import Ajv, { type ValidateFunction } from 'ajv'
import addErrors from 'ajv-errors'
import addFormats from 'ajv-formats'
import type { ValidationError } from '@/types/validation'

class ValidationService {
  private ajv: InstanceType<typeof Ajv>
  private validateFn: ValidateFunction | null = null

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      verbose: true,
    })
    
    addErrors(this.ajv)
    addFormats(this.ajv)
  }

  loadSchema(schema: object): void {
    this.validateFn = this.ajv.compile(schema)
  }

  validate(data: unknown): ValidationError[] {
    if (!this.validateFn) {
      return []
    }

    const valid = this.validateFn(data)
    
    if (valid) {
      return []
    }

    const errors = this.validateFn.errors || []
    
    return errors.map((error): ValidationError => {
      const path = error.instancePath
        ? `root${error.instancePath.replace(/\//g, '.').replace(/\.(\d+)/g, '[$1]')}`
        : 'root'
      
      return {
        path,
        line: 1,
        column: 1,
        message: error.message || 'Validation error',
        severity: error.keyword === 'warning' ? 'warning' : 'error',
        schemaPath: error.schemaPath,
      }
    })
  }

  validateJsonString(jsonString: string): ValidationError[] {
    try {
      const data = JSON.parse(jsonString)
      return this.validate(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      const match = message.match(/position (\d+)/)
      const position = match ? parseInt(match[1], 10) : 0
      
      return [{
        path: 'root',
        line: 1,
        column: position + 1,
        message,
        severity: 'error',
      }]
    }
  }
}

export const validationService = new ValidationService()
export { ValidationService }
