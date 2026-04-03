import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CheckoutForm } from './modules/customer/CheckoutForm'
import { CustomerView } from './modules/customer/CustomerView'
import { useOrderStore } from './store/useOrderStore'

function App() {
  const initCatalog = useOrderStore((state) => state.initCatalog)

  useEffect(() => {
    void initCatalog()
  }, [initCatalog])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-red-600">PizzaClick OS</h1>
        <p className="text-gray-600">Experiencia de Cliente</p>
      </header>

      <main className="mx-auto w-full max-w-6xl">
        <Routes>
          <Route path="/" element={<CustomerView />} />
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App