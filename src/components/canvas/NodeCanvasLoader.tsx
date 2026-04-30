import { memo } from 'react'
import { LoadingState } from '@/components/common/LoadingState'

export const NodeCanvasLoader = memo(() => (
  <LoadingState label="Loading canvas..." accentClassName="border-secondary" />
))

NodeCanvasLoader.displayName = 'NodeCanvasLoader'
