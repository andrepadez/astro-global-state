# useGlobal

Global state management hook using React Query under the hood.

## Usage

### Hook Mode

```typescript
import { useGlobal } from '@vimazing/hooks/useGlobal';

function UserComponent() {
  const [user, setUser, refresh, reset] = useGlobal('CURRENT_USER', null);
  
  return (
    <div>
      <p>User: {user?.name}</p>
      <button onClick={() => setUser({ name: 'John' })}>Set User</button>
      <button onClick={refresh}>Refresh</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Accessor Mode

```typescript
import { useGlobal } from '@vimazing/hooks/useGlobal';

function AnotherComponent() {
  const global = useGlobal();
  const user = global.get('CURRENT_USER');
  
  return <div>{user?.name}</div>;
}
```

## API

### Hook Mode

```typescript
useGlobal<T>(key: StateKey, initialData?: T | (() => T))
```

Returns: `[data, setData, refresh, reset]`

### Accessor Mode

```typescript
useGlobal()
```

Returns: `{ get: <R>(key: StateKey) => R | null }`

## Features

- Global state shared across components
- Powered by React Query
- Supports nested keys (arrays)
- Accessor mode for read-only access
- Automatic persistence
- Type-safe
