interface EmptyStateProps {
  message?: string
}

export function EmptyState({
  message = 'Horno calentándose... no hay pizzas disponibles todavía',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">🍕</span>
      <p className="text-base font-medium text-gray-600">{message}</p>
    </div>
  )
}
