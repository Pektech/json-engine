import { ValidationService, validationService } from './validation'

describe('ValidationService', () => {
  it('returns no errors before schema is loaded', () => {
    expect(new ValidationService().validate({ anything: true })).toEqual([])
  })

  it('returns no errors for valid data', () => {
    const service = new ValidationService()
    service.loadSchema({ type: 'object', required: ['name'], properties: { name: { type: 'string' } } })

    expect(service.validate({ name: 'Ada' })).toEqual([])
  })

  it('maps schema errors to root-style paths', () => {
    const service = new ValidationService()
    service.loadSchema({
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: { age: { type: 'number' } },
          },
        },
      },
    })

    expect(service.validate({ users: [{ age: 'old' }] })).toEqual([
      expect.objectContaining({
        path: 'root.users[0].age',
        line: 1,
        column: 1,
        severity: 'error',
        schemaPath: expect.any(String),
      }),
    ])
  })

  it('uses fallback validation message when AJV omits one', () => {
    const service = new ValidationService()
    service.loadSchema({ not: {} })

    const validateFn = (service as any).validateFn
    validateFn.errors = [{ instancePath: '', keyword: 'custom', schemaPath: '#/custom' }]
    ;(service as any).validateFn = jest.fn(() => false)
    ;(service as any).validateFn.errors = validateFn.errors

    expect(service.validate({})).toEqual([
      {
        path: 'root',
        line: 1,
        column: 1,
        message: 'Validation error',
        severity: 'error',
        schemaPath: '#/custom',
      },
    ])
  })

  it('maps warning keyword severity', () => {
    const service = new ValidationService()
    ;(service as any).validateFn = jest.fn(() => false)
    ;(service as any).validateFn.errors = [{
      instancePath: '/name',
      keyword: 'warning',
      message: 'Heads up',
      schemaPath: '#/warning',
    }]

    expect(service.validate({ name: 'Ada' })[0]).toMatchObject({
      path: 'root.name',
      message: 'Heads up',
      severity: 'warning',
    })
  })

  it('returns empty errors when validator fails without error details', () => {
    const service = new ValidationService()
    ;(service as any).validateFn = jest.fn(() => false)
    ;(service as any).validateFn.errors = null

    expect(service.validate({})).toEqual([])
  })

  it('validates JSON strings and reports parse columns', () => {
    const service = new ValidationService()
    service.loadSchema({ type: 'object' })

    expect(service.validateJsonString('{}')).toEqual([])
    expect(service.validateJsonString('{bad}')).toEqual([
      expect.objectContaining({
        path: 'root',
        line: 1,
        column: expect.any(Number),
        severity: 'error',
      }),
    ])
  })

  it('handles non-Error thrown parse failures', () => {
    const service = new ValidationService()
    const parseSpy = jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw 'bad'
    })

    expect(service.validateJsonString('x')[0]).toMatchObject({
      message: 'Invalid JSON',
      column: 1,
    })

    parseSpy.mockRestore()
  })

  it('exports a shared validation service instance', () => {
    validationService.loadSchema({ type: 'number' })
    expect(validationService.validate(1)).toEqual([])
  })
})
