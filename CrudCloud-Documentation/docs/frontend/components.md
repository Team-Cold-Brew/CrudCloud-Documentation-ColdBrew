# Componentes

## Estructura de Componentes

El proyecto sigue una arquitectura de componentes organizada en dos categorías principales:

1. **Common Components** - Componentes reutilizables
2. **Layout Components** - Componentes de estructura

---

## Common Components

### Button

Componente de botón reutilizable con variantes y estados.

**Ubicación:** `src/components/common/Button.jsx`

```jsx
import Button from '@/components/common/Button'

// Variantes
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>
<Button variant="outline">Outline Button</Button>

// Estados
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Estilo del botón |
| `size` | `string` | `'md'` | Tamaño del botón |
| `loading` | `boolean` | `false` | Muestra spinner de carga |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `onClick` | `function` | - | Callback al hacer click |
| `type` | `string` | `'button'` | Tipo HTML del botón |

---

### Input

Componente de input con validación y mensajes de error.

**Ubicación:** `src/components/common/Input.jsx`

```jsx
import Input from '@/components/common/Input'

<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del input |
| `type` | `string` | `'text'` | Tipo de input HTML |
| `value` | `string` | - | Valor del input |
| `onChange` | `function` | - | Callback onChange |
| `error` | `string` | - | Mensaje de error |
| `required` | `boolean` | `false` | Campo requerido |
| `disabled` | `boolean` | `false` | Deshabilita el input |
| `placeholder` | `string` | - | Placeholder |

---

### Modal

Componente de modal con overlay.

**Ubicación:** `src/components/common/Modal.jsx`

```jsx
import Modal from '@/components/common/Modal'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Acción"
>
  <p>¿Estás seguro de eliminar esta instancia?</p>
  <div className="mt-4 flex gap-2">
    <Button onClick={handleConfirm}>Confirmar</Button>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
  </div>
</Modal>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controla visibilidad |
| `onClose` | `function` | - | Callback al cerrar |
| `title` | `string` | - | Título del modal |
| `children` | `node` | - | Contenido del modal |
| `size` | `string` | `'md'` | Tamaño del modal |

---

### Card

Componente de tarjeta con sombra y padding.

**Ubicación:** `src/components/common/Card.jsx`

```jsx
import Card from '@/components/common/Card'

<Card>
  <Card.Header>
    <h3>Título de la Tarjeta</h3>
  </Card.Header>
  <Card.Body>
    <p>Contenido de la tarjeta</p>
  </Card.Body>
  <Card.Footer>
    <Button>Acción</Button>
  </Card.Footer>
</Card>
```

---

### Toast

Notificaciones temporales.

**Ubicación:** `src/components/common/Toast.jsx`

```jsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('Instancia creada exitosamente', 'success')
  }

  const handleError = () => {
    showToast('Error al crear instancia', 'error')
  }
}
```

**Tipos:**
- `success` - Verde con ✓
- `error` - Rojo con ✗
- `warning` - Naranja con ⚠
- `info` - Azul con ℹ

---

### Badge

Etiquetas de estado.

**Ubicación:** `src/components/common/Badge.jsx`

```jsx
import Badge from '@/components/common/Badge'

<Badge variant="success">RUNNING</Badge>
<Badge variant="warning">CREATING</Badge>
<Badge variant="error">SUSPENDED</Badge>
<Badge variant="gray">DELETED</Badge>
```

---

### Select

Dropdown select personalizado.

**Ubicación:** `src/components/common/Select.jsx`

```jsx
import Select from '@/components/common/Select'

<Select
  label="Motor de Base de Datos"
  value={engine}
  onChange={(e) => setEngine(e.target.value)}
  options={[
    { value: 'MySQL', label: 'MySQL 8.0' },
    { value: 'PostgreSQL', label: 'PostgreSQL 14' },
    { value: 'MongoDB', label: 'MongoDB 6.0' },
  ]}
/>
```

---

## Layout Components

### Sidebar

Barra lateral de navegación.

**Ubicación:** `src/components/layout/Sidebar.jsx`

```jsx
import Sidebar from '@/components/layout/Sidebar'

<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

**Características:**
- Navegación principal
- Indicador de página activa
- Responsive (drawer en móvil)
- Íconos con Lucide React

---

### Navbar

Barra superior con usuario y acciones.

**Ubicación:** `src/components/layout/Navbar.jsx`

```jsx
import Navbar from '@/components/layout/Navbar'

<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
```

**Elementos:**
- Botón de menú (móvil)
- Nombre de usuario
- Avatar
- Dropdown de perfil
- Botón de logout

---

### LayoutDashboard

Layout principal que combina Sidebar y Navbar.

**Ubicación:** `src/components/layout/LayoutDashboard.jsx`

```jsx
import LayoutDashboard from '@/components/layout/LayoutDashboard'

function App() {
  return (
    <LayoutDashboard>
      <Dashboard />
    </LayoutDashboard>
  )
}
```

---

## Hooks Personalizados

### useAuth

Hook para acceder al contexto de autenticación.

```jsx
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.name}</p>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </div>
  )
}
```

---

### useToast

Hook para mostrar notificaciones.

```jsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { showToast } = useToast()

  const handleClick = async () => {
    try {
      await api.post('/databases', data)
      showToast('Base de datos creada', 'success')
    } catch (error) {
      showToast('Error al crear base de datos', 'error')
    }
  }
}
```

---

### useCopyToClipboard

Hook para copiar texto al portapapeles.

```jsx
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

function CredentialsDisplay({ password }) {
  const [copied, copyToClipboard] = useCopyToClipboard()

  return (
    <div>
      <code>{password}</code>
      <Button onClick={() => copyToClipboard(password)}>
        {copied ? 'Copiado!' : 'Copiar'}
      </Button>
    </div>
  )
}
```

---

## Patrones de Diseño

### Compound Components

```jsx
// Card compound component
<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

### Render Props

```jsx
// DataFetcher with render prop
<DataFetcher url="/api/databases">
  {({ data, loading, error }) => (
    loading ? <Spinner /> :
    error ? <Error message={error} /> :
    <DatabaseList data={data} />
  )}
</DataFetcher>
```

### Higher-Order Components

```jsx
// withAuth HOC
const ProtectedRoute = withAuth(Dashboard)
```

---

## Estilos con TailwindCSS

### Clases Reutilizables

```css
/* src/styles/globals.css */

/* Botones */
.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition;
}

/* Cards */
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

/* Inputs */
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary;
}
```

### Responsive Design

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {databases.map(db => <DatabaseCard key={db.id} {...db} />)}
</div>
```

---

## Accesibilidad

### ARIA Labels

```jsx
<button
  aria-label="Cerrar modal"
  aria-describedby="modal-description"
  onClick={onClose}
>
  <X size={20} />
</button>
```

### Keyboard Navigation

```jsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Clickeable div
</div>
```

---

## Testing de Componentes

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/common/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
```

---

## Próximos Pasos

- [API Integration](./api-integration.md)
- [State Management](./state-management.md)
- [Deployment](./deployment.md)
