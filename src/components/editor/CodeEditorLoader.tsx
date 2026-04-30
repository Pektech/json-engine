import { memo } from 'react'
import { LoadingState } from '@/components/common/LoadingState'

export const CodeEditorLoader = memo(() => (
  <LoadingState label="Loading editor..." accentClassName="border-primary" />
))

CodeEditorLoader.displayName = 'CodeEditorLoader'
