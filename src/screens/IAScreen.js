import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF' };

const ACTIVITY_OPTIONS = [
  { id: 'sedentary', emoji: '🛋️', label: 'Sedentaria', factor: 1.2 },
  { id: 'light', emoji: '🚶', label: 'Ligera', factor: 1.375 },
  { id: 'moderate', emoji: '🏃', label: 'Moderada', factor: 1.55 },
  { id: 'active', emoji: '🏋️', label: 'Activa', factor: 1.725 },
];

const GOAL_OPTIONS = [
  { id: 'lose_weight', emoji: '⚡', label: 'Perder peso' },
  { id: 'maintain', emoji: '⚖️', label: 'Mantener' },
  { id: 'gain_muscle', emoji: '💪', label: 'Ganar músculo' },
];

const DIETARY_OPTIONS = [
  { id: 'lactose_free', label: '🥛 Sin lactosa' },
  { id: 'gluten_free', label: '🌾 Sin gluten' },
  { id: 'vegetarian', label: '🥗 Vegetariana' },
  { id: 'vegan', label: '🌱 Vegana' },
  { id: 'none', label: '✅ Sin restricciones' },
];

const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function PerfilScreen({ pi, profile, signOut }) {
  const [editing, setEditing] = useState(null);
  const [age, setAge] = useState(String(profile?.age || ''));
  const [weight, setWeight] = useState(String(profile?.weight || ''));
  const [height, setHeight] = useState(String(profile?.height || ''));
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel || 'moderate');
  const [goal, setGoal] = useState(profile?.goal || 'lose_weight');
  const [dietary, setDietary] = useState(profile?.dietary || []);
  const [trainDays, setTrainDays] = useState(profile?.trainDays || [1, 2, 4, 5]);
  const [saving, setSaving] = useState(false);

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

  const save = async () => {
    setSaving(true);
    await profile.saveAll({ age: parseInt(age), weight: parseFloat(weight), height: parseFloat(height), activityLevel, goal, dietary, trainDays });
    setSaving(false);
    setEditing(null);
  };

  const actOpt = ACTIVITY_OPTIONS.find(a => a.id === activityLevel);
  const goalOpt = GOAL_OPTIONS.find(g => g.id === goal);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* CABECERA */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>👤</Text>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        {pi && <Text style={styles.headerSub}>{pi.data?.emoji} Fase {pi.data?.name} · Día {pi.day}</Text>}
      </View>

      {/* DATOS PERSONALES */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📏 Datos personales</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'personal' ? null : 'personal')}>
            <Text style={styles.editBtn}>{editing === 'personal' ? 'Cerrar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        {editing !== 'personal' ? (
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{age || '—'}</Text><Text style={styles.infoLabel}>años</Text></View>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{weight || '—'}</Text><Text style={styles.infoLabel}>kg</Text></View>
            <View style={styles.infoBox}><Text style={styles.infoVal}>{height || '—'}</Text><Text style={styles.infoLabel}>cm</Text></View>
          </View>
        ) : (
          <View>
            {[{ label: 'Edad', val: age, set: setAge, unit: 'años', kb: 'numeric' },
              { label: 'Peso', val: weight, set: setWeight, unit: 'kg', kb: 'decimal-pad' },
              { label: 'Altura', val: height, set: setHeight, unit: 'cm', kb: 'numeric' }].map(f => (
              <View key={f.label} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} value={f.val} onChangeText={f.set}
                    keyboardType={f.kb} placeholder="—" />
                  <Text style={styles.inputUnit}>{f.unit}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ACTIVIDAD Y OBJETIVO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🎯 Actividad y objetivo</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'goal' ? null : 'goal')}>
            <Text style={styles.editBtn}>{editing === 'goal' ? 'Cerrar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        {editing !== 'goal' ? (
          <View style={styles.row}>
            <View style={[styles.chip, { backgroundColor: BLUE.light }]}>
              <Text style={styles.chipText}>{actOpt?.emoji} {actOpt?.label}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: BLUE.light }]}>
              <Text style={styles.chipText}>{goalOpt?.emoji} {goalOpt?.label}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.editSection}>Nivel de actividad</Text>
            {ACTIVITY_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => setActivityLevel(opt.id)}
                style={[styles.optRow, activityLevel === opt.id && styles.optRowActive]}>
                <Text style={styles.optEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optLabel, activityLevel === opt.id && { color: BLUE.primary, fontWeight: '700' }]}>{opt.label}</Text>
                <View style={[styles.radio, activityLevel === opt.id && styles.radioActive]}>
                  {activityLevel === opt.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <Text style={[styles.editSection, { marginTop: 16 }]}>Objetivo</Text>
            {GOAL_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => setGoal(opt.id)}
                style={[styles.optRow, goal === opt.id && styles.optRowActive]}>
                <Text style={styles.optEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optLabel, goal === opt.id && { color: BLUE.primary, fontWeight: '700' }]}>{opt.label}</Text>
                <View style={[styles.radio, goal === opt.id && styles.radioActive]}>
                  {goal === opt.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ALIMENTACIÓN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🥗 Alimentación</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'diet' ? null : 'diet')}>
            <Text style={styles.editBtn}>{editing === 'diet' ? 'Cerrar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        {editing !== 'diet' ? (
          <View style={styles.row}>
            {dietary.length === 0
              ? <Text style={styles.emptyText}>Sin restricciones definidas</Text>
              : dietary.map(id => {
                  const opt = DIETARY_OPTIONS.find(o => o.id === id);
                  return opt ? <View key={id} style={[styles.chip, { backgroundColor: BLUE.light }]}><Text style={styles.chipText}>{opt.label}</Text></View> : null;
                })}
          </View>
        ) : (
          <View>
            {DIETARY_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => toggleDietary(opt.id)}
                style={[styles.optRow, dietary.includes(opt.id) && styles.optRowActive]}>
                <Text style={[styles.optLabel, { flex: 1 }]}>{opt.label}</Text>
                <View style={[styles.checkbox, dietary.includes(opt.id) && styles.checkboxActive]}>
                  {dietary.includes(opt.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* DÍAS DE ENTRENO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💪 Días de entreno</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'days' ? null : 'days')}>
            <Text style={styles.editBtn}>{editing === 'days' ? 'Cerrar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.daysRow}>
          {[0, 1, 2, 3, 4, 5, 6].map(d => {
            const active = trainDays.includes(d);
            return (
              <TouchableOpacity key={d} onPress={() => editing === 'days' && toggleDay(d)}
                style={[styles.dayChip, { backgroundColor: active ? BLUE.primary : '#E2E8F0' }]}>
                <Text style={[styles.dayChipText, { color: active ? 'white' : '#94A3B8' }]}>{DAY_SHORT[d]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {editing === 'days' && (
          <TouchableOpacity style={[styles.saveBtn, { marginTop: 12 }]} onPress={save} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* IA */}
      <View style={[styles.card, { backgroundColor: BLUE.light }]}>
        <Text style={[styles.cardTitle, { color: BLUE.primary, marginBottom: 8 }]}>✨ Asistente IA</Text>
        <Text style={styles.iaDesc}>Próximamente podrás preguntarle al asistente IA sobre tu ciclo, nutrición y entrenos.</Text>
        <View style={styles.iaExamples}>
          {['¿Qué como antes de entrenar?', '¿Puedo hacer HIIT hoy?', 'Tengo antojos, ¿qué hago?'].map(q => (
            <View key={q} style={styles.iaQ}><Text style={styles.iaQText}>· {q}</Text></View>
          ))}
        </View>
      </View>

      {/* CERRAR SESIÓN */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  editBtn: { fontSize: 13, color: '#1A56DB', fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: 10 },
  infoBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center' },
  infoVal: { fontSize: 22, fontWeight: '700', color: '#1A56DB' },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { width: 90, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, textAlign: 'center' },
  inputUnit: { fontSize: 13, color: '#94A3B8' },
  saveBtn: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#1A56DB', alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#1A56DB', fontWeight: '500' },
  emptyText: { fontSize: 13, color: '#94A3B8' },
  editSection: { fontSize: 12, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 6 },
  optRowActive: { borderColor: '#1A56DB', backgroundColor: '#EFF6FF' },
  optEmoji: { fontSize: 20, marginRight: 10 },
  optLabel: { flex: 1, fontSize: 14, color: '#334155' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#1A56DB' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A56DB' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  checkmark: { color: 'white', fontSize: 13, fontWeight: '700' },
  daysRow: { flexDirection: 'row', gap: 5 },
  dayChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  dayChipText: { fontSize: 11, fontWeight: '600' },
  iaDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },
  iaExamples: { backgroundColor: 'white', borderRadius: 12, padding: 12 },
  iaQ: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iaQText: { fontSize: 13, color: '#475569' },
  signOutBtn: { marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: 'white', alignItems: 'center' },
  signOutText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
});