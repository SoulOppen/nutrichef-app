// Banco de recetas populares — se sirven sin llamar a Gemini
// Cuando el usuario busca algo que coincide, se muestra directo

export const POPULAR_RECIPES = [
  {
    title: 'Huevos revueltos',
    description: 'Rápido, proteico y versátil. Listo en 5 minutos.',
    prepTime: '2 min', cookTime: '3 min', cuisine: 'Básico',
    tags: ['huevo', 'huevos', 'revueltos', 'desayuno', 'rápido', 'proteína'],
    ingredients: [
      { name: 'Huevos', amount: '3 unidades', substitute: 'Claras de huevo (6)' },
      { name: 'Sal', amount: 'Al gusto', substitute: '' },
      { name: 'Mantequilla o aceite', amount: '1 cdta', substitute: 'Aceite de oliva' },
      { name: 'Pimienta negra', amount: 'Al gusto', substitute: '' },
    ],
    steps: [
      'Bate los huevos con sal y pimienta en un bowl.',
      'Calienta la sartén a fuego medio-bajo con mantequilla.',
      'Vierte los huevos y revuelve lentamente con una espátula hasta que estén cremosos. Retira antes de que estén totalmente secos.',
    ],
    macros: { calories: '220 kcal', protein: '18g', carbs: '1g', fat: '16g', fiber: '0g' },
    tips: 'El secreto es fuego bajo y no parar de mover. Saca del fuego un poco antes, el calor residual termina la cocción.',
  },
  {
    title: 'Papas fritas en air fryer',
    description: 'Crujientes por fuera, suaves por dentro. Sin aceite extra.',
    prepTime: '5 min', cookTime: '18 min', cuisine: 'Básico',
    tags: ['papas', 'papa', 'patatas', 'fritas', 'air fryer', 'airfryer', 'crujiente'],
    ingredients: [
      { name: 'Papas', amount: '2 medianas (400g)', substitute: 'Batata/boniato' },
      { name: 'Aceite de oliva', amount: '1 cda', substitute: 'Aceite vegetal' },
      { name: 'Sal', amount: '1 cdta', substitute: '' },
      { name: 'Ajo en polvo', amount: '½ cdta (opcional)', substitute: '' },
      { name: 'Pimentón', amount: '½ cdta (opcional)', substitute: '' },
    ],
    steps: [
      'Corta las papas en bastones o gajos del mismo tamaño (aprox. 1cm de grosor).',
      'Remojar en agua fría 15-20 minutos para sacar el almidón. Secar muy bien con papel absorbente.',
      'Mezcla con el aceite y las especias.',
      'Air fryer a 200°C, 15-18 minutos. Agitar a la mitad del tiempo.',
    ],
    macros: { calories: '280 kcal', protein: '5g', carbs: '55g', fat: '5g', fiber: '4g' },
    tips: 'El paso de remojar y secar bien es clave para que queden crujientes. No sobrecargues la canasta del air fryer.',
  },
  {
    title: 'Arroz blanco básico',
    description: 'La base perfecta. Suelto y bien cocido.',
    prepTime: '2 min', cookTime: '15 min', cuisine: 'Básico',
    tags: ['arroz', 'arroz blanco', 'básico', 'guarnición'],
    ingredients: [
      { name: 'Arroz', amount: '1 taza (185g)', substitute: 'Arroz integral (+10 min)' },
      { name: 'Agua', amount: '2 tazas (480ml)', substitute: 'Caldo de pollo' },
      { name: 'Sal', amount: '1 cdta', substitute: '' },
      { name: 'Aceite o mantequilla', amount: '1 cdta', substitute: '' },
    ],
    steps: [
      'Lava el arroz hasta que el agua salga casi transparente.',
      'En una olla, lleva el agua a hervir con la sal. Añade el aceite.',
      'Agrega el arroz, reduce a fuego muy bajo, tapa y cocina 12-15 minutos sin destapar.',
      'Retira del fuego y deja reposar tapado 5 minutos. Esponja con un tenedor.',
    ],
    macros: { calories: '340 kcal', protein: '6g', carbs: '74g', fat: '1g', fiber: '1g' },
    tips: 'La regla de oro: 1 taza de arroz = 2 tazas de agua. No destapar ni revolver durante la cocción.',
  },
  {
    title: 'Pechuga de pollo a la plancha',
    description: 'Jugosa por dentro, dorada por fuera. La proteína más rápida.',
    prepTime: '5 min', cookTime: '10 min', cuisine: 'Básico',
    tags: ['pollo', 'pechuga', 'plancha', 'proteína', 'sano', 'dieta'],
    ingredients: [
      { name: 'Pechuga de pollo', amount: '1 unidad (150-200g)', substitute: 'Muslo sin piel' },
      { name: 'Aceite de oliva', amount: '1 cda', substitute: 'Aceite vegetal' },
      { name: 'Sal y pimienta', amount: 'Al gusto', substitute: '' },
      { name: 'Ajo en polvo', amount: '½ cdta', substitute: 'Ajo fresco laminado' },
    ],
    steps: [
      'Seca la pechuga con papel. Aplana levemente si es muy gruesa (golpes suaves con la mano).',
      'Unta con aceite y sazona por ambos lados.',
      'Plancha o sartén a fuego medio-alto, bien caliente. 4-5 minutos por lado sin mover.',
      'Deja reposar 3 minutos antes de cortar.',
    ],
    macros: { calories: '220 kcal', protein: '42g', carbs: '0g', fat: '5g', fiber: '0g' },
    tips: 'La clave es no moverla durante la cocción para que selle bien. Si se pega, aún no está lista para voltear.',
  },
  {
    title: 'Pasta con aceite y ajo',
    description: 'Aglio e olio. 15 minutos, ingredientes básicos, resultado increíble.',
    prepTime: '5 min', cookTime: '12 min', cuisine: 'Italiana',
    tags: ['pasta', 'aglio', 'olio', 'ajo', 'aceite', 'rápido', 'fácil'],
    ingredients: [
      { name: 'Pasta (spaghetti)', amount: '80g', substitute: 'Cualquier pasta larga' },
      { name: 'Ajo', amount: '3 dientes', substitute: '½ cdta ajo en polvo' },
      { name: 'Aceite de oliva', amount: '3 cdas', substitute: '' },
      { name: 'Sal', amount: 'Al gusto', substitute: '' },
      { name: 'Perejil (opcional)', amount: 'Un puñado', substitute: 'Albahaca' },
      { name: 'Chile rojo (opcional)', amount: '1 pizca', substitute: '' },
    ],
    steps: [
      'Cuece la pasta en agua con sal según el paquete. Reserva 1 vaso del agua de cocción.',
      'Mientras tanto, lamina el ajo y sofríe en el aceite a fuego muy bajo (1-2 min). No debe dorarse demasiado.',
      'Añade la pasta escurrida al aceite con ajo, agrega un poco del agua de cocción y mezcla bien.',
      'Sirve con perejil picado.',
    ],
    macros: { calories: '420 kcal', protein: '10g', carbs: '60g', fat: '15g', fiber: '3g' },
    tips: 'El agua de cocción con almidón es el secreto que liga la salsa. Añádela poco a poco.',
  },
  {
    title: 'Tostadas con aguacate',
    description: 'El desayuno o snack más popular del momento. Listo en 3 minutos.',
    prepTime: '3 min', cookTime: '2 min', cuisine: 'Básico',
    tags: ['aguacate', 'avocado', 'tostada', 'desayuno', 'snack', 'rápido'],
    ingredients: [
      { name: 'Pan integral', amount: '2 rebanadas', substitute: 'Pan de centeno' },
      { name: 'Aguacate maduro', amount: '1/2 unidad', substitute: '' },
      { name: 'Limón', amount: 'Unas gotas', substitute: 'Vinagre de manzana' },
      { name: 'Sal y pimienta', amount: 'Al gusto', substitute: '' },
      { name: 'Huevo pochado (opcional)', amount: '1 unidad', substitute: '' },
    ],
    steps: [
      'Tuesta el pan.',
      'Aplasta el aguacate con un tenedor, añade limón, sal y pimienta.',
      'Extiende sobre el pan tostado. Añade el huevo pochado si quieres más proteína.',
    ],
    macros: { calories: '280 kcal', protein: '7g', carbs: '28g', fat: '16g', fiber: '8g' },
    tips: 'Unas escamas de sal y un chorrito de aceite de oliva al final elevan mucho el plato.',
  },
  {
    title: 'Avena con fruta',
    description: 'Desayuno nutritivo y saciante. Sin cocción si usas overnight oats.',
    prepTime: '2 min', cookTime: '5 min', cuisine: 'Básico',
    tags: ['avena', 'oats', 'overnight', 'desayuno', 'fruta', 'saludable'],
    ingredients: [
      { name: 'Avena en copos', amount: '50g (½ taza)', substitute: '' },
      { name: 'Leche o bebida vegetal', amount: '200ml', substitute: 'Agua' },
      { name: 'Plátano o fruta de temporada', amount: '1 unidad', substitute: '' },
      { name: 'Miel o sirope de arce', amount: '1 cdta (opcional)', substitute: '' },
      { name: 'Canela', amount: '½ cdta (opcional)', substitute: '' },
    ],
    steps: [
      'Mezcla la avena con la leche en un bol o cazo.',
      'Calienta a fuego medio removiendo 3-5 minutos hasta que espese. O microondas 2 minutos.',
      'Sirve con la fruta troceada, miel y canela.',
    ],
    macros: { calories: '310 kcal', protein: '10g', carbs: '55g', fat: '5g', fiber: '7g' },
    tips: 'Versión overnight: mezcla en un frasco la noche anterior y deja en la nevera. Por la mañana está lista sin cocción.',
  },
  {
    title: 'Tortilla de patatas',
    description: 'El clásico español. Con o sin cebolla, siempre gana.',
    prepTime: '15 min', cookTime: '20 min', cuisine: 'Española',
    tags: ['tortilla', 'patatas', 'papa', 'huevo', 'española', 'clásico'],
    ingredients: [
      { name: 'Patatas', amount: '3 medianas (500g)', substitute: '' },
      { name: 'Huevos', amount: '4 unidades', substitute: '' },
      { name: 'Cebolla (opcional)', amount: '½ unidad', substitute: '' },
      { name: 'Aceite de oliva', amount: '100ml (para freír)', substitute: 'Aceite vegetal' },
      { name: 'Sal', amount: 'Al gusto', substitute: '' },
    ],
    steps: [
      'Pela y corta las patatas en láminas finas. Sazona.',
      'Fríe las patatas (y cebolla si usas) en aceite abundante a fuego medio-bajo hasta que estén tiernas pero no doradas (~15 min). Escurre bien.',
      'Bate los huevos con sal. Mezcla con las patatas.',
      'En sartén antiadherente con poco aceite, vierte la mezcla. Cuaja a fuego bajo (~5 min). Da la vuelta con un plato y cuaja el otro lado.',
    ],
    macros: { calories: '380 kcal', protein: '14g', carbs: '35g', fat: '20g', fiber: '3g' },
    tips: 'El secreto está en pochar las patatas despacio y en no secar demasiado la tortilla al cuajar.',
  },
  {
    title: 'Ensalada básica de atún',
    description: 'Alta en proteína, sin cocción, lista en 5 minutos.',
    prepTime: '5 min', cookTime: '0 min', cuisine: 'Básico',
    tags: ['atún', 'ensalada', 'proteína', 'rápido', 'sin cocción', 'dieta'],
    ingredients: [
      { name: 'Atún en lata (al natural)', amount: '1 lata (120g escurrido)', substitute: 'Sardinas o caballa' },
      { name: 'Lechuga o mix de hojas', amount: '2 puñados', substitute: '' },
      { name: 'Tomate', amount: '1 mediano', substitute: '' },
      { name: 'Pepino', amount: '½ unidad', substitute: '' },
      { name: 'Aceite de oliva', amount: '1 cda', substitute: '' },
      { name: 'Limón o vinagre', amount: 'Al gusto', substitute: '' },
      { name: 'Sal y pimienta', amount: 'Al gusto', substitute: '' },
    ],
    steps: [
      'Lava y trocea las verduras.',
      'Escurre el atún y desmenuza.',
      'Mezcla todo, aliña con aceite, limón, sal y pimienta justo antes de comer.',
    ],
    macros: { calories: '220 kcal', protein: '28g', carbs: '8g', fat: '8g', fiber: '3g' },
    tips: 'Aliña siempre justo antes de servir. La lechuga se ablanda con el aliño.',
  },
  {
    title: 'Batido de proteínas básico',
    description: 'Post-entrenamiento o desayuno rápido. Sin cocción.',
    prepTime: '3 min', cookTime: '0 min', cuisine: 'Básico',
    tags: ['batido', 'proteína', 'shake', 'smoothie', 'post entreno', 'desayuno'],
    ingredients: [
      { name: 'Leche o bebida vegetal', amount: '300ml', substitute: 'Agua' },
      { name: 'Plátano', amount: '1 mediano', substitute: 'Fresas o mango' },
      { name: 'Proteína en polvo (opcional)', amount: '1 medida', substitute: '' },
      { name: 'Mantequilla de cacahuete', amount: '1 cda', substitute: 'Almendras' },
      { name: 'Avena', amount: '2 cdas', substitute: '' },
    ],
    steps: [
      'Mete todo en la batidora.',
      'Bate 30-60 segundos hasta que quede homogéneo.',
      'Sirve inmediatamente.',
    ],
    macros: { calories: '380 kcal', protein: '28g', carbs: '45g', fat: '8g', fiber: '4g' },
    tips: 'Con el plátano congelado queda más cremoso y frío, como un helado.',
  },
];

// Buscar recetas en el banco local
export function searchLocalRecipes(query) {
  if (!query?.trim()) return [];
  const q = query.trim().toLowerCase();
  return POPULAR_RECIPES.filter(r =>
    r.tags.some(tag => q.includes(tag) || tag.includes(q)) ||
    r.title.toLowerCase().includes(q)
  );
}
