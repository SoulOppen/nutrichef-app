import { Navigate, Route, Routes } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
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

// Pantalla de carga con identidad visual en lugar de spinner vacío
function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="flex flex-col items-center gap-5 animate-pulse">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-3xl shadow-lg rotate-3">
          <ChefHat size={42} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-700 tracking-tight">
          NutriChef <span className="text-orange-500">IA</span>
        </h1>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  if (user === undefined) return <SplashScreen />;
  if (user === null) return <LoginView />;

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
