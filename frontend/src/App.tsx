import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
