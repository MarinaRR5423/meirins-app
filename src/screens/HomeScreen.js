import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PHASES } from '../data/phases';

const BLUE = { primary: '#1A56DB', light: '#EFF6FF', mid: 'rgba(26,86,219,0.10)' };
function calcCalories(profile, phase) {
  if (!profile?.weight || !profile?.height || !profile?.age) return null;
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  const actMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const act = actMap[profile.activityLevel] || 1.55;
  const tdee = Math.round(bmr * act);
  const goalMap = { lose: -300, maintain: 0, gain: 300 };
  const adj = goalMap[profile.goal] || 0;
  const phaseAdj = { menstrual: -200, follicular: -300, ovulation: -250, luteal: 100 };
  const total = tdee + adj + (phaseAdj[phase] || 0);
  return { tdee, total: Math.max(1200, total) };
}
export default function HomeScreen({ pi, profile }) {
  const d = pi?.data;
  const navigation = useNavigation();
  const cals = calcCalories(profile, pi?.phase);
  const pKeys = ['menstrual', 'follicular', 'ovulation', 'luteal'];
  const pR = { menstrual: [1, 5], follicular: [6, 13], ovulation: [14, 16], luteal: [17, pi?.cycleLen || 28] };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Meirins · hoy</Text>
          <Text style={styles.headerTitle}>{d?.emoji} Fase {d?.name}</Text>
        </View>
        <View style={styles.dayBadge}>
          <Text style={styles.dayNum}>{pi?.day}</Text>
          <Text style={styles.dayLabel}>DÍA DEL CICLO</Text>
        </View>
      </View>
      <View style={styles.headerTag}>
        <Text style={styles.headerTagText}>{d?.tagline} · Quedan <Text style={{ fontWeight: '700' }}>{pi?.daysLeft} días</Text></Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Tu ciclo</Text>
            <Text style={styles.cardMuted}>Día {pi?.day} de {pi?.cycleLen}</Text>
          </View>
          <View style={styles.progressBar}>
            {pKeys.map(ph => {
              const [s, e] = pR[ph];
              const w = ((e - s + 1) / (pi?.cycleLen || 28)) * 100;
              return <View key={ph} style={{ width: `${w}%`, backgroundColor: ph === pi?.phase ? PHASES[ph].color : PHASES[ph].mid }} />;
            })}
          </View>
          <View style={styles.phaseLabels}>
            {pKeys.map(ph => <Text key={ph} style={[styles.phaseLabel, { color: ph === pi?.phase ? PHASES[ph].color : '#CBD5E1', fontWeight: ph === pi?.phase ? '700' : '400' }]}>{PHASES[ph].emoji} {PHASES[ph].name.slice(0, 3)}</Text>)}
          </View>
          <View style={[styles.tagBg, { backgroundColor: d?.mid }]}>
            <Text style={[styles.tagText, { color: d?.color }]}>{d?.tagline}</Text>
            <Text style={styles.tagMuted}> · Quedan <Text style={{ fontWeight: '700' }}>{pi?.daysLeft} día{pi?.daysLeft !== 1 ? 's' : ''}</Text></Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, styles.gridCard]}>
            <Text style={styles.cardLabel}>INTENSIDAD HOY</Text>
            <Text style={[styles.intensity, { color: d?.color }]}>{d?.intensity}</Text>
            <View style={styles.intensityBar}>
              <View style={[styles.intensityFill, { width: `${d?.intensityPct}%`, backgroundColor: d?.color }]} />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Gimnasio')} style={[styles.card, styles.gridCard]}>
  <Text style={styles.cardLabel}>SESIÓN HOY</Text>
  <Text style={{ fontSize: 22 }}>{d?.week[0].ico}</Text>
  <Text style={styles.sessionName}>{d?.week[0].name}</Text>
  {d?.week[0].dur ? <Text style={[styles.sessionDur, { color: BLUE.primary }]}>{d?.week[0].dur}</Text> : null}
</TouchableOpacity>
        </View>
{cals && (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>🔥 Calorías objetivo hoy</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: d?.color }}>{cals.total}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>kcal · objetivo fase</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#475569' }}>{cals.tdee}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>kcal · mantenimiento</Text>
      </View>
      <View style={{ backgroundColor: d?.mid, borderRadius: 10, padding: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: d?.color }}>{d?.kcal?.split('·')[0]}</Text>
      </View>
    </View>
  </View>
)}
        <TouchableOpacity onPress={() => navigation.navigate('Nutrición')} style={styles.card}>
  <Text style={styles.sectionTitle}>🥗 Nutrición de hoy</Text>
  <View style={styles.tags}>
    {d?.focus.map(f => <View key={f} style={styles.tag}><Text style={styles.tagLabel}>{f}</Text></View>)}
  </View>
  <View style={[styles.highlight, { borderLeftColor: BLUE.primary }]}>
    <Text style={styles.highlightTitle}>{d?.meals[0].ico} {d?.meals[0].title}</Text>
    <Text style={styles.highlightSub}>{d?.meals[0].items.join(' · ')}</Text>
  </View>
</TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💡 Consejo de la fase</Text>
          <Text style={styles.tip}>"{d?.tip}"</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FA' },
  header: { backgroundColor: '#1A56DB', padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: { fontSize: 24, color: 'white', fontWeight: '700', marginTop: 4 },
  dayBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dayNum: { fontSize: 28, color: 'white', fontWeight: '700', lineHeight: 32 },
  dayLabel: { fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5, marginTop: 2 },
  headerTag: { backgroundColor: '#1A56DB', paddingHorizontal: 20, paddingBottom: 20 },
  headerTagInner: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12 },
  headerTagText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontStyle: 'italic' },
  scroll: { flex: 1 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  cardMuted: { fontSize: 12, color: '#94A3B8' },
  progressBar: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', height: 10, marginBottom: 10 },
  phaseLabels: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  phaseLabel: { fontSize: 9 },
  tagBg: { borderRadius: 10, padding: 10 },
  tagText: { fontSize: 13, fontWeight: '700' },
  tagMuted: { fontSize: 13, color: '#475569' },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridCard: { flex: 1, margin: 0 },
  intensity: { fontSize: 20, fontWeight: '700', marginVertical: 4 },
  intensityBar: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  intensityFill: { height: '100%', borderRadius: 2 },
  sessionName: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginTop: 4 },
  sessionDur: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: 'rgba(26,86,219,0.10)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagLabel: { fontSize: 11, color: '#1A56DB', fontWeight: '500' },
  highlight: { borderLeftWidth: 3, paddingLeft: 12 },
  highlightTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  highlightSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  tip: { fontSize: 13, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
});