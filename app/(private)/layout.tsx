'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext.jsx';
import { FoodPreferencesProvider } from '@/context/FoodPreferencesContext.jsx';
import LoginView from '@/views/LoginView.jsx';
import AppLayout from '@/components/layout/AppLayout.jsx';
import { SplashScreen } from '@/components/routing/RouteScreens.jsx';
import { useProfileStore, isProfileComplete } from '@/stores/useProfileStore.js';
import { useSyncStore } from '@/stores/useSyncStore.js';
import { ROUTES } from '@/lib/routes.js';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLocalMode } = useAuth();
  const profile = useProfileStore((s) => s.profile);
  const firestoreReady = useProfileStore((s) => s.firestoreReady);

  useSyncStore();

  useEffect(() => {
    if (firestoreReady && !isProfileComplete(profile)) {
      router.replace(ROUTES.onboarding);
    }
  }, [firestoreReady, profile, router]);

  if (user === undefined && !isLocalMode) return <SplashScreen />;
  if (user === null && !isLocalMode) return <LoginView />;

  return (
    <FoodPreferencesProvider>
      <AppLayout>{children}</AppLayout>
    </FoodPreferencesProvider>
  );
}
