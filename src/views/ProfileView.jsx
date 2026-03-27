import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Apple, BookOpen, CheckCircle2, Dumbbell, HeartPulse, LogOut, PiggyBank, RefreshCw, Target } from 'lucide-react';
import { useAppState } from '../context/appState.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileView() {
  const { profile, setProfile } = useAppState();
  const { user, logout } = useAuth();
  const commonAllergies = ['Sin Gluten', 'Sin Lácteos', 'Alergia al Maní', 'Alergia a Mariscos', 'Sin Soya'];
  const dietaryStyles = ['Ninguna', 'Vegetariana', 'Vegana', 'Pescatariana', 'Keto', 'Paleo'];
  const religiousDiets = ['Ninguna', 'Halal', 'Kosher', 'Hindú (Sin carne de res)', 'Jainista'];
  const [dislikeInput, setDislikeInput] = useState('');

  useEffect(() => {
    if (profile.weight && profile.height && profile.age && !profile.manualCalories && !profile.manualProtein && !profile.manualFiber) {
      const w = parseFloat(profile.weight);
      const h = parseFloat(profile.height);
      const a = parseFloat(profile.age);

      if (w > 0 && h > 0 && a > 0) {
        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        bmr += profile.gender === 'Masculino' ? 5 : -161;

        let tdee = bmr * parseFloat(profile.activityLevel);
        let calTarget = tdee;
        let proteinFactor = 1.6;

        if (profile.goals.includes('Déficit')) { calTarget -= 500; proteinFactor = 2.0; }
        else if (profile.goals.includes('Superávit')) { calTarget += 500; proteinFactor = 2.2; }

        let fiber = Math.round((calTarget / 1000) * 14);

        setProfile(prev => ({
          ...prev,
          dailyCalories: Math.round(calTarget).toString(),
          proteinTarget: Math.round(w * proteinFactor).toString(),
          fiberTarget: fiber.toString()
        }));
      }
    }
  }, [profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel, profile.goals, profile.manualCalories, profile.manualProtein, profile.manualFiber, setProfile]);

  const toggleAllergy = (res) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.includes(res)
        ? profile.allergies.filter(r => r !== res)
        : [...profile.allergies, res]
    });
  };

  const removeLearnedPreference = (index) => {
    const newPrefs = [...profile.learnedPreferences];
    newPrefs.splice(index, 1);
    setProfile({ ...profile, learnedPreferences: newPrefs });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Card de usuario con avatar y logout */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 flex items-center gap-4">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-14 h-14 rounded-full border-2 border-orange-200 shadow-sm" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
            {user?.displayName?.[0] || '?'}
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-slate-800">{user?.displayName || 'Usuario'}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-red-200"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>

      {/* Resto del perfil */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-orange-100">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <HeartPulse size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Tu Perfil Integral</h2>
            <p className="text-slate-500 text-sm">Medidas, objetivos y preferencias para una personalización total.</p>
          </div>
        </div>

        <div className="space-y-8">

          {/* Meta Principal */}
          <section className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200 shadow-inner">
            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2"><Target size={20} /> Tu Meta Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-orange-900 mb-2">¿Cuál es tu objetivo?</label>
                <select value={profile.goals} onChange={(e) => setProfile({...profile, goals: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium text-slate-700 shadow-sm">
                  <option>Mantenimiento y energía</option>
                  <option>Déficit calórico (Pérdida de peso)</option>
                  <option>Superávit calórico (Ganancia muscular)</option>
                  <option>Comer más saludable general</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-orange-900 mb-2">Nivel de Actividad Física</label>
                <select value={profile.activityLevel} onChange={(e) => setProfile({...profile, activityLevel: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium text-slate-700 shadow-sm">
                  <option value="1.2">Sedentario (Poco o nada)</option>
                  <option value="1.375">Ligero (1-3 días/semana)</option>
                  <option value="1.55">Moderado (3-5 días/semana)</option>
                  <option value="1.725">Activo (Fuerte 6-7 días/semana)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Biometría */}
          <section className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Biometría y Cálculos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Edad</label>
                <input type="number" value={profile.age} onChange={(e) => setProfile({...profile, age: e.target.value, manualCalories: false})} placeholder="Ej: 30" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Género</label>
                <select value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value, manualCalories: false})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option>Femenino</option>
                  <option>Masculino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Peso (kg)</label>
                <input type="number" value={profile.weight} onChange={(e) => setProfile({...profile, weight: e.target.value, manualCalories: false})} placeholder="Ej: 70" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Altura (cm)</label>
                <input type="number" value={profile.height} onChange={(e) => setProfile({...profile, height: e.target.value, manualCalories: false})} placeholder="Ej: 175" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-orange-100/50 p-4 rounded-xl border border-orange-200">
                <label className="block text-sm font-semibold text-orange-900 mb-1 flex justify-between">
                  <span>Meta Diaria (kcal)</span>
                  {profile.manualCalories && <span className="text-xs text-orange-600 bg-orange-200 px-2 py-0.5 rounded-full">Manual</span>}
                </label>
                <p className="text-xs text-orange-700 mb-2">Ajustado según biometría.</p>
                <input type="number" value={profile.dailyCalories} onChange={(e) => setProfile({...profile, dailyCalories: e.target.value, manualCalories: true})} placeholder="Ej: 2000" className="w-full p-3 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
              </div>
              <div className="bg-blue-100/50 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-900 mb-1 flex justify-between">
                  <span>Proteína (g)</span>
                  {profile.manualProtein && <span className="text-xs text-blue-600 bg-blue-200 px-2 py-0.5 rounded-full">Manual</span>}
                </label>
                <p className="text-xs text-blue-700 mb-2">Calculada para tu objetivo (1.6 - 2.2g/kg).</p>
                <input type="number" value={profile.proteinTarget} onChange={(e) => setProfile({...profile, proteinTarget: e.target.value, manualProtein: true})} placeholder="Ej: 120" className="w-full p-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div className="bg-green-100/50 p-4 rounded-xl border border-green-200">
                <label className="block text-sm font-semibold text-green-900 mb-1 flex justify-between">
                  <span>Fibra (g)</span>
                  {profile.manualFiber && <span className="text-xs text-green-600 bg-green-200 px-2 py-0.5 rounded-full">Manual</span>}
                </label>
                <p className="text-xs text-green-700 mb-2">Aprox. 14g por 1000 kcal.</p>
                <input type="number" value={profile.fiberTarget} onChange={(e) => setProfile({...profile, fiberTarget: e.target.value, manualFiber: true})} placeholder="Ej: 30" className="w-full p-3 rounded-xl border border-green-300 focus:ring-2 focus:ring-green-500 outline-none bg-white" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1"><Dumbbell size={16} className="text-slate-500"/> Suplemento</h4>
                  <p className="text-xs text-slate-500">Permite recetas con Proteína en Polvo.</p>
                </div>
                <button onClick={() => setProfile({...profile, useProteinPowder: !profile.useProteinPowder})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.useProteinPowder ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.useProteinPowder ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1"><PiggyBank size={16} className="text-emerald-600"/> Modo Económico</h4>
                  <p className="text-xs text-emerald-700">Prioriza recetas de bajo costo y Meal Prep.</p>
                </div>
                <button onClick={() => setProfile({...profile, budgetFriendly: !profile.budgetFriendly})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.budgetFriendly ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.budgetFriendly ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Dieta */}
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Apple size={16} className="text-green-500"/> Estilo de Dieta</label>
              <div className="flex flex-wrap gap-2">
                {dietaryStyles.map(diet => (
                  <button key={diet} onClick={() => setProfile({...profile, dietaryStyle: diet})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${profile.dietaryStyle === diet ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{diet}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><BookOpen size={16} className="text-purple-500"/> Dieta Religiosa/Ética</label>
              <div className="flex flex-wrap gap-2">
                {religiousDiets.map(diet => (
                  <button key={diet} onClick={() => setProfile({...profile, religiousDiet: diet})} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${profile.religiousDiet === diet ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{diet}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Alergias */}
          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> Alergias e Intolerancias Médicas</label>
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map(res => (
                <button key={res} onClick={() => toggleAllergy(res)} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-colors ${profile.allergies.includes(res) ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'}`}>
                  {profile.allergies.includes(res) && <CheckCircle2 size={14} />}
                  {res}
                </button>
              ))}
            </div>
          </section>

          {/* Dislikes */}
          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ingredientes que NO te gustan (Fijos)</label>
            <p className="text-xs text-slate-500 mb-3">Escribe un alimento y presiona "Enter".</p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 transition-all flex flex-wrap gap-2 items-center min-h-[50px]">
              {profile.dislikes.map((item, index) => (
                <span key={index} className="bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                  {item}
                  <button onClick={() => setProfile({...profile, dislikes: profile.dislikes.filter((_, i) => i !== index)})} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
              <input
                type="text"
                value={dislikeInput}
                onChange={(e) => setDislikeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && dislikeInput.trim()) {
                    e.preventDefault();
                    if (!profile.dislikes.includes(dislikeInput.trim())) {
                      setProfile({...profile, dislikes: [...profile.dislikes, dislikeInput.trim()]});
                    }
                    setDislikeInput('');
                  }
                }}
                placeholder={profile.dislikes.length === 0 ? 'Ej: Cilantro, Mariscos...' : 'Agregar otro...'}
                className="flex-1 bg-transparent outline-none text-sm min-w-[150px]"
              />
            </div>
          </section>

          {/* Preferencias aprendidas */}
          {profile.learnedPreferences.length > 0 && (
            <section className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2"><RefreshCw size={16} className="text-blue-500"/> Lo que la IA ha aprendido de ti</label>
              <p className="text-xs text-blue-700 mb-3">Haz clic para olvidar una regla.</p>
              <div className="flex flex-wrap gap-2">
                {profile.learnedPreferences.map((pref, i) => (
                  <button key={i} onClick={() => removeLearnedPreference(i)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-200 text-blue-800 hover:bg-red-200 hover:text-red-800 transition-colors flex items-center gap-1 group" title="Haz clic para eliminar">
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
