import { QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider } from '@heroui/react';
import { queryClient } from './lib/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from './shared/components/Toast/Toast';

function App() {
  return (
    <HeroUIProvider>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
        <ToastContainer />
      </QueryClientProvider>
    </HeroUIProvider>
  );
}

export default App;
