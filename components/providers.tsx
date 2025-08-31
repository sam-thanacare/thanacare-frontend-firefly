'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </PersistGate>
      ) : (
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      )}
    </Provider>
  );
}
