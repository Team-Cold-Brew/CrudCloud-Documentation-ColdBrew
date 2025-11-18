# Instalación y Setup

## Requisitos Previos

- Node.js 18+ (LTS recomendado)
- npm 9+ o yarn 1.22+
- Git

## Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Team-Cold-Brew/CrudCloud-Frontend.git
cd CrudCloud-Frontend
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Backend
VITE_API_URL=http://localhost:8080/api

# Mercado Pago (opcional para desarrollo)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key

# Environment
VITE_ENV=development
```

### 4. Iniciar el Servidor de Desarrollo

```bash
# Con npm
npm run dev

# Con yarn
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

```json
{
  "scripts": {
    "dev": "vite",                    // Servidor de desarrollo
    "build": "vite build",            // Build de producción
    "preview": "vite preview",        // Preview del build
    "lint": "eslint . --ext js,jsx",  // Linter
    "format": "prettier --write ."    // Formatear código
  }
}
```

## Estructura de Archivos

```
CrudCloud-Frontend/
├── public/              # Assets estáticos
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── components/      # Componentes React
│   │   ├── common/      # Componentes reutilizables
│   │   └── layout/      # Layouts y navegación
│   ├── pages/           # Páginas de la aplicación
│   ├── context/         # React Context
│   ├── utils/           # Utilidades y helpers
│   ├── styles/          # Estilos globales
│   ├── App.jsx          # Componente raíz
│   ├── main.jsx         # Entry point
│   └── index.css        # CSS principal
├── .env.local           # Variables de entorno
├── .eslintrc.js         # Configuración ESLint
├── .prettierrc          # Configuración Prettier
├── index.html           # HTML base
├── package.json         # Dependencias
├── tailwind.config.js   # Config TailwindCSS
├── vite.config.js       # Config Vite
└── README.md            # Documentación
```

## Configuración de Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

## Configuración de TailwindCSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#EA580C',
      },
    },
  },
  plugins: [],
}
```

## Configuración de ESLint

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

## Configuración de Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

## Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.294.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

## Variables de Entorno

### Desarrollo (`.env.local`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

### Producción (`.env.production`)

```env
VITE_API_URL=https://api.cold-brew.crudzaso.com/api
VITE_ENV=production
```

### Uso en el Código

```javascript
const API_URL = import.meta.env.VITE_API_URL
const IS_DEV = import.meta.env.VITE_ENV === 'development'
```

## Build para Producción

### 1. Crear Build

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos optimizados.

### 2. Preview del Build

```bash
npm run preview
```

### 3. Verificar el Build

```bash
# Verificar tamaño de archivos
du -sh dist/*

# Verificar estructura
tree dist/
```

## Optimización del Build

### Code Splitting

Vite automáticamente hace code splitting. Para lazy loading manual:

```javascript
// App.jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
```

### Optimización de Imágenes

```bash
# Instalar plugin de optimización
npm install vite-plugin-imagemin -D
```

```javascript
// vite.config.js
import imagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
    }),
  ],
})
```

## Troubleshooting

### Puerto en uso

```bash
# Cambiar puerto en vite.config.js
server: {
  port: 3000
}
```

### Error de importación de TailwindCSS

Asegúrate de tener `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Problema con variables de entorno

Las variables deben empezar con `VITE_` para ser accesibles:

```env
# ❌ Incorrecto
API_URL=http://localhost:8080

# ✅ Correcto
VITE_API_URL=http://localhost:8080
```

### Build falla por warnings de ESLint

```bash
# Build ignorando warnings
npm run build -- --no-lint
```

## Hot Module Replacement (HMR)

Vite incluye HMR por defecto. Para preservar estado:

```javascript
// src/pages/Dashboard.jsx
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

## Testing (Preparado)

```bash
# Instalar Vitest y React Testing Library
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// vite.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

## Próximos Pasos

- [Estructura del Proyecto](./project-structure.md)
- [Componentes](./components.md)
- [Integración con API](./api-integration.md)
- [Deployment](./deployment.md)
