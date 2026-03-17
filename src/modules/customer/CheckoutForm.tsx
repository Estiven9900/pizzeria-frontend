import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { OrderTimer } from '../../components/OrderTimer'
import { useOrderStore } from '../../store/useOrderStore'

interface CheckoutFormValues {
  fullName: string
  email: string
  phoneNumber: string
  deliveryAddress: string
  referenceNotes: string
}

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>

const initialValues: CheckoutFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  deliveryAddress: '',
  referenceNotes: '',
}

function validate(values: CheckoutFormValues): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'El nombre es obligatorio'
  }

  if (!values.email.trim()) {
    errors.email = 'El email es obligatorio'
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = 'El teléfono es obligatorio'
  }

  if (!values.deliveryAddress.trim()) {
    errors.deliveryAddress = 'La dirección es obligatoria'
  }

  return errors
}

export function CheckoutForm() {
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const [values, setValues] = useState<CheckoutFormValues>(initialValues)
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [orderCreatedAt, setOrderCreatedAt] = useState<number | null>(null)

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const handleChange = (
    field: keyof CheckoutFormValues,
    value: CheckoutFormValues[keyof CheckoutFormValues],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }))

    if (errors[field]) {
      setErrors((previous) => {
        const next = { ...previous }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formErrors = validate(values)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const createdAt = Date.now()

    setActiveOrder({
      id: crypto.randomUUID(),
      customer_name: values.fullName,
      customer_email: values.email,
      customer_phone: values.phoneNumber,
      delivery_address: values.deliveryAddress,
      reference_notes: values.referenceNotes.trim() || undefined,
      status: 'Pending',
      created_at: createdAt,
    })

    setOrderCreatedAt(createdAt)
    setIsLoading(false)
  }

  if (orderCreatedAt) {
    return (
      <section className="flex min-h-[420px] w-full items-center justify-center rounded-2xl bg-white p-6 shadow-md">
        <OrderTimer createdAt={orderCreatedAt} />
      </section>
    )
  }

  return (
    <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
        <p className="mt-1 text-sm text-gray-600">Completa tus datos para confirmar el pedido.</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={values.fullName}
            onChange={(event) => handleChange('fullName', event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-xs text-red-600">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="mb-1 text-xs text-gray-500">Lo usamos para enviarte el cupón de cancelación.</p>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => handleChange('email', event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={values.phoneNumber}
            onChange={(event) => handleChange('phoneNumber', event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
            aria-invalid={Boolean(errors.phoneNumber)}
            aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="mt-1 text-xs text-red-600">
              {errors.phoneNumber}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="deliveryAddress"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Delivery Address
          </label>
          <input
            id="deliveryAddress"
            type="text"
            value={values.deliveryAddress}
            onChange={(event) => handleChange('deliveryAddress', event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
            aria-invalid={Boolean(errors.deliveryAddress)}
            aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
          />
          {errors.deliveryAddress && (
            <p id="deliveryAddress-error" className="mt-1 text-xs text-red-600">
              {errors.deliveryAddress}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="referenceNotes" className="mb-1 block text-sm font-medium text-gray-700">
            Reference Notes
          </label>
          <textarea
            id="referenceNotes"
            value={values.referenceNotes}
            onChange={(event) => handleChange('referenceNotes', event.target.value)}
            placeholder="Ej: Apartamento 402, timbre dañado"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || hasErrors}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Procesando...' : 'Confirmar Pedido (Simular Pago)'}
        </button>
      </form>
    </section>
  )
}
