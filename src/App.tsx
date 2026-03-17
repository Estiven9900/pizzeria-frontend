import { OrderTimer } from './components/OrderTimer';

function App() {
  const mockCreatedAt = Date.now();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-red-600">PizzaClick OS</h1>
        <p className="text-gray-600">Panel de Control - Modo Desarrollo</p>
      </header>

      <main className="max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Estado del Pedido</h2>
        <OrderTimer createdAt={mockCreatedAt} />
      </main>
    </div>
  )
}

export default App;