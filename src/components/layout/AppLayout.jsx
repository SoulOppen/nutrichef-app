import { Bookmark, Calendar, ChefHat, Compass, Settings, Utensils } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.js';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: ROUTES.create, label: 'Crear', icon: Utensils },
  { to: ROUTES.explore, label: 'Explorar', icon: Compass },
  { to: ROUTES.saved, label: 'Guardados', icon: Bookmark },
  { to: ROUTES.plan, label: 'Plan', icon: Calendar },
  { to: ROUTES.profile, label: 'Perfil', icon: Settings },
];

function desktopNavClass({ isActive }) {
  return `flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-sm font-bold transition-all ${
    isActive ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;
}

function mobileNavClass({ isActive }) {
  return `flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-all ${
    isActive ? 'text-orange-600' : 'text-slate-400'
  }`;
}

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20 md:pb-12">
      {/* Header — visible en todos los tamaños */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to={ROUTES.create} className="flex items-center gap-2 text-orange-600">
            <ChefHat size={28} />
            <h1 className="text-xl font-bold tracking-tight">NutriChef IA</h1>
          </NavLink>

          {/* Nav desktop — oculta en mobile */}
          <nav className="hidden sm:flex gap-1 md:gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopNavClass}>
                <item.icon size={18} />
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Avatar de usuario */}
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Usuario'}
              title={user.displayName || ''}
              className="w-9 h-9 rounded-full border-2 border-orange-200 shadow-sm hidden sm:block"
            />
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Bottom nav — solo en mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 flex">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileNavClass}>
            {({ isActive }) => (
              <>
                <item.icon
                  size={22}
                  className={isActive ? 'text-orange-500' : 'text-slate-400'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
