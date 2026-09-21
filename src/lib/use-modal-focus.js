import { useCallback, useEffect, useRef } from 'react'
import { startModalFocusSession, trapTabKey } from './modal-focus.js'

export function useModalFocus({ open, dialogRef, initialFocusRef, onClose }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    return startModalFocusSession(dialogRef.current, initialFocusRef.current)
  }, [open, dialogRef, initialFocusRef])

  return useCallback((event) => {
    if (!open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCloseRef.current?.()
      return
    }
    trapTabKey(event, dialogRef.current)
  }, [open, dialogRef])
}

