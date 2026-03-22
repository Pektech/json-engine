import type { JsonNodeType } from '@/types/canvas'

interface NodeTypeBadgeProps {
  type: JsonNodeType
  size?: 'sm' | 'md'
}

const typeConfig: Record<JsonNodeType, { bg: string; text: string; border: string; label: string }> = {
  object: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', label: 'Object' },
  array: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/50', label: 'Array' },
  string: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/50', label: 'String' },
  number: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/50', label: 'Number' },
  boolean: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/50', label: 'Boolean' },
  null: { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/50', label: 'Null' },
}

export function NodeTypeBadge({ type, size = 'md' }: NodeTypeBadgeProps) {
  const config = typeConfig[type]
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  
  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} font-label font-medium uppercase tracking-wider`}
    >
      {config.label}
    </span>
  )
}
