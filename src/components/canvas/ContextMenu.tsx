'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  onClick?: () => void
  disabled?: boolean
  submenu?: ContextMenuItem[]
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const content = (
    <div
      ref={menuRef}
      className="fixed z-[99999] min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-xl py-2">
        {items.map((item, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => {
                if (!item.disabled && !item.submenu && item.onClick) {
                  item.onClick()
                  onClose()
                }
              }}
              disabled={item.disabled}
              className="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <span>{item.label}</span>
              {item.submenu && <span className="text-zinc-500 ml-2">›</span>}
            </button>
            
            {/* Submenu - shows on hover */}
            {item.submenu && (
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-xl py-2 min-w-[150px]">
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => {
                        if (subItem.onClick) {
                          subItem.onClick()
                          onClose()
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high"
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
  
  // Render portal to document body
  return createPortal(content, document.body)
}
