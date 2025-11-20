# Components

## Component Structure

The project follows a component architecture organized into two main categories:

1. **Common Components** - Reusable components
2. **Layout Components** - Structure components

---

## Common Components

### Button

Reusable button component with variants and states.

**Location:** `src/components/common/Button.jsx`

```jsx
import Button from '@/components/common/Button'

// Variants
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger Button</Button>
<Button variant="outline">Outline Button</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Button style |
| `size` | `string` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `disabled` | `boolean` | `false` | Disables button |
| `onClick` | `function` | - | Click callback |
| `type` | `string` | `'button'` | HTML button type |

---

### Input

Input component with validation and error messages.

**Location:** `src/components/common/Input.jsx`

```jsx
import Input from '@/components/common/Input'

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `type` | `string` | `'text'` | HTML input type |
| `value` | `string` | - | Input value |
| `onChange` | `function` | - | onChange callback |
| `error` | `string` | - | Error message |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disables input |
| `placeholder` | `string` | - | Placeholder |

---

### Modal

Modal component with overlay.

**Location:** `src/components/common/Modal.jsx`

```jsx
import Modal from '@/components/common/Modal'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to delete this instance?</p>
  <div className="mt-4 flex gap-2">
    <Button onClick={handleConfirm}>Confirm</Button>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
  </div>
</Modal>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controls visibility |
| `onClose` | `function` | - | Close callback |
| `title` | `string` | - | Modal title |
| `children` | `node` | - | Modal content |
| `size` | `string` | `'md'` | Modal size |

---

### Card

Card component with shadow and padding.

**Location:** `src/components/common/Card.jsx`

```jsx
import Card from '@/components/common/Card'

<Card>
  <Card.Header>
    <h3>Card Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Card content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

### Toast

Temporary notifications.

**Location:** `src/components/common/Toast.jsx`

```jsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('Instance created successfully', 'success')
  }

  const handleError = () => {
    showToast('Error creating instance', 'error')
  }
}
```

**Types:**
- `success` - Green with ✓
- `error` - Red with ✗
- `warning` - Orange with ⚠
- `info` - Blue with ℹ

---

### Badge

Status labels.

**Location:** `src/components/common/Badge.jsx`

```jsx
import Badge from '@/components/common/Badge'

<Badge variant="success">RUNNING</Badge>
<Badge variant="warning">CREATING</Badge>
<Badge variant="error">SUSPENDED</Badge>
<Badge variant="gray">DELETED</Badge>
```

---

### Select

Custom dropdown select.

**Location:** `src/components/common/Select.jsx`

```jsx
import Select from '@/components/common/Select'

<Select
  label="Database Engine"
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

Sidebar navigation.

**Location:** `src/components/layout/Sidebar.jsx`

```jsx
import Sidebar from '@/components/layout/Sidebar'

<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

**Features:**
- Main navigation
- Active page indicator
- Responsive (drawer on mobile)
- Icons with Lucide React

---

### Navbar

Top bar with user and actions.

**Location:** `src/components/layout/Navbar.jsx`

```jsx
import Navbar from '@/components/layout/Navbar'

<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
```

**Elements:**
- Menu button (mobile)
- Username
- Avatar
- Profile dropdown
- Logout button

---

### LayoutDashboard

Main layout that combines Sidebar and Navbar.

**Location:** `src/components/layout/LayoutDashboard.jsx`

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

## Custom Hooks

### useAuth

Hook to access authentication context.

```jsx
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}</p>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </div>
  )
}
```

---

### useToast

Hook to display notifications.

```jsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { showToast } = useToast()

  const handleClick = async () => {
    try {
      await api.post('/databases', data)
      showToast('Database created', 'success')
    } catch (error) {
      showToast('Error creating database', 'error')
    }
  }
}
```

---

### useCopyToClipboard

Hook to copy text to clipboard.

```jsx
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

function CredentialsDisplay({ password }) {
  const [copied, copyToClipboard] = useCopyToClipboard()

  return (
    <div>
      <code>{password}</code>
      <Button onClick={() => copyToClipboard(password)}>
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  )
}
```

---

## Design Patterns

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

## Styles with TailwindCSS

### Reusable Classes

```css
/* src/styles/globals.css */

/* Buttons */
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

## Accessibility

### ARIA Labels

```jsx
<button
  aria-label="Close modal"
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

## Component Testing

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

## Next Steps

- [Deployment](./deployment.md)
- [Frontend Introduction](./intro.md)
