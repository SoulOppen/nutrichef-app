import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import { AppStateProvider } from './context/AppStateContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ROUTES } from './routes/paths.js';
import GeneratorView from './views/GeneratorView.jsx';
import ExploreView from './views/ExploreView.jsx';
import MealPlanView from './views/MealPlanView.jsx';
import ProfileView from './views/ProfileView.jsx';
import SavedView from './views/SavedView.jsx';
import LoginView from './views/LoginView.jsx';

function AppRoutes() {
  const { user } = useAuth();

  // Mientras Firebase verifica la sesión, no renderizamos nada
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No autenticado → pantalla de login
  if (user === null) {
    return <LoginView />;
  }

  // Autenticado → app normal
  return (
    <AppStateProvider>
      <Routes>
        <Route path={ROUTES.home} element={<AppLayout />}>
          <Route index element={<Navigate to={ROUTES.create} replace />} />
          <Route path={ROUTES.create.slice(1)} element={<GeneratorView />} />
          <Route path={ROUTES.explore.slice(1)} element={<ExploreView />} />
          <Route path={ROUTES.saved.slice(1)} element={<SavedView />} />
          <Route path={ROUTES.plan.slice(1)} element={<MealPlanView />} />
          <Route path={ROUTES.profile.slice(1)} element={<ProfileView />} />
          <Route path="*" element={<Navigate to={ROUTES.create} replace />} />
        </Route>
      </Routes>
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
