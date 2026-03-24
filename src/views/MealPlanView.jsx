import { useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';
import MealPlanHeader from '../components/meal-plan/MealPlanHeader.jsx';
import MealPlanSettings from '../components/meal-plan/MealPlanSettings.jsx';
import PlanSummary from '../components/meal-plan/PlanSummary.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import SavedMealsPanel from '../components/meal-plan/SavedMealsPanel.jsx';
import SelectedDayMeals from '../components/meal-plan/SelectedDayMeals.jsx';
import ShoppingListSection from '../components/meal-plan/ShoppingListSection.jsx';
import SupplementReminder from '../components/meal-plan/SupplementReminder.jsx';
import { useAppState } from '../context/appState.js';
import { callGeminiAPI } from '../lib/gemini.js';

export default function MealPlanView() {
  const { profile, setPlan, plan, savedMeals, setSavedMeals, favoriteRecipes } = useAppState();
  const [loading, setLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [creatineTaken, setCreatineTaken] = useState(false);
  const [planType, setPlanType] = useState('Diario');
  const [planPreferences, setPlanPreferences] = useState('');
  const [isTrainingDay, setIsTrainingDay] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [swappingData, setSwappingData] = useState(null);
  const [customSwapRequest, setCustomSwapRequest] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setShoppingList(null);
    setSwappingData(null);

    const isWeekly = planType === 'Semanal';
    const isUpdatingSingleDay = !isWeekly && plan && plan.days && plan.days.length > 0;
    const targetDayName = isUpdatingSingleDay ? plan.days[selectedDayIdx].dayName : (isWeekly ? 'Dia 1 (Lunes)' : 'Hoy');

    const prompt = `
      Crea un plan de comidas ${isWeekly ? 'SEMANAL (7 dias completos, enfocado en Meal Prep/Batch Cooking)' : 'de 1 DIA COMPLETO'} adaptado a este perfil:
      - Datos: Peso ${profile.weight || 'N/A'}kg. Meta de Calorias Base: ${profile.dailyCalories || 'Adecuadas'} kcal/dia. Proteinas: ${profile.proteinTarget || 'Adecuada'} g/dia.
      - Objetivo: ${profile.goals}
      - Dieta: ${profile.dietaryStyle}, ${profile.religiousDiet}
      - Evitar: ${[...profile.allergies, ...profile.dislikes, ...profile.learnedPreferences].join(', ')}
      - Platos que le encantan al usuario (usalos de inspiracion si es posible): ${favoriteRecipes?.length > 0 ? favoriteRecipes.map(r => r.title).join(', ') : 'Ninguno registrado'}
      - Presupuesto Economico Activado: ${profile.budgetFriendly ? 'SI, usa legumbres, arroz, vegetales de estacion. Muy barato.' : 'NO'}
      - PREFERENCIAS PUNTUALES PARA ESTE PLAN: ${planPreferences || 'Ninguna'}
      - DIA DE ENTRENAMIENTO: ${isTrainingDay ? 'SI. Aumenta las calorias diarias un 10-15% (aprox +200-300 kcal) y prioriza los carbohidratos alrededor del entreno.' : 'NO. Es dia de descanso, manten las calorias base calculadas y evita el exceso de carbohidratos simples.'}
      - COMIDAS FIJADAS POR EL USUARIO (OBLIGATORIO INCLUIR ESTAS EN EL PLAN): ${savedMeals.length > 0 ? savedMeals.map(m => m.title).join(', ') : 'Ninguna'}

      ${!isWeekly ? 'Para CADA TIPO DE COMIDA (Desayuno, Almuerzo, Snack, Cena), ofrece 2 OPCIONES DISTINTAS para dar variedad.' : 'Para el plan semanal, usa la estrategia de Batch Cooking. NO repitas el mismo menu exacto los 7 dias.'}

      Devuelve un JSON estricto con esta estructura:
      {
        "summary": "Resumen motivacional y tips para el plan",
        "totalCalories": "aprox kcal (promedio diario ajustado)",
        "totalProtein": "aprox g (promedio diario)",
        "totalFiber": "aprox g (promedio diario)",
        "days": [
          {
            "dayName": "${targetDayName}",
            "meals": [
              {
                "type": "Desayuno",
                "options": [
                  { "name": "Nombre", "description": "Breve", "calories": "kcal", "protein": "Xg", "fiber": "Xg" }
                ]
              }
            ]
          }
        ]
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);

      if (isUpdatingSingleDay && result.days && result.days.length > 0) {
        const updatedPlan = { ...plan };
        updatedPlan.days[selectedDayIdx] = result.days[0];
        setPlan(updatedPlan);
      } else {
        setPlan(result);
        setSelectedDayIdx(0);
      }

      setSavedMeals([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapMeal = async () => {
    if (!swappingData || !customSwapRequest.trim()) return;

    setIsSwapping(true);
    const { dayIdx, mealIdx, currentMealName } = swappingData;
    const currentMealType = plan.days[dayIdx].meals[mealIdx].type;

    const prompt = `
      El usuario esta viendo su plan de comidas y quiere reemplazar el "${currentMealName}" (${currentMealType}) del ${plan.days[dayIdx].dayName}.
      Peticion especial del usuario para este reemplazo: "${customSwapRequest}".

      Asegurate de que siga cumpliendo su perfil: ${profile.goals}, Dieta: ${profile.dietaryStyle}, Evitar: ${[...profile.allergies, ...profile.dislikes].join(', ')}.

      Devuelve UNICAMENTE un JSON con la nueva comida:
      {
        "options": [
          { "name": "Nuevo Plato", "description": "Por que cumple con la peticion...", "calories": "...", "protein": "...", "fiber": "..." }
        ]
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      const newPlan = { ...plan };
      newPlan.days[dayIdx].meals[mealIdx].options = result.options;
      setPlan(newPlan);
      setSwappingData(null);
      setCustomSwapRequest('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwapping(false);
    }
  };

  const generateRecipeFromPlan = async (option) => {
    setGeneratingRecipe(true);
    const prompt = `
      Genera la receta completa para: "${option.name}".
      Contexto del plato: ${option.description}.
      Perfil a cumplir:
      - Objetivo: ${profile.goals} (Ajustado a esta comida -> Calorias Meta: ${option.calories}, Proteina: ${option.protein}, Fibra: ${option.fiber}).
      - Restricciones: ${[profile.dietaryStyle, profile.religiousDiet, ...profile.allergies].join(', ')}.
      - Evitar: ${profile.dislikes.join(', ')} ${profile.learnedPreferences.join(' ')}.
      - Proteina en polvo: ${profile.useProteinPowder ? 'Si' : 'No'}.

      Devuelve la respuesta UNICAMENTE en un JSON valido con este esquema exacto:
      {
        "title": "Nombre creativo del plato",
        "description": "Breve descripcion",
        "prepTime": "XX min",
        "cookTime": "XX min",
        "cuisine": "Tipo",
        "ingredients": [ { "name": "Ingrediente", "amount": "Cant.", "substitute": "Sustituto" } ],
        "steps": ["Paso 1..."],
        "macros": { "calories": "aprox", "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
        "tips": "Tip"
      }
    `;

    try {
      const result = await callGeminiAPI(prompt);
      setSelectedRecipe(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingRecipe(false);
    }
  };

  const generateShoppingList = async () => {
    if (!plan) return;

    setLoadingList(true);
    const prompt = `Basado en el siguiente plan de comidas: ${JSON.stringify(plan)}. 
    Calcula las cantidades totales aproximadas necesarias de cada ingrediente para todo el plan y genera una lista de compras agrupada por categorias logicas del supermercado. 
    Si el perfil dice Modo Economico, sugiere comprar al por mayor o marcas blancas. 
    Devuelve UNICAMENTE un JSON valido con este esquema: 
    { "categories": [ { "name": "Categoria", "items": [ { "name": "Nombre del producto", "amount": "Cantidad total (ej: 500g, 1 kg, 2 unid)" } ] } ] }`;

    try {
      const result = await callGeminiAPI(prompt);
      setShoppingList(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  if (generatingRecipe) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-green-600">
        <RefreshCw className="animate-spin mb-4" size={48} />
        <p className="font-medium animate-pulse">Escribiendo la receta detallada...</p>
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setSelectedRecipe(null)} className="mb-4 text-green-600 font-medium flex items-center gap-1 hover:underline">
          <ChevronRight className="rotate-180" size={18} /> Volver a mi Plan
        </button>
        <RecipeCard recipe={selectedRecipe} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <MealPlanHeader
        profileGoals={profile.goals}
        plan={plan}
        planType={planType}
        loading={loading}
        onPlanTypeChange={setPlanType}
        onGeneratePlan={generatePlan}
      />

      <MealPlanSettings
        planPreferences={planPreferences}
        onPlanPreferencesChange={setPlanPreferences}
        isTrainingDay={isTrainingDay}
        onTrainingDayToggle={() => setIsTrainingDay(!isTrainingDay)}
      />

      <SavedMealsPanel
        savedMeals={savedMeals}
        onRemoveMeal={(index) => setSavedMeals(savedMeals.filter((_, idx) => idx !== index))}
      />

      <SupplementReminder
        creatineTaken={creatineTaken}
        onToggle={() => setCreatineTaken(!creatineTaken)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-green-600">
          <RefreshCw className="animate-spin mb-4" size={48} />
          <p className="font-medium animate-pulse text-center">
            Planificando tu menu...
            <br />
            {planType === 'Semanal' && <span className="text-sm opacity-80">Un plan de 7 dias puede tomar unos segundos extras.</span>}
          </p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-8">
          <PlanSummary
            plan={plan}
            selectedDayIdx={selectedDayIdx}
            onSelectDay={setSelectedDayIdx}
          />

          <SelectedDayMeals
            day={plan.days && plan.days[selectedDayIdx]}
            selectedDayIdx={selectedDayIdx}
            swappingData={swappingData}
            customSwapRequest={customSwapRequest}
            isSwapping={isSwapping}
            onSwapStart={setSwappingData}
            onSwapRequestChange={setCustomSwapRequest}
            onSwapConfirm={handleSwapMeal}
            onSwapCancel={() => setSwappingData(null)}
            onGenerateRecipe={generateRecipeFromPlan}
          />

          <ShoppingListSection
            shoppingList={shoppingList}
            loadingList={loadingList}
            onGenerateShoppingList={generateShoppingList}
          />
        </div>
      )}
    </div>
  );
}
