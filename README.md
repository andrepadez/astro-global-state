# astro-global-state

Global state management for Astro + React Query, designed specifically for SSR/hydration safety in Astro's island architecture.

## Installation

```bash
npm install astro-global-state @tanstack/react-query
```

## Quick Start

### 1. Create a language selector with hook mode (subscribes to changes)

> **Important:** Initialize global state early in your component tree. The component that first calls `useGlobal(key, value)` should be rendered before any component that accesses or depends on that state.

```tsx
import { useGlobal, withReactQuery } from "astro-global-state";

function LanguageSelectorInner() {
  const [language, setLanguage] = useGlobal<"en" | "pt">("LANGUAGE", "en");

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "pt")}>
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
  );
}

export const LanguageSelector = withReactQuery(LanguageSelectorInner);
```

### 2. Use the selected language for translations (hook mode - re-renders on language change)

```tsx
import { useGlobal, withReactQuery } from "astro-global-state";

const translations = {
  en: { greeting: "Hello", farewell: "Goodbye" },
  pt: { greeting: "Olá", farewell: "Adeus" },
};

function TranslatedContentInner() {
  // here, as the value is already globally set, you don't pass the second argument as to not override the original one
  const [language] = useGlobal<"en" | "pt">("LANGUAGE");

  return (
    <div>
      <h1>{translations[language].greeting}</h1>
      <p>{translations[language].farewell}</p>
    </div>
  );
}

export const TranslatedContent = withReactQuery(TranslatedContentInner);
```

### 3. Access language without re-renders (accessor mode - read-only)

```tsx
import { useGlobal, withReactQuery } from "astro-global-state";

function AnalyticsInner() {
  const { get } = useGlobal();

  const handleClick = () => {
    // Gets current language WITHOUT subscribing to changes
    // This function won't re-run when language changes
    const currentLanguage = get("LANGUAGE");
    console.log(`User clicked in ${currentLanguage}`);
  };

  return <button onClick={handleClick}>Track Event</button>;
}

export const Analytics = withReactQuery(AnalyticsInner);
```

## API

### `useGlobal<T>(key, initialData?)`

Global state management hook using React Query's cache as the store. Must be used inside a component wrapped with `withReactQuery`.

**Parameters:**

- `key`: State key (string or string[])
- `initialData`: Optional initial value or initializer function

**Returns:**

- `[value, setValue, refresh, reset]` - Tuple with state value, setter, refresh, and reset functions

**Example:**

```tsx
const [user, setUser, refresh, reset] = useGlobal<User>("CURRENT_USER", null);

setUser({ name: "John" }); // Update state
refresh(); // Invalidate cache (triggers re-render)
reset(); // Remove from cache
```

### `useGlobal()`

Accessor mode - get any global value without subscribing to updates.

**Returns:**

- `{ get: <R>(key) => R | null }` - Function to access cached values

**Example:**

```tsx
const { get } = useGlobal();
const theme = get("THEME"); // No re-render on update
```

### `withReactQuery<P>(Component)`

Higher-order component that automatically wraps a component in `ReactQueryProvider`. Enables all React Query hooks including `useGlobal` to work correctly.

**Parameters:**

- `Component`: Any React component

**Returns:**

- Wrapped component with React Query context

**Example:**

```tsx
function MyComponent() {
  const [data, setData] = useGlobal("KEY", null);
  return <div>{data}</div>;
}

export default withReactQuery(MyComponent);
```

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

1. **Always wrap components with `withReactQuery`** - Required for `useGlobal` to work
2. **Use descriptive key names** - Helps with debugging and cache visibility
3. **Initialize with appropriate defaults** - Prevents undefined issues
4. **Keep state as simple as possible** - Use React Query's `useQuery` for server state
5. **Use accessor mode for read-only access** - Avoids unnecessary re-renders when you only need to read values

## Troubleshooting

### "No QueryClient available"

Ensure your component is wrapped with `withReactQuery`. This automatically provides the React Query context needed for `useGlobal` to work.

### `useGlobal` is not a function

Check that your component is wrapped with `withReactQuery`. `useGlobal` can only be called inside components that are wrapped with this HOC.

### Hydration mismatch warnings

Hydration mismatches typically occur when SSR and client render different values. Initialize `useGlobal` with consistent data (avoid random values during initialization).

### State not persisting across components

All components using `useGlobal` share the same React Query client cache. Use consistent key names to share state across components.

## License

MIT
