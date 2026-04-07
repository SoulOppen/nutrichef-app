import { useState } from 'react';
import { useAppState } from '../context/appState.js';
import { useRecipeCache } from './useRecipeCache.js';
import {
  fetchGeminiContent,
  compactProfile,
  buildLocaleInstruction,
  buildAbsoluteGuardrail,
  buildSupermarketInstruction,
} from '../lib/gemini.js';

// Meal prep plans are less volatile than single recipes — cache for 2 hours
const MEAL_PREP_TTL = 2 * 60 * 60 * 1000;

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

// ── Cache key ─────────────────────────────────────────────────────────────────

function makePlanKey(params, profileSlice) {
  return JSON.stringify({ type: 'mealprep_v4', params, p: profileSlice });
}

// ── Mode → silent guidance for the model ──────────────────────────────────────
// IMPORTANT: never mention the mode to the user. The model uses these to bias
// ingredient choices but the output should feel natural.

const MODE_GUIDANCE = {
  alto_proteina:  'Prioriza carnes magras, huevos y legumbres. Asegura alta densidad de proteína por porción.',
  vegetariano:    'Sin carnes ni pescados. Usa legumbres, huevos y lácteos (si las preferencias lo permiten).',
  economico:      'Prioriza ingredientes baratos: legumbres, arroz, huevo, verduras de estación. Evita carnes caras.',
  alto_en_fibra:  'Incluye verduras, legumbres y granos integrales. Maximiza fibra por porción.',
  rapido:         'Minimiza tiempo total y pasos. Recetas que se cocinen rápido y compartan cocción.',
};

// ── Directed change → silent adjustment guidance ─────────────────────────────
// Used when the user requests a tweak (e.g. "más proteína") on top of a plan.

export const CHANGE_GUIDANCE = {
  mas_economico: 'Reemplazar carnes caras por huevo y legumbres. Reducir la variedad de ingredientes.',
  mas_proteina:  'Aumentar huevo, pollo y legumbres. Mantener todo simple.',
  sin_carne:     'Eliminar todas las carnes y pescados. Usar legumbres, huevo y lácteos si las preferencias lo permiten.',
  mas_rapido:    'Reducir pasos y preparaciones distintas. Recetas más rápidas de ejecutar.',
  mas_fibra:     'Agregar verduras, legumbres y granos integrales.',
};

// ── Prompt builder ────────────────────────────────────────────────────────────

function summarizePreviousPlan(plan) {
  if (!plan) return '';
  const meals = (plan.days || []).map(d => `Día ${d.day}: ${d.meal}`).join(' | ');
  const ingredients = (plan.shopping_list || []).slice(0, 12).map(i => i.name).filter(Boolean).join(', ');
  return `- Título: ${plan.title}\n- Comidas: ${meals}\n- Ingredientes principales: ${ingredients}`;
}

function buildTweakBlock(params, previousPlan) {
  if (!params.change_type || !previousPlan) return '';
  const guidance = CHANGE_GUIDANCE[params.change_type] || '';
  return `

## AJUSTE DIRIGIDO (instrucción interna, NO mencionar al usuario)

Plan actual del usuario:
${summarizePreviousPlan(previousPlan)}

Tipo de ajuste solicitado: ${params.change_type}

Guía del ajuste:
${guidance}

Reglas del ajuste:
- Ajusta el plan en esa dirección manteniendo simplicidad
- Preserva ingredientes y preparaciones del plan actual cuando sean coherentes con el ajuste
- NO rehagas todo innecesariamente
- NO menciones en la respuesta que estás ajustando un plan previo
- El resultado debe parecer un plan natural y fresco, no una "versión modificada"
`;
}

function buildMealPrepPrompt(params, { profileStr, locale, guardrail, superStr }, previousPlan = null) {
  const restrictions = [guardrail, superStr].filter(Boolean).join('\n') || 'Ninguna';
  const dias = params.dias || 3;
  const modeGuidance = MODE_GUIDANCE[params.mode] || MODE_GUIDANCE.rapido;
  const tweakBlock = buildTweakBlock(params, previousPlan);

  return `${locale}
Actúa como un asistente que toma decisiones por el usuario y resuelve su alimentación sin esfuerzo.

Objetivo: Generar UN plan de meal prep para ${dias} días que minimice esfuerzo, reutilice ingredientes y sea fácil de ejecutar en la vida real, en una sola sesión de cocina (máximo 1–2 horas).

Reglas clave:
- SIEMPRE entrega UNA sola propuesta (nunca múltiples opciones)
- NO generes variedad innecesaria
- PRIORIZA simplicidad y coherencia
- PRIORIZA reutilización de ingredientes (cocinar una vez, usar varias veces)
- TODO debe respetar ESTRICTAMENTE las restricciones del usuario (ej: kosher)
- NO incluyas marcas ni productos comerciales
- EVITA ingredientes caros o difíciles a menos que el contexto lo justifique
- Evita ingredientes que se usen solo una vez
- Si algún ingrediente no cumple restricciones, reemplázalo automáticamente sin mencionarlo

## CONTEXTO DEL USUARIO

Preferencias: ${profileStr}
Restricciones dietarias: ${restrictions}
Tiempo disponible: bajo
Nivel de esfuerzo: mínimo

## DIRECTRIZ INTERNA (no mencionar al usuario en la respuesta)

${modeGuidance}
${tweakBlock}
## INSTRUCCIONES

1. Genera UN plan para ${dias} días
2. Usa la MENOR cantidad de ingredientes posible
3. Reutiliza preparaciones (ej: cocinar pollo una vez, usarlo en varias comidas)
4. Evita ingredientes que se usen solo una vez
5. Mantén recetas simples (máx 5 pasos cada una)
6. El plan debe poder cocinarse en una sola sesión (máx 1–2 h)
7. Asegura coherencia nutricional según el objetivo del usuario
8. Ajusta todo según la directriz interna
9. NO menciones modos, etiquetas ni explicaciones del estilo del plan
10. SOLO JSON, sin texto adicional

## CAMPOS OBLIGATORIOS DEL JSON

- "title": nombre del plan (corto, claro, sin etiquetas de modo)
- "description": 1 línea explicando por qué este plan es ideal (simple y directo, sin mencionar el modo)
- "days": array con UNA comida principal por día, cada una con ingredientes y pasos breves
- "shopping_list": lista total consolidada, sin duplicados, organizada de forma simple
- "prep_plan": pasos de batch cooking, claros, cortos y numerados, enfocados en cocinar todo en el menor tiempo posible

## FORMATO DE RESPUESTA (JSON OBLIGATORIO)

{"title":"","description":"Por qué este plan es ideal (1 línea)","total_days":${dias},"total_time_minutes":0,"days":[{"day":1,"meal":"","ingredients":[{"name":"","amount":""}],"steps":["Paso 1"]}],"shopping_list":[{"name":"","amount":""}],"prep_plan":["Paso 1 batch cooking"],"storage":{"containers":0,"instructions":["instrucción"],"duration_days":${dias}},"nutrition_summary":{"daily_calories":0,"daily_protein":0},"tip":"1 sugerencia útil"}`;
}

// ── Normalize plan from Gemini ────────────────────────────────────────────────

function normalizePlan(raw, dias) {
  return {
    title: raw.title || 'Plan de meal prep',
    description: raw.description || '',
    total_days: raw.total_days || Number(dias) || 3,
    total_time_minutes: raw.total_time_minutes || 0,
    days: Array.isArray(raw.days) ? raw.days.map((d, i) => ({
      day: d.day ?? i + 1,
      meal: d.meal || '',
      ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
      steps: Array.isArray(d.steps) ? d.steps : [],
    })) : [],
    shopping_list: Array.isArray(raw.shopping_list) ? raw.shopping_list : [],
    prep_plan: Array.isArray(raw.prep_plan) ? raw.prep_plan : [],
    storage: raw.storage || null,
    nutrition_summary: raw.nutrition_summary || null,
    tip: raw.tip || '',
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useMealPrep — generates ONE decisive meal prep plan per params combination.
 *
 * - generate(params, { previousPlan? }) → Promise<Plan | null>
 * - getPlan(params)                     → Plan | null  (cached result, base only)
 * - isLoading(params)                   → boolean
 * - getError(params)                    → string | null
 *
 * Params shape:
 *   { dias: string,
 *     mode: 'alto_proteina'|'vegetariano'|'economico'|'alto_en_fibra'|'rapido',
 *     change_type?: 'mas_economico'|'mas_proteina'|'sin_carne'|'mas_rapido'|'mas_fibra' }
 *
 * When change_type + previousPlan are provided, the model adjusts the previous
 * plan in that direction. Tweaks are NOT cached (they depend on the input plan).
 */
export function useMealPrep() {
  const [plansMap, setPlansMap] = useState({});
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [errors, setErrors] = useState({});
  const { profile } = useAppState();
  const cache = useRecipeCache(MEAL_PREP_TTL);

  const _key = (params) => makePlanKey(params, compactProfile(profile).slice(0, 80));

  const generate = async (params, { previousPlan } = {}) => {
    const key = _key(params);
    const isTweak = !!params.change_type && !!previousPlan;

    if (activeKeys.has(key)) return null;

    // TTL cache hit → no API call (only for base generations, never for tweaks)
    if (!isTweak) {
      const hit = cache.getCached(key);
      if (hit) {
        setPlansMap(m => ({ ...m, [key]: hit }));
        return hit;
      }
    }

    setActiveKeys(s => new Set([...s, key]));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });

    try {
      const profileStr = compactProfile(profile);
      const locale = buildLocaleInstruction(profile);
      const guardrail = buildAbsoluteGuardrail(profile);
      const superStr = buildSupermarketInstruction(profile);

      const prompt = buildMealPrepPrompt(
        params,
        { profileStr, locale, guardrail, superStr },
        isTweak ? previousPlan : null
      );
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      };

      const data = await fetchGeminiContent({ kind: 'text', payload });
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('La IA no devolvió respuesta');

      let parsed;
      try { parsed = JSON.parse(extractJSON(rawText)); }
      catch { throw new Error('Respuesta inesperada — intenta de nuevo'); }

      // Support both { plan: {...} } wrapper and direct object
      const raw = parsed?.plan ?? parsed;
      if (!raw?.title && !Array.isArray(raw?.days)) {
        throw new Error('No se generó plan — intenta de nuevo');
      }

      const plan = normalizePlan(raw, params.dias);
      // Only persist base plans — tweaks are transient and depend on a specific input
      if (!isTweak) cache.setCache(key, plan);
      setPlansMap(m => ({ ...m, [key]: plan }));
      return plan;
    } catch (err) {
      setErrors(e => ({ ...e, [key]: err.message }));
      return null;
    } finally {
      setActiveKeys(s => { const n = new Set(s); n.delete(key); return n; });
    }
  };

  const getPlan = (params) => plansMap[_key(params)] ?? null;
  const isLoading = (params) => activeKeys.has(_key(params));
  const getError = (params) => errors[_key(params)] ?? null;

  return { generate, getPlan, isLoading, getError };
}
