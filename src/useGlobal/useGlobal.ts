import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { queryClient as globalQueryClient } from "../react-query-client";

export const GLOBAL_KEY = "__GLOBAL_STATE__";
export type StateKey = string | string[];

// 🔹 Overload 1: Accessor mode
export function useGlobal(): { get: <R = unknown>(key: StateKey) => R | null };

// 🔹 Overload 2: Hook mode
export function useGlobal<T>(
  key: StateKey,
  initialData?: T | null | (() => T | null),
): readonly [
  T | null,
  React.Dispatch<React.SetStateAction<T | null>>,
  () => void,
  () => void,
];

// ✅ Implementation
export function useGlobal<T>(key?: StateKey, initialData?: T | (() => T)): any {
  let queryClient: QueryClient | undefined;

  // Try to get context client (if inside a provider)
  try {
    queryClient = useQueryClient();
  } catch {
    // If no provider exists, fall back to global singleton
    queryClient = globalQueryClient;
  }

  if (!queryClient) {
    throw new Error(
      "[useGlobal] No QueryClient available. Ensure ReactQueryProvider or globalQueryClient is configured.",
    );
  }

  // ---- Accessor mode ----
  if (!key) {
    const get = <R = unknown>(key: StateKey): R | null => {
      const theKey = [GLOBAL_KEY, Array.isArray(key) ? key.join(".") : key];
      const data = queryClient.getQueryData<R>(theKey);
      return data ?? null;
    };
    return { get };
  }

  // ---- Hook mode ----
  const theKey = [GLOBAL_KEY, Array.isArray(key) ? key.join(".") : key];
  const theInitialData =
    typeof initialData === "function"
      ? (initialData as () => T)()
      : initialData;

  const { data } = useQuery<T>({
    queryKey: theKey,
    enabled: false,
    queryFn: () => theInitialData!,
    initialData: theInitialData,
    staleTime: Infinity,
  });

  const setData: React.Dispatch<React.SetStateAction<T>> = (arg) => {
    const val =
      typeof arg === "function" ? (arg as (prev: T) => T)(data as T) : arg;
    queryClient!.setQueryData(theKey, val);
  };

  const reset = () => queryClient!.removeQueries({ queryKey: theKey });
  const refresh = () => queryClient!.invalidateQueries({ queryKey: theKey });

  return [data!, setData, refresh, reset] as const;
}
