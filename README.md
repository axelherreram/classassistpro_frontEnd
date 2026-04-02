# ClassAssist Frontend

Aplicación frontend de ClassAssist, una plataforma para gestión de clases, asistencias, participación y desempeño de estudiantes.

## Tecnologías principales

- React 19 + Vite
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS

## Estructura básica

```text
frontend/
	src/
		components/      # Vistas y componentes por módulo
		services/        # Cliente API y servicios por dominio
		App.jsx          # Enrutamiento principal
		main.jsx         # Punto de entrada
```

## Requisitos

- Node.js 18 o superior
- npm

## Variables de entorno

Crea un archivo `.env` dentro de `frontend/` con:

```env
VITE_API_URL=http://localhost:3000/api
```

## Instalación y ejecución

1. Instalar dependencias del frontend:

```bash
cd frontend
npm install
```

2. Ejecutar en desarrollo:

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

4. Previsualizar build:

```bash
npm run preview
```

## Backend (resumen rápido)

El frontend consume el API del backend en `/api`. Para levantarlo:

```bash
cd backend
npm install
npm run dev
```

Variables mínimas esperadas por backend:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tu_base
DB_USER=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_jwt
```

## Endpoints útiles

- API status: `GET http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`
