import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import { AppStateProvider } from './context/AppStateContext.jsx';
import { ROUTES } from './routes/paths.js';
import GeneratorView from './views/GeneratorView.jsx';
import ExploreView from './views/ExploreView.jsx';
import MealPlanView from './views/MealPlanView.jsx';
import ProfileView from './views/ProfileView.jsx';
import SavedView from './views/SavedView.jsx';

export default function App() {
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
