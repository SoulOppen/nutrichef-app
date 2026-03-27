import { useAuth } from '../context/AuthContext.jsx';

export default function LoginView() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">NutriChef</h1>
        <p className="text-neutral-400 text-sm">Tu asistente de cocina con IA</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4">
        <p className="text-neutral-300 text-center text-sm mb-2">
          Inicia sesión para guardar tus recetas y perfil en todos tus dispositivos
        </p>
        <button
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-3 w-full bg-white text-neutral-900 font-semibold py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
