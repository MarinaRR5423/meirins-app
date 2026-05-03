import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PHASES } from '../data/phases';
import { INGREDIENTS, formatQty } from '../data/ingredients';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

function buildShopping(weekDays, adults, children) {
  const portions = adults + children * 0.6;
  const pDays = {};
  weekDays.forEach(d => { pDays[d.phase] = (pDays[d.phase] || 0) + 1; });
  const merged = {};
  Object.entries(pDays).forEach(([phase, days]) => {
    INGREDIENTS[phase].forEach(cat => {
      cat.items.forEach(item => {
        const key = item.name + '_' + item.unit;
        if (!merged[key]) merged[key] = { name: item.name, unit: item.unit, totalQty: 0, cat: cat.cat };
        merged[key].totalQty += item.qty * days * portions;
      });
    });
  });
  const byCat = {};
  Object.values(merged).forEach(item => {
    if (!byCat[item.cat]) byCat[item.cat] = [];
    byCat[item.cat].push(item);
  });
  return byCat;
}

export default function NutriScreen({ pi }) {
  const [sub, setSub] = useState('hoy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [openM, setOpenM] = useState(null);
  const [openD, setOpenD] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [altMeal, setAltMeal] = useState({});
  const d = pi?.data;
  const totalPeople = adults + children;

  const weekDays = useMemo(() => {
    if (!pi) return [];
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i);
      const cd = ((pi.day - 1 + i) % pi.cycleLen) + 1;
      const phase = cd <= 5 ? 'menstrual' : cd <= 13 ? 'follicular' : cd <= 16 ? 'ovulation' : 'luteal';
      return { date, dayLabel: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : names[date.getDay()], dayNum: date.getDate(), phase, pd: PHASES[phase] };
    });
  }, [pi]);

  const shopData = useMemo(() => buildShopping(weekDays, adults, children), [weekDays, adults, children]);

  if (recipe) return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => setRecipe(null)}>
        <Text style={styles.back}>← Volver al menú</Text>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: BLUE.light }]}>
        <Text style={styles.recipeTag}>{recipe.meal}</Text>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <Text style={styles.recipeSub}>Sin lactosa · {totalPeople} persona{totalPeople > 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🛒 Ingredientes</Text>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.listRow}>
            <View style={styles.dot} />
            <Text style={styles.listText}>{ing}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👩‍🍳 Preparación</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👨‍👩‍👧 Personas en el hogar</Text>
        <View style={styles.personsRow}>
          {[
            { label: '👤 Adultos', val: adults, set: setAdults, min: 1, max: 8, color: BLUE.primary },
            { label: '🧒 Niños', val: children, set: setChildren, min: 0, max: 6, color: '#64748B' }
          ].map(p => (
            <View key={p.label} style={styles.personBox}>
              <Text style={styles.personLabel}>{p.label}</Text>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => p.set(v => Math.max(p.min, v - 1))}
                  style={[styles.counterBtn, { borderColor: p.color }]}>
                  <Text style={[styles.counterBtnText, { color: p.color }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.counterVal, { color: p.color }]}>{p.val}</Text>
                <TouchableOpacity onPress={() => p.set(v => Math.min(p.max, v + 1))}
                  style={[styles.counterBtnFill, { backgroundColor: p.color }]}>
                  <Text style={styles.counterBtnFillText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.personNote}>{totalPeople} persona{totalPeople > 1 ? 's' : ''} · niños al 60% de ración</Text>
      </View>

      <View style={styles.tabRow}>
        {[{ id: 'hoy', l: 'Hoy' }, { id: 'semana', l: 'Semana' }, { id: 'lista', l: '🛒 Lista' }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
            style={[styles.tab, sub === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sub === 'hoy' && <>
        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>📊 Fase {d?.name} · Objetivos</Text>
          <Text style={styles.kcal}>{d?.kcal}</Text>
          <View style={styles.tags}>
            {d?.focus.map(f => <View key={f} style={styles.tagFill}><Text style={styles.tagFillText}>{f}</Text></View>)}
          </View>
        </View>

        {d?.meals.map((m, i) => (
          <View key={m.t} style={styles.card}>
            <TouchableOpacity style={styles.mealRow} onPress={() => setOpenM(openM === i ? null : i)}>
              <Text style={styles.mealIco}>{m.ico}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTag}>{m.t}</Text>
                <Text style={styles.mealTitle}>{m.title}</Text>
              </View>
              <Text style={styles.chevron}>{openM === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openM === i && (
              <View style={styles.mealDetail}>
                {m.items.map(it => (
                  <View key={it} style={styles.listRow}>
                    <View style={styles.dot} />
                    <Text style={styles.listText}>{it}</Text>
                  </View>
                ))}

                {m.recipe && (
                  <TouchableOpacity style={styles.recipeBtn} onPress={() => setRecipe({ meal: m.t, title: m.title, ...m.recipe })}>
                    <Text style={styles.recipeBtnText}>👩‍🍳 Ver receta completa</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.recipeBtn, { marginTop: 8, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}
                  onPress={() => setAltMeal(prev => ({ ...prev, [i]: !prev[i] }))}>
                  <Text style={[styles.recipeBtnText, { color: '#64748B' }]}>
                    🔄 {altMeal[i] ? 'Ver plato original' : 'Cambiar este plato'}
                  </Text>
                </TouchableOpacity>

                {altMeal[i] && (
                  <View style={{ marginTop: 8, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700', marginBottom: 4 }}>ALTERNATIVA</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>
                      {d?.meals[(i + 1) % d.meals.length].ico} {d?.meals[(i + 1) % d.meals.length].title}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      {d?.meals[(i + 1) % d.meals.length].items.join(' · ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </>}

      {sub === 'semana' && <>
        {weekDays.map((day, i) => (
          <View key={i} style={[styles.card, i === 0 && { borderWidth: 2, borderColor: BLUE.primary }]}>
            <TouchableOpacity style={styles.dayRow} onPress={() => setOpenD(openD === i ? null : i)}>
              <View style={styles.dayDate}>
                <Text style={[styles.dayLabel, i === 0 && { color: BLUE.primary, fontWeight: '700' }]}>{day.dayLabel}</Text>
                <Text style={styles.dayNum}>{day.dayNum}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.phaseBadge, { backgroundColor: day.pd.color }]}>
                  <Text style={styles.phaseBadgeText}>{day.pd.emoji} {day.pd.name}</Text>
                </View>
                <Text style={styles.dayMeals}>{day.pd.meals[0].ico} {day.pd.meals[0].title} · {day.pd.meals[1].ico} {day.pd.meals[1].title}</Text>
              </View>
              <Text style={styles.chevron}>{openD === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openD === i && (
              <View style={styles.mealDetail}>
                {day.pd.meals.map(meal => (
                  <View key={meal.t} style={{ marginBottom: 12 }}>
                    <Text style={[styles.mealTag, { color: BLUE.primary, marginBottom: 4 }]}>{meal.ico} {meal.t} — {meal.title}</Text>
                    {meal.items.map(it => (
                      <View key={it} style={styles.listRow}>
                        <View style={styles.dot} />
                        <Text style={styles.listText}>{it}</Text>
                      </View>
                    ))}
                    {meal.recipe && (
                      <TouchableOpacity style={[styles.recipeBtn, { marginTop: 8 }]} onPress={() => setRecipe({ meal: meal.t, title: meal.title, ...meal.recipe })}>
                        <Text style={styles.recipeBtnText}>👩‍🍳 Ver receta</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </>}

      {sub === 'lista' && <>
        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>🛒 Lista de la compra semanal</Text>
          <Text style={styles.listSub}>
            <Text style={{ fontWeight: '700' }}>{adults} adulto{adults > 1 ? 's' : ''}</Text>
            {children > 0 ? ` + ${children} niño${children > 1 ? 's' : ''}` : ''} · próximos 7 días
          </Text>
        </View>
        {Object.entries(shopData).map(([cat, items]) => (
          <View key={cat} style={styles.card}>
            <Text style={styles.sectionTitle}>{cat}</Text>
            {items.map(item => (
              <View key={item.name} style={styles.shopRow}>
                <View style={styles.shopLeft}>
                  <View style={styles.checkbox} />
                  <Text style={styles.shopName}>{item.name}</Text>
                </View>
                <Text style={styles.shopQty}>{formatQty(item.totalQty, item.unit)}</Text>
              </View>
            ))}
          </View>
        ))}
      </>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  back: { fontSize: 14, color: '#1A56DB', fontWeight: '600', marginBottom: 16 },
  recipeTag: { fontSize: 11, color: '#1A56DB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  recipeTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  recipeSub: { fontSize: 12, color: '#64748B' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1A56DB', marginTop: 5, marginRight: 10, flexShrink: 0 },
  listText: { fontSize: 13, color: '#334155', flex: 1 },
  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#1A56DB', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { color: 'white', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 13, color: '#334155', lineHeight: 20, flex: 1, paddingTop: 4 },
  personsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  personBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, alignItems: 'center' },
  personLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { fontSize: 16, fontWeight: '700' },
  counterVal: { fontSize: 20, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  counterBtnFill: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  counterBtnFillText: { color: 'white', fontSize: 16, fontWeight: '700' },
  personNote: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 50, padding: 4, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 46, alignItems: 'center' },
  tabActive: { backgroundColor: '#1A56DB' },
  tabText: { fontSize: 13, color: '#94A3B8' },
  tabTextActive: { color: 'white', fontWeight: '700' },
  kcal: { fontSize: 13, color: '#475569', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagFill: { backgroundColor: '#1A56DB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagFillText: { color: 'white', fontSize: 11, fontWeight: '500' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealIco: { fontSize: 28, flexShrink: 0 },
  mealTag: { fontSize: 10, color: '#1A56DB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  mealTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  chevron: { color: '#CBD5E1', fontSize: 14, flexShrink: 0 },
  mealDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  recipeBtn: { marginTop: 12, padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#1A56DB', backgroundColor: '#EFF6FF', alignItems: 'center' },
  recipeBtnText: { color: '#1A56DB', fontWeight: '600', fontSize: 13 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayDate: { width: 44, alignItems: 'center', flexShrink: 0 },
  dayLabel: { fontSize: 11, color: '#94A3B8' },
  dayNum: { fontSize: 20, fontWeight: '700', color: '#1E293B', lineHeight: 24 },
  phaseBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 3 },
  phaseBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
  dayMeals: { fontSize: 12, color: '#64748B' },
  listSub: { fontSize: 12, color: '#475569' },
  shopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  shopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#1A56DB', flexShrink: 0 },
  shopName: { fontSize: 13, color: '#334155' },
  shopQty: { fontSize: 13, fontWeight: '600', color: '#1A56DB', flexShrink: 0, marginLeft: 8 },
});