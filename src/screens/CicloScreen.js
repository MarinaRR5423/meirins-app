import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PHASES } from '../data/phases';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF' };

export default function CicloScreen({ pi, setLastPeriod, setCycleLength }) {
  const [editing, setEditing] = useState(false);
  const [newLen, setNewLen] = useState(pi?.cycleLen || 28);
  const d = pi?.data;

  const today = new Date();
  const days = Array.from({ length: 60 }, (_, i) => {
    const dt = new Date();
    dt.setDate(today.getDate() - i);
    return dt.toISOString().split('T')[0];
  });

  const pDays = {
    menstrual: 'Días 1–5', follicular: 'Días 6–13',
    ovulation: 'Días 14–16', luteal: 'Días 17–' + (pi?.cycleLen || 28)
  };

  const r = 78, cx = 110, cy = 110, size = 220;
  const phF = [
    { key: 'menstrual', s: 0, e: 5 / 28 }, { key: 'follicular', s: 5 / 28, e: 13 / 28 },
    { key: 'ovulation', s: 13 / 28, e: 16 / 28 }, { key: 'luteal', s: 16 / 28, e: 1 }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.wheelContainer}>
          {phF.map(ph => {
            const a1 = ph.s * 2 * Math.PI - Math.PI / 2;
            const a2 = ph.e * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
            const isActive = ph.key === pi?.phase;
            return (
              <View key={ph.key} style={[styles.phaseArc, {
                position: 'absolute',
                backgroundColor: isActive ? PHASES[ph.key].color : '#E2E8F0',
              }]} />
            );
          })}
          <View style={styles.wheelCenter}>
            <Text style={styles.wheelLabel}>día del ciclo</Text>
            <Text style={styles.wheelDay}>{pi?.day}</Text>
          </View>
        </View>
        <Text style={[styles.phaseName, { color: d?.color }]}>{d?.emoji} Fase {d?.name}</Text>
        <Text style={styles.phaseTagline}>{d?.tagline} · {pi?.daysLeft} días restantes</Text>
      </View>

      {Object.entries(PHASES).map(([key, ph]) => {
        const isA = key === pi?.phase;
        return (
          <View key={key} style={[styles.card, isA && { borderWidth: 2, borderColor: ph.color }]}>
            <View style={styles.phaseRow}>
              <View>
                <Text style={[styles.phaseTitle, { color: isA ? ph.color : '#334155' }]}>{ph.emoji} {ph.name}</Text>
                <Text style={styles.phaseDays}>{pDays[key]}</Text>
              </View>
              {isA && <View style={[styles.badge, { backgroundColor: ph.color }]}><Text style={styles.badgeText}>HOY</Text></View>}
            </View>
            {isA && <Text style={styles.phaseDesc}>{ph.desc}</Text>}
          </View>
        );
      })}

      <View style={[styles.card, { borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1' }]}>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editBtn}>✏️ Actualizar fecha o duración del ciclo</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.editTitle}>Actualizar datos</Text>
            <Text style={styles.editLabel}>Inicio última regla</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {days.map(d => (
                <TouchableOpacity key={d} onPress={() => setLastPeriod(d)}
                  style={[styles.dateBtn, pi?.lastPeriod === d && styles.dateBtnActive]}>
                  <Text style={styles.dateBtnText}>
                    {new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.editLabel}>Duración: <Text style={{ fontWeight: '700' }}>{newLen} días</Text></Text>
            <View style={styles.lenRow}>
              {[21, 24, 26, 28, 30, 32, 35].map(l => (
                <TouchableOpacity key={l} onPress={() => setNewLen(l)}
                  style={[styles.lenBtn, newLen === l && styles.lenBtnActive]}>
                  <Text style={[styles.lenBtnText, newLen === l && styles.lenBtnTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => { setCycleLength(newLen); setEditing(false); }}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  content: { padding: 14, paddingTop: 60, paddingBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  wheelContainer: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  wheelCenter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  wheelLabel: { fontSize: 10, color: '#94A3B8', marginBottom: 2 },
  wheelDay: { fontSize: 32, fontWeight: '700', color: '#1E293B' },
  phaseArc: { width: 160, height: 160, borderRadius: 80, position: 'absolute' },
  phaseName: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  phaseTagline: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseTitle: { fontSize: 14, fontWeight: '600' },
  phaseDays: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  phaseDesc: { fontSize: 12, color: '#475569', marginTop: 8, lineHeight: 20 },
  editBtn: { fontSize: 13, color: '#64748B', textAlign: 'center', padding: 4 },
  editTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  editLabel: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  dateBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8, alignItems: 'center' },
  dateBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  dateBtnText: { fontSize: 12, color: '#475569' },
  lenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lenBtn: { padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', minWidth: 40, alignItems: 'center' },
  lenBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  lenBtnText: { fontSize: 13, color: '#475569' },
  lenBtnTextActive: { color: 'white', fontWeight: '700' },
  editBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#64748B' },
  saveBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#1A56DB', alignItems: 'center' },
  saveText: { fontSize: 14, color: 'white', fontWeight: '600' },
});