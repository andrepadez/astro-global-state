# astro-global-state

Global state management for Astro + React Query, designed specifically for SSR/hydration safety in Astro's island architecture.

## Installation

```bash
npm install astro-global-state @tanstack/react-query
```

## Quick Start

### 1. Setup in your Astro layout

```tsx
// src/layouts/main.astro
import { ReactQueryProvider } from "@vimazing/astro-global";

<html>
  <body>
    <ReactQueryProvider>
      <slot />
    </ReactQueryProvider>
  </body>
</html>;
```

### 2. Create a global state hook in your component

```tsx
import { useGlobal } from "astro-global-state";

export function MyComponent() {
  const [theme, setTheme] = useGlobal<"light" | "dark">("THEME", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

### 3. Use withReactQuery HOC for components that need useGlobal

```tsx
import { withReactQuery, useGlobal } from "astro-global-state";

type MyComponentProps = {
  useGlobal: typeof useGlobal;
};

function MyComponentInner({ useGlobal }: MyComponentProps) {
  const [count, setCount] = useGlobal<number>("COUNT", 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export const MyComponent = withReactQuery(MyComponentInner);
```

## API

### `useGlobal<T>(key, initialData?)`

Global state management hook using React Query's cache as the store.

**Parameters:**

- `key`: State key (string or string[])
- `initialData`: Optional initial value or initializer function

**Returns:**

- `[value, setValue, refresh, reset]` - Similar to useState, with extra cache controls

**Example:**

```tsx
const [user, setUser, refresh, reset] = useGlobal<User>("CURRENT_USER", null);

setUser({ name: "John" }); // Update state
refresh(); // Invalidate (triggers re-render)
reset(); // Remove from cache
```

### `useGlobal()`

Accessor mode - get any global value without subscribing to updates.

**Returns:**

- `{ get: (key) => value | null }` - Access cached values

**Example:**

```tsx
const { get } = useGlobal();
const theme = get("THEME"); // No re-render on update
```

### `withReactQuery<P>(Component)`

HOC that wraps a component in ReactQueryProvider and injects the `useGlobal` hook reference.

**Why:** React hooks can't be passed as props directly, but their references can. This enables type-safe prop passing.

**Parameters:**

- Component must accept `{ useGlobal: typeof useGlobal }` in props

**Example:**

```tsx
type Props = { useGlobal: typeof useGlobal };

function MyComponent({ useGlobal }: Props) {
  const [data, setData] = useGlobal("KEY", null);
  return <div>{data}</div>;
}

export default withReactQuery(MyComponent);
```

### `ReactQueryProvider`

Wraps your app with React Query context. Required at the top level.

**Note:** You can also manually set up React Query's `QueryClientProvider` with the exported `queryClient` singleton if you prefer more control.

## Under the Hood

- **Singleton QueryClient**: A single QueryClient instance persists globally, ensuring all islands share the same cache
- **React Query Cache**: Global state is stored in React Query's query cache with infinite staleTime
- **Hydration Safe**: Automatically handles SSR/client hydration boundaries in Astro
- **Fallback Mechanism**: If `useGlobal` is called outside a provider, it falls back to the global QueryClient

## Common Patterns

### Language/Locale Selection

```tsx
const [language, setLanguage] = useGlobal<"en" | "pt">("LANGUAGE", "en");
```

### Dark Mode Toggle

```tsx
const [isDark, setIsDark] = useGlobal<boolean>("DARK_MODE", false);
```

### Nested State

```tsx
const [user, setUser] = useGlobal(["app", "user"], null);
const [theme, setTheme] = useGlobal(["app", "theme"], "light");
```

## Best Practices

1. **Use descriptive key names** - Helps with debugging and cache visibility
2. **Initialize with appropriate defaults** - Prevents undefined issues
3. **Keep state as simple as possible** - Use React Query's useQuery for server state
4. **Wrap interactive components** - Only use `withReactQuery` on components that need `useGlobal`
5. **Use accessor mode sparingly** - It doesn't cause re-renders, which is sometimes a feature, sometimes a bug

## Troubleshooting

### "No QueryClient available"

Ensure you have `ReactQueryProvider` at the top level of your Astro layout.

### Hydration mismatch warnings

Hydration mismatches typically occur when SSR and client render different values. Initialize `useGlobal` with consistent data (avoid random values during initialization).

### State not persisting across islands

By design, each island gets its own React tree, but they share the same QueryClient cache. Use the singleton cache key pattern to ensure values persist.

## License

MIT
