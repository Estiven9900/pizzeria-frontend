export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  durationMs?: number
}

type ToastListener = (toast: ToastMessage) => void

const listeners = new Set<ToastListener>()

export const toastEmitter = {
  subscribe(listener: ToastListener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  emit(type: ToastType, message: string, durationMs = 4000): void {
    const toast: ToastMessage = { id: crypto.randomUUID(), type, message, durationMs }
    for (const listener of listeners) {
      listener(toast)
    }
  },

  error(message: string, durationMs?: number): void {
    this.emit('error', message, durationMs)
  },

  warning(message: string, durationMs?: number): void {
    this.emit('warning', message, durationMs)
  },

  success(message: string, durationMs?: number): void {
    this.emit('success', message, durationMs)
  },

  info(message: string, durationMs?: number): void {
    this.emit('info', message, durationMs)
  },
}
