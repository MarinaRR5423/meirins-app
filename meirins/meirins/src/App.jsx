import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import './index.css'

// ── SUPABASE ─────────────────────────────────────────────────────────────────
const sb = createClient(
  'https://lpcvkzmfemxziuhdmzpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3Zrem1mZW14eml1aGRtenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTcxNTcsImV4cCI6MjA5MjEzMzE1N30.1khyrwY8455LKptbHLIRtSe9AjT8bOitV7vSskVSN1g'
)

// ── CONSTANTES VISUALES (no vienen de la BD) ─────────────────────────────────
const BLUE = { primary:'#1A56DB', dark:'#1E3A8A', light:'#EFF6FF', mid:'rgba(26,86,219,0.10)', text:'#1E40AF' }

const SPORT_CHIPS = [
  {ico:'🤸',name:'Calistenia 30min'},
  {ico:'🏃',name:'Correr 30min'},
  {ico:'🚴',name:'Bici 45min'},
  {ico:'🏊',name:'Natación 30min'},
  {ico:'🧘',name:'Yoga 30min'},
  {ico:'⚽',name:'Fútbol 1h'},
  {ico:'🎾',name:'Tenis 1h'},
]

const PHASE_VISUAL = {
  menstrual:  { color:'#64748B', light:'#F8FAFC', mid:'rgba(100,116,139,0.10)' },
  follicular: { color:'#2563EB', light:'#EFF6FF', mid:'rgba(37,99,235,0.10)'   },
  ovulation:  { color:'#0284C7', light:'#F0F9FF', mid:'rgba(2,132,199,0.10)'   },
  luteal:     { color:'#475569', light:'#F8FAFC', mid:'rgba(71,85,105,0.10)'   },
}

// ── DATOS LOCALES (fallback si Supabase falla) ────────────────────────────────
const PHASES_LOCAL = {
  menstrual:{
    name:'Menstrual',emoji:'🌑',...PHASE_VISUAL.menstrual,
    tagline:'Restauración & Descanso',
    desc:'Tu cuerpo se renueva. Nutríte con calma y respeta el descanso.',
    focus:['Hierro','Magnesio','Omega-3','Antiinflamatorios'],kcal:'Déficit suave · −200 kcal/día',
    intensity:'Muy baja',intensityPct:20,
    tip:'El descanso activo tiene tanto valor como el entreno intenso. Tu cuerpo trabaja internamente.',
    meals:[
      {t:'Desayuno',ico:'🌾',title:'Porridge reconfortante',items:['Avena con leche de avena','Plátano + semillas de chía','Canela y miel'],recipe:{ingredients:['80g copos de avena','200ml leche de avena','1 plátano maduro','1 cdta semillas de chía','½ cdta canela molida','1 cdta miel'],steps:['Calienta la leche de avena en un cazo a fuego medio.','Añade la avena y cocina 4–5 min removiendo constantemente.','Vierte en un bol y lamina el plátano encima.','Añade la chía, espolvorea canela y termina con la miel.']}},
      {t:'Almuerzo',ico:'🐟',title:'Salmón antiinflamatorio',items:['Salmón al horno 150g','Quinoa 80g + espinacas salteadas','Limón y aceite de oliva'],recipe:{ingredients:['150g filete de salmón','80g quinoa cruda','100g espinacas frescas','1 limón','2 cdas aceite de oliva virgen','Sal, pimienta, eneldo'],steps:['Precalienta el horno a 180°C. Salpimienta el salmón y hornea 15–18 min.','Cuece la quinoa (ratio 1:2 con agua, 15 min).','Saltea las espinacas 2 min con un poco de aceite.','Sirve la quinoa con espinacas, el salmón encima y aliña con limón.']}},
      {t:'Cena',ico:'🍲',title:'Crema de lentejas rojas',items:['Crema de lentejas rojas','Pan de centeno tostado','Jengibre fresco rallado'],recipe:{ingredients:['150g lentejas rojas','½ cebolla','1 zanahoria','1 cdta jengibre fresco rallado','½ cdta cúrcuma','500ml agua o caldo','1 cda aceite de oliva','Pan de centeno'],steps:['Sofríe la cebolla y zanahoria en aceite 5 min.','Añade las lentejas, jengibre, cúrcuma y agua. Cuece 20 min.','Tritura con batidora hasta textura suave.','Sirve caliente con el pan de centeno tostado.']}},
      {t:'Snacks',ico:'🍫',title:'Caprichos con propósito',items:['Chocolate negro 85% · 20g','Nueces · 30g','Infusión jengibre-cúrcuma'],recipe:{ingredients:['20g chocolate negro 85%','30g nueces','1 taza agua caliente','1 rodaja jengibre fresco','½ cdta cúrcuma','1 cdta miel (opcional)'],steps:['Hierve el agua y añade el jengibre y la cúrcuma.','Deja reposar 5 min, cuela y añade miel si deseas.','Disfruta junto con el chocolate negro y las nueces.']}},
    ],
    week:[
      {d:'L',name:'Yoga restaurativo',dur:"30'",ico:'🧘',on:true,exercises:[{name:'Postura del niño (Balasana)',dur:'3 min'},{name:'Torsión espinal suave',dur:'2 min c/lado'},{name:'Piernas en la pared',dur:'5 min'},{name:'Savasana',dur:'10 min'}]},
      {d:'M',name:'Paseo suave',dur:"20'",ico:'🚶',on:true,exercises:[{name:'Caminata a ritmo cómodo',dur:'20 min'},{name:'Respiración profunda caminando',dur:'todo el paseo'}]},
      {d:'X',name:'Pilates suave',dur:"40'",ico:'🤸',on:true,exercises:[{name:'The Hundred (modificado)',sets:3,reps:'10 resp'},{name:'Roll Up suave',sets:3,reps:'8'},{name:'Single Leg Stretch',sets:2,reps:'10 c/lado'},{name:'Glute Bridge',sets:3,reps:'12'},{name:'Cat-Cow',sets:2,reps:'10'}]},
      {d:'J',name:'Descanso total',dur:'',ico:'😴',on:false,exercises:[]},
      {d:'V',name:'Estiramientos',dur:"30'",ico:'🙆',on:true,exercises:[{name:'Estiramiento de caderas',dur:'2 min c/lado'},{name:'Apertura de pecho',dur:'3 min'},{name:'Estiramiento lumbar',dur:'3 min'},{name:'Relajación con respiración',dur:'10 min'}]},
      {d:'S',name:'Paseo en naturaleza',dur:"30'",ico:'🌿',on:true,exercises:[{name:'Caminata en terreno natural',dur:'30 min'}]},
      {d:'D',name:'Descanso',dur:'',ico:'😴',on:false,exercises:[]},
    ]
  },
  follicular:{
    name:'Folicular',emoji:'🌒',...PHASE_VISUAL.follicular,
    tagline:'Energía & Crecimiento',
    desc:'Los estrógenos suben. Tu fuerza, resistencia y motivación están en pleno auge.',
    focus:['Proteína magra','Carbohidratos complejos','Probióticos','Zinc'],kcal:'Déficit moderado · −300 kcal/día',
    intensity:'Alta',intensityPct:80,
    tip:'¡Aprovecha esta ventana! Tu fuerza es superior. Intenta superar tus marcas personales.',
    meals:[
      {t:'Desayuno',ico:'🥚',title:'Tortilla energética',items:['3 huevos + espinacas frescas','Aguacate ½ · tostada centeno','Café o té verde'],recipe:{ingredients:['3 huevos','60g espinacas frescas','½ aguacate','1 rebanada pan de centeno','Sal, pimienta, aceite de oliva'],steps:['Bate los huevos con sal y pimienta.','Saltea las espinacas 1 min en sartén con un poco de aceite.','Añade los huevos y cuaja a fuego medio-bajo 3–4 min.','Tuesta el pan y sirve con el aguacate laminado.']}},
      {t:'Almuerzo',ico:'🍗',title:'Bowl de fuerza',items:['Pechuga de pollo 150g','Quinoa 80g + brócoli al vapor','Comino y limón'],recipe:{ingredients:['150g pechuga de pollo','80g quinoa cruda','150g brócoli','1 limón','½ cdta comino','2 cdas aceite de oliva','Sal y pimienta'],steps:['Cuece la quinoa 15 min. Vaporiza el brócoli 8 min.','Sazona el pollo con comino, sal y pimienta.','Cocina el pollo a la plancha 6–7 min por lado.','Monta el bowl con quinoa, brócoli y pollo laminado. Aliña con limón.']}},
      {t:'Cena',ico:'🐠',title:'Merluza al papillote',items:['Merluza al papillote 150g','Boniato asado 120g','Ensalada verde con pepitas'],recipe:{ingredients:['150g filete de merluza','120g boniato','80g ensalada mixta','15g pepitas de calabaza','Limón, aceite oliva, sal, hierbas provenzales'],steps:['Precalienta el horno a 200°C.','Envuelve la merluza en papel de horno con limón, aceite y hierbas. Hornea 15 min.','Corta el boniato en cubos y hornea con aceite y sal 25 min.','Sirve con la ensalada aliñada y pepitas de calabaza.']}},
      {t:'Snacks',ico:'🥕',title:'Energía limpia',items:['Fruta de temporada','Hummus con crudités','Kombucha natural'],recipe:{ingredients:['1 fruta de temporada','80g hummus','100g zanahoria y apio crudos','250ml kombucha natural'],steps:['Lava y corta las verduras en bastones.','Sirve el hummus en un bol pequeño para dipear.','Acompaña con la fruta y la kombucha fría.']}},
    ],
    week:[
      {d:'L',name:'HIIT',dur:"30'",ico:'🔥',on:true,exercises:[{name:'Burpees',sets:4,reps:'12'},{name:'Jump squats',sets:3,reps:'15'},{name:'Mountain climbers',sets:3,dur:'45s'},{name:'High knees',sets:3,dur:'45s'},{name:'Push-ups',sets:3,reps:'12'}]},
      {d:'M',name:'Fuerza · Piernas',dur:"45'",ico:'🦵',on:true,exercises:[{name:'Sentadilla con peso',sets:4,reps:'12'},{name:'Peso muerto',sets:3,reps:'10'},{name:'Zancadas alternadas',sets:3,reps:'12 c/lado'},{name:'Hip thrust',sets:4,reps:'15'},{name:'Prensa de piernas',sets:3,reps:'12'}]},
      {d:'X',name:'Carrera continua',dur:"30'",ico:'🏃',on:true,exercises:[{name:'Calentamiento caminando',dur:'5 min'},{name:'Carrera a ritmo constante',dur:'20 min'},{name:'Vuelta a la calma',dur:'5 min'}]},
      {d:'J',name:'Fuerza · Upper body',dur:"45'",ico:'💪',on:true,exercises:[{name:'Press banca o flexiones',sets:4,reps:'12'},{name:'Remo con mancuerna',sets:3,reps:'12 c/lado'},{name:'Press hombros',sets:3,reps:'12'},{name:'Curl bíceps',sets:3,reps:'15'},{name:'Tríceps en polea',sets:3,reps:'15'}]},
      {d:'V',name:'HIIT / Crossfit',dur:"30'",ico:'🔥',on:true,exercises:[{name:'Box jumps',sets:4,reps:'10'},{name:'Kettlebell swings',sets:4,reps:'15'},{name:'Battle ropes',sets:3,dur:'30s'},{name:'TRX rows',sets:3,reps:'12'}]},
      {d:'S',name:'Deporte outdoor',dur:"60'",ico:'🚴',on:true,exercises:[{name:'Bici, senderismo o natación',dur:'60 min'}]},
      {d:'D',name:'Descanso activo',dur:"20'",ico:'🧘',on:true,exercises:[{name:'Yoga suave o estiramientos',dur:'20 min'}]},
    ]
  },
  ovulation:{
    name:'Ovulación',emoji:'🌕',...PHASE_VISUAL.ovulation,
    tagline:'Pico de Potencia',
    desc:'Tu mejor momento. Fuerza, energía y carisma al máximo absoluto.',
    focus:['Zinc','Antioxidantes','Fibra','Comidas ligeras'],kcal:'Déficit moderado · −250 kcal/día',
    intensity:'Máxima',intensityPct:100,
    tip:'¡Bate tus récords! Tu cuerpo está en su pico absoluto. El momento ideal para nuevos retos.',
    meals:[
      {t:'Desayuno',ico:'🍓',title:'Smoothie bowl',items:['Leche de coco 200ml','Frutos rojos 100g','Pepitas de calabaza · granola sin gluten'],recipe:{ingredients:['200ml leche de coco','100g frutos rojos (frescos o congelados)','30g granola sin gluten','15g pepitas de calabaza','1 cdta miel (opcional)'],steps:['Tritura los frutos rojos con la leche de coco hasta obtener una base suave.','Vierte en un bol.','Decora con la granola y las pepitas de calabaza.','Añade miel al gusto.']}},
      {t:'Almuerzo',ico:'🍤',title:'Ensalada proteica',items:['Gambas a la plancha 150g','Aguacate + pepino + rúcula','Sésamo · vinagreta limón'],recipe:{ingredients:['150g gambas peladas','1 aguacate','½ pepino','60g rúcula','10g semillas de sésamo','Zumo 1 limón, 2 cdas aceite oliva, sal'],steps:['Cocina las gambas a la plancha 2–3 min por lado con sal.','Lamina el aguacate y corta el pepino en medias lunas.','Monta la ensalada con la rúcula de base.','Añade gambas, aguacate y pepino. Aliña y espolvorea sésamo.']}},
      {t:'Cena',ico:'🦃',title:'Pavo & fibra',items:['Pavo a la plancha 150g','Espárragos asados','Arroz integral 70g'],recipe:{ingredients:['150g filete de pavo','150g espárragos','70g arroz integral','Aceite de oliva, ajo, sal, pimienta, pimentón'],steps:['Cuece el arroz integral 30–35 min.','Asa los espárragos con aceite y sal en horno 200°C 15 min.','Salpimienta el pavo y cocina a la plancha 5–6 min por lado.','Sirve todo junto con un hilo de aceite y pimentón.']}},
      {t:'Snacks',ico:'🌱',title:'Antioxidantes',items:['Pepitas de calabaza · 30g','Frutos rojos frescos','Matcha latte con leche de avena'],recipe:{ingredients:['30g pepitas de calabaza','100g frutos rojos frescos','1 cdta matcha en polvo','200ml leche de avena caliente','1 cdta miel'],steps:['Disuelve el matcha en un poco de agua caliente formando una pasta.','Calienta la leche de avena y viértela sobre el matcha.','Añade miel y mezcla bien.','Acompaña con los frutos rojos y las pepitas.']}},
    ],
    week:[
      {d:'L',name:'Carrera intensa',dur:"45'",ico:'🏃',on:true,exercises:[{name:'Calentamiento',dur:'10 min'},{name:'Intervalos 1 min rápido / 1 min suave',sets:10,reps:'x'},{name:'Vuelta a la calma',dur:'5 min'}]},
      {d:'M',name:'Fuerza total',dur:"50'",ico:'🏋️',on:true,exercises:[{name:'Sentadilla con barra',sets:5,reps:'8'},{name:'Peso muerto',sets:4,reps:'8'},{name:'Press banca',sets:4,reps:'8'},{name:'Dominadas o jalón',sets:4,reps:'8'},{name:'Press militar',sets:3,reps:'10'}]},
      {d:'X',name:'Boxeo / CrossFit',dur:"45'",ico:'🥊',on:true,exercises:[{name:'Saltar a la comba',dur:'5 min'},{name:'Combinaciones de boxeo',sets:5,dur:'2 min'},{name:'Thruster con mancuernas',sets:4,reps:'12'},{name:'TRX o dominadas',sets:3,reps:'8'}]},
      {d:'J',name:'Fuerza + Cardio',dur:"50'",ico:'🔥',on:true,exercises:[{name:'Circuit training: sentadilla + press',sets:5,reps:'10 c/u'},{name:'AMRAP: burpees + remo',dur:'10 min'},{name:'Core: plancha y hollow body',sets:3,dur:'45s'}]},
      {d:'V',name:'Deporte outdoor',dur:"60'",ico:'⛰️',on:true,exercises:[{name:'Senderismo, escalada o trail running',dur:'60 min'}]},
      {d:'S',name:'Actividad social',dur:"60'",ico:'🏊',on:true,exercises:[{name:'Natación, pádel, tenis o deporte en grupo',dur:'60 min'}]},
      {d:'D',name:'Descanso',dur:'',ico:'😴',on:false,exercises:[]},
    ]
  },
  luteal:{
    name:'Lútea',emoji:'🌖',...PHASE_VISUAL.luteal,
    tagline:'Calma & Equilibrio',
    desc:'La progesterona toma el mando. Nutre tu cuerpo para navegar el SPM con energía.',
    focus:['Carbohidratos complejos','Triptófano','Magnesio','Anti-cravings'],kcal:'Mantenimiento · +100–150 kcal',
    intensity:'Moderada',intensityPct:40,
    tip:'Ve reduciendo la intensidad progresivamente. Prioriza la recuperación.',
    meals:[
      {t:'Desayuno',ico:'🍞',title:'Desayuno saciante',items:['2 tostadas integrales · huevo poché','Aguacate + tomate cherry','Semillas de girasol'],recipe:{ingredients:['2 rebanadas pan integral','2 huevos','½ aguacate','80g tomate cherry','15g semillas de girasol','Vinagre blanco, sal, pimienta'],steps:['Tuesta el pan. Prepara agua con vinagre y llévala casi al hervor.','Rompe el huevo en un cuenco y deslízalo suavemente al agua. Cuece 3–4 min.','Machaca el aguacate con sal en las tostadas.','Coloca el huevo encima, añade los tomates y las semillas.']}},
      {t:'Almuerzo',ico:'🥗',title:'Bowl vegetal completo',items:['Tofu firme 150g salteado','Arroz integral 80g','Verduras al wok · sésamo y tamari'],recipe:{ingredients:['150g tofu firme','80g arroz integral','150g verduras mixtas (pimiento, calabacín, zanahoria)','1 cda tamari sin gluten','1 cda aceite de sésamo','1 cdta jengibre rallado','Semillas de sésamo'],steps:['Cuece el arroz integral 30 min.','Corta el tofu en cubos y dóralo en sartén hasta que esté crujiente.','Saltea las verduras 5 min. Añade tamari, jengibre y el tofu.','Sirve sobre el arroz con aceite de sésamo y semillas.']}},
      {t:'Cena',ico:'🍜',title:'Sopa reconfortante',items:['Caldo de pollo casero','Pollo desmenuzado 100g','Fideos de arroz + verduras'],recipe:{ingredients:['600ml caldo de pollo','100g pollo cocido desmenuzado','80g fideos de arroz','100g verduras (puerro, zanahoria, apio)','Sal, pimienta, perejil fresco'],steps:['Calienta el caldo con las verduras cortadas finas durante 10 min.','Añade los fideos de arroz y cocina 5–7 min.','Incorpora el pollo desmenuzado y calienta 2 min.','Sirve con pimienta y perejil fresco picado.']}},
      {t:'Snacks',ico:'🍌',title:'Antojos inteligentes',items:['Plátano + mantequilla de almendra','Chocolate negro 85% · 20g','Dátiles 2–3 unidades'],recipe:{ingredients:['1 plátano maduro','1 cda mantequilla de almendra','20g chocolate negro 85%','2–3 dátiles Medjool'],steps:['Corta el plátano en rodajas.','Unta la mantequilla de almendra sobre las rodajas o dipea directamente.','Acompaña con los dátiles y el chocolate.','Tip: congela el plátano 1h para una textura tipo helado.']}},
    ],
    week:[
      {d:'L',name:'Pilates',dur:"45'",ico:'🤸',on:true,exercises:[{name:'The Hundred',sets:3,reps:'10 resp'},{name:'Roll Up',sets:3,reps:'8'},{name:'Side Kick series',sets:2,reps:'12 c/lado'},{name:'Swimming',sets:3,dur:'30s'},{name:'Seal',sets:2,reps:'8'}]},
      {d:'M',name:'Fuerza moderada',dur:"40'",ico:'💪',on:true,exercises:[{name:'Sentadilla con mancuernas',sets:3,reps:'12'},{name:'Peso muerto suave',sets:3,reps:'10'},{name:'Remo con banda',sets:3,reps:'15'},{name:'Glute bridge',sets:3,reps:'15'},{name:'Core suave',sets:2,dur:'30s'}]},
      {d:'X',name:'Yoga flow',dur:"45'",ico:'🧘',on:true,exercises:[{name:'Saludo al sol (×5)',dur:'10 min'},{name:'Guerrero I y II',dur:'3 min c/lado'},{name:'Torsiones suaves',dur:'5 min'},{name:'Yin yoga / posturas de suelo',dur:'15 min'}]},
      {d:'J',name:'Caminata rápida',dur:"45'",ico:'🚶',on:true,exercises:[{name:'Caminata a paso rápido',dur:'45 min'}]},
      {d:'V',name:'Natación suave',dur:"30'",ico:'🏊',on:true,exercises:[{name:'Crol suave',sets:5,reps:'2 largos'},{name:'Espalda',sets:4,reps:'2 largos'},{name:'Flotación y respiración',dur:'5 min'}]},
      {d:'S',name:'Estiramientos',dur:"30'",ico:'🙆',on:true,exercises:[{name:'Estiramiento completo de cuerpo',dur:'30 min'}]},
      {d:'D',name:'Descanso total',dur:'',ico:'😴',on:false,exercises:[]},
    ]
  }
}

const INGREDIENTS = {
  menstrual:[
    {cat:'🐟 Pescados',items:[{name:'Salmón fresco',qty:150,unit:'g'}]},
    {cat:'🌾 Cereales y legumbres',items:[{name:'Avena (copos)',qty:50,unit:'g'},{name:'Quinoa',qty:80,unit:'g'},{name:'Pan de centeno',qty:40,unit:'g'},{name:'Lentejas rojas',qty:80,unit:'g'}]},
    {cat:'🥬 Verduras',items:[{name:'Espinacas frescas',qty:100,unit:'g'},{name:'Ajos',qty:2,unit:'uds'}]},
    {cat:'🍌 Frutas',items:[{name:'Plátano',qty:1,unit:'ud'},{name:'Limones',qty:1,unit:'ud'}]},
    {cat:'🥜 Frutos secos y semillas',items:[{name:'Nueces',qty:30,unit:'g'},{name:'Semillas de chía',qty:10,unit:'g'}]},
    {cat:'🫙 Despensa',items:[{name:'Leche de avena',qty:200,unit:'ml'},{name:'Chocolate negro 85%',qty:20,unit:'g'},{name:'Aceite de oliva virgen',qty:15,unit:'ml'},{name:'Miel',qty:10,unit:'g'},{name:'Jengibre fresco',qty:10,unit:'g'},{name:'Cúrcuma molida',qty:2,unit:'g'}]},
  ],
  follicular:[
    {cat:'🥩 Proteínas',items:[{name:'Pechuga de pollo',qty:150,unit:'g'},{name:'Merluza (filetes)',qty:150,unit:'g'},{name:'Huevos',qty:3,unit:'uds'}]},
    {cat:'🌾 Cereales',items:[{name:'Quinoa',qty:80,unit:'g'},{name:'Pan de centeno',qty:40,unit:'g'},{name:'Boniato',qty:120,unit:'g'}]},
    {cat:'🥬 Verduras',items:[{name:'Espinacas frescas',qty:60,unit:'g'},{name:'Brócoli',qty:150,unit:'g'},{name:'Zanahoria',qty:100,unit:'g'}]},
    {cat:'🥑 Frutas',items:[{name:'Aguacate',qty:1,unit:'ud'},{name:'Limones',qty:1,unit:'ud'},{name:'Fruta de temporada',qty:1,unit:'ud'}]},
    {cat:'🥜 Semillas',items:[{name:'Pepitas de calabaza',qty:15,unit:'g'}]},
    {cat:'🫙 Despensa',items:[{name:'Hummus',qty:60,unit:'g'},{name:'Kombucha natural',qty:250,unit:'ml'},{name:'Aceite de oliva virgen',qty:15,unit:'ml'}]},
  ],
  ovulation:[
    {cat:'🦐 Proteínas',items:[{name:'Gambas frescas o congeladas',qty:150,unit:'g'},{name:'Pavo (filetes)',qty:150,unit:'g'}]},
    {cat:'🌾 Cereales',items:[{name:'Arroz integral',qty:70,unit:'g'},{name:'Granola sin gluten',qty:40,unit:'g'}]},
    {cat:'🥬 Verduras',items:[{name:'Espárragos',qty:150,unit:'g'},{name:'Pepino',qty:100,unit:'g'},{name:'Rúcula',qty:60,unit:'g'}]},
    {cat:'🍓 Frutas',items:[{name:'Frutos rojos (frescos o congelados)',qty:200,unit:'g'},{name:'Aguacate',qty:1,unit:'ud'},{name:'Limones',qty:1,unit:'ud'}]},
    {cat:'🥜 Semillas',items:[{name:'Pepitas de calabaza',qty:50,unit:'g'},{name:'Semillas de sésamo',qty:10,unit:'g'}]},
    {cat:'🫙 Despensa',items:[{name:'Leche de coco (en lata)',qty:200,unit:'ml'},{name:'Leche de avena',qty:200,unit:'ml'},{name:'Matcha en polvo',qty:2,unit:'g'},{name:'Aceite de oliva virgen',qty:15,unit:'ml'}]},
  ],
  luteal:[
    {cat:'🥩 Proteínas',items:[{name:'Tofu firme',qty:150,unit:'g'},{name:'Pollo (muslos)',qty:150,unit:'g'},{name:'Huevos',qty:2,unit:'uds'}]},
    {cat:'🌾 Cereales',items:[{name:'Pan integral',qty:80,unit:'g'},{name:'Arroz integral',qty:80,unit:'g'},{name:'Fideos de arroz',qty:80,unit:'g'}]},
    {cat:'🥬 Verduras',items:[{name:'Tomate cherry',qty:80,unit:'g'},{name:'Verduras mixtas para wok',qty:150,unit:'g'},{name:'Verduras para sopa',qty:100,unit:'g'}]},
    {cat:'🥑 Frutas',items:[{name:'Aguacate',qty:1,unit:'ud'},{name:'Plátano',qty:1,unit:'ud'},{name:'Dátiles',qty:3,unit:'uds'}]},
    {cat:'🥜 Semillas',items:[{name:'Mantequilla de almendra',qty:20,unit:'g'},{name:'Semillas de girasol',qty:15,unit:'g'}]},
    {cat:'🫙 Despensa',items:[{name:'Caldo de pollo (brick)',qty:400,unit:'ml'},{name:'Chocolate negro 85%',qty:20,unit:'g'},{name:'Salsa tamari',qty:15,unit:'ml'},{name:'Aceite de sésamo',qty:15,unit:'ml'},{name:'Aceite de oliva virgen',qty:15,unit:'ml'}]},
  ]
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAY_SHORT  = ['D','L','M','X','J','V','S']
const jsToIdx    = {1:0,2:1,3:2,4:3,5:4,6:5,0:6}

function formatQty(qty,unit){
  const r=Math.ceil(qty)
  if(unit==='g'&&qty>=1000)return`${(qty/1000).toFixed(1).replace(/\.0$/,'')} kg`
  if(unit==='ml'&&qty>=1000)return`${(qty/1000).toFixed(1).replace(/\.0$/,'')} L`
  if(unit==='ud'||unit==='uds')return`${r} ${r===1?'unidad':'unidades'}`
  return`${r} ${unit}`
}

function buildShopping(weekDays,adults,children){
  const portions=adults+children*0.6
  const pDays={}
  weekDays.forEach(d=>{pDays[d.phase]=(pDays[d.phase]||0)+1})
  const merged={}
  Object.entries(pDays).forEach(([phase,days])=>{
    INGREDIENTS[phase].forEach(cat=>{
      cat.items.forEach(item=>{
        const key=item.name+'_'+item.unit
        if(!merged[key])merged[key]={name:item.name,unit:item.unit,totalQty:0,cat:cat.cat}
        merged[key].totalQty+=item.qty*days*portions
      })
    })
  })
  const byCat={}
  Object.values(merged).forEach(item=>{
    if(!byCat[item.cat])byCat[item.cat]=[]
    byCat[item.cat].push(item)
  })
  return byCat
}

function downloadList(weekDays,adults,children){
  const byCat=buildShopping(weekDays,adults,children)
  const fmt=d=>d.toLocaleDateString('es-ES',{day:'numeric',month:'long'})
  const total=adults+children
  let txt=`LISTA DE LA COMPRA — MEIRINS\n`
  txt+=`Semana del ${fmt(weekDays[0].date)} al ${fmt(weekDays[6].date)}\n`
  txt+=`${adults} adulto${adults>1?'s':''}${children>0?` + ${children} niño${children>1?'s':''}`:''} · ${total} persona${total>1?'s':''}\n`
  txt+=`${'─'.repeat(44)}\n\n`
  Object.entries(byCat).forEach(([cat,items])=>{
    txt+=`${cat}\n`
    items.forEach(item=>{
      const q=formatQty(item.totalQty,item.unit)
      const pad=' '.repeat(Math.max(1,36-item.name.length))
      txt+=`  □ ${item.name}${pad}${q}\n`
    })
    txt+='\n'
  })
  txt+=`${'─'.repeat(44)}\nGenerado con Meirins · ${new Date().toLocaleDateString('es-ES')}\n`
  const blob=new Blob([txt],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url;a.download=`meirins-compra-${new Date().toISOString().split('T')[0]}.txt`;a.click()
  URL.revokeObjectURL(url)
}

function getPhaseInfo(dateStr,cycleLen,phases=PHASES_LOCAL){
  if(!dateStr)return null
  const start=new Date(dateStr);start.setHours(0,0,0,0)
  const today=new Date();today.setHours(0,0,0,0)
  const diff=Math.round((today-start)/86400000)
  const day=(diff%cycleLen)+1
  const phase=day<=5?'menstrual':day<=13?'follicular':day<=16?'ovulation':'luteal'
  const nextDay=phase==='menstrual'?6:phase==='follicular'?14:phase==='ovulation'?17:cycleLen+1
  return{phase,day,daysLeft:Math.max(nextDay-day,0),data:phases[phase],cycleLen}
}

// ── CARD ──────────────────────────────────────────────────────────────────────
const C = ({children,style={}}) => (
  <div style={{background:'white',borderRadius:18,padding:16,marginBottom:12,boxShadow:'0 2px 14px rgba(0,0,0,0.06)',...style}}>{children}</div>
)

// ── SETUP ─────────────────────────────────────────────────────────────────────
function Setup({done}){
  const [step,setStep]=useState(0)
  const [date,setDate]=useState('')
  const [len,setLen]=useState(28)
  const [trainDays,setTrainDays]=useState([1,2,4,5])
  const today=new Date().toISOString().split('T')[0]
  const minD=new Date();minD.setDate(minD.getDate()-60)
  const BG='linear-gradient(160deg,#0F1F4A,#1A56DB)'
  const toggleDay=(d)=>{
    if(trainDays.includes(d)){if(trainDays.length>2)setTrainDays(trainDays.filter(x=>x!==d))}
    else{if(trainDays.length<6)setTrainDays([...trainDays,d].sort())}
  }
  if(step===0)return(
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
      <div style={{textAlign:'center',color:'white',maxWidth:360,width:'100%'}}>
        <div style={{fontSize:72,lineHeight:1,marginBottom:16}}>🌙</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:40,margin:'0 0 4px',fontWeight:700}}>Meirins</h1>
        <p style={{fontSize:12,letterSpacing:3,opacity:0.65,textTransform:'uppercase',margin:'0 0 20px'}}>Programa con propósito</p>
        <div style={{width:40,height:2,background:'rgba(255,255,255,0.3)',margin:'0 auto 22px'}}/>
        {['🥗 Nutrición sin lactosa adaptada a tu ciclo','💪 Entrenamiento con rutinas detalladas','🛒 Lista de la compra semanal','📊 Seguimiento de tu ciclo'].map(f=>(
          <div key={f} style={{background:'rgba(255,255,255,0.12)',borderRadius:12,padding:'10px 16px',marginBottom:8,fontSize:14,textAlign:'left'}}>{f}</div>
        ))}
        <button onClick={()=>setStep(1)} style={{marginTop:24,background:'white',color:'#1A56DB',border:'none',borderRadius:50,padding:'14px 48px',fontSize:16,fontWeight:700,cursor:'pointer'}}>Comenzar →</button>
      </div>
    </div>
  )
  if(step===1)return(
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
      <div style={{width:'100%',maxWidth:360,color:'white'}}>
        <button onClick={()=>setStep(0)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer',padding:0,marginBottom:28}}>← Volver</button>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',letterSpacing:2,marginBottom:8}}>PASO 1 DE 2</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,margin:'0 0 6px'}}>Tu ciclo menstrual</h2>
        <p style={{fontSize:14,opacity:0.65,margin:'0 0 24px'}}>Para calcular tu fase actual</p>
        <label style={{display:'block',fontSize:13,opacity:0.8,marginBottom:6,fontWeight:500}}>¿Cuándo empezó tu última regla?</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} max={today} min={minD.toISOString().split('T')[0]}
          style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.12)',color:'white',fontSize:16,boxSizing:'border-box',marginBottom:24,outline:'none'}}/>
        <label style={{display:'block',fontSize:13,opacity:0.8,marginBottom:10,fontWeight:500}}>Duración de tu ciclo: <strong>{len} días</strong></label>
        <input type="range" min={21} max={35} value={len} onChange={e=>setLen(+e.target.value)} style={{width:'100%',marginBottom:6,accentColor:'#60A5FA'}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,opacity:0.5,marginBottom:28}}><span>21 días</span><span>28 (media)</span><span>35 días</span></div>
        <button onClick={()=>date&&setStep(2)} disabled={!date}
          style={{width:'100%',padding:14,borderRadius:50,border:'none',fontSize:16,fontWeight:700,cursor:date?'pointer':'not-allowed',background:date?'white':'rgba(255,255,255,0.2)',color:date?'#1A56DB':'rgba(255,255,255,0.4)'}}>Siguiente →</button>
      </div>
    </div>
  )
  return(
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:28}}>
      <div style={{width:'100%',maxWidth:360,color:'white'}}>
        <button onClick={()=>setStep(1)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.6)',fontSize:14,cursor:'pointer',padding:0,marginBottom:28}}>← Volver</button>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',letterSpacing:2,marginBottom:8}}>PASO 2 DE 2</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,margin:'0 0 6px'}}>¿Cuándo entrenas?</h2>
        <p style={{fontSize:14,opacity:0.65,margin:'0 0 24px'}}>Elige tus días preferidos (mín. 2, máx. 6)</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,marginBottom:24}}>
          {[0,1,2,3,4,5,6].map(d=>{
            const active=trainDays.includes(d)
            return(
              <button key={d} onClick={()=>toggleDay(d)}
                style={{padding:'12px 0',borderRadius:12,border:active?'none':'1px solid rgba(255,255,255,0.25)',background:active?'white':'rgba(255,255,255,0.08)',color:active?'#1A56DB':'rgba(255,255,255,0.7)',fontWeight:active?700:400,cursor:'pointer',fontSize:12,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <span style={{fontSize:11}}>{DAY_SHORT[d]}</span>
                <span style={{fontSize:14}}>{active?'💪':'😴'}</span>
              </button>
            )
          })}
        </div>
        <div style={{background:'rgba(255,255,255,0.10)',borderRadius:14,padding:16,marginBottom:24,fontSize:13,lineHeight:1.7}}>
          <div style={{fontWeight:600,marginBottom:4}}>Tu perfil completo</div>
          🎯 Perder peso y definir · 🥛 Sin lactosa<br/>
          💪 Entrenas: {trainDays.map(d=>DAY_LABELS[d]).join(', ')}
        </div>
        <button onClick={()=>done(date,len,trainDays)}
          style={{width:'100%',padding:14,borderRadius:50,border:'none',fontSize:16,fontWeight:700,cursor:'pointer',background:'white',color:'#1A56DB'}}>
          Crear mi programa ✨
        </button>
      </div>
    </div>
  )
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeTab({pi}){
  const d=pi?.data
  const pKeys=['menstrual','follicular','ovulation','luteal']
  const pR={menstrual:[1,5],follicular:[6,13],ovulation:[14,16],luteal:[17,pi?.cycleLen||28]}
  return(<div>
    <C>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,alignItems:'center'}}>
        <span style={{fontSize:14,fontWeight:600,color:'#1E293B'}}>Tu ciclo</span>
        <span style={{fontSize:12,color:'#94A3B8'}}>Día {pi?.day} de {pi?.cycleLen}</span>
      </div>
      <div style={{display:'flex',borderRadius:8,overflow:'hidden',height:10,marginBottom:10}}>
        {pKeys.map(ph=>{const[s,e]=pR[ph];const w=((e-s+1)/(pi?.cycleLen||28))*100;return<div key={ph} style={{width:`${w}%`,background:ph===pi?.phase?PHASES_LOCAL[ph].color:PHASES_LOCAL[ph].mid}}/>})}
      </div>
      <div style={{display:'flex',justifyContent:'space-around',marginBottom:12}}>
        {pKeys.map(ph=><span key={ph} style={{fontSize:9,color:ph===pi?.phase?PHASES_LOCAL[ph].color:'#CBD5E1',fontWeight:ph===pi?.phase?700:400}}>{PHASES_LOCAL[ph].emoji} {PHASES_LOCAL[ph].name.slice(0,3)}</span>)}
      </div>
      <div style={{background:d?.mid,borderRadius:10,padding:'8px 12px',fontSize:13}}>
        <strong style={{color:d?.color}}>{d?.tagline}</strong>
        <span style={{color:'#475569'}}> · Quedan <strong>{pi?.daysLeft} día{pi?.daysLeft!==1?'s':''}</strong></span>
      </div>
    </C>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
      <C style={{margin:0,padding:14}}>
        <div style={{fontSize:11,color:'#94A3B8',marginBottom:6,fontWeight:500}}>INTENSIDAD HOY</div>
        <div style={{fontSize:20,fontWeight:700,color:d?.color}}>{d?.intensity}</div>
        <div style={{height:4,background:'#F1F5F9',borderRadius:2,marginTop:8,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${d?.intensityPct}%`,background:d?.color,borderRadius:2}}/>
        </div>
      </C>
      <C style={{margin:0,padding:14}}>
        <div style={{fontSize:11,color:'#94A3B8',marginBottom:6,fontWeight:500}}>SESIÓN HOY</div>
        <div style={{fontSize:22}}>{d?.week[0].ico}</div>
        <div style={{fontSize:12,fontWeight:600,color:'#1E293B',marginTop:4}}>{d?.week[0].name}</div>
        {d?.week[0].dur&&<div style={{fontSize:11,color:BLUE.primary,marginTop:2}}>{d?.week[0].dur}</div>}
      </C>
    </div>
    <C>
      <div style={{fontSize:14,fontWeight:600,marginBottom:10,color:'#1E293B'}}>🥗 Nutrición de hoy</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
        {d?.focus.map(f=><span key={f} style={{background:BLUE.mid,color:BLUE.primary,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:500}}>{f}</span>)}
      </div>
      <div style={{borderLeft:`3px solid ${BLUE.primary}`,paddingLeft:12}}>
        <div style={{fontSize:13,fontWeight:600,color:'#1E293B'}}>{d?.meals[0].ico} {d?.meals[0].title}</div>
        <div style={{fontSize:12,color:'#64748B',marginTop:2}}>{d?.meals[0].items.join(' · ')}</div>
      </div>
    </C>
    <C><div style={{fontSize:13,fontWeight:600,marginBottom:6,color:'#1E293B'}}>💡 Consejo de la fase</div>
      <div style={{fontSize:13,color:'#475569',lineHeight:1.6,fontStyle:'italic'}}>"{d?.tip}"</div>
    </C>
  </div>)
}

// ── CICLO ─────────────────────────────────────────────────────────────────────
function CicloTab({pi,setLastPeriod,setCycleLength}){
  const [editing,setEditing]=useState(false)
  const [newDate,setNewDate]=useState('')
  const [newLen,setNewLen]=useState(pi?.cycleLen||28)
  const d=pi?.data
  const today=new Date().toISOString().split('T')[0]
  const r=78,cx=110,cy=110,size=220
  const phF=[{key:'menstrual',s:0,e:5/28},{key:'follicular',s:5/28,e:13/28},{key:'ovulation',s:13/28,e:16/28},{key:'luteal',s:16/28,e:1}]
  const arc=(s,e)=>{const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2;const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);return`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${(e-s)>0.5?1:0} 1 ${x2} ${y2} Z`}
  const dA=pi?((pi.day-1)/pi.cycleLen)*2*Math.PI-Math.PI/2:-Math.PI/2
  const dX=cx+r*Math.cos(dA),dY=cy+r*Math.sin(dA)
  const pDays={menstrual:'Días 1–5',follicular:'Días 6–13',ovulation:'Días 14–16',luteal:'Días 17–'+(pi?.cycleLen||28)}
  return(<div>
    <C style={{textAlign:'center'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',margin:'0 auto 12px'}}>
        {phF.map(ph=><path key={ph.key} d={arc(ph.s,ph.e)} fill={ph.key===pi?.phase?PHASES_LOCAL[ph.key].color:'#E2E8F0'} opacity={ph.key===pi?.phase?1:0.9}/>)}
        <circle cx={cx} cy={cy} r={58} fill="white"/>
        {pi&&<circle cx={dX} cy={dY} r={9} fill="white" stroke={d?.color} strokeWidth={3.5}/>}
        <text x={cx} y={cy-8} textAnchor="middle" style={{fontSize:11,fill:'#94A3B8'}}>día del ciclo</text>
        <text x={cx} y={cy+22} textAnchor="middle" style={{fontSize:34,fontWeight:700,fill:'#1E293B'}}>{pi?.day}</text>
      </svg>
      <div style={{fontSize:15,fontWeight:700,color:d?.color}}>{d?.emoji} Fase {d?.name}</div>
      <div style={{fontSize:12,color:'#94A3B8',marginTop:4}}>{d?.tagline} · {pi?.daysLeft} días restantes</div>
    </C>
    {Object.entries(PHASES_LOCAL).map(([key,ph])=>{const isA=key===pi?.phase;return(
      <C key={key} style={{border:isA?`2px solid ${ph.color}`:'2px solid transparent',padding:'12px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><span style={{fontSize:14,fontWeight:600,color:isA?ph.color:'#334155'}}>{ph.emoji} {ph.name}</span><span style={{fontSize:12,color:'#94A3B8',marginLeft:8}}>{pDays[key]}</span></div>
          {isA&&<span style={{background:ph.color,color:'white',fontSize:10,padding:'3px 10px',borderRadius:20,fontWeight:700}}>HOY</span>}
        </div>
        {isA&&<div style={{fontSize:12,color:'#475569',marginTop:8,lineHeight:1.55}}>{ph.desc}</div>}
      </C>
    )})}
    <C style={{border:'1px dashed #CBD5E1'}}>
      {!editing?(<button onClick={()=>setEditing(true)} style={{width:'100%',background:'none',border:'none',fontSize:13,color:'#64748B',cursor:'pointer',padding:4}}>✏️ Actualizar fecha o duración del ciclo</button>):(
        <div>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:'#1E293B'}}>Actualizar datos</div>
          <label style={{fontSize:12,color:'#64748B',display:'block',marginBottom:4}}>Inicio última regla</label>
          <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} max={today} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #E2E8F0',fontSize:14,boxSizing:'border-box',marginBottom:14}}/>
          <label style={{fontSize:12,color:'#64748B',display:'block',marginBottom:4}}>Duración ciclo: {newLen} días</label>
          <input type="range" min={21} max={35} value={newLen} onChange={e=>setNewLen(+e.target.value)} style={{width:'100%',marginBottom:16,accentColor:BLUE.primary}}/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setEditing(false)} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid #E2E8F0',background:'white',cursor:'pointer',fontSize:14}}>Cancelar</button>
            <button onClick={()=>{if(newDate){setLastPeriod(newDate);setCycleLength(newLen)}setEditing(false)}} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:BLUE.primary,color:'white',fontWeight:600,cursor:'pointer',fontSize:14}}>Guardar</button>
          </div>
        </div>
      )}
    </C>
  </div>)
}

// ── NUTRI ─────────────────────────────────────────────────────────────────────
function NutriTab({d,pi}){
  const [sub,setSub]=useState('hoy')
  const [adults,setAdults]=useState(1)
  const [children,setChildren]=useState(0)
  const [openM,setOpenM]=useState(null)
  const [openD,setOpenD]=useState(null)
  const [recipe,setRecipe]=useState(null)
  const [dl,setDl]=useState(false)
  const weekDays=useMemo(()=>{
    if(!pi)return[]
    const names=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    return Array.from({length:7},(_,i)=>{
      const date=new Date();date.setDate(date.getDate()+i)
      const cd=((pi.day-1+i)%pi.cycleLen)+1
      const phase=cd<=5?'menstrual':cd<=13?'follicular':cd<=16?'ovulation':'luteal'
      return{date,dayLabel:i===0?'Hoy':i===1?'Mañana':names[date.getDay()],dayNum:date.getDate(),cycleDay:cd,phase,pd:PHASES_LOCAL[phase]}
    })
  },[pi])
  const shopData=useMemo(()=>buildShopping(weekDays,adults,children),[weekDays,adults,children])
  const handleDL=()=>{downloadList(weekDays,adults,children);setDl(true);setTimeout(()=>setDl(false),3000)}
  const totalPeople=adults+children
  if(recipe)return(
    <div>
      <button onClick={()=>setRecipe(null)} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',fontSize:14,color:BLUE.primary,cursor:'pointer',marginBottom:16,fontWeight:600,padding:0}}>← Volver al menú</button>
      <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}22`}}>
        <div style={{fontSize:11,color:BLUE.primary,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,marginBottom:4}}>{recipe.meal}</div>
        <div style={{fontSize:18,fontWeight:700,color:'#1E293B',marginBottom:4}}>{recipe.title}</div>
        <div style={{fontSize:12,color:'#64748B'}}>Sin lactosa · {totalPeople} persona{totalPeople>1?'s':''}</div>
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:700,color:'#1E293B',marginBottom:12}}>🛒 Ingredientes</div>
        {recipe.ingredients.map((ing,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'7px 0',borderBottom:'1px solid #F1F5F9',fontSize:13,color:'#334155'}}>
            <div style={{width:6,height:6,borderRadius:3,background:BLUE.primary,flexShrink:0,marginTop:5}}/>
            {ing}
          </div>
        ))}
      </C>
      <C>
        <div style={{fontSize:14,fontWeight:700,color:'#1E293B',marginBottom:12}}>👩‍🍳 Preparación</div>
        {recipe.steps.map((step,i)=>(
          <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid #F1F5F9'}}>
            <div style={{width:26,height:26,borderRadius:13,background:BLUE.primary,color:'white',fontSize:12,fontWeight:700,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</div>
            <div style={{fontSize:13,color:'#334155',lineHeight:1.6,paddingTop:4}}>{step}</div>
          </div>
        ))}
      </C>
    </div>
  )
  return(<div>
    <C style={{padding:'14px 16px'}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:'#1E293B'}}>👨‍👩‍👧 Personas en el hogar</div>
      <div style={{display:'flex',gap:10,marginBottom:8}}>
        {[{label:'👤 Adultos',val:adults,set:setAdults,min:1,max:8,col:BLUE.primary},{label:'🧒 Niños',val:children,set:setChildren,min:0,max:6,col:'#64748B'}].map(({label,val,set,min,max,col})=>(
          <div key={label} style={{flex:1,background:'#F8FAFC',borderRadius:12,padding:10,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#64748B',marginBottom:6}}>{label}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <button onClick={()=>set(v=>Math.max(min,v-1))} style={{width:28,height:28,borderRadius:14,border:`1.5px solid ${col}`,background:'white',color:col,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>−</button>
              <span style={{fontSize:20,fontWeight:700,color:col,minWidth:16,textAlign:'center'}}>{val}</span>
              <button onClick={()=>set(v=>Math.min(max,v+1))} style={{width:28,height:28,borderRadius:14,border:'none',background:col,color:'white',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:'#94A3B8',textAlign:'center'}}>{totalPeople} persona{totalPeople>1?'s':''} · niños al 60% de ración de adulto</div>
    </C>
    <div style={{display:'flex',background:'white',borderRadius:50,padding:4,marginBottom:14,boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
      {[{id:'hoy',l:'Hoy'},{id:'semana',l:'Semana'},{id:'lista',l:'🛒 Lista'}].map(t=>(
        <button key={t.id} onClick={()=>setSub(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:46,border:'none',fontSize:13,fontWeight:sub===t.id?700:400,background:sub===t.id?BLUE.primary:'transparent',color:sub===t.id?'white':'#94A3B8',cursor:'pointer',transition:'all 0.2s'}}>{t.l}</button>
      ))}
    </div>
    {sub==='hoy'&&<div>
      <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}22`}}>
        <div style={{fontSize:13,fontWeight:700,color:BLUE.primary,marginBottom:8}}>📊 Fase {d?.name} · Objetivos</div>
        <div style={{fontSize:13,color:'#475569',marginBottom:10}}>{d?.kcal}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
          {d?.focus.map(f=><span key={f} style={{background:BLUE.primary,color:'white',padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:500}}>{f}</span>)}
        </div>
        <div style={{fontSize:12,color:'#64748B'}}>🥛 Menús sin lactosa · {totalPeople} persona{totalPeople>1?'s':''}</div>
      </C>
      {d?.meals.map((m,i)=>(
        <C key={m.t}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setOpenM(openM===i?null:i)}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:28,flexShrink:0}}>{m.ico}</span>
              <div>
                <div style={{fontSize:10,color:BLUE.primary,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,marginBottom:2}}>{m.t}</div>
                <div style={{fontSize:14,fontWeight:600,color:'#1E293B'}}>{m.title}</div>
              </div>
            </div>
            <span style={{color:'#CBD5E1',fontSize:14,transform:`rotate(${openM===i?180:0}deg)`,transition:'transform 0.2s',flexShrink:0}}>▼</span>
          </div>
          {openM===i&&<div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #F1F5F9'}}>
            {m.items.map(it=><div key={it} style={{display:'flex',gap:10,alignItems:'center',padding:'6px 0',fontSize:13,color:'#475569',borderBottom:'1px solid #F8FAFC'}}>
              <div style={{width:6,height:6,borderRadius:3,background:BLUE.primary,flexShrink:0}}/>{it}
            </div>)}
            {m.recipe&&<button onClick={()=>setRecipe({meal:m.t,title:m.title,...m.recipe})}
              style={{marginTop:12,width:'100%',padding:'10px',borderRadius:12,border:`1.5px solid ${BLUE.primary}`,background:BLUE.light,color:BLUE.primary,fontWeight:600,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              👩‍🍳 Ver receta completa
            </button>}
          </div>}
        </C>
      ))}
    </div>}
    {sub==='semana'&&<div>
      <div style={{fontSize:12,color:'#94A3B8',marginBottom:10,paddingLeft:4}}>Próximos 7 días · {totalPeople} persona{totalPeople>1?'s':''} · sin lactosa</div>
      {weekDays.map((day,i)=>(
        <C key={i} style={{padding:'12px 14px',cursor:'pointer',border:i===0?`2px solid ${BLUE.primary}`:'2px solid transparent'}} onClick={()=>setOpenD(openD===i?null:i)}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:44,textAlign:'center',flexShrink:0}}>
                <div style={{fontSize:11,color:i===0?BLUE.primary:'#94A3B8',fontWeight:i===0?700:400}}>{day.dayLabel}</div>
                <div style={{fontSize:20,fontWeight:700,color:'#1E293B',lineHeight:1}}>{day.dayNum}</div>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <span style={{background:day.pd.color,color:'white',fontSize:10,padding:'2px 8px',borderRadius:10,fontWeight:600}}>{day.pd.emoji} {day.pd.name}</span>
                </div>
                <div style={{fontSize:12,color:'#64748B'}}>{day.pd.meals[0].ico} {day.pd.meals[0].title} · {day.pd.meals[1].ico} {day.pd.meals[1].title}</div>
              </div>
            </div>
            <span style={{color:'#CBD5E1',fontSize:14,transform:`rotate(${openD===i?180:0}deg)`,transition:'transform 0.2s',flexShrink:0}}>▼</span>
          </div>
          {openD===i&&<div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #F1F5F9'}}>
            {day.pd.meals.map(meal=>(
              <div key={meal.t} style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:BLUE.primary,marginBottom:4}}>{meal.ico} {meal.t} — {meal.title}</div>
                {meal.items.map(it=><div key={it} style={{display:'flex',gap:8,alignItems:'center',fontSize:12,color:'#475569',padding:'3px 0'}}>
                  <div style={{width:5,height:5,borderRadius:3,background:BLUE.primary,flexShrink:0}}/>{it}
                </div>)}
                {meal.recipe&&<button onClick={()=>setRecipe({meal:meal.t,title:meal.title,...meal.recipe})}
                  style={{marginTop:8,padding:'7px 14px',borderRadius:10,border:`1px solid ${BLUE.primary}`,background:BLUE.light,color:BLUE.primary,fontWeight:600,cursor:'pointer',fontSize:12}}>
                  👩‍🍳 Ver receta
                </button>}
              </div>
            ))}
          </div>}
        </C>
      ))}
    </div>}
    {sub==='lista'&&<div>
      <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}22`}}>
        <div style={{fontSize:13,fontWeight:700,color:BLUE.primary,marginBottom:6}}>🛒 Lista de la compra semanal</div>
        <div style={{fontSize:12,color:'#475569',lineHeight:1.6,marginBottom:8}}>
          <strong>{adults} adulto{adults>1?'s':''}</strong>{children>0&&<span> + <strong>{children} niño{children>1?'s':''}</strong></span>} · próximos 7 días
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {weekDays.reduce((a,d)=>{if(!a.includes(d.phase))a.push(d.phase);return a;},[]).map(ph=>(
            <span key={ph} style={{background:PHASES_LOCAL[ph].color,color:'white',fontSize:10,padding:'3px 8px',borderRadius:10,fontWeight:600}}>{PHASES_LOCAL[ph].emoji} {PHASES_LOCAL[ph].name}</span>
          ))}
        </div>
      </C>
      {Object.entries(shopData).map(([cat,items])=>(
        <C key={cat} style={{padding:'14px 16px'}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'#1E293B'}}>{cat}</div>
          {items.map(item=>(
            <div key={item.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #F8FAFC'}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${BLUE.primary}`,flexShrink:0}}/>
                <span style={{fontSize:13,color:'#334155'}}>{item.name}</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:BLUE.primary,flexShrink:0,marginLeft:8}}>{formatQty(item.totalQty,item.unit)}</span>
            </div>
          ))}
        </C>
      ))}
      <button onClick={handleDL} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',background:dl?'#16A34A':BLUE.primary,color:'white',fontSize:15,fontWeight:700,cursor:'pointer',transition:'all 0.3s',marginTop:4}}>
        {dl?'✓ Descargado':'⬇ Descargar lista (.txt)'}
      </button>
    </div>}
  </div>)
}

// ── GIMNASIO ──────────────────────────────────────────────────────────────────
function GimnasioTab({d,pi,trainDays,setTrainDays,workoutLog,setWorkoutLog}){
  const [sub,setSub]=useState('hoy')
  const [extraInput,setExtraInput]=useState('')
  const [addingSport,setAddingSport]=useState(false)
  const todayJS=new Date()
  const todayKey=todayJS.toISOString().split('T')[0]
  const todayDow=todayJS.getDay()
  const isTrainDay=trainDays.includes(todayDow)
  const todayWeekIdx=jsToIdx[todayDow]
  const todayWorkout=d?.week[todayWeekIdx]
  const todayLog=workoutLog[todayKey]
  const saveLog=(update)=>{
    const updated={...workoutLog,[todayKey]:update}
    setWorkoutLog(updated)
    try{localStorage.setItem('meirins_gym',JSON.stringify(updated))}catch{}
  }
  const weekDays=Array.from({length:7},(_,i)=>{
    const date=new Date();date.setDate(date.getDate()+i)
    const dow=date.getDay()
    const wIdx=jsToIdx[dow]
    const cd=((pi.day-1+i)%pi.cycleLen)+1
    const phase=cd<=5?'menstrual':cd<=13?'follicular':cd<=16?'ovulation':'luteal'
    const dateKey=date.toISOString().split('T')[0]
    return{date,dow,isTrain:trainDays.includes(dow),wIdx,phase,pd:PHASES_LOCAL[phase],log:workoutLog[dateKey],dateKey,dayNum:date.getDate(),dayLabel:i===0?'Hoy':i===1?'Mañana':DAY_LABELS[dow]}
  })
  return(<div>
    <div style={{display:'flex',background:'white',borderRadius:50,padding:4,marginBottom:14,boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
      {[{id:'hoy',l:'Hoy'},{id:'semana',l:'Semana'},{id:'perfil',l:'Perfil'}].map(t=>(
        <button key={t.id} onClick={()=>setSub(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:46,border:'none',fontSize:13,fontWeight:sub===t.id?700:400,background:sub===t.id?BLUE.primary:'transparent',color:sub===t.id?'white':'#94A3B8',cursor:'pointer',transition:'all 0.2s'}}>{t.l}</button>
      ))}
    </div>
    {sub==='hoy'&&<div>
      <C style={{background:BLUE.light}}>
        <div style={{fontSize:13,fontWeight:700,color:BLUE.primary,marginBottom:8}}>⚡ Fase {d?.name} · Intensidad {d?.intensity}</div>
        <div style={{height:8,background:'#DBEAFE',borderRadius:4,marginBottom:8,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${d?.intensityPct}%`,background:BLUE.primary,borderRadius:4}}/>
        </div>
        <div style={{fontSize:12,color:'#475569',fontStyle:'italic'}}>{d?.tip}</div>
      </C>
      {isTrainDay?(
        <div>
          <C>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontSize:11,color:BLUE.primary,fontWeight:700,letterSpacing:0.8,marginBottom:4}}>SESIÓN DE HOY</div>
                <div style={{fontSize:18,fontWeight:700,color:'#1E293B'}}>{todayWorkout?.ico} {todayWorkout?.name}</div>
                {todayWorkout?.dur&&<div style={{fontSize:13,color:'#64748B',marginTop:2}}>⏱ {todayWorkout.dur}</div>}
              </div>
              {todayLog&&(
                <span style={{padding:'5px 12px',borderRadius:20,fontSize:12,fontWeight:700,background:todayLog.status==='done'?'#DCFCE7':'#FEE2E2',color:todayLog.status==='done'?'#16A34A':'#DC2626',flexShrink:0}}>
                  {todayLog.status==='done'?'✓ Hecho':'✗ No pude'}
                </span>
              )}
            </div>
            {todayWorkout?.exercises?.length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',marginBottom:8,letterSpacing:0.5}}>EJERCICIOS</div>
                {todayWorkout.exercises.map((ex,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderRadius:10,background:i%2===0?'#F8FAFC':'white',marginBottom:4}}>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <div style={{width:24,height:24,borderRadius:12,background:BLUE.mid,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:BLUE.primary,flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:13,fontWeight:500,color:'#1E293B'}}>{ex.name}</span>
                    </div>
                    <span style={{fontSize:12,color:BLUE.primary,fontWeight:600,flexShrink:0,marginLeft:8}}>
                      {ex.sets&&ex.reps?`${ex.sets}×${ex.reps}`:ex.sets&&ex.dur?`${ex.sets}×${ex.dur}`:ex.dur||''}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!todayLog&&<div style={{display:'flex',gap:8,marginBottom:8}}>
              <button onClick={()=>saveLog({status:'done',extraSport:''})} style={{flex:1,padding:'12px',borderRadius:12,border:'none',background:'#16A34A',color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>✓ Completado</button>
              <button onClick={()=>saveLog({status:'skipped',extraSport:''})} style={{flex:1,padding:'12px',borderRadius:12,border:'none',background:'#EF4444',color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>✗ No pude</button>
            </div>}
            {todayLog&&<button onClick={()=>{const u={...workoutLog};delete u[todayKey];setWorkoutLog(u);try{localStorage.setItem('meirins_gym',JSON.stringify(u))}catch{}}}
              style={{width:'100%',padding:'9px',borderRadius:12,border:'1px solid #E2E8F0',background:'white',color:'#64748B',cursor:'pointer',fontSize:13,marginBottom:8}}>
              Deshacer registro
            </button>}
          </C>
          <C>
            <div style={{fontSize:13,fontWeight:600,color:'#1E293B',marginBottom:10}}>➕ Añadir deporte extra</div>
            {todayLog?.extraSport?(
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#F0FDF4',borderRadius:10}}>
                <span style={{fontSize:13,color:'#166534',fontWeight:500}}>🏅 {todayLog.extraSport}</span>
                <button onClick={()=>saveLog({...todayLog,extraSport:''})} style={{background:'none',border:'none',color:'#94A3B8',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
              </div>
            ):addingSport?(
              <div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                  {SPORT_CHIPS.map(ch=>(
                    <button key={ch.name} onClick={()=>{saveLog({...(todayLog||{status:'done'}),extraSport:ch.name});setAddingSport(false);setExtraInput('')}}
                      style={{padding:'6px 12px',borderRadius:20,border:`1.5px solid ${BLUE.primary}`,background:BLUE.light,color:BLUE.primary,fontSize:12,fontWeight:500,cursor:'pointer'}}>
                      {ch.ico} {ch.name}
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={extraInput} onChange={e=>setExtraInput(e.target.value)} placeholder="Otro: Pádel 90min..."
                    style={{flex:1,padding:'10px 12px',borderRadius:10,border:'1px solid #E2E8F0',fontSize:13,outline:'none'}}/>
                  <button onClick={()=>{saveLog({...(todayLog||{status:'done'}),extraSport:extraInput});setAddingSport(false);setExtraInput('')}}
                    style={{padding:'10px 16px',borderRadius:10,border:'none',background:BLUE.primary,color:'white',fontWeight:600,cursor:'pointer',fontSize:13}}>Añadir</button>
                </div>
              </div>
            ):(
              <button onClick={()=>setAddingSport(true)} style={{width:'100%',padding:'10px',borderRadius:12,border:'1.5px dashed #CBD5E1',background:'white',color:'#64748B',cursor:'pointer',fontSize:13}}>
                + Añadir otro deporte o actividad
              </button>
            )}
          </C>
        </div>
      ):(
        <div>
          <C style={{textAlign:'center',padding:28}}>
            <div style={{fontSize:48,marginBottom:12}}>😴</div>
            <div style={{fontSize:16,fontWeight:700,color:'#1E293B',marginBottom:8}}>Día de descanso</div>
            <div style={{fontSize:13,color:'#64748B',lineHeight:1.6}}>Hoy no está programado entrenar. El descanso también es parte del progreso.</div>
          </C>
          <C>
            <div style={{fontSize:13,fontWeight:600,color:'#1E293B',marginBottom:10}}>¿Has hecho algo hoy? Regístralo</div>
            {addingSport?(
              <div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                  {SPORT_CHIPS.map(ch=>(
                    <button key={ch.name} onClick={()=>{saveLog({status:'extra',extraSport:ch.name});setAddingSport(false);setExtraInput('')}}
                      style={{padding:'6px 12px',borderRadius:20,border:`1.5px solid ${BLUE.primary}`,background:BLUE.light,color:BLUE.primary,fontSize:12,fontWeight:500,cursor:'pointer'}}>
                      {ch.ico} {ch.name}
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={extraInput} onChange={e=>setExtraInput(e.target.value)} placeholder="Otro: Paseo 30min..."
                    style={{flex:1,padding:'10px 12px',borderRadius:10,border:'1px solid #E2E8F0',fontSize:13,outline:'none'}}/>
                  <button onClick={()=>{saveLog({status:'extra',extraSport:extraInput});setAddingSport(false);setExtraInput('')}}
                    style={{padding:'10px 16px',borderRadius:10,border:'none',background:BLUE.primary,color:'white',fontWeight:600,cursor:'pointer',fontSize:13}}>Añadir</button>
                </div>
              </div>
            ):(
              <button onClick={()=>setAddingSport(true)} style={{width:'100%',padding:'10px',borderRadius:12,border:'1.5px dashed #CBD5E1',background:'white',color:'#64748B',cursor:'pointer',fontSize:13}}>
                + Añadir deporte espontáneo
              </button>
            )}
          </C>
        </div>
      )}
    </div>}
    {sub==='semana'&&<div>
      <C>
        <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:'#1E293B'}}>📅 Tu semana</div>
        {weekDays.map((day,i)=>{
          const w=d?.week[day.wIdx]
          const st=day.log?.status
          return(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:12,background:i===0?'#EFF6FF':day.isTrain?'#F8FAFC':'white',border:`1px solid ${i===0?'#BFDBFE':'#F1F5F9'}`,marginBottom:6}}>
              <div style={{width:40,textAlign:'center',flexShrink:0}}>
                <div style={{fontSize:10,color:i===0?BLUE.primary:'#94A3B8',fontWeight:i===0?700:400}}>{day.dayLabel}</div>
                <div style={{fontSize:18,fontWeight:700,color:'#1E293B',lineHeight:1}}>{day.dayNum}</div>
              </div>
              <span style={{fontSize:20,flexShrink:0}}>{day.isTrain?w?.ico:'😴'}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:day.isTrain?600:400,color:day.isTrain?'#1E293B':'#CBD5E1',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{day.isTrain?w?.name:'Descanso'}</div>
                {day.log?.extraSport&&<div style={{fontSize:11,color:BLUE.primary,marginTop:1}}>+ {day.log.extraSport}</div>}
              </div>
              <div style={{flexShrink:0,textAlign:'right'}}>
                {w?.dur&&day.isTrain&&<div style={{fontSize:10,color:'#94A3B8'}}>{w.dur}</div>}
                {st==='done'&&<div style={{fontSize:13,color:'#16A34A',fontWeight:700}}>✓</div>}
                {st==='skipped'&&<div style={{fontSize:13,color:'#EF4444',fontWeight:700}}>✗</div>}
                {st==='extra'&&<div style={{fontSize:13,color:BLUE.primary,fontWeight:700}}>🏅</div>}
              </div>
            </div>
          )
        })}
      </C>
      <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}22`}}>
        <div style={{fontSize:11,fontWeight:700,color:BLUE.primary,marginBottom:8,letterSpacing:0.5}}>TUS DÍAS DE ENTRENAMIENTO</div>
        <div style={{display:'flex',gap:5}}>
          {[0,1,2,3,4,5,6].map(dv=>(
            <div key={dv} style={{flex:1,padding:'6px 0',borderRadius:8,background:trainDays.includes(dv)?BLUE.primary:'#E2E8F0',textAlign:'center'}}>
              <span style={{fontSize:11,color:trainDays.includes(dv)?'white':'#94A3B8',fontWeight:600}}>{DAY_SHORT[dv]}</span>
            </div>
          ))}
        </div>
      </C>
    </div>}
    {sub==='perfil'&&<div>
      <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}22`}}>
        <div style={{fontSize:14,fontWeight:700,color:BLUE.primary,marginBottom:4}}>👤 Tu perfil de entrenamiento</div>
        <div style={{fontSize:12,color:'#64748B'}}>Personaliza tu programa de fitness</div>
      </C>
      <C>
        <div style={{fontSize:13,fontWeight:700,color:'#1E293B',marginBottom:12}}>📅 Días de entrenamiento</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5,marginBottom:10}}>
          {[0,1,2,3,4,5,6].map(dv=>{
            const active=trainDays.includes(dv)
            return(
              <button key={dv} onClick={()=>{
                let updated
                if(active){if(trainDays.length>2)updated=trainDays.filter(x=>x!==dv)}
                else{if(trainDays.length<6)updated=[...trainDays,dv].sort()}
                if(updated)setTrainDays(updated)
              }}
                style={{padding:'10px 0',borderRadius:10,border:active?'none':'1px solid #E2E8F0',background:active?BLUE.primary:'#F8FAFC',color:active?'white':'#94A3B8',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <span style={{fontSize:10,fontWeight:600}}>{DAY_SHORT[dv]}</span>
                <span style={{fontSize:13}}>{active?'💪':'😴'}</span>
              </button>
            )
          })}
        </div>
        <div style={{fontSize:11,color:'#94A3B8',textAlign:'center'}}>Mín. 2 · Máx. 6 días · Toca para activar/desactivar</div>
      </C>
      <C>
        <div style={{fontSize:13,fontWeight:700,color:'#1E293B',marginBottom:12}}>🏋️ Programa actual por fase</div>
        {Object.entries(PHASES_LOCAL).map(([key,ph])=>{
          const isActive=key===pi?.phase
          return(
            <div key={key} style={{padding:'10px 12px',borderRadius:12,background:isActive?BLUE.light:'#F8FAFC',border:`1.5px solid ${isActive?BLUE.primary:'#E2E8F0'}`,marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:isActive?BLUE.primary:'#334155'}}>{ph.emoji} Fase {ph.name}</span>
                {isActive&&<span style={{background:BLUE.primary,color:'white',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700}}>AHORA</span>}
              </div>
              <div style={{fontSize:12,color:'#64748B',marginBottom:6}}>{ph.intensity} · {ph.intensityPct}% intensidad</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {ph.week.filter(w=>w.on).map((w,i)=>(
                  <span key={i} style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:'3px 9px',fontSize:11,color:'#475569'}}>
                    {w.ico} {w.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </C>
      <C style={{border:'1px dashed #CBD5E1'}}>
        <div style={{fontSize:12,color:'#64748B',textAlign:'center',lineHeight:1.6}}>
          💡 El programa de ejercicios se adapta automáticamente a tu fase del ciclo menstrual.<br/>
          <span style={{color:BLUE.primary,fontWeight:500}}>Ve a la pestaña Ciclo para actualizar tus fechas.</span>
        </div>
      </C>
    </div>}
  </div>)
}

// ── IA ────────────────────────────────────────────────────────────────────────
function IATab(){
  return(<div>
    <C style={{background:BLUE.light,border:`1px solid ${BLUE.primary}33`,marginBottom:16}}>
      <div style={{fontSize:14,fontWeight:700,color:BLUE.primary,marginBottom:8}}>✨ Asistente IA</div>
      <div style={{fontSize:13,color:'#475569',lineHeight:1.7,marginBottom:16}}>Próximamente conectado con Claude para darte consejos personalizados según tu fase actual.</div>
      <div style={{background:'white',borderRadius:14,padding:16}}>
        <div style={{fontSize:12,color:'#94A3B8',fontWeight:600,marginBottom:10,letterSpacing:0.5}}>PODRÁS PREGUNTAR</div>
        {['¿Qué como antes de entrenar hoy?','¿Puedo hacer HIIT en mi fase actual?','Tengo antojos de dulce, ¿qué hago?','Dame un plan de comidas para esta semana'].map(q=>(
          <div key={q} style={{padding:'8px 0',borderBottom:'1px solid #F1F5F9',fontSize:13,color:'#475569'}}>· {q}</div>
        ))}
      </div>
    </C>
  </div>)
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const saved=()=>{try{return JSON.parse(localStorage.getItem('meirins')||'{}')}catch{return{}}}
  const savedGym=()=>{try{return JSON.parse(localStorage.getItem('meirins_gym')||'{}')}catch{return{}}}

  const [setup,setSetup]=useState(!!saved().lastPeriod)
  const [tab,setTab]=useState('home')
  const [lastPeriod,setLP]=useState(saved().lastPeriod||'')
  const [cycleLength,setCL]=useState(saved().cycleLength||28)
  const [trainDays,setTD]=useState(saved().trainDays||[1,2,4,5])
  const [workoutLog,setWorkoutLog]=useState(savedGym())
  const [dbStatus,setDbStatus]=useState('connecting')
  const [splash,setSplash]=useState(true)

  const persist=(lp,cl,td)=>{try{localStorage.setItem('meirins',JSON.stringify({lastPeriod:lp,cycleLength:cl,trainDays:td}))}catch{}}
  const setLastPeriod=(v)=>{setLP(v);persist(v,cycleLength,trainDays)}
  const setCycleLength=(v)=>{setCL(v);persist(lastPeriod,v,trainDays)}
  const setTrainDays=(v)=>{setTD(v);persist(lastPeriod,cycleLength,v)}

  useEffect(()=>{
    setTimeout(()=>setSplash(false),900)
    sb.from('1.phases').select('key').limit(1)
      .then(({error})=>setDbStatus(error?'error':'ok'))
      .catch(()=>setDbStatus('error'))
  },[])

  const pi=lastPeriod?getPhaseInfo(lastPeriod,cycleLength):null
  const d=pi?.data

  if(splash)return(
    <div style={{position:'fixed',inset:0,background:'linear-gradient(160deg,#0F1F4A,#1A56DB)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{fontSize:72,marginBottom:16}}>🌙</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,color:'white',fontWeight:700}}>Meirins</div>
      <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,letterSpacing:3,textTransform:'uppercase',marginTop:8}}>Cargando...</div>
    </div>
  )

  if(!setup)return<Setup done={(date,len,td)=>{setLP(date);setCL(len);setTD(td);persist(date,len,td);setSetup(true)}}/>

  const tabs=[{id:'home',ico:'🏠',l:'Inicio'},{id:'ciclo',ico:'🌙',l:'Ciclo'},{id:'nutri',ico:'🥗',l:'Nutrición'},{id:'gym',ico:'🏋️',l:'Gimnasio'},{id:'ia',ico:'✨',l:'IA'}]

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",maxWidth:430,margin:'0 auto',minHeight:'100vh',display:'flex',flexDirection:'column',background:'#F0F4FA'}}>
      <div style={{background:'linear-gradient(135deg,#0F1F4A 0%,#1A56DB 100%)',padding:'20px 20px 28px',color:'white',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
              <p style={{margin:0,fontSize:10,opacity:0.7,letterSpacing:2,textTransform:'uppercase',fontWeight:500}}>Meirins · hoy</p>
              {dbStatus==='ok'&&<span style={{background:'rgba(34,197,94,0.25)',border:'1px solid rgba(34,197,94,0.5)',color:'#86efac',fontSize:9,padding:'2px 7px',borderRadius:20,fontWeight:700}}>DB ✓</span>}
              {dbStatus==='error'&&<span style={{background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',color:'#fca5a5',fontSize:9,padding:'2px 7px',borderRadius:20,fontWeight:700}}>DB ✗</span>}
              {dbStatus==='connecting'&&<span style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontSize:9,padding:'2px 7px',borderRadius:20}}>DB…</span>}
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,margin:'4px 0 0',fontWeight:700,lineHeight:1.2}}>{d?.emoji} Fase {d?.name}</h1>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',borderRadius:18,padding:'10px 18px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}>
            <div style={{fontSize:28,fontWeight:700,lineHeight:1}}>{pi?.day}</div>
            <div style={{fontSize:9,opacity:0.8,marginTop:2,letterSpacing:0.5}}>DÍA DEL CICLO</div>
          </div>
        </div>
        <div style={{background:'rgba(255,255,255,0.12)',borderRadius:14,padding:'10px 14px'}}>
          <span style={{fontSize:13,fontStyle:'italic',opacity:0.9}}>{d?.tagline} · Quedan </span>
          <strong style={{fontSize:13}}>{pi?.daysLeft} días</strong>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 14px 90px'}}>
        {tab==='home'&&<HomeTab pi={pi}/>}
        {tab==='ciclo'&&<CicloTab pi={pi} setLastPeriod={setLastPeriod} setCycleLength={setCycleLength}/>}
        {tab==='nutri'&&<NutriTab d={d} pi={pi}/>}
        {tab==='gym'&&<GimnasioTab d={d} pi={pi} trainDays={trainDays} setTrainDays={setTrainDays} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog}/>}
        {tab==='ia'&&<IATab/>}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'min(430px,100%)',background:'white',borderTop:'1px solid #E2E8F0',display:'flex',padding:'8px 0 20px',boxShadow:'0 -2px 20px rgba(0,0,0,0.08)',zIndex:100}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:'none',border:'none',cursor:'pointer',padding:'4px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <span style={{fontSize:20}}>{t.ico}</span>
            <span style={{fontSize:9,color:tab===t.id?BLUE.primary:'#94A3B8',fontWeight:tab===t.id?700:400,transition:'color 0.2s'}}>{t.l}</span>
            {tab===t.id&&<div style={{width:4,height:4,borderRadius:2,background:BLUE.primary,marginTop:1}}/>}
          </button>
        ))}
      </div>
    </div>
  )
}
