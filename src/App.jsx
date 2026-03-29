import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import AppLayout from './components/layout/AppLayout.jsx';
import { AppStateProvider, isProfileComplete } from './context/AppStateContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ROUTES } from './routes/paths.js';
import { useAppState } from './context/appState.js';
import { useEffect } from 'react';

import GeneratorView from './views/GeneratorView.jsx';
import ExploreView from './views/ExploreView.jsx';
import MealPlanView from './views/MealPlanView.jsx';
import ProfileView from './views/ProfileView.jsx';
import SettingsView from './views/SettingsView.jsx';
import SavedView from './views/SavedView.jsx';
import AddRecipeView from './views/AddRecipeView.jsx';
import LoginView from './views/LoginView.jsx';
import OnboardingView from './views/OnboardingView.jsx';

function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[--c-bg] to-white dark:from-gray-950 dark:to-gray-900">
      <div className="flex flex-col items-center gap-5 animate-pulse">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg rotate-3" style={{ background: 'var(--c-primary)' }}>
          <ChefHat size={42} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-700 dark:text-white">NutriChef <span style={{ color: 'var(--c-primary)' }}>IA</span></h1>
      </div>
    </div>
  );
}

// Redirige al onboarding si el perfil está incompleto
function OnboardingGuard({ children }) {
  const { profile, firestoreReady } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (firestoreReady && !isProfileComplete(profile)) {
      navigate(ROUTES.onboarding, { replace: true });
    }
  }, [firestoreReady, profile, navigate]);

  return children;
}

function AppRoutes() {
  const { user, isLocalMode } = useAuth();

  if (user === undefined && !isLocalMode) return <SplashScreen />;
  if (user === null && !isLocalMode) return <LoginView />;

  return (
    <AppStateProvider>
      <Routes>
        {/* Onboarding fuera del layout principal */}
        <Route path={ROUTES.onboarding} element={<OnboardingView />} />

        <Route path={ROUTES.home} element={
          <OnboardingGuard>
            <AppLayout />
          </OnboardingGuard>
        }>
          <Route index element={<Navigate to={ROUTES.create} replace />} />
          <Route path={ROUTES.create.slice(1)} element={<GeneratorView />} />
          <Route path={ROUTES.explore.slice(1)} element={<ExploreView />} />
          <Route path={ROUTES.saved.slice(1)} element={<SavedView />} />
          <Route path={ROUTES.plan.slice(1)} element={<MealPlanView />} />
          <Route path={ROUTES.profile.slice(1)} element={<ProfileView />} />
          <Route path={ROUTES.settings.slice(1)} element={<SettingsView />} />
          <Route path="add-recipe" element={<AddRecipeView />} />
          <Route path="*" element={<Navigate to={ROUTES.create} replace />} />
        </Route>
      </Routes>
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
