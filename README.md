# PizzaClick Frontend

Frontend de PizzaClick con React + TypeScript + Vite + Tailwind.

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose (opcional, para levantar frontend y Postgres en contenedor)

## Variables de entorno

Este proyecto valida variables requeridas al iniciar la app desde `src/config/env.ts`.

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Ajusta valores según tu entorno. Variables requeridas para el frontend:

- `VITE_API_URL` — URL del backend/API
- `VITE_APP_ENV` — Entorno de ejecución (opcional, default: `development`)

## Arranque rápido (local)

```bash
npm install
npm run dev
```

La app queda disponible en:

- `http://localhost:5173`

## Arranque con Docker Compose

```bash
docker compose up --build
```

Servicios principales:

- Frontend: `http://localhost:5173`
- Postgres: `localhost:5433`

## Scripts útiles

- `npm run dev`: modo desarrollo
- `npm run build`: compilación de producción
- `npm run preview`: vista previa de build
- `npm run lint`: linting del proyecto

## Flujo recomendado para tomar una tarea

1. Clona el repo y entra a la carpeta `Frontend`.
2. Crea `.env` desde `.env.example`.
3. Instala dependencias con `npm install`.
4. Arranca con `npm run dev`.
5. Antes de enviar cambios, ejecuta:

```bash
npm run lint
npm run build
```

## Troubleshooting

### Error: faltan variables de entorno

Si ves errores como `[Env Error]`, revisa que exista `.env` y que tenga `VITE_API_URL`.

### Error: No se encuentra `react-router-dom`

Instala dependencias del proyecto:

```bash
npm install
```

### No abre desde contenedor

La configuración de Vite ya expone `host: 0.0.0.0` y puerto `5173` en `vite.config.ts`.
