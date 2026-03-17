# Plan de refactor: lógica de countdown compartida

## Objetivo
Centralizar la lógica de cálculo de tiempo restante y la constante de lock para evitar duplicación entre `OrderTimer` y `useOrderStore`.

## Pasos
1. Crear módulo compartido en `src/modules/orderLock.ts`.
2. Mover `ORDER_LOCK_TIME_SECONDS = 60` al módulo compartido.
3. Mover `calculateTimeRemaining` al módulo compartido.
4. Soportar tipos `Date | string | number` en la utilidad.
5. Actualizar `src/store/useOrderStore.ts` para importar desde el módulo compartido.
6. Eliminar constante/función duplicadas en el store.
7. Actualizar `src/components/OrderTimer.tsx` para importar la utilidad compartida.
8. Eliminar constante/función duplicadas en el componente.
9. Verificar que el comportamiento visual y de bloqueo no cambie.

## Criterios de aceptación
- Existe una sola implementación de `calculateTimeRemaining`.
- Existe una sola constante de duración de lock (60s).
- `OrderTimer` y `useOrderStore` compilan usando imports del módulo compartido.
- No hay cambios funcionales en el countdown o bloqueo.

## Nota
Mantener el refactor mínimo y sin cambios de UX.