import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Apple, BookOpen, CheckCircle2, Dumbbell, HeartPulse, PiggyBank, RefreshCw, Target, Trophy } from 'lucide-react';
import { useAppState } from '../context/appState.js';
import { calculateTDEE } from '../lib/gemini.js';

const SPORT_OPTIONS = ['Ninguno', 'Cardio', 'Fuerza/Powerlifting', 'Crossfit', 'HIIT', 'Deportes de equipo'];
const DIETARY_STYLES = ['Ninguna', 'Vegetariana', 'Vegana', 'Pescatariana', 'Keto', 'Paleo'];
const RELIGIOUS_DIETS = ['Ninguna', 'Halal', 'Kosher', 'Hindú (Sin carne de res)', 'Jainista'];
const COMMON_ALLERGIES = ['Sin Gluten', 'Sin Lácteos', 'Alergia al Maní', 'Alergia a Mariscos', 'Sin Soya'];

export default function ProfileView() {
  const { profile, setProfile } = useAppState();
  const [dislikeInput, setDislikeInput] = useState('');

  // Recalcular macros automáticamente cuando cambien los datos relevantes
  useEffect(() => {
    if (profile.manualCalories && profile.manualProtein && profile.manualFiber && profile.manualCarb) return;
    if (!profile.weight || !profile.height || !profile.age) return;

    const macros = calculateTDEE(profile);
    if (!macros) return;

    setProfile(prev => ({
      ...prev,
      ...(!prev.manualCalories && { dailyCalories: macros.calories.toString() }),
      ...(!prev.manualProtein && { proteinTarget: macros.protein.toString() }),
      ...(!prev.manualFiber && { fiberTarget: macros.fiber.toString() }),
      ...(!prev.manualCarb && { carbTarget: macros.carbs.toString() }),
    }));
  }, [
    profile.weight, profile.height, profile.age, profile.gender,
    profile.activityLevel, profile.goals,
    profile.sportType, profile.trainingDuration, profile.trainingDaysPerWeek,
    profile.manualCalories, profile.manualProtein, profile.manualFiber, profile.manualCarb,
    setProfile
  ]);

  const toggleAllergy = (a) => setProfile({ ...profile, allergies: profile.allergies.includes(a) ? profile.allergies.filter(x => x !== a) : [...profile.allergies, a] });
  const removeLearnedPref = (i) => { const p = [...profile.learnedPreferences]; p.splice(i, 1); setProfile({ ...profile, learnedPreferences: p }); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Meta principal */}
      <section className="p-6 rounded-2xl border" style={{ background: 'var(--c-primary-light)', borderColor: 'var(--c-primary-border)' }}>
        <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: 'var(--c-primary-text)' }}>
          <Target size={18} /> Tu Meta Principal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--c-primary-text)' }}>Objetivo</label>
            <select value={profile.goals} onChange={e => setProfile({ ...profile, goals: e.target.value, manualCalories: false })} className="w-full p-3 rounded-xl border outline-none bg-white dark:bg-gray-800 dark:text-white text-sm font-medium" style={{ borderColor: 'var(--c-primary-border)' }}>
              <option>Mantenimiento y energia</option>
              <option>Déficit calórico (Pérdida de peso)</option>
              <option>Superávit calórico (Ganancia muscular)</option>
              <option>Comer más saludable general</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--c-primary-text)' }}>Nivel de actividad</label>
            <select value={profile.activityLevel} onChange={e => setProfile({ ...profile, activityLevel: e.target.value, manualCalories: false })} className="w-full p-3 rounded-xl border outline-none bg-white dark:bg-gray-800 dark:text-white text-sm font-medium" style={{ borderColor: 'var(--c-primary-border)' }}>
              <option value="1.2">Sedentario</option>
              <option value="1.375">Ligero (1-3 días/semana)</option>
              <option value="1.55">Moderado (3-5 días/semana)</option>
              <option value="1.725">Activo (6-7 días/semana)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Biometría */}
      <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-blue-500" /> Biometría y Macros
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Edad', field: 'age', placeholder: '30' },
            { label: 'Peso (kg)', field: 'weight', placeholder: '70' },
            { label: 'Altura (cm)', field: 'height', placeholder: '175' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
              <input type="number" value={profile[field]} onChange={e => setProfile({ ...profile, [field]: e.target.value, manualCalories: false })} placeholder={placeholder} className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 outline-none bg-white dark:bg-gray-800 dark:text-white text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Género</label>
            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value, manualCalories: false })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 outline-none bg-white dark:bg-gray-800 dark:text-white text-sm">
              <option>Femenino</option>
              <option>Masculino</option>
            </select>
          </div>
        </div>

        {/* Macros calculados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-gray-700">
          {[
            { label: 'Calorías', field: 'dailyCalories', manualKey: 'manualCalories', suffix: 'kcal', color: 'orange' },
            { label: 'Proteína', field: 'proteinTarget', manualKey: 'manualProtein', suffix: 'g', color: 'blue' },
            { label: 'Carbohidratos', field: 'carbTarget', manualKey: 'manualCarb', suffix: 'g', color: 'amber' },
            { label: 'Fibra', field: 'fiberTarget', manualKey: 'manualFiber', suffix: 'g', color: 'green' },
          ].map(({ label, field, manualKey, suffix, color }) => (
            <div key={field} className={`bg-${color}-50 dark:bg-${color}-900/20 p-3 rounded-xl border border-${color}-100 dark:border-${color}-800`}>
              <div className="flex justify-between items-center mb-1">
                <label className={`text-xs font-bold text-${color}-800 dark:text-${color}-300`}>{label}</label>
                {profile[manualKey] && <span className={`text-[9px] bg-${color}-200 dark:bg-${color}-800 text-${color}-700 px-1.5 py-0.5 rounded-full font-bold`}>Manual</span>}
              </div>
              <div className="flex items-center gap-1">
                <input type="number" value={profile[field]} onChange={e => setProfile({ ...profile, [field]: e.target.value, [manualKey]: true })} placeholder="—" className="flex-1 p-2 rounded-lg border outline-none bg-white dark:bg-gray-800 dark:text-white text-sm font-bold min-w-0" />
                <span className={`text-xs text-${color}-600 dark:text-${color}-400 font-medium shrink-0`}>{suffix}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-gray-700">
          {[
            { key: 'useProteinPowder', label: 'Proteína en Polvo', desc: 'Permite recetas con suplemento.', icon: Dumbbell, color: 'blue' },
            { key: 'budgetFriendly', label: 'Modo Económico', desc: 'Prioriza recetas de bajo costo.', icon: PiggyBank, color: 'emerald' },
          ].map(({ key, label, desc, icon: Icon, color }) => (
            <div key={key} className={`flex items-center justify-between bg-${color}-50 dark:bg-${color}-900/20 p-4 rounded-xl border border-${color}-200 dark:border-${color}-800`}>
              <div>
                <h4 className={`font-bold text-${color}-900 dark:text-${color}-300 text-sm flex items-center gap-1`}><Icon size={15} /> {label}</h4>
                <p className={`text-xs text-${color}-700 dark:text-${color}-400`}>{desc}</p>
              </div>
              <button onClick={() => setProfile({ ...profile, [key]: !profile[key] })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${profile[key] ? `bg-${color}-600` : 'bg-slate-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile[key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Deporte */}
      <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" /> Deporte y Entrenamiento
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Ajusta el TDEE y la proteína según tu tipo de entrenamiento.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SPORT_OPTIONS.map(sport => (
            <button key={sport} onClick={() => setProfile({ ...profile, sportType: sport, manualCalories: false })} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${profile.sportType === sport ? 'text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`} style={profile.sportType === sport ? { background: 'var(--c-primary)' } : {}}>
              {sport}
            </button>
          ))}
        </div>
        {profile.sportType !== 'Ninguno' && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Duración por sesión</label>
              <div className="flex items-center border border-slate-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                <input type="number" value={profile.trainingDuration} onChange={e => setProfile({ ...profile, trainingDuration: e.target.value, manualCalories: false })} placeholder="60" className="flex-1 p-3 outline-none text-sm dark:text-white bg-transparent" />
                <span className="px-2 text-xs text-slate-400 font-medium">min</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Días por semana</label>
              <select value={profile.trainingDaysPerWeek} onChange={e => setProfile({ ...profile, trainingDaysPerWeek: e.target.value, manualCalories: false })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-600 outline-none bg-white dark:bg-gray-800 dark:text-white text-sm">
                {['1','2','3','4','5','6','7'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Dieta */}
      <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm space-y-5">
        <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Apple size={16} className="text-green-500" /> Dieta y Restricciones
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1"><Apple size={12} className="text-green-500" /> Estilo de Dieta</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_STYLES.map(d => <button key={d} onClick={() => setProfile({ ...profile, dietaryStyle: d })} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${profile.dietaryStyle === d ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`}>{d}</button>)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1"><BookOpen size={12} className="text-purple-500" /> Dieta Religiosa</label>
            <div className="flex flex-wrap gap-2">
              {RELIGIOUS_DIETS.map(d => <button key={d} onClick={() => setProfile({ ...profile, religiousDiet: d })} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${profile.religiousDiet === d ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`}>{d}</button>)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1"><AlertTriangle size={12} className="text-red-500" /> Alergias e Intolerancias</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map(a => (
              <button key={a} onClick={() => toggleAllergy(a)} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${profile.allergies.includes(a) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 border border-transparent'}`}>
                {profile.allergies.includes(a) && <CheckCircle2 size={11} />}{a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ingredientes que no te gustan</label>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2">Escribe y presiona Enter</p>
          <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-xl border border-slate-200 dark:border-gray-600 flex flex-wrap gap-2 items-center min-h-[44px]">
            {profile.dislikes.map((item, i) => (
              <span key={i} className="bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-sm">
                {item}
                <button onClick={() => setProfile({ ...profile, dislikes: profile.dislikes.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-500 font-bold text-sm leading-none">×</button>
              </span>
            ))}
            <input type="text" value={dislikeInput} onChange={e => setDislikeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && dislikeInput.trim()) { e.preventDefault(); if (!profile.dislikes.includes(dislikeInput.trim())) setProfile({ ...profile, dislikes: [...profile.dislikes, dislikeInput.trim()] }); setDislikeInput(''); } }} placeholder={profile.dislikes.length === 0 ? 'Ej: Cilantro, Mariscos...' : 'Agregar...'} className="flex-1 bg-transparent outline-none text-xs min-w-[120px] dark:text-white dark:placeholder-gray-500" />
          </div>
        </div>

        {profile.learnedPreferences.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1"><RefreshCw size={11} /> Lo que la IA aprendió de ti</label>
            <div className="flex flex-wrap gap-2">
              {profile.learnedPreferences.map((pref, i) => (
                <button key={i} onClick={() => removeLearnedPref(i)} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-red-200 hover:text-red-800 transition-colors group" title="Clic para eliminar">
                  {pref} <span className="hidden group-hover:inline">×</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
