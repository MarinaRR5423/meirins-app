export const INGREDIENTS = {
  menstrual: [
    { cat: '🐟 Pescados', items: [{ name: 'Salmón fresco', qty: 150, unit: 'g' }] },
    { cat: '🌾 Cereales y legumbres', items: [{ name: 'Avena (copos)', qty: 50, unit: 'g' }, { name: 'Quinoa', qty: 80, unit: 'g' }, { name: 'Pan de centeno', qty: 40, unit: 'g' }, { name: 'Lentejas rojas', qty: 80, unit: 'g' }] },
    { cat: '🥬 Verduras', items: [{ name: 'Espinacas frescas', qty: 100, unit: 'g' }, { name: 'Ajos', qty: 2, unit: 'uds' }] },
    { cat: '🍌 Frutas', items: [{ name: 'Plátano', qty: 1, unit: 'ud' }, { name: 'Limones', qty: 1, unit: 'ud' }] },
    { cat: '🥜 Frutos secos y semillas', items: [{ name: 'Nueces', qty: 30, unit: 'g' }, { name: 'Semillas de chía', qty: 10, unit: 'g' }] },
    { cat: '🫙 Despensa', items: [{ name: 'Leche de avena', qty: 200, unit: 'ml' }, { name: 'Chocolate negro 85%', qty: 20, unit: 'g' }, { name: 'Aceite de oliva virgen', qty: 15, unit: 'ml' }, { name: 'Miel', qty: 10, unit: 'g' }, { name: 'Jengibre fresco', qty: 10, unit: 'g' }, { name: 'Cúrcuma molida', qty: 2, unit: 'g' }] },
  ],
  follicular: [
    { cat: '🥩 Proteínas', items: [{ name: 'Pechuga de pollo', qty: 150, unit: 'g' }, { name: 'Merluza (filetes)', qty: 150, unit: 'g' }, { name: 'Huevos', qty: 3, unit: 'uds' }] },
    { cat: '🌾 Cereales', items: [{ name: 'Quinoa', qty: 80, unit: 'g' }, { name: 'Pan de centeno', qty: 40, unit: 'g' }, { name: 'Boniato', qty: 120, unit: 'g' }] },
    { cat: '🥬 Verduras', items: [{ name: 'Espinacas frescas', qty: 60, unit: 'g' }, { name: 'Brócoli', qty: 150, unit: 'g' }, { name: 'Zanahoria', qty: 100, unit: 'g' }] },
    { cat: '🥑 Frutas', items: [{ name: 'Aguacate', qty: 1, unit: 'ud' }, { name: 'Limones', qty: 1, unit: 'ud' }, { name: 'Fruta de temporada', qty: 1, unit: 'ud' }] },
    { cat: '🥜 Semillas', items: [{ name: 'Pepitas de calabaza', qty: 15, unit: 'g' }] },
    { cat: '🫙 Despensa', items: [{ name: 'Hummus', qty: 60, unit: 'g' }, { name: 'Kombucha natural', qty: 250, unit: 'ml' }, { name: 'Aceite de oliva virgen', qty: 15, unit: 'ml' }] },
  ],
  ovulation: [
    { cat: '🦐 Proteínas', items: [{ name: 'Gambas frescas o congeladas', qty: 150, unit: 'g' }, { name: 'Pavo (filetes)', qty: 150, unit: 'g' }] },
    { cat: '🌾 Cereales', items: [{ name: 'Arroz integral', qty: 70, unit: 'g' }, { name: 'Granola sin gluten', qty: 40, unit: 'g' }] },
    { cat: '🥬 Verduras', items: [{ name: 'Espárragos', qty: 150, unit: 'g' }, { name: 'Pepino', qty: 100, unit: 'g' }, { name: 'Rúcula', qty: 60, unit: 'g' }] },
    { cat: '🍓 Frutas', items: [{ name: 'Frutos rojos (frescos o congelados)', qty: 200, unit: 'g' }, { name: 'Aguacate', qty: 1, unit: 'ud' }, { name: 'Limones', qty: 1, unit: 'ud' }] },
    { cat: '🥜 Semillas', items: [{ name: 'Pepitas de calabaza', qty: 50, unit: 'g' }, { name: 'Semillas de sésamo', qty: 10, unit: 'g' }] },
    { cat: '🫙 Despensa', items: [{ name: 'Leche de coco (en lata)', qty: 200, unit: 'ml' }, { name: 'Leche de avena', qty: 200, unit: 'ml' }, { name: 'Matcha en polvo', qty: 2, unit: 'g' }, { name: 'Aceite de oliva virgen', qty: 15, unit: 'ml' }] },
  ],
  luteal: [
    { cat: '🥩 Proteínas', items: [{ name: 'Tofu firme', qty: 150, unit: 'g' }, { name: 'Pollo (muslos)', qty: 150, unit: 'g' }, { name: 'Huevos', qty: 2, unit: 'uds' }] },
    { cat: '🌾 Cereales', items: [{ name: 'Pan integral', qty: 80, unit: 'g' }, { name: 'Arroz integral', qty: 80, unit: 'g' }, { name: 'Fideos de arroz', qty: 80, unit: 'g' }] },
    { cat: '🥬 Verduras', items: [{ name: 'Tomate cherry', qty: 80, unit: 'g' }, { name: 'Verduras mixtas para wok', qty: 150, unit: 'g' }, { name: 'Verduras para sopa', qty: 100, unit: 'g' }] },
    { cat: '🥑 Frutas', items: [{ name: 'Aguacate', qty: 1, unit: 'ud' }, { name: 'Plátano', qty: 1, unit: 'ud' }, { name: 'Dátiles', qty: 3, unit: 'uds' }] },
    { cat: '🥜 Semillas', items: [{ name: 'Mantequilla de almendra', qty: 20, unit: 'g' }, { name: 'Semillas de girasol', qty: 15, unit: 'g' }] },
    { cat: '🫙 Despensa', items: [{ name: 'Caldo de pollo (brick)', qty: 400, unit: 'ml' }, { name: 'Chocolate negro 85%', qty: 20, unit: 'g' }, { name: 'Salsa tamari', qty: 15, unit: 'ml' }, { name: 'Aceite de sésamo', qty: 15, unit: 'ml' }, { name: 'Aceite de oliva virgen', qty: 15, unit: 'ml' }] },
  ]
};

export const formatQty = (qty, unit) => {
  const r = Math.ceil(qty);
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} L`;
  if (unit === 'ud' || unit === 'uds') return `${r} ${r === 1 ? 'unidad' : 'unidades'}`;
  return `${r} ${unit}`;
};