'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.jsx';
import { ROUTES } from '@/lib/routes.js';
import { SplashScreen } from '@/components/routing/RouteScreens.jsx';

export default function Page() {
  const router = useRouter();
  const { user, isLocalMode } = useAuth();

  useEffect(() => {
    if (user === undefined && !isLocalMode) return;

    if ((user && !isLocalMode) || isLocalMode) {
      router.replace(ROUTES.cook);
      return;
    }

    if (user === null && !isLocalMode) {
      router.replace('/auth');
    }
  }, [user, isLocalMode, router]);

  if (user === undefined && !isLocalMode) {
    return <SplashScreen />;
  }

  return null;
}
