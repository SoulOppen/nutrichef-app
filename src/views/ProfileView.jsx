import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Apple, BookOpen, CheckCircle2, Dumbbell, HeartPulse, LogOut, Monitor, Moon, PiggyBank, RefreshCw, Sun, Target, Upload } from 'lucide-react';
import { useAppState } from '../context/appState.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme, THEMES } from '../context/ThemeContext.jsx';

export default function ProfileView() {
  const { profile, setProfile } = useAppState();
  const { user, isLocalMode, logout, linkToGoogle } = useAuth();
  const { themeId, setTheme, isDark, colorMode, setMode } = useTheme();

  const commonAllergies = ['Sin Gluten', 'Sin Lácteos', 'Alergia al Maní', 'Alergia a Mariscos', 'Sin Soya'];
  const dietaryStyles = ['Ninguna', 'Vegetariana', 'Vegana', 'Pescatariana', 'Keto', 'Paleo'];
  const religiousDiets = ['Ninguna', 'Halal', 'Kosher', 'Hindú (Sin carne de res)', 'Jainista'];
  const [dislikeInput, setDislikeInput] = useState('');
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    if (profile.weight && profile.height && profile.age && !profile.manualCalories && !profile.manualProtein && !profile.manualFiber) {
      const w = parseFloat(profile.weight), h = parseFloat(profile.height), a = parseFloat(profile.age);
      if (w > 0 && h > 0 && a > 0) {
        let bmr = (10 * w) + (6.25 * h) - (5 * a) + (profile.gender === 'Masculino' ? 5 : -161);
        let tdee = bmr * parseFloat(profile.activityLevel);
        let calTarget = tdee, proteinFactor = 1.6;
        if (profile.goals.includes('Déficit')) { calTarget -= 500; proteinFactor = 2.0; }
        else if (profile.goals.includes('Superávit')) { calTarget += 500; proteinFactor = 2.2; }
        setProfile(prev => ({
          ...prev,
          dailyCalories: Math.round(calTarget).toString(),
          proteinTarget: Math.round(w * proteinFactor).toString(),
          fiberTarget: Math.round((calTarget / 1000) * 14).toString()
        }));
      }
    }
  }, [profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel, profile.goals, profile.manualCalories, profile.manualProtein, profile.manualFiber, setProfile]);

  const toggleAllergy = (res) => setProfile({ ...profile, allergies: profile.allergies.includes(res) ? profile.allergies.filter(r => r !== res) : [...profile.allergies, res] });
  const removeLearnedPreference = (i) => { const p = [...profile.learnedPreferences]; p.splice(i, 1); setProfile({ ...profile, learnedPreferences: p }); };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try { await linkToGoogle(); } catch (err) { console.error(err); } finally { setLinkingGoogle(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Card usuario */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-14 h-14 rounded-full border-2 shadow-sm" style={{ borderColor: 'var(--c-primary-border)' }} />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white" style={{ background: 'var(--c-primary)' }}>
            {user?.displayName?.[0] || '?'}
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-slate-800 dark:text-white">{user?.displayName || (isLocalMode ? 'Modo Local' : 'Usuario')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || (isLocalMode ? 'Sin cuenta — datos solo en este dispositivo' : '')}</p>
        </div>
        {isLocalMode ? (
          <button
            onClick={handleLinkGoogle}
            disabled={linkingGoogle}
            className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl transition-all border-2 text-white"
            style={{ background: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}
          >
            {linkingGoogle ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
            <span className="hidden sm:inline">Vincular Google</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 bg-slate-100 dark:bg-gray-800 hover:bg-red-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-red-200"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        )}
      </div>

      {/* Selector de tema */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wide">🎨 Apariencia</h3>

        {/* Modo claro/oscuro/sistema */}
        <div className="flex gap-2 mb-5">
          {[
            { value: null, label: 'Sistema', icon: Monitor },
            { value: 'light', label: 'Claro', icon: Sun },
            { value: 'dark', label: 'Oscuro', icon: Moon },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={String(value)}
              onClick={() => setMode(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                colorMode === value
                  ? 'border-[--c-primary] bg-[--c-primary-light] text-[--c-primary-text]'
                  : 'border-slate-200 dark:border-gray-700 text-slate-500 dark:text-slate-400 hover:border-[--c-primary-border]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Temas de color */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Color del tema</p>
        <div className="flex gap-3 flex-wrap">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                themeId === t.id
                  ? 'border-[--c-primary] bg-[--c-primary-light] text-[--c-primary-text]'
                  : 'border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
              {themeId === t.id && <CheckCircle2 size={14} style={{ color: 'var(--c-primary)' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Perfil nutricional */}
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-gray-800 pb-4">
          <div className="p-3 rounded-full" style={{ background: 'var(--c-primary-light)', color: 'var(--c-primary)' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tu Perfil Integral</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Medidas, objetivos y preferencias.</p>
          </div>
        </div>

        <div className="space-y-8">

          {/* Meta */}
          <section className="p-6 rounded-2xl border" style={{ background: 'var(--c-primary-light)', borderColor: 'var(--c-primary-border)' }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--c-primary-text)' }}><Target size={20} /> Tu Meta Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--c-primary-text)' }}>¿Cuál es tu objetivo?</label>
                <select value={profile.goals} onChange={(e) => setProfile({...profile, goals: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border outline-none bg-white dark:bg-gray-800 dark:text-white font-medium text-slate-700 shadow-sm" style={{ borderColor: 'var(--c-primary-border)' }}>
                  <option>Mantenimiento y energía</option>
                  <option>Déficit calórico (Pérdida de peso)</option>
                  <option>Superávit calórico (Ganancia muscular)</option>
                  <option>Comer más saludable general</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--c-primary-text)' }}>Nivel de Actividad Física</label>
                <select value={profile.activityLevel} onChange={(e) => setProfile({...profile, activityLevel: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border outline-none bg-white dark:bg-gray-800 dark:text-white font-medium text-slate-700 shadow-sm" style={{ borderColor: 'var(--c-primary-border)' }}>
                  <option value="1.2">Sedentario</option>
                  <option value="1.375">Ligero (1-3 días/semana)</option>
                  <option value="1.55">Moderado (3-5 días/semana)</option>
                  <option value="1.725">Activo (6-7 días/semana)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Biometría */}
          <section className="bg-slate-50 dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Biometría y Cálculos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Edad', field: 'age', placeholder: 'Ej: 30' },
                { label: 'Peso (kg)', field: 'weight', placeholder: 'Ej: 70' },
                { label: 'Altura (cm)', field: 'height', placeholder: 'Ej: 175' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                  <input type="number" value={profile[field]} onChange={(e) => setProfile({...profile, [field]: e.target.value, manualCalories: false})} placeholder={placeholder} className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 focus:ring-2 outline-none bg-white dark:bg-gray-700 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Género</label>
                <select value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 focus:ring-2 outline-none bg-white dark:bg-gray-700 dark:text-white">
                  <option>Femenino</option>
                  <option>Masculino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-gray-700">
              {[
                { label: 'Meta Diaria (kcal)', field: 'dailyCalories', manualKey: 'manualCalories', color: 'orange', note: 'Ajustado según biometría.' },
                { label: 'Proteína (g)', field: 'proteinTarget', manualKey: 'manualProtein', color: 'blue', note: '1.6 – 2.2g/kg según objetivo.' },
                { label: 'Fibra (g)', field: 'fiberTarget', manualKey: 'manualFiber', color: 'green', note: '~14g por cada 1000 kcal.' },
              ].map(({ label, field, manualKey, color, note }) => (
                <div key={field} className={`bg-${color}-100/50 dark:bg-${color}-900/20 p-4 rounded-xl border border-${color}-200 dark:border-${color}-800`}>
                  <label className={`block text-sm font-semibold text-${color}-900 dark:text-${color}-300 mb-1 flex justify-between`}>
                    <span>{label}</span>
                    {profile[manualKey] && <span className={`text-xs bg-${color}-200 dark:bg-${color}-800 px-2 py-0.5 rounded-full`}>Manual</span>}
                  </label>
                  <p className={`text-xs text-${color}-700 dark:text-${color}-400 mb-2`}>{note}</p>
                  <input type="number" value={profile[field]} onChange={(e) => setProfile({...profile, [field]: e.target.value, [manualKey]: true})} placeholder="—" className="w-full p-3 rounded-xl border outline-none bg-white dark:bg-gray-800 dark:text-white" />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700 grid md:grid-cols-2 gap-4">
              {[
                { key: 'useProteinPowder', label: 'Proteína en Polvo', desc: 'Permite recetas con suplemento.', icon: Dumbbell, color: 'blue' },
                { key: 'budgetFriendly', label: 'Modo Económico', desc: 'Prioriza recetas de bajo costo.', icon: PiggyBank, color: 'emerald' },
              ].map(({ key, label, desc, icon: Icon, color }) => (
                <div key={key} className={`flex items-center justify-between bg-${color}-50 dark:bg-${color}-900/20 p-4 rounded-xl border border-${color}-200 dark:border-${color}-800`}>
                  <div>
                    <h4 className={`font-bold text-${color}-900 dark:text-${color}-300 text-sm flex items-center gap-1`}><Icon size={16} /> {label}</h4>
                    <p className={`text-xs text-${color}-700 dark:text-${color}-400`}>{desc}</p>
                  </div>
                  <button onClick={() => setProfile({...profile, [key]: !profile[key]})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile[key] ? `bg-${color}-600` : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Dieta */}
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Apple size={16} className="text-green-500" /> Estilo de Dieta</label>
              <div className="flex flex-wrap gap-2">
                {dietaryStyles.map(diet => (
                  <button key={diet} onClick={() => setProfile({...profile, dietaryStyle: diet})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${profile.dietaryStyle === diet ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>{diet}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={16} className="text-purple-500" /> Dieta Religiosa/Ética</label>
              <div className="flex flex-wrap gap-2">
                {religiousDiets.map(diet => (
                  <button key={diet} onClick={() => setProfile({...profile, religiousDiet: diet})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${profile.religiousDiet === diet ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>{diet}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Alergias */}
          <section>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Alergias e Intolerancias</label>
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map(res => (
                <button key={res} onClick={() => toggleAllergy(res)} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-colors ${profile.allergies.includes(res) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 border border-transparent hover:bg-slate-200'}`}>
                  {profile.allergies.includes(res) && <CheckCircle2 size={14} />}
                  {res}
                </button>
              ))}
            </div>
          </section>

          {/* Dislikes */}
          <section>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ingredientes que NO te gustan</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Escribe un alimento y presiona "Enter".</p>
            <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-xl border border-slate-200 dark:border-gray-600 focus-within:ring-2 transition-all flex flex-wrap gap-2 items-center min-h-[50px]">
              {profile.dislikes.map((item, index) => (
                <span key={index} className="bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                  {item}
                  <button onClick={() => setProfile({...profile, dislikes: profile.dislikes.filter((_, i) => i !== index)})} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
              <input type="text" value={dislikeInput} onChange={(e) => setDislikeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && dislikeInput.trim()) { e.preventDefault(); if (!profile.dislikes.includes(dislikeInput.trim())) setProfile({...profile, dislikes: [...profile.dislikes, dislikeInput.trim()]}); setDislikeInput(''); } }}
                placeholder={profile.dislikes.length === 0 ? 'Ej: Cilantro, Mariscos...' : 'Agregar otro...'}
                className="flex-1 bg-transparent outline-none text-sm min-w-[150px] dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </section>

          {/* Preferencias aprendidas */}
          {profile.learnedPreferences.length > 0 && (
            <section className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
              <label className="block text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2"><RefreshCw size={16} className="text-blue-500" /> Lo que la IA ha aprendido de ti</label>
              <div className="flex flex-wrap gap-2">
                {profile.learnedPreferences.map((pref, i) => (
                  <button key={i} onClick={() => removeLearnedPreference(i)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-red-200 hover:text-red-800 transition-colors flex items-center gap-1 group" title="Haz clic para eliminar">
                    {pref} <span className="hidden group-hover:inline ml-1">×</span>
                  </button>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
