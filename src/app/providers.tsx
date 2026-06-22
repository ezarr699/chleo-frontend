/**
 * ============================================================
 * @module      app
 * @layer       app > provider
 * @file        providers.tsx
 * @path        src/app/providers.tsx
 * @description Global providers: TanStack Query client & Toaster.
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/quick-start
 * ============================================================
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/components/ui/sonner'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
