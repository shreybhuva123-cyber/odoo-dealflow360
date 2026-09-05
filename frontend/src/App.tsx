import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/routes';
import { ToastStack } from '@/components/feedback/ToastStack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastStack />
    </QueryClientProvider>
  );
}

export default App;
