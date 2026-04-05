import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { toastEmitter } from '../utils/toastEmitter'
import type { ToastMessage, ToastType } from '../utils/toastEmitter'

const ICONS: Record<ToastType, React.ReactNode> = {
  error: <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  success: <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  info: <Info className="h-5 w-5 shrink-0" aria-hidden="true" />,
}

const STYLES: Record<ToastType, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

const ICON_STYLES: Record<ToastType, string> = {
  error: 'text-red-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
  info: 'text-blue-500',
}

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true))

    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.durationMs ?? 4000)

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, toast.durationMs, onRemove])

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md transition-all duration-300 ${
        STYLES[toast.type]
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <span className={ICON_STYLES[toast.type]}>{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="ml-1 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    return toastEmitter.subscribe((toast) => {
      setToasts((prev) => [...prev, toast])
    })
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
