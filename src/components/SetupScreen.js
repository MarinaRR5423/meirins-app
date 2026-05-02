import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const ACTIVITY_OPTIONS = [
  { id: 'sedentary', emoji: '🛋️', label: 'Sedentaria', desc: 'Sin ejercicio o muy poco', factor: 1.2 },
  { id: 'light', emoji: '🚶', label: 'Ligera', desc: '1–3 días de ejercicio/semana', factor: 1.375 },
  { id: 'moderate', emoji: '🏃', label: 'Moderada', desc: '3–5 días de ejercicio/semana', factor: 1.55 },
  { id: 'active', emoji: '🏋️', label: 'Activa', desc: '6–7 días de ejercicio/semana', factor: 1.725 },
];

const GOAL_OPTIONS = [
  { id: 'lose_weight', emoji: '⚡', label: 'Perder peso', desc: 'Déficit calórico controlado' },
  { id: 'maintain', emoji: '⚖️', label: 'Mantener', desc: 'Calorías de mantenimiento' },
  { id: 'gain_muscle', emoji: '💪', label: 'Ganar músculo', desc: 'Superávit calórico moderado' },
];

const DIETARY_OPTIONS = [
  { id: 'lactose_free', label: '🥛 Sin lactosa' },
  { id: 'gluten_free', label: '🌾 Sin gluten' },
  { id: 'vegetarian', label: '🥗 Vegetariana' },
  { id: 'vegan', label: '🌱 Vegana' },
  { id: 'none', label: '✅ Sin restricciones' },
];

export default function SetupScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('lose_weight');
  const [dietary, setDietary] = useState([]);
  const [wantsSport, setWantsSport] = useState(true);
  const [date, setDate] = useState('');
  const [len, setLen] = useState(28);
  const [trainDays, setTrainDays] = useState([1, 2, 4, 5]);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const days = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const toggleDietary = (id) => {
    if (id === 'none') { setDietary(['none']); return; }
    const without = dietary.filter(x => x !== 'none');
    if (without.includes(id)) setDietary(without.filter(x => x !== id));
    else setDietary([...without, id]);
  };

  const toggleDay = (d) => {
    if (trainDays.includes(d)) { if (trainDays.length > 2) setTrainDays(trainDays.filter(x => x !== d)); }
    else { if (trainDays.length < 6) setTrainDays([...trainDays, d].sort()); }
  };

  const finish = async () => {
    setSaving(true);
    await onDone({
      date, len,
      trainDays: wantsSport ? trainDays : [],
      age: parseInt(age), weight: parseFloat(weight), height: parseFloat(height),
      activityLevel, goal, dietary,
    });
    setSaving(false);
  };

  const TOTAL_STEPS = wantsSport ? 6 : 5;

  // PASO 0 — Bienvenida
  if (step === 0) return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>Meirins</Text>
      <Text style={styles.tagline}>PROGRAMA CON PROPÓSITO</Text>
      <View style={styles.divider} />
      {['🥗 Nutrición adaptada a tu ciclo', '💪 Entrenamiento personalizado', '🛒 Lista de la compra semanal', '📊 Calorías calculadas para ti'].map(f => (
        <View key={f} style={styles.feature}><Text style={styles.featureText}>{f}</Text></View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
        <Text style={styles.btnText}>Comenzar →</Text>
      </TouchableOpacity>
    </View>
  );

  // PASO 1 — Datos personales
  if (step === 1) return (
    <KeyboardAvoidingView style={styles.scrollContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(0)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.stepLabel}>PASO 1 DE {TOTAL_STEPS}</Text>
        <Text style={styles.stepTitle}>Datos personales</Text>
        <Text style={styles.stepSub}>Para calcular tus calorías exactas</Text>

        {[
          { label: 'Edad', value: age, set: setAge, placeholder: 'Ej: 28', keyboard: 'numeric', unit: 'años' },
          { label: 'Peso', value: weight, set: setWeight, placeholder: 'Ej: 62.5', keyboard: 'decimal-pad', unit: 'kg' },
          { label: 'Altura', value: height, set: setHeight, placeholder: 'Ej: 165', keyboard: 'numeric', unit: 'cm' },
        ].map(f => (
          <View key={f.label} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{f.label}</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={f.value} onChangeText={f.set}
                placeholder={f.placeholder} placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType={f.keyboard} />
              <Text style={styles.inputUnit}>{f.unit}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.btn, (!age || !weight || !height) && styles.btnDisabled]}
          onPress={() => age && weight && height && setStep(2)} disabled={!age || !weight || !height}>
          <Text style={styles.btnText}>Siguiente →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // PASO 2 — Nivel de actividad
  if (step === 2) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      <Text style={styles.stepLabel}>PASO 2 DE {TOTAL_STEPS}</Text>
      <Text style={styles.stepTitle}>Nivel de actividad</Text>
      <Text style={styles.stepSub}>Tu rutina habitual fuera de Meirins</Text>

      {ACTIVITY_OPTIONS.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => setActivityLevel(opt.id)}
          style={[styles.optionCard, activityLevel === opt.id && styles.optionCardActive]}>
          <Text style={styles.optionEmoji}>{opt.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, activityLevel === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </View>
          <View style={[styles.radio, activityLevel === opt.id && styles.radioActive]}>
            {activityLevel === opt.id && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => setStep(3)}>
        <Text style={styles.btnText}>Siguiente →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // PASO 3 — Objetivo
  if (step === 3) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(2)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      <Text style={styles.stepLabel}>PASO 3 DE {TOTAL_STEPS}</Text>
      <Text style={styles.stepTitle}>Tu objetivo</Text>
      <Text style={styles.stepSub}>Adaptaremos tus calorías a tu meta</Text>

      {GOAL_OPTIONS.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => setGoal(opt.id)}
          style={[styles.optionCard, goal === opt.id && styles.optionCardActive]}>
          <Text style={styles.optionEmoji}>{opt.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, goal === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </View>
          <View style={[styles.radio, goal === opt.id && styles.radioActive]}>
            {goal === opt.id && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => setStep(4)}>
        <Text style={styles.btnText}>Siguiente →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // PASO 4 — Restricciones alimentarias
  if (step === 4) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(3)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      <Text style={styles.stepLabel}>PASO 4 DE {TOTAL_STEPS}</Text>
      <Text style={styles.stepTitle}>Alimentación</Text>
      <Text style={styles.stepSub}>¿Tienes alguna restricción? Puedes marcar varias</Text>

      {DIETARY_OPTIONS.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => toggleDietary(opt.id)}
          style={[styles.optionCard, dietary.includes(opt.id) && styles.optionCardActive]}>
          <Text style={styles.optionLabel}>{opt.label}</Text>
          <View style={[styles.checkbox, dietary.includes(opt.id) && styles.checkboxActive]}>
            {dietary.includes(opt.id) && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => setStep(5)}>
        <Text style={styles.btnText}>Siguiente →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // PASO 5 — Ciclo menstrual
  if (step === 5) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(4)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      <Text style={styles.stepLabel}>PASO 5 DE {TOTAL_STEPS}</Text>
      <Text style={styles.stepTitle}>Tu ciclo menstrual</Text>
      <Text style={styles.stepSub}>¿Cuándo empezó tu última regla?</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        {days.map(d => (
          <TouchableOpacity key={d} onPress={() => setDate(d)}
            style={[styles.dateBtn, date === d && styles.dateBtnActive]}>
            <Text style={[styles.dateBtnText, date === d && styles.dateBtnTextActive]}>
              {new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.stepSub}>Duración: <Text style={{ fontWeight: '700' }}>{len} días</Text></Text>
      <View style={styles.lenRow}>
        {[21, 24, 26, 28, 30, 32, 35].map(l => (
          <TouchableOpacity key={l} onPress={() => setLen(l)}
            style={[styles.lenBtn, len === l && styles.lenBtnActive]}>
            <Text style={[styles.lenBtnText, len === l && styles.lenBtnTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepSub, { marginTop: 24 }]}>¿Quieres incluir rutina deportiva?</Text>
      <View style={styles.sportRow}>
        {[{ v: true, l: '💪 Sí' }, { v: false, l: '🛋️ No' }].map(opt => (
          <TouchableOpacity key={String(opt.v)} onPress={() => setWantsSport(opt.v)}
            style={[styles.sportBtn, wantsSport === opt.v && styles.sportBtnActive]}>
            <Text style={[styles.sportBtnText, wantsSport === opt.v && styles.sportBtnTextActive]}>{opt.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, !date && styles.btnDisabled]}
        onPress={() => date && setStep(wantsSport ? 6 : 7)} disabled={!date}>
        <Text style={styles.btnText}>Siguiente →</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // PASO 6 — Días de entreno (solo si wantsSport)
  if (step === 6) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(5)}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      <Text style={styles.stepLabel}>PASO 6 DE {TOTAL_STEPS}</Text>
      <Text style={styles.stepTitle}>¿Cuándo entrenas?</Text>
      <Text style={styles.stepSub}>Elige tus días (mín. 2, máx. 6)</Text>

      <View style={styles.daysGrid}>
        {[0, 1, 2, 3, 4, 5, 6].map(d => {
          const active = trainDays.includes(d);
          return (
            <TouchableOpacity key={d} onPress={() => toggleDay(d)}
              style={[styles.dayBtn, active && styles.dayBtnActive]}>
              <Text style={styles.dayShort}>{DAY_SHORT[d]}</Text>
              <Text style={styles.dayEmoji}>{active ? '💪' : '😴'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Tu perfil completo</Text>
        <Text style={styles.summaryText}>📏 {height} cm · {weight} kg · {age} años</Text>
        <Text style={styles.summaryText}>🎯 {GOAL_OPTIONS.find(g => g.id === goal)?.label}</Text>
        <Text style={styles.summaryText}>💪 Entrenas: {trainDays.map(d => DAY_LABELS[d]).join(', ')}</Text>
      </View>

      <TouchableOpacity style={[styles.btn, saving && styles.btnDisabled]} onPress={finish} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Crear mi programa ✨'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1F4A', alignItems: 'center', justifyContent: 'center', padding: 28 },
  scrollContainer: { flex: 1, backgroundColor: '#0F1F4A' },
  scrollContent: { padding: 28, paddingTop: 60, paddingBottom: 40 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontFamily: 'serif', fontSize: 40, color: 'white', fontWeight: '700', marginBottom: 4 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, marginBottom: 20 },
  divider: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 22 },
  feature: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 8, width: '100%' },
  featureText: { color: 'white', fontSize: 14 },
  btn: { width: '100%', padding: 15, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', marginTop: 24 },
  btnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  btnText: { color: '#1A56DB', fontSize: 16, fontWeight: '700' },
  back: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 28 },
  stepLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 8 },
  stepTitle: { fontFamily: 'serif', fontSize: 28, color: 'white', fontWeight: '700', marginBottom: 6 },
  stepSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 16 },
  inputUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 14, minWidth: 30 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  optionCardActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'white' },
  optionEmoji: { fontSize: 28, flexShrink: 0 },
  optionLabel: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  optionLabelActive: { color: 'white' },
  optionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  radioActive: { borderColor: 'white' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxActive: { backgroundColor: 'white', borderColor: 'white' },
  checkmark: { color: '#1A56DB', fontSize: 14, fontWeight: '700' },
  dateBtn: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', marginRight: 8, alignItems: 'center' },
  dateBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  dateBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  dateBtnTextActive: { color: '#1A56DB', fontWeight: '700' },
  lenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lenBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', minWidth: 44, alignItems: 'center' },
  lenBtnActive: { backgroundColor: 'white' },
  lenBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  lenBtnTextActive: { color: '#1A56DB', fontWeight: '700' },
  sportRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  sportBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center' },
  sportBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  sportBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
  sportBtnTextActive: { color: '#1A56DB' },
  daysGrid: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dayBtn: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center' },
  dayBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  dayShort: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  dayEmoji: { fontSize: 14, marginTop: 4 },
  summary: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 16, marginBottom: 8 },
  summaryTitle: { color: 'white', fontWeight: '600', marginBottom: 6 },
  summaryText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 24 },
});