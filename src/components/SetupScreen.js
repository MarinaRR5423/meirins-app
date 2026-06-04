import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import T from '../i18n/translations';

const LANG_OPTIONS = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'it', flag: '🇮🇹' },
];

export default function SetupScreen({ onDone, lang = 'es', onLangChange }) {
  const su = (T[lang] || T.es).setup;

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [modules, setModules] = useState(['cycle', 'nutrition', 'sport', 'sleep']);
  const [saving, setSaving] = useState(false);

  const toggleModule = (id) => {
    if (modules.includes(id)) {
      if (modules.length > 1) setModules(modules.filter(x => x !== id));
    } else {
      setModules([...modules, id]);
    }
  };

  const finish = async () => {
    setSaving(true);
    await onDone({
      name: name.trim(),
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      modules,
    });
    setSaving(false);
  };

  // ─── PASO 0 · Bienvenida ────────────────────────────────────────────────────
  if (step === 0) return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        {LANG_OPTIONS.map(l => (
          <TouchableOpacity key={l.code} onPress={() => onLangChange?.(l.code)}
            style={[styles.langBtn, lang === l.code && styles.langBtnActive]}>
            <Text style={styles.langFlag}>{l.flag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>Meirins</Text>
      <Text style={styles.tagline}>{su.tagline}</Text>
      <View style={styles.divider} />
      {su.features.map(f => (
        <View key={f} style={styles.feature}><Text style={styles.featureText}>{f}</Text></View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
        <Text style={styles.btnText}>{su.start}</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── PASO 1 · Datos personales ──────────────────────────────────────────────
  if (step === 1) return (
    <KeyboardAvoidingView style={styles.scrollContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(0)}><Text style={styles.back}>{su.back}</Text></TouchableOpacity>
        <Text style={styles.stepDots}><Text style={styles.dotActive}>●</Text> ● ●</Text>
        <Text style={styles.stepTitle}>{su.step1Title}</Text>
        <Text style={styles.stepSub}>{su.step1Sub}</Text>

        {/* Nombre — opcional */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{su.nameLabel || '¿Cómo te llamas?'} <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{su.nameOptional || '(opcional)'}</Text></Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={su.namePlaceholder || 'Tu nombre…'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="words"
          />
        </View>

        {[
          { label: su.ageLabel,    value: age,    set: setAge,    placeholder: su.agePh,    keyboard: 'numeric',      unit: su.ageUnit },
          { label: su.weightLabel, value: weight, set: setWeight, placeholder: su.weightPh, keyboard: 'decimal-pad',  unit: 'kg' },
          { label: su.heightLabel, value: height, set: setHeight, placeholder: su.heightPh, keyboard: 'numeric',      unit: 'cm' },
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

        <TouchableOpacity
          style={[styles.btn, (!age || !weight || !height) && styles.btnDisabled]}
          onPress={() => age && weight && height && setStep(2)}
          disabled={!age || !weight || !height}>
          <Text style={styles.btnText}>{su.next}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─── PASO 2 · Módulos ───────────────────────────────────────────────────────
  if (step === 2) return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.back}>{su.back}</Text></TouchableOpacity>
      <Text style={styles.stepDots}>● <Text style={styles.dotActive}>●</Text> ●</Text>
      <Text style={styles.stepTitle}>{su.modulesTitle}</Text>
      <Text style={styles.stepSub}>{su.modulesSub}</Text>

      {su.modulesOpts.map(opt => {
        const active = modules.includes(opt.id);
        return (
          <TouchableOpacity key={opt.id} onPress={() => toggleModule(opt.id)}
            style={[styles.optionCard, active && styles.optionCardActive]}>
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <View style={[styles.checkbox, active && styles.checkboxActive]}>
              {active && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.btn, (saving || modules.length === 0) && styles.btnDisabled]}
        onPress={finish}
        disabled={saving || modules.length === 0}>
        <Text style={styles.btnText}>{saving ? su.saving : su.create}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1F4A', alignItems: 'center', justifyContent: 'center', padding: 28 },
  langRow: { position: 'absolute', top: 56, right: 24, flexDirection: 'row', gap: 8 },
  langBtn: { padding: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.5)' },
  langFlag: { fontSize: 20 },
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
  back: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 },
  stepDots: { fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 6, marginBottom: 14 },
  dotActive: { color: 'white' },
  stepTitle: { fontFamily: 'serif', fontSize: 28, color: 'white', fontWeight: '700', marginBottom: 6 },
  stepSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 24 },
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
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxActive: { backgroundColor: 'white', borderColor: 'white' },
  checkmark: { color: '#1A56DB', fontSize: 14, fontWeight: '700' },
});
