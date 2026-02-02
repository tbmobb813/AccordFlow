'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ClerkProvider to avoid loading Clerk during build when key is absent
const ClerkProvider = dynamic(() => import('@clerk/nextjs').then((m) => m.ClerkProvider), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  if (!clerkPublishableKey) {
    // Safe fallback: do not initialize Clerk when publishable key is missing (e.g., CI/prerender)
    return content;
  }

  return (
    // Initialize Clerk only when publishable key is available
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ClerkProvider publishableKey={clerkPublishableKey}>{content}</ClerkProvider>
  );
}
