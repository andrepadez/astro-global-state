import { ReactQueryProvider } from "./ReactQueryProvider";

/**
 * Higher-order component that automatically wraps a component in ReactQueryProvider.
 * Ensures that any hook using React Query (useQuery, useMutation, useGlobal, etc.)
 * always has access to the shared QueryClient context.
 */
export function withReactQuery<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
  const WithReactQuery: React.FC<P> = (props) => (
    <ReactQueryProvider>
      <WrappedComponent {...props} />
    </ReactQueryProvider>
  );

  // For easier debugging in React DevTools
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  WithReactQuery.displayName = `withReactQuery(${wrappedName})`;

  return WithReactQuery;
}
