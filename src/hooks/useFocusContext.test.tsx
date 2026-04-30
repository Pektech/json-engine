import { act, renderHook } from '@testing-library/react'
import { FocusProvider, useFocusContext } from './useFocusContext'

describe('useFocusContext', () => {
  it('throws when used outside FocusProvider', () => {
    expect(() => renderHook(() => useFocusContext())).toThrow('useFocusContext must be used within FocusProvider')
  })

  it('tracks focused editor and canvas areas', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <FocusProvider>{children}</FocusProvider>
    const { result } = renderHook(() => useFocusContext(), { wrapper })

    expect(result.current.focusedArea).toBe('global')
    expect(result.current.isEditorFocused()).toBe(false)
    expect(result.current.isCanvasFocused()).toBe(false)

    act(() => {
      result.current.setFocusedArea('editor')
    })
    expect(result.current.isEditorFocused()).toBe(true)
    expect(result.current.isCanvasFocused()).toBe(false)

    act(() => {
      result.current.setFocusedArea('canvas')
    })
    expect(result.current.isEditorFocused()).toBe(false)
    expect(result.current.isCanvasFocused()).toBe(true)
  })
})
