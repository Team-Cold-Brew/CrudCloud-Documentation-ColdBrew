# Installation and Setup

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Team-Cold-Brew/CrudCloud-Frontend.git
cd CrudCloud-Frontend
```

### 2. Install Dependencies

```bash
# With npm
npm install

# With yarn
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# API Backend
VITE_API_URL=http://localhost:8080/api

# Mercado Pago (optional for development)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key

# Environment
VITE_ENV=development
```

### 4. Start Development Server

```bash
# With npm
npm run dev

# With yarn
yarn dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```json
{
  "scripts": {
    "dev": "vite",                    // Development server
    "build": "vite build",            // Production build
    "preview": "vite preview",        // Preview build
    "lint": "eslint . --ext js,jsx",  // Linter
    "format": "prettier --write ."    // Format code
  }
}
```

## File Structure

```
CrudCloud-Frontend/
├── public/              # Static assets
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Reusable components
│   │   └── layout/      # Layouts and navigation
│   ├── pages/           # Application pages
│   ├── context/         # React Context
│   ├── utils/           # Utilities and helpers
│   ├── styles/          # Global styles
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Main CSS
├── .env.local           # Environment variables
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── index.html           # Base HTML
├── package.json         # Dependencies
├── tailwind.config.js   # TailwindCSS config
├── vite.config.js       # Vite config
└── README.md            # Documentation
```

## Vite Configuration

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

## TailwindCSS Configuration

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

## ESLint Configuration

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

## Prettier Configuration

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

## Main Dependencies

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

## Environment Variables

### Development (`.env.local`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

### Production (`.env.production`)

```env
VITE_API_URL=https://api.cold-brew.crudzaso.com/api
VITE_ENV=production
```

### Usage in Code

```javascript
const API_URL = import.meta.env.VITE_API_URL
const IS_DEV = import.meta.env.VITE_ENV === 'development'
```

## Production Build

### 1. Create Build

```bash
npm run build
```

This generates the `dist/` folder with optimized files.

### 2. Preview Build

```bash
npm run preview
```

### 3. Verify Build

```bash
# Check file sizes
du -sh dist/*

# Check structure
tree dist/
```

## Build Optimization

### Code Splitting

Vite automatically does code splitting. For manual lazy loading:

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

### Image Optimization

```bash
# Install optimization plugin
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

### Port in use

```bash
# Change port in vite.config.js
server: {
  port: 3000
}
```

### TailwindCSS import error

Make sure you have `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Environment variables problem

Variables must start with `VITE_` to be accessible:

```env
# ❌ Incorrect
API_URL=http://localhost:8080

# ✅ Correct
VITE_API_URL=http://localhost:8080
```

### Build fails due to ESLint warnings

```bash
# Build ignoring warnings
npm run build -- --no-lint
```

## Hot Module Replacement (HMR)

Vite includes HMR by default. To preserve state:

```javascript
// src/pages/Dashboard.jsx
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

## Testing (Prepared)

```bash
# Install Vitest and React Testing Library
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

## Next Steps

- [Components](./components.md)
- [Deployment](./deployment.md)
