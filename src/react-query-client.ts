import { QueryClient } from '@tanstack/react-query';

declare global {
  var __astroQueryClient: QueryClient | undefined;
}

export const queryClient =
  globalThis.__astroQueryClient ||
  (globalThis.__astroQueryClient = new QueryClient());

