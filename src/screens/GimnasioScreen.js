import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { PHASES, DAY_SHORT, DAY_LABELS, jsToIdx } from '../data/phases';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };

export default function GimnasioScreen({ pi, trainDays, setTrainDays }) {
  const [sub, setSub] = useState('hoy');
  const [extraInput, setExtraInput] = useState('');
  const [addingSport, setAddingSport] = useState(false);
  const [editingDays, setEditingDays] = useState(false);
  const [tempDays, setTempDays] = useState(trainDays);
  const [workoutLog, setWorkoutLog] = useState({});

  const d = pi?.data;
  const todayJS = new Date();
  const todayKey = todayJS.toISOString().split('T')[0];
  const todayDow = todayJS.getDay();
  const isTrainDay = trainDays.includes(todayDow);
  const todayWeekIdx = jsToIdx[todayDow];
  const todayWorkout = d?.week[todayWeekIdx];
  const todayLog = workoutLog[todayKey];

  if (!pi) return null;
  const saveLog = (update) => setWorkoutLog(prev => ({ ...prev, [todayKey]: update }));

  const toggleTempDay = (dv) => {
    if (tempDays.includes(dv)) { if (tempDays.length > 2) setTempDays(tempDays.filter(x => x !== dv)); }
    else { if (tempDays.length < 6) setTempDays([...tempDays, dv].sort()); }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() + i);
    const dow = date.getDay();
    const wIdx = jsToIdx[dow];
    const cd = (((pi?.day ?? 1) - 1 + i) % (pi?.cycleLen ?? 28)) + 1;
    const phase = cd <= 5 ? 'menstrual' : cd <= 13 ? 'follicular' : cd <= 16 ? 'ovulation' : 'luteal';
    const dateKey = date.toISOString().split('T')[0];
    return { date, dow, isTrain: trainDays.includes(dow), wIdx, phase, pd: PHASES[phase], log: workoutLog[dateKey], dateKey, dayNum: date.getDate(), dayLabel: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DAY_LABELS[dow] };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabRow}>
        {[{ id: 'hoy', l: 'Hoy' }, { id: 'semana', l: 'Semana' }].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setSub(t.id)}
            style={[styles.tab, sub === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, sub === t.id && styles.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sub === 'hoy' && <>
        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <Text style={[styles.sectionTitle, { color: BLUE.primary }]}>⚡ Fase {d?.name} · Intensidad {d?.intensity}</Text>
          <View style={styles.intensityBar}>
            <View style={[styles.intensityFill, { width: `${d?.intensityPct}%` }]} />
          </View>
          <Text style={styles.tip}>{d?.tip}</Text>
        </View>

        {isTrainDay ? <>
          <View style={styles.card}>
            <View style={styles.sessionHeader}>
              <View>
                <Text style={styles.sessionTag}>SESIÓN DE HOY</Text>
                <Text style={styles.sessionName}>{todayWorkout?.ico} {todayWorkout?.name}</Text>
                {todayWorkout?.dur && <Text style={styles.sessionDur}>⏱ {todayWorkout.dur}</Text>}
              </View>
              {todayLog && (
                <View style={[styles.statusBadge, { backgroundColor: todayLog.status === 'done' ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.statusText, { color: todayLog.status === 'done' ? '#16A34A' : '#DC2626' }]}>
                    {todayLog.status === 'done' ? '✓ Hecho' : '✗ No pude'}
                  </Text>
                </View>
              )}
            </View>

            {todayWorkout?.exercises?.length > 0 && (
              <View style={styles.exercises}>
                <Text style={styles.exercisesLabel}>EJERCICIOS</Text>
                {todayWorkout.exercises.map((ex, i) => (
                  <View key={i} style={[styles.exerciseRow, { backgroundColor: i % 2 === 0 ? '#F8FAFC' : 'white' }]}>
                    <View style={styles.exNum}><Text style={styles.exNumText}>{i + 1}</Text></View>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exDetail}>
                      {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets && ex.dur ? `${ex.sets}×${ex.dur}` : ex.dur || ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!todayLog && (
              <View style={styles.logBtns}>
                <TouchableOpacity style={styles.doneBtn} onPress={() => saveLog({ status: 'done', extraSport: '' })}>
                  <Text style={styles.doneBtnText}>✓ Completado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipBtn} onPress={() => saveLog({ status: 'skipped', extraSport: '' })}>
                  <Text style={styles.skipBtnText}>✗ No pude</Text>
                </TouchableOpacity>
              </View>
            )}
            {todayLog && (
              <TouchableOpacity style={styles.undoBtn} onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
                <Text style={styles.undoBtnText}>Deshacer registro</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>➕ Añadir deporte extra</Text>
            {todayLog?.extraSport ? (
              <View style={styles.extraRow}>
                <Text style={styles.extraText}>🏅 {todayLog.extraSport}</Text>
                <TouchableOpacity onPress={() => saveLog({ ...todayLog, extraSport: '' })}>
                  <Text style={styles.extraRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ) : addingSport ? (
              <View style={styles.extraInput}>
                <TextInput style={styles.input} value={extraInput} onChangeText={setExtraInput} placeholder="Ej: Tenis 1h, Pádel 90min..." />
                <TouchableOpacity style={styles.addBtn} onPress={() => { saveLog({ ...(todayLog || { status: 'done' }), extraSport: extraInput }); setAddingSport(false); setExtraInput(''); }}>
                  <Text style={styles.addBtnText}>Añadir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.dashedBtn} onPress={() => setAddingSport(true)}>
                <Text style={styles.dashedBtnText}>+ Añadir otro deporte o actividad</Text>
              </TouchableOpacity>
            )}
          </View>
        </> : <>
          <View style={[styles.card, { alignItems: 'center', padding: 28 }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>😴</Text>
            <Text style={styles.restTitle}>Día de descanso</Text>
            <Text style={styles.restSub}>Hoy no está programado entrenar. El descanso también es parte del progreso.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>¿Has hecho algo hoy? Regístralo</Text>
            {todayLog?.extraSport ? (
              <View style={[styles.extraRow, { backgroundColor: BLUE.light }]}>
                <Text style={[styles.extraText, { color: '#1E40AF' }]}>🏅 {todayLog.extraSport}</Text>
                <TouchableOpacity onPress={() => setWorkoutLog(prev => { const u = { ...prev }; delete u[todayKey]; return u; })}>
                  <Text style={styles.extraRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ) : addingSport ? (
              <View style={styles.extraInput}>
                <TextInput style={styles.input} value={extraInput} onChangeText={setExtraInput} placeholder="Ej: Paseo 30min, Natación..." />
                <TouchableOpacity style={styles.addBtn} onPress={() => { saveLog({ status: 'extra', extraSport: extraInput }); setAddingSport(false); setExtraInput(''); }}>
                  <Text style={styles.addBtnText}>Añadir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.dashedBtn} onPress={() => setAddingSport(true)}>
                <Text style={styles.dashedBtnText}>+ Añadir deporte espontáneo</Text>
              </TouchableOpacity>
            )}
          </View>
        </>}
      </>}

      {sub === 'semana' && <>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Tu semana</Text>
          {weekDays.map((day, i) => {
            const w = d?.week[day.wIdx];
            const st = day.log?.status;
            return (
              <View key={i} style={[styles.weekRow, { backgroundColor: i === 0 ? '#EFF6FF' : day.isTrain ? '#F8FAFC' : 'white', borderColor: i === 0 ? '#BFDBFE' : '#F1F5F9' }]}>
                <View style={styles.weekDate}>
                  <Text style={[styles.weekDayLabel, i === 0 && { color: BLUE.primary, fontWeight: '700' }]}>{day.dayLabel}</Text>
                  <Text style={styles.weekDayNum}>{day.dayNum}</Text>
                </View>
                <Text style={{ fontSize: 20, flexShrink: 0 }}>{day.isTrain ? w?.ico : '😴'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.weekWorkout, { color: day.isTrain ? '#1E293B' : '#CBD5E1', fontWeight: day.isTrain ? '600' : '400' }]} numberOfLines={1}>{day.isTrain ? w?.name : 'Descanso'}</Text>
                  {day.log?.extraSport && <Text style={styles.weekExtra}>+ {day.log.extraSport}</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {w?.dur && day.isTrain && <Text style={styles.weekDur}>{w.dur}</Text>}
                  {st === 'done' && <Text style={{ color: '#16A34A', fontWeight: '700' }}>✓</Text>}
                  {st === 'skipped' && <Text style={{ color: '#EF4444', fontWeight: '700' }}>✗</Text>}
                  {st === 'extra' && <Text style={{ color: BLUE.primary, fontWeight: '700' }}>🏅</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: BLUE.light }]}>
          <View style={styles.daysHeader}>
            <Text style={[styles.sectionTitle, { color: BLUE.primary, marginBottom: 0 }]}>TUS DÍAS DE ENTRENAMIENTO</Text>
            {!editingDays
              ? <TouchableOpacity onPress={() => { setTempDays(trainDays); setEditingDays(true); }} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
              : <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => setEditingDays(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTrainDays(tempDays); setEditingDays(false); }} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
            }
          </View>
          <View style={styles.daysRow}>
            {[0, 1, 2, 3, 4, 5, 6].map(dv => {
              const active = editingDays ? tempDays.includes(dv) : trainDays.includes(dv);
              return (
                <TouchableOpacity key={dv} onPress={() => editingDays && toggleTempDay(dv)}
                  style={[styles.dayChip, { backgroundColor: active ? BLUE.primary : '#E2E8F0' }]}>
                  <Text style={[styles.dayChipText, { color: active ? 'white' : '#94A3B8' }]}>{DAY_SHORT[dv]}</Text>
                  <Text style={{ fontSize: 12 }}>{active ? '💪' : '😴'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {editingDays && <Text style={styles.daysHint}>Toca para activar/desactivar · mín. 2, máx. 6</Text>}
        </View>
      </>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },
  tabRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 50, padding: 4, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 46, alignItems: 'center' },
  tabActive: { backgroundColor: '#1A56DB' },
  tabText: { fontSize: 13, color: '#94A3B8' },
  tabTextActive: { color: 'white', fontWeight: '700' },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  intensityBar: { height: 8, backgroundColor: '#DBEAFE', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  intensityFill: { height: '100%', backgroundColor: '#1A56DB', borderRadius: 4 },
  tip: { fontSize: 12, color: '#475569', fontStyle: 'italic' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sessionTag: { fontSize: 11, color: '#1A56DB', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  sessionName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  sessionDur: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexShrink: 0 },
  statusText: { fontSize: 12, fontWeight: '700' },
  exercises: { marginBottom: 14 },
  exercisesLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 8, letterSpacing: 0.5 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', padding: 9, borderRadius: 10, marginBottom: 4 },
  exNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(26,86,219,0.10)', justifyContent: 'center', alignItems: 'center', marginRight: 10, flexShrink: 0 },
  exNumText: { fontSize: 11, fontWeight: '700', color: '#1A56DB' },
  exName: { flex: 1, fontSize: 13, fontWeight: '500', color: '#1E293B' },
  exDetail: { fontSize: 12, color: '#1A56DB', fontWeight: '600', flexShrink: 0, marginLeft: 8 },
  logBtns: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  doneBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center' },
  doneBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  skipBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  skipBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  undoBtn: { padding: 9, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 8 },
  undoBtnText: { fontSize: 13, color: '#64748B' },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#F0FDF4', borderRadius: 10 },
  extraText: { fontSize: 13, color: '#166534', fontWeight: '500' },
  extraRemove: { color: '#94A3B8', fontSize: 18 },
  extraInput: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13 },
  addBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1A56DB', justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  dashedBtn: { padding: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1', alignItems: 'center' },
  dashedBtnText: { fontSize: 13, color: '#64748B' },
  restTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  restSub: { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center' },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
  weekDate: { width: 40, alignItems: 'center', flexShrink: 0 },
  weekDayLabel: { fontSize: 10, color: '#94A3B8' },
  weekDayNum: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 22 },
  weekWorkout: { fontSize: 13 },
  weekExtra: { fontSize: 11, color: '#1A56DB', marginTop: 1 },
  weekDur: { fontSize: 10, color: '#94A3B8' },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  editBtn: { borderWidth: 1, borderColor: '#1A56DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  editBtnText: { fontSize: 12, color: '#1A56DB' },
  cancelBtn: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  cancelBtnText: { fontSize: 12, color: '#64748B' },
  saveBtn: { backgroundColor: '#1A56DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  saveBtnText: { fontSize: 12, color: 'white', fontWeight: '600' },
  daysRow: { flexDirection: 'row', gap: 5, marginTop: 4 },
  dayChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', gap: 3 },
  dayChipText: { fontSize: 11, fontWeight: '600' },
  daysHint: { fontSize: 11, color: '#1A56DB', marginTop: 8, textAlign: 'center' },
});