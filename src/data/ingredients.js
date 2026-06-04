// Shopping list ingredients per cycle phase — multilingual
// cat and name are { es, en, fr } objects

export const INGREDIENTS = {
  menstrual: [
    { cat: { es: '🐟 Pescados', en: '🐟 Fish', fr: '🐟 Poissons' }, items: [
      { name: { es: 'Salmón fresco', en: 'Fresh salmon', fr: 'Saumon frais' }, qty: 150, unit: 'g' },
    ]},
    { cat: { es: '🌾 Cereales y legumbres', en: '🌾 Grains & legumes', fr: '🌾 Céréales et légumineuses' }, items: [
      { name: { es: 'Avena (copos)', en: 'Rolled oats', fr: 'Flocons d\'avoine' }, qty: 50, unit: 'g' },
      { name: { es: 'Quinoa', en: 'Quinoa', fr: 'Quinoa' }, qty: 80, unit: 'g' },
      { name: { es: 'Pan de centeno', en: 'Rye bread', fr: 'Pain de seigle' }, qty: 40, unit: 'g' },
      { name: { es: 'Lentejas rojas', en: 'Red lentils', fr: 'Lentilles rouges' }, qty: 80, unit: 'g' },
    ]},
    { cat: { es: '🥬 Verduras', en: '🥬 Vegetables', fr: '🥬 Légumes' }, items: [
      { name: { es: 'Espinacas frescas', en: 'Fresh spinach', fr: 'Épinards frais' }, qty: 100, unit: 'g' },
      { name: { es: 'Ajos', en: 'Garlic cloves', fr: 'Gousses d\'ail' }, qty: 2, unit: 'uds' },
    ]},
    { cat: { es: '🍌 Frutas', en: '🍌 Fruits', fr: '🍌 Fruits' }, items: [
      { name: { es: 'Plátano', en: 'Banana', fr: 'Banane' }, qty: 1, unit: 'ud' },
      { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons' }, qty: 1, unit: 'ud' },
    ]},
    { cat: { es: '🥜 Frutos secos y semillas', en: '🥜 Nuts & seeds', fr: '🥜 Noix et graines' }, items: [
      { name: { es: 'Nueces', en: 'Walnuts', fr: 'Noix' }, qty: 30, unit: 'g' },
      { name: { es: 'Semillas de chía', en: 'Chia seeds', fr: 'Graines de chia' }, qty: 10, unit: 'g' },
    ]},
    { cat: { es: '🫙 Despensa', en: '🫙 Pantry', fr: '🫙 Épicerie' }, items: [
      { name: { es: 'Leche de avena', en: 'Oat milk', fr: 'Lait d\'avoine' }, qty: 200, unit: 'ml' },
      { name: { es: 'Chocolate negro 85%', en: 'Dark chocolate 85%', fr: 'Chocolat noir 85%' }, qty: 20, unit: 'g' },
      { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge' }, qty: 15, unit: 'ml' },
      { name: { es: 'Miel', en: 'Honey', fr: 'Miel' }, qty: 10, unit: 'g' },
      { name: { es: 'Jengibre fresco', en: 'Fresh ginger', fr: 'Gingembre frais' }, qty: 10, unit: 'g' },
      { name: { es: 'Cúrcuma molida', en: 'Ground turmeric', fr: 'Curcuma en poudre' }, qty: 2, unit: 'g' },
    ]},
  ],
  follicular: [
    { cat: { es: '🥩 Proteínas', en: '🥩 Proteins', fr: '🥩 Protéines' }, items: [
      { name: { es: 'Pechuga de pollo', en: 'Chicken breast', fr: 'Blanc de poulet' }, qty: 150, unit: 'g' },
      { name: { es: 'Merluza (filetes)', en: 'Hake fillets', fr: 'Filets de merlu' }, qty: 150, unit: 'g' },
      { name: { es: 'Huevos', en: 'Eggs', fr: 'Œufs' }, qty: 3, unit: 'uds' },
    ]},
    { cat: { es: '🌾 Cereales', en: '🌾 Grains', fr: '🌾 Céréales' }, items: [
      { name: { es: 'Quinoa', en: 'Quinoa', fr: 'Quinoa' }, qty: 80, unit: 'g' },
      { name: { es: 'Pan de centeno', en: 'Rye bread', fr: 'Pain de seigle' }, qty: 40, unit: 'g' },
      { name: { es: 'Boniato', en: 'Sweet potato', fr: 'Patate douce' }, qty: 120, unit: 'g' },
    ]},
    { cat: { es: '🥬 Verduras', en: '🥬 Vegetables', fr: '🥬 Légumes' }, items: [
      { name: { es: 'Espinacas frescas', en: 'Fresh spinach', fr: 'Épinards frais' }, qty: 60, unit: 'g' },
      { name: { es: 'Brócoli', en: 'Broccoli', fr: 'Brocoli' }, qty: 150, unit: 'g' },
      { name: { es: 'Zanahoria', en: 'Carrot', fr: 'Carotte' }, qty: 100, unit: 'g' },
    ]},
    { cat: { es: '🥑 Frutas', en: '🥑 Fruits', fr: '🥑 Fruits' }, items: [
      { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat' }, qty: 1, unit: 'ud' },
      { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons' }, qty: 1, unit: 'ud' },
      { name: { es: 'Fruta de temporada', en: 'Seasonal fruit', fr: 'Fruit de saison' }, qty: 1, unit: 'ud' },
    ]},
    { cat: { es: '🥜 Semillas', en: '🥜 Seeds', fr: '🥜 Graines' }, items: [
      { name: { es: 'Pepitas de calabaza', en: 'Pumpkin seeds', fr: 'Graines de courge' }, qty: 15, unit: 'g' },
    ]},
    { cat: { es: '🫙 Despensa', en: '🫙 Pantry', fr: '🫙 Épicerie' }, items: [
      { name: { es: 'Hummus', en: 'Hummus', fr: 'Houmous' }, qty: 60, unit: 'g' },
      { name: { es: 'Kombucha natural', en: 'Plain kombucha', fr: 'Kombucha nature' }, qty: 250, unit: 'ml' },
      { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge' }, qty: 15, unit: 'ml' },
    ]},
  ],
  ovulation: [
    { cat: { es: '🦐 Proteínas', en: '🦐 Proteins', fr: '🦐 Protéines' }, items: [
      { name: { es: 'Gambas frescas o congeladas', en: 'Fresh or frozen prawns', fr: 'Crevettes fraîches ou surgelées' }, qty: 150, unit: 'g' },
      { name: { es: 'Pavo (filetes)', en: 'Turkey fillets', fr: 'Filets de dinde' }, qty: 150, unit: 'g' },
    ]},
    { cat: { es: '🌾 Cereales', en: '🌾 Grains', fr: '🌾 Céréales' }, items: [
      { name: { es: 'Arroz integral', en: 'Brown rice', fr: 'Riz complet' }, qty: 70, unit: 'g' },
      { name: { es: 'Granola sin gluten', en: 'Gluten-free granola', fr: 'Granola sans gluten' }, qty: 40, unit: 'g' },
    ]},
    { cat: { es: '🥬 Verduras', en: '🥬 Vegetables', fr: '🥬 Légumes' }, items: [
      { name: { es: 'Espárragos', en: 'Asparagus', fr: 'Asperges' }, qty: 150, unit: 'g' },
      { name: { es: 'Pepino', en: 'Cucumber', fr: 'Concombre' }, qty: 100, unit: 'g' },
      { name: { es: 'Rúcula', en: 'Rocket / Arugula', fr: 'Roquette' }, qty: 60, unit: 'g' },
    ]},
    { cat: { es: '🍓 Frutas', en: '🍓 Fruits', fr: '🍓 Fruits' }, items: [
      { name: { es: 'Frutos rojos (frescos o congelados)', en: 'Berries (fresh or frozen)', fr: 'Fruits rouges (frais ou surgelés)' }, qty: 200, unit: 'g' },
      { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat' }, qty: 1, unit: 'ud' },
      { name: { es: 'Limones', en: 'Lemons', fr: 'Citrons' }, qty: 1, unit: 'ud' },
    ]},
    { cat: { es: '🥜 Semillas', en: '🥜 Seeds', fr: '🥜 Graines' }, items: [
      { name: { es: 'Pepitas de calabaza', en: 'Pumpkin seeds', fr: 'Graines de courge' }, qty: 50, unit: 'g' },
      { name: { es: 'Semillas de sésamo', en: 'Sesame seeds', fr: 'Graines de sésame' }, qty: 10, unit: 'g' },
    ]},
    { cat: { es: '🫙 Despensa', en: '🫙 Pantry', fr: '🫙 Épicerie' }, items: [
      { name: { es: 'Leche de coco (en lata)', en: 'Coconut milk (canned)', fr: 'Lait de coco (en boîte)' }, qty: 200, unit: 'ml' },
      { name: { es: 'Leche de avena', en: 'Oat milk', fr: 'Lait d\'avoine' }, qty: 200, unit: 'ml' },
      { name: { es: 'Matcha en polvo', en: 'Matcha powder', fr: 'Poudre de matcha' }, qty: 2, unit: 'g' },
      { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge' }, qty: 15, unit: 'ml' },
    ]},
  ],
  luteal: [
    { cat: { es: '🥩 Proteínas', en: '🥩 Proteins', fr: '🥩 Protéines' }, items: [
      { name: { es: 'Tofu firme', en: 'Firm tofu', fr: 'Tofu ferme' }, qty: 150, unit: 'g' },
      { name: { es: 'Pollo (muslos)', en: 'Chicken thighs', fr: 'Cuisses de poulet' }, qty: 150, unit: 'g' },
      { name: { es: 'Huevos', en: 'Eggs', fr: 'Œufs' }, qty: 2, unit: 'uds' },
    ]},
    { cat: { es: '🌾 Cereales', en: '🌾 Grains', fr: '🌾 Céréales' }, items: [
      { name: { es: 'Pan integral', en: 'Wholegrain bread', fr: 'Pain complet' }, qty: 80, unit: 'g' },
      { name: { es: 'Arroz integral', en: 'Brown rice', fr: 'Riz complet' }, qty: 80, unit: 'g' },
      { name: { es: 'Fideos de arroz', en: 'Rice noodles', fr: 'Nouilles de riz' }, qty: 80, unit: 'g' },
    ]},
    { cat: { es: '🥬 Verduras', en: '🥬 Vegetables', fr: '🥬 Légumes' }, items: [
      { name: { es: 'Tomate cherry', en: 'Cherry tomatoes', fr: 'Tomates cerises' }, qty: 80, unit: 'g' },
      { name: { es: 'Verduras mixtas para wok', en: 'Mixed stir-fry vegetables', fr: 'Légumes mixtes pour wok' }, qty: 150, unit: 'g' },
      { name: { es: 'Verduras para sopa', en: 'Soup vegetables', fr: 'Légumes pour soupe' }, qty: 100, unit: 'g' },
    ]},
    { cat: { es: '🥑 Frutas', en: '🥑 Fruits', fr: '🥑 Fruits' }, items: [
      { name: { es: 'Aguacate', en: 'Avocado', fr: 'Avocat' }, qty: 1, unit: 'ud' },
      { name: { es: 'Plátano', en: 'Banana', fr: 'Banane' }, qty: 1, unit: 'ud' },
      { name: { es: 'Dátiles', en: 'Dates', fr: 'Dattes' }, qty: 3, unit: 'uds' },
    ]},
    { cat: { es: '🥜 Semillas', en: '🥜 Seeds & nut butters', fr: '🥜 Graines et purées' }, items: [
      { name: { es: 'Mantequilla de almendra', en: 'Almond butter', fr: 'Purée d\'amande' }, qty: 20, unit: 'g' },
      { name: { es: 'Semillas de girasol', en: 'Sunflower seeds', fr: 'Graines de tournesol' }, qty: 15, unit: 'g' },
    ]},
    { cat: { es: '🫙 Despensa', en: '🫙 Pantry', fr: '🫙 Épicerie' }, items: [
      { name: { es: 'Caldo de pollo (brick)', en: 'Chicken stock (carton)', fr: 'Bouillon de poulet (brique)' }, qty: 400, unit: 'ml' },
      { name: { es: 'Chocolate negro 85%', en: 'Dark chocolate 85%', fr: 'Chocolat noir 85%' }, qty: 20, unit: 'g' },
      { name: { es: 'Salsa tamari', en: 'Tamari sauce', fr: 'Sauce tamari' }, qty: 15, unit: 'ml' },
      { name: { es: 'Aceite de sésamo', en: 'Sesame oil', fr: 'Huile de sésame' }, qty: 15, unit: 'ml' },
      { name: { es: 'Aceite de oliva virgen', en: 'Extra virgin olive oil', fr: 'Huile d\'olive vierge' }, qty: 15, unit: 'ml' },
    ]},
  ],
};

// Unit labels per language
const UNIT_LABELS = {
  es: { ud: 'unidad', uds: 'unidades' },
  en: { ud: 'unit', uds: 'units' },
  fr: { ud: 'unité', uds: 'unités' },
};

export const formatQty = (qty, unit, lang = 'es') => {
  const r = Math.ceil(qty);
  const ul = UNIT_LABELS[lang] || UNIT_LABELS.es;
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} L`;
  if (unit === 'ud' || unit === 'uds') return `${r} ${r === 1 ? ul.ud : ul.uds}`;
  return `${r} ${unit}`;
};

// Helper: resolve a multilingual name to the current language
export function locName(name, lang = 'es') {
  if (!name) return '';
  if (typeof name === 'string') return name; // legacy flat string
  return name[lang] ?? name.es ?? '';
}

export function locCat(cat, lang = 'es') {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  return cat[lang] ?? cat.es ?? '';
}
