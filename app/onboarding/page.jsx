'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingView from '@/views/OnboardingView.jsx';
import LoginView from '@/views/LoginView.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useProfileStore, isProfileComplete } from '@/stores/useProfileStore.js';
import { useSyncStore } from '@/stores/useSyncStore.js';
import { SplashScreen } from '@/components/routing/RouteScreens.jsx';
import { ROUTES } from '@/lib/routes.js';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLocalMode } = useAuth();
  const profile = useProfileStore((s) => s.profile);
  const firestoreReady = useProfileStore((s) => s.firestoreReady);

  useSyncStore();

  useEffect(() => {
    if (firestoreReady && isProfileComplete(profile)) {
      router.replace(ROUTES.cook);
    }
  }, [firestoreReady, profile, router]);

  if (user === undefined && !isLocalMode) return <SplashScreen />;
  if (user === null && !isLocalMode) return <LoginView />;

  return <OnboardingView />;
}
