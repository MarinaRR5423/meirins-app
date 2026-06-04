import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import T, { getMealLabel, getPhaseDisplay } from '../i18n/translations';
import { PHASES } from '../data/phases';
import { INGREDIENTS, formatQty, locName, locCat } from '../data/ingredients';
import { usePhaseData } from '../hooks/usePhaseData';
import { getDayType, MENU_A, MENU_B, MENU_FREE, TIPS_NUTRI, resolveMenu, resolveTips } from '../data/marinaProgram';
import { ARTICLES } from '../data/articles';
import TipsCard from '../components/TipsCard';
import { NutriSetupCard } from '../components/TabSetupCard';
import { calcCalories } from '../utils/calories';
import { useDiets, normalizeDietId } from '../hooks/useDiets';
import { getDayNutritionContext } from '../utils/programEngine';

const NUTRI_ARTICLE_IDS = ['nutrition-menstrual', 'endometriosis-nutrition', 'pcos-hormones', 'pregnancy-nutrition'];
const nutriArticles = ARTICLES.filter(a => NUTRI_ARTICLE_IDS.includes(a.id));

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
const WATER_GOAL = 8;
const ML_PER_GLASS = 250;

function WaterCard({ lang }) {
  const n = (T[lang] || T.es).nutri;
  const w = n.water;
  const todayStr = new Date().toISOString().split('T')[0];
  const [count, setCount]       = useState(0);
  const [dateKey, setDateKey]   = useState(todayStr);

  // Auto-reset at midnight
  if (dateKey !== todayStr) { setDateKey(todayStr); setCount(0); }

  const ml     = count * ML_PER_GLASS;
  const goalMl = WATER_GOAL * ML_PER_GLASS;
  const pct    = Math.min(1, ml / goalMl);
  const done   = count >= WATER_GOAL;

  const handleBubble = (i) => {
    // Tap filled → remove from that glass onward; tap empty → fill up to it
    setCount(i < count ? i : i + 1);
  };

  return (
    <View style={wStyles.card}>
      {/* Header */}
      <View style={wStyles.header}>
        <Text style={wStyles.title}>{w.title}</Text>
        <Text style={[wStyles.mlText, done && { color: '#16A34A' }]}>
          {done ? w.done : `${ml} / ${goalMl} ${w.ml}`}
        </Text>
      </View>

      {/* Bubble row */}
      <View style={wStyles.bubblesRow}>
        {Array.from({ length: WATER_GOAL }, (_, i) => {
          const filled = i < count;
          return (
            <TouchableOpacity key={i} onPress={() => handleBubble(i)} activeOpacity={0.7}
              style={[wStyles.bubble, filled ? wStyles.bubbleFilled : wStyles.bubbleEmpty]}>
              <Text style={[wStyles.bubbleEmoji, !filled && { opacity: 0.2 }]}>💧</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={wStyles.progressBg}>
        <View style={[wStyles.progressFill, { width: `${pct * 100}%`, backgroundColor: done ? '#16A34A' : BLUE.primary }]} />
      </View>

      {/* Footer */}
      <View style={wStyles.footer}>
        <Text style={wStyles.footerText}>{count} / {WATER_GOAL} {w.glasses} · {w.goal}</Text>
        {count > 0 && (
          <TouchableOpacity onPress={() => setCount(0)}>
            <Text style={wStyles.resetText}>{w.reset}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const wStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  mlText: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },
  bubblesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bubble: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bubbleFilled: { backgroundColor: '#DBEAFE' },
  bubbleEmpty: { borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  bubbleEmoji: { fontSize: 18 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 11, color: '#64748B' },
  resetText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});

function buildShopping(weekDays, adults, children, lang = 'es') {
  const portions = adults + children * 0.6;
  const pDays = {};
  weekDays.forEach(d => { pDays[d.phase] = (pDays[d.phase] || 0) + 1; });
  const merged = {};
  Object.entries(pDays).forEach(([phase, days]) => {
    INGREDIENTS[phase].forEach(cat => {
      const catLabel = locCat(cat.cat, lang);
      cat.items.forEach(item => {
        // Use ES name as stable key (language-independent), display resolved name
        const esName = typeof item.name === 'string' ? item.name : item.name.es;
        const key = esName + '_' + item.unit;
        const displayName = locName(item.name, lang);
        if (!merged[key]) merged[key] = { name: displayName, unit: item.unit, totalQty: 0, cat: catLabel };
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

function MealCard({ meal, expanded, onToggle, onRecipe, seeRecipeLabel, mealLabelFn }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.mealRow} onPress={onToggle}>
        <Text style={styles.mealIco}>{meal.ico}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealTag}>{mealLabelFn ? mealLabelFn(meal.label) : meal.label}</Text>
          <Text style={styles.mealTitle}>{meal.items[0]}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.mealDetail}>
          {meal.items.map((it, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.dot} />
              <Text style={styles.listText}>{it}</Text>
            </View>
          ))}
          {meal.recipe && (
            <TouchableOpacity style={styles.recipeBtn} onPress={() => onRecipe(meal.recipe, meal.label)}>
              <Text style={styles.recipeBtnText}>{seeRecipeLabel || '👩‍🍳 Ver la receta completa'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function NutriScreen({ pi, program, lang = 'es', goal, activityLevel, dietary, profileExtended, saveAll, saveProfileExtended, age, weight, height, trainDays }) {
  const [sub, setSub] = useState('plan');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [openM, setOpenM] = useState(null);
  const [openD, setOpenD] = useState(null);
  const [openPlan, setOpenPlan] = useState(0);
  const [recipe, setRecipe] = useState(null);
  const [altMeal, setAltMeal] = useState({});
  const { phaseData } = usePhaseData(pi?.phase);
  const d = phaseData;
  const totalPeople = adults + children;
  const n = (T[lang] || T.es).nutri;
  const cm = (T[lang] || T.es).common;

  // ── Calorías personalizadas ─────────────────────────────────────────────────
  const cals = calcCalories({ weight, height, age, activityLevel, goal, trainDays }, pi?.phase);

  // ── Dieta desde Supabase ─────────────────────────────────────────────────────
  const { getDiet } = useDiets(lang);
  const currentDietId = normalizeDietId(profileExtended?.diet || '');
  const dietData      = currentDietId ? getDiet(currentDietId) : null;
  const [dietOpen, setDietOpen] = useState(false);

  // ── Contexto nutricional del día (fase + dieta + condiciones) ────────────────
  const nutritionCtx = getDayNutritionContext(
    pi?.phase,
    currentDietId || null,
    profileExtended?.conditions || [],
    lang,
  );

  // resolveMenu detects old Supabase flat-string format and falls back to the
  // multilingual static file automatically, so content is always translated.
  const menuA     = resolveMenu(program?.menuA,     lang, MENU_A);
  const menuB     = resolveMenu(program?.menuB,     lang, MENU_B);
  const menuFree  = resolveMenu(program?.menuFree,  lang, MENU_FREE);
  const tipsNutri = resolveTips(program?.tipsNutri ?? TIPS_NUTRI, lang);

  const todayType = getDayType(new Date().getDay());
  const todayMenu = todayType === 'A' ? menuA : todayType === 'B' ? menuB : menuFree;

  const weekMenuDays = useMemo(() => {
    const names = lang === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : lang === 'en'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i);
      const dow = date.getDay();
      const type = getDayType(dow);
      const menu = type === 'A' ? menuA : type === 'B' ? menuB : menuFree;
      return {
        label: i === 0 ? cm.today : i === 1 ? cm.tomorrow : names[dow],
        dayNum: date.getDate(),
        menu,
        type,
      };
    });
  }, []);

  const weekDays = useMemo(() => {
    if (!pi) return [];
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i);
      const cd = ((pi.day - 1 + i) % pi.cycleLen) + 1;
      const phase = cd <= 5 ? 'menstrual' : cd <= 13 ? 'follicular' : cd <= 16 ? 'ovulation' : 'luteal';
      return { date, dayLabel: i === 0 ? cm.today : i === 1 ? cm.tomorrow : names[date.getDay()], dayNum: date.getDate(), phase, pd: PHASES[phase] };
    });
  }, [pi]);

  const shopData = useMemo(() => buildShopping(weekDays, adults, children, lang), [weekDays, adults, children, lang]);

  if (recipe) return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => setRecipe(null)}>
        <Text style={styles.back}>{n.backToMenu}</Text>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: BLUE.light }]}>
        <Text style={styles.recipeTag}>{recipe.mealLabel}</Text>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{n.ingredients}</Text>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.listRow}>
            <View style={styles.dot} />
            <Text style={styles.listText}>{ing}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{n.preparation}</Text>
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

      <NutriSetupCard lang={lang} profileExtended={profileExtended} goal={goal}
        activityLevel={activityLevel} dietary={dietary}
        saveAll={saveAll || (() => {})} saveProfileExtended={saveProfileExtended || (() => {})} />

      {/* ── TARJETA DE DIETA ACTIVA ── */}
      {dietData && (
        <View style={styles.dietCard}>
          <TouchableOpacity style={styles.dietHeader} onPress={() => setDietOpen(v => !v)} activeOpacity={0.8}>
            <Text style={styles.dietIcon}>{dietData.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dietName}>{dietData.name[lang] || dietData.name.es}</Text>
              {dietData.macros && (
                <Text style={styles.dietMacros}>
                  🌾 {dietData.macros.carbs_pct}% · 🥩 {dietData.macros.protein_pct}% · 🫒 {dietData.macros.fat_pct}%
                </Text>
              )}
            </View>
            <Text style={styles.dietArrow}>{dietOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dietOpen && (() => {
            const allowed   = dietData.allowed_foods?.[lang]   || dietData.allowed_foods?.es   || [];
            const forbidden = dietData.forbidden_foods?.[lang] || dietData.forbidden_foods?.es || [];
            const benefits  = dietData.benefits?.[lang]        || dietData.benefits?.es        || [];
            const warnings  = dietData.warnings?.[lang]        || dietData.warnings?.es        || [];
            return (
              <View style={styles.dietBody}>
                {allowed.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={styles.dietSectionLabel}>
                      ✅ {lang === 'en' ? 'EAT FREELY' : lang === 'fr' ? 'À MANGER LIBREMENT' : 'COMER LIBREMENTE'}
                    </Text>
                    {allowed.slice(0, 6).map((f, i) => <Text key={i} style={styles.dietItem}>· {f}</Text>)}
                  </View>
                )}
                {forbidden.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={[styles.dietSectionLabel, { color: '#EF4444' }]}>
                      ❌ {lang === 'en' ? 'AVOID' : lang === 'fr' ? 'ÉVITER' : 'EVITAR'}
                    </Text>
                    {forbidden.slice(0, 4).map((f, i) => <Text key={i} style={[styles.dietItem, { color: '#EF4444' }]}>· {f}</Text>)}
                  </View>
                )}
                {benefits.length > 0 && (
                  <View style={styles.dietSection}>
                    <Text style={[styles.dietSectionLabel, { color: '#059669' }]}>
                      💡 {lang === 'en' ? 'KEY BENEFITS' : lang === 'fr' ? 'BÉNÉFICES CLÉS' : 'BENEFICIOS CLAVE'}
                    </Text>
                    {benefits.slice(0, 3).map((b, i) => <Text key={i} style={[styles.dietItem, { color: '#065F46' }]}>· {b}</Text>)}
                  </View>
                )}
                {warnings.length > 0 && (
                  <View style={[styles.dietSection, { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 8 }]}>
                    <Text style={[styles.dietSectionLabel, { color: '#92400E' }]}>
                      ⚠️ {lang === 'en' ? 'KEEP IN MIND' : lang === 'fr' ? 'À GARDER EN TÊTE' : 'TEN EN CUENTA'}
                    </Text>
                    {warnings.slice(0, 2).map((w, i) => <Text key={i} style={[styles.dietItem, { color: '#92400E' }]}>· {w}</Text>)}
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* ── CONTEXTO NUTRICIONAL DEL DÍA ── */}
      {nutritionCtx && (
        <View style={styles.ctxCard}>
          <Text style={styles.ctxTitle}>
            🎯 {lang === 'en' ? 'Today\'s focus' : lang === 'fr' ? 'Focus du jour' : lang === 'it' ? 'Focus di oggi' : 'Foco de hoy'}
          </Text>
          <View style={styles.ctxNutrients}>
            {(Array.isArray(nutritionCtx.nutrients) ? nutritionCtx.nutrients : [nutritionCtx.nutrients]).map((n, i) => (
              <View key={i} style={styles.ctxPill}>
                <Text style={styles.ctxPillTxt}>{n}</Text>
              </View>
            ))}
          </View>
          {!!nutritionCtx.tip && (
            <Text style={styles.ctxTip}>{nutritionCtx.tip}</Text>
          )}
          {!!nutritionCtx.dietNote && (
            <Text style={styles.ctxDietNote}>🥗 {nutritionCtx.dietNote}</Text>
          )}
          {nutritionCtx.conditionNotes?.map((note, i) => (
            <Text key={i} style={styles.ctxCondNote}>{note}</Text>
          ))}
          {!!nutritionCtx.avoidNote && (
            <Text style={styles.ctxAvoid}>⚠️ {nutritionCtx.avoidNote}</Text>
          )}
        </View>
      )}

      <View style={styles.tabRow}>
        {[{ id: 'plan', l: n.myPlan }, { id: 'semana', l: n.week }, { id: 'lista', l: n.list }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
            style={[styles.tab, sub === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── MON PLAN ── */}
      {sub === 'plan' && <>
        {/* Bannière du jour */}
        <View style={[styles.card, { backgroundColor: todayMenu.color }]}>
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.planTag, { color: todayMenu.textColor }]}>{cm.today.toUpperCase()} · {todayMenu.tag}</Text>
              <Text style={[styles.planTitle, { color: todayMenu.textColor }]}>{todayMenu.label}{cals ? ` · ${cals.total} kcal` : ''}</Text>
            </View>
            <Text style={{ fontSize: 28 }}>{todayType === 'free' ? '😊' : todayType === 'A' ? '🐔' : '🐟'}</Text>
          </View>
          <Text style={[styles.planSub, { color: todayMenu.textColor }]}>
            {todayType === 'A' ? n.dayADesc : todayType === 'B' ? n.dayBDesc : n.dayFreeDesc}
          </Text>
        </View>

        {/* Repas du jour */}
        {todayMenu.meals.map((meal, i) => (
          <MealCard
            key={meal.id}
            meal={meal}
            expanded={openPlan === i}
            onToggle={() => setOpenPlan(openPlan === i ? null : i)}
            onRecipe={(r, lbl) => setRecipe({ ...r, mealLabel: lbl })}
            seeRecipeLabel={n.seeRecipe}
            mealLabelFn={(lbl) => getMealLabel(lang, lbl)}
          />
        ))}

        {/* Conseils */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{n.tips}</Text>
          {tipsNutri.map((tip, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.dot} />
              <Text style={styles.listText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Type de journée info */}
        <View style={[styles.card, { backgroundColor: '#F8FAFC' }]}>
          <Text style={styles.sectionTitle}>{n.dayTypes}</Text>
          {[menuA, menuB].map(menu => (
            <View key={menu.label} style={[styles.dayTypeRow, { backgroundColor: menu.color }]}>
              <Text style={[styles.dayTypeLabel, { color: menu.textColor }]}>{menu.label}</Text>
              <Text style={[styles.dayTypeTag, { color: menu.textColor }]}>{menu.tag}</Text>
            </View>
          ))}
          <View style={[styles.dayTypeRow, { backgroundColor: menuFree.color ?? MENU_FREE.color }]}>
            <Text style={[styles.dayTypeLabel, { color: menuFree.textColor ?? MENU_FREE.textColor }]}>{menuFree.label}</Text>
            <Text style={[styles.dayTypeTag, { color: menuFree.textColor ?? MENU_FREE.textColor }]}>{menuFree.tag}</Text>
          </View>
        </View>

        {/* ── AGUA ── */}
        <WaterCard lang={lang} />
      </>}

      {/* ── SEMAINE ── */}
      {sub === 'semana' && <>
        {weekMenuDays.map((day, i) => (
          <View key={i} style={[styles.card, i === 0 && { borderWidth: 2, borderColor: BLUE.primary }]}>
            <TouchableOpacity style={styles.dayRow} onPress={() => setOpenD(openD === i ? null : i)}>
              <View style={styles.dayDate}>
                <Text style={[styles.dayLabel, i === 0 && { color: BLUE.primary, fontWeight: '700' }]}>{day.label}</Text>
                <Text style={styles.dayNum}>{day.dayNum}</Text>
              </View>
              <View style={[styles.dayTypeBadge, { backgroundColor: day.menu.color }]}>
                <Text style={[styles.dayTypeBadgeText, { color: day.menu.textColor }]}>{day.menu.label}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.dayMeals} numberOfLines={1}>
                  {day.menu.meals.slice(0, 2).map(m => m.ico + ' ' + getMealLabel(lang, m.label)).join(' · ')}
                </Text>
              </View>
              <Text style={styles.chevron}>{openD === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openD === i && (
              <View style={styles.mealDetail}>
                {day.menu.meals.map((meal, j) => (
                  <View key={meal.id} style={{ marginBottom: 12 }}>
                    <Text style={[styles.mealTag, { color: day.menu.textColor, marginBottom: 4 }]}>{meal.ico} {getMealLabel(lang, meal.label)}</Text>
                    {meal.items.map((it, k) => (
                      <View key={k} style={styles.listRow}>
                        <View style={styles.dot} />
                        <Text style={styles.listText}>{it}</Text>
                      </View>
                    ))}
                    {meal.recipe && (
                      <TouchableOpacity style={[styles.recipeBtn, { marginTop: 8 }]}
                        onPress={() => setRecipe({ ...meal.recipe, mealLabel: meal.label })}>
                        <Text style={styles.recipeBtnText}>{n.seeRecipeShort}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </>}

      {/* ── LISTE DE COURSES ── */}
      {sub === 'lista' && <>
        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>{n.weekList}</Text>
          <Text style={styles.listSub}>{n.weekListSub} · {adults} {adults > 1 ? n.adults2 : n.adult}</Text>
          <View style={styles.personsRow}>
            {[
              { label: n.adults, val: adults, set: setAdults, min: 1, max: 8, color: BLUE.primary },
              { label: n.children, val: children, set: setChildren, min: 0, max: 6, color: '#64748B' }
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
                <Text style={styles.shopQty}>{formatQty(item.totalQty, item.unit, lang)}</Text>
              </View>
            ))}
          </View>
        ))}
      </>}

      {/* ── CONSEJOS ── */}
      <TipsCard articles={nutriArticles} lang={lang} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },

  // Nutrition context card
  ctxCard:      { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  ctxTitle:     { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  ctxNutrients: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  ctxPill:      { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ctxPillTxt:   { fontSize: 12, color: '#1A56DB', fontWeight: '600' },
  ctxTip:       { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 6 },
  ctxDietNote:  { fontSize: 12, color: '#059669', backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8, marginBottom: 6, lineHeight: 18 },
  ctxCondNote:  { fontSize: 12, color: '#7C3AED', backgroundColor: '#F5F3FF', borderRadius: 8, padding: 8, marginBottom: 6, lineHeight: 18 },
  ctxAvoid:     { fontSize: 12, color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, lineHeight: 18 },

  // Diet info card
  dietCard:         { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  dietHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  dietIcon:         { fontSize: 26 },
  dietName:         { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dietMacros:       { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  dietArrow:        { fontSize: 11, color: '#94A3B8' },
  dietBody:         { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dietSection:      { marginTop: 10 },
  dietSectionLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 5 },
  dietItem:         { fontSize: 13, color: '#475569', lineHeight: 20 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  back: { fontSize: 14, color: '#1A56DB', fontWeight: '600', marginBottom: 16 },
  recipeTag: { fontSize: 11, color: '#1A56DB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  recipeTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1A56DB', marginTop: 5, marginRight: 10, flexShrink: 0 },
  listText: { fontSize: 13, color: '#334155', flex: 1, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#1A56DB', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { color: 'white', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 13, color: '#334155', lineHeight: 20, flex: 1, paddingTop: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 50, padding: 4, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 46, alignItems: 'center' },
  tabActive: { backgroundColor: '#1A56DB' },
  tabText: { fontSize: 12, color: '#94A3B8' },
  tabTextActive: { color: 'white', fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planTag: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  planTitle: { fontSize: 17, fontWeight: '700' },
  planSub: { fontSize: 12, lineHeight: 18, opacity: 0.85 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealIco: { fontSize: 26, flexShrink: 0 },
  mealTag: { fontSize: 10, color: '#1A56DB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  mealTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  chevron: { color: '#CBD5E1', fontSize: 14, flexShrink: 0 },
  mealDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  recipeBtn: { marginTop: 12, padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#1A56DB', backgroundColor: '#EFF6FF', alignItems: 'center' },
  recipeBtnText: { color: '#1A56DB', fontWeight: '600', fontSize: 13 },
  dayTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 6 },
  dayTypeLabel: { fontSize: 13, fontWeight: '700' },
  dayTypeTag: { fontSize: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayDate: { width: 50, alignItems: 'center', flexShrink: 0 },
  dayLabel: { fontSize: 11, color: '#94A3B8' },
  dayNum: { fontSize: 20, fontWeight: '700', color: '#1E293B', lineHeight: 24 },
  dayTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexShrink: 0 },
  dayTypeBadgeText: { fontSize: 10, fontWeight: '700' },
  dayMeals: { fontSize: 12, color: '#64748B' },
  personsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  personBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 10, alignItems: 'center' },
  personLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { fontSize: 16, fontWeight: '700' },
  counterVal: { fontSize: 20, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  counterBtnFill: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  counterBtnFillText: { color: 'white', fontSize: 16, fontWeight: '700' },
  listSub: { fontSize: 12, color: '#475569', marginBottom: 4 },
  shopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  shopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#1A56DB', flexShrink: 0 },
  shopName: { fontSize: 13, color: '#334155' },
  shopQty: { fontSize: 13, fontWeight: '600', color: '#1A56DB', flexShrink: 0, marginLeft: 8 },
});
