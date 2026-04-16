'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogContext.jsx';
import QueryProvider from '@/providers/QueryProvider.jsx';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmDialogProvider>
          <QueryProvider>{children}</QueryProvider>
        </ConfirmDialogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
