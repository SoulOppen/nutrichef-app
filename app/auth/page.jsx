'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '@/views/LoginView.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { ROUTES } from '@/lib/routes.js';

export default function AuthPage() {
  const router = useRouter();
  const { user, isLocalMode } = useAuth();

  useEffect(() => {
    if (user || isLocalMode) {
      router.replace(ROUTES.cook);
    }
  }, [user, isLocalMode, router]);

  return <LoginView />;
}
