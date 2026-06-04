/**
 * TabSetupCard — tarjeta inline que aparece en la parte superior de una pestaña
 * cuando faltan datos necesarios para esa pestaña.
 * Se pliega/despliega y desaparece cuando el usuario guarda los datos.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, SafeAreaView, Platform,
} from 'react-native';
import T from '../i18n/translations';

const BLUE = '#1A56DB';
const BG   = '#0F1F4A';

// ─── Componentes internos ─────────────────────────────────────────────────────

function OptionCard({ label, desc, icon, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={[s.optCard, selected && s.optCardActive]} activeOpacity={0.8}>
      {icon ? <Text style={s.optIcon}>{icon}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[s.optLabel, selected && s.optLabelActive]}>{label}</Text>
        {desc ? <Text style={s.optDesc}>{desc}</Text> : null}
      </View>
      {selected && <Text style={s.check}>✓</Text>}
    </TouchableOpacity>
  );
}

function Chip({ label, selected, onPress, danger }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={[s.chip, selected && (danger ? s.chipDanger : s.chipActive)]}>
      <Text style={[s.chipLabel, selected && s.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DayPicker({ trainDays, onToggle, dayLetters }) {
  return (
    <View style={s.daysRow}>
      {[0, 1, 2, 3, 4, 5, 6].map(d => {
        const on = trainDays.includes(d);
        return (
          <TouchableOpacity key={d} onPress={() => onToggle(d)}
            style={[s.dayBtn, on && s.dayBtnActive]}>
            <Text style={[s.dayLetter, on && s.dayLetterActive]}>{dayLetters[d]}</Text>
            <Text style={{ fontSize: 12, marginTop: 2 }}>{on ? '💪' : '😴'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Modal de contenido ───────────────────────────────────────────────────────

function SetupModal({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.modal}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── CICLO ────────────────────────────────────────────────────────────────────
export function CicloSetupCard({ lang, lastPeriod, setLastPeriod, cycleLength, setCycleLength, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const [open, setOpen]             = useState(false);
  const [len, setLen]               = useState(cycleLength || 28);
  const [selDate, setSelDate]       = useState(lastPeriod || null);
  const [lifeStage, setLifeStage]   = useState(profileExtended?.lifeStage || '');
  const [conditions, setConditions] = useState(profileExtended?.conditions || []);
  const [contraUse, setContraUse]   = useState(profileExtended?.contraUse ?? null);   // true | false | null
  const [contraType, setContraType] = useState(profileExtended?.contraType || '');
  const [saving, setSaving]         = useState(false);

  const today = new Date();
  const days  = Array.from({ length: 60 }, (_, i) => {
    const d = new Date(); d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const toggleCondition = (v) =>
    conditions.includes(v) ? setConditions(conditions.filter(x => x !== v)) : setConditions([...conditions, v]);

  const save = async () => {
    if (!selDate) return;
    setSaving(true);
    await setLastPeriod(selDate);
    await setCycleLength(len);
    if (saveProfileExtended) {
      await saveProfileExtended({ lifeStage, conditions, contraUse, contraType });
    }
    setSaving(false);
    setOpen(false);
  };

  if (lastPeriod) return null;

  const txt = {
    bannerTitle: { es: 'Configura tu ciclo', en: 'Configure your cycle', fr: 'Configure ton cycle', it: 'Configura il tuo ciclo' }[lang] || 'Configura tu ciclo',
    bannerSub:   { es: 'Fecha de inicio y salud menstrual', en: 'Start date & menstrual health', fr: 'Date de début et santé menstruelle', it: 'Data di inizio e salute mestruale' }[lang] || 'Fecha de inicio y salud menstrual',
    modalTitle:  { es: '🌙 Tu ciclo', en: '🌙 Your cycle', fr: '🌙 Ton cycle', it: '🌙 Il tuo ciclo' }[lang] || '🌙 Tu ciclo',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  const canSave = !!selDate;

  return (
    <>
      <TouchableOpacity style={s.banner} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}>🌙</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerTitle}>{txt.bannerTitle}</Text>
          <Text style={s.bannerSub}>{txt.bannerSub}</Text>
        </View>
        <Text style={s.bannerArrow}>→</Text>
      </TouchableOpacity>

      <SetupModal visible={open} onClose={() => setOpen(false)} title={txt.modalTitle}>

        {/* ── Fecha de inicio ── */}
        <Text style={s.secLabel}>{p.cycle?.lastPeriodLabel?.toUpperCase() || 'INICIO ÚLTIMO CICLO'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {days.map(d => {
            const active = selDate === d;
            return (
              <TouchableOpacity key={d} onPress={() => setSelDate(d)}
                style={[s.dateBtn, active && s.dateBtnActive]}>
                <Text style={[s.dateBtnTxt, active && s.dateBtnTxtActive]}>
                  {new Date(d + 'T12:00:00').toLocaleDateString(p.setup?.dateLocale || 'es-ES', { day: 'numeric', month: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Duración del ciclo ── */}
        <Text style={s.secLabel}>{(p.setup?.durationLabel || 'DURACIÓN:').toUpperCase()} <Text style={{ color: 'white', fontWeight: '700' }}>{len} {p.setup?.days || 'días'}</Text></Text>
        <View style={[s.lenRow, { marginBottom: 24 }]}>
          {[21, 24, 26, 28, 30, 32, 35].map(l => (
            <TouchableOpacity key={l} onPress={() => setLen(l)} style={[s.lenBtn, len === l && s.lenBtnActive]}>
              <Text style={[s.lenTxt, len === l && s.lenTxtActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Etapa vital ── */}
        {ob?.lifeStages && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.lifeStageLabel}</Text>
          {ob.lifeStages.map(o => (
            <OptionCard key={o.v} label={o.l} desc={o.d} selected={lifeStage === o.v} onPress={() => setLifeStage(o.v)} />
          ))}
          {lifeStage === 'pregnant' && ob.pregnantBanner &&
            <Text style={s.pregnantBanner}>{ob.pregnantBanner}</Text>}
        </>}

        {/* ── Condiciones ── */}
        {ob?.conditions && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.conditionsLabel}</Text>
          <View style={s.chips}>
            {ob.conditions.map(o => (
              <Chip key={o.v} label={o.l} selected={conditions.includes(o.v)} onPress={() => toggleCondition(o.v)} />
            ))}
          </View>
        </>}

        {/* ── Anticoncepción ── */}
        {ob?.contraLabel && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.contraLabel}</Text>
          <Text style={s.secSub}>{ob.contraQuestion}</Text>
          <View style={s.yesNoRow}>
            <TouchableOpacity style={[s.yesNoBtn, contraUse === true  && s.yesNoBtnActive]} onPress={() => setContraUse(true)}>
              <Text style={[s.yesNoTxt, contraUse === true  && s.yesNoTxtActive]}>{txt.yesLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.yesNoBtn, contraUse === false && s.yesNoBtnActive]} onPress={() => { setContraUse(false); setContraType(''); }}>
              <Text style={[s.yesNoTxt, contraUse === false && s.yesNoTxtActive]}>{txt.noLabel}</Text>
            </TouchableOpacity>
          </View>
          {contraUse === true && ob.contraOptions && <>
            <View style={[s.chips, { marginTop: 10 }]}>
              {ob.contraOptions.map(o => (
                <Chip key={o.v} label={o.l} selected={contraType === o.v} onPress={() => setContraType(o.v)} />
              ))}
            </View>
          </>}
        </>}

        <TouchableOpacity style={[s.saveBtn, (!canSave || saving) && { opacity: 0.45 }]} onPress={save} disabled={!canSave || saving}>
          <Text style={s.saveBtnTxt}>{saving ? '…' : (p.common?.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── CICLO HEALTH (secundaria, para usuarios con fecha pero sin datos de salud) ──
export function CicloHealthCard({ lang, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const [open, setOpen]             = useState(false);
  const [lifeStage, setLifeStage]   = useState(profileExtended?.lifeStage || '');
  const [conditions, setConditions] = useState(profileExtended?.conditions || []);
  const [contraUse, setContraUse]   = useState(profileExtended?.contraUse ?? null);
  const [contraType, setContraType] = useState(profileExtended?.contraType || '');
  const [saving, setSaving]         = useState(false);

  if (profileExtended?.lifeStage) return null;

  const toggleCondition = (v) =>
    conditions.includes(v) ? setConditions(conditions.filter(x => x !== v)) : setConditions([...conditions, v]);

  const save = async () => {
    setSaving(true);
    await saveProfileExtended({ lifeStage, conditions, contraUse, contraType });
    setSaving(false);
    setOpen(false);
  };

  const txt = {
    bannerTitle: { es: 'Tu salud menstrual', en: 'Your menstrual health', fr: 'Ta santé menstruelle', it: 'La tua salute mestruale' }[lang] || 'Tu salud menstrual',
    bannerSub:   { es: 'Condiciones, síndromes y anticoncepción', en: 'Conditions, syndromes & contraception', fr: 'Conditions, syndromes et contraception', it: 'Condizioni, sindromi e contraccezione' }[lang] || 'Condiciones, síndromes y anticoncepción',
    modalTitle:  { es: '🩺 Salud menstrual', en: '🩺 Menstrual health', fr: '🩺 Santé menstruelle', it: '🩺 Salute mestruale' }[lang] || '🩺 Salud menstrual',
    yesLabel:    ob?.yes  || 'Sí',
    noLabel:     ob?.no   || 'No',
  };

  return (
    <>
      <TouchableOpacity style={[s.banner, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}>🩺</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.bannerTitle, { color: '#9F1239' }]}>{txt.bannerTitle}</Text>
          <Text style={[s.bannerSub, { color: '#FB7185' }]}>{txt.bannerSub}</Text>
        </View>
        <Text style={[s.bannerArrow, { color: '#9F1239' }]}>→</Text>
      </TouchableOpacity>

      <SetupModal visible={open} onClose={() => setOpen(false)} title={txt.modalTitle}>

        {ob?.lifeStages && <>
          <Text style={s.secLabel}>{ob.lifeStageLabel}</Text>
          {ob.lifeStages.map(o => (
            <OptionCard key={o.v} label={o.l} desc={o.d} selected={lifeStage === o.v} onPress={() => setLifeStage(o.v)} />
          ))}
          {lifeStage === 'pregnant' && ob.pregnantBanner &&
            <Text style={s.pregnantBanner}>{ob.pregnantBanner}</Text>}
        </>}

        {ob?.conditions && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.conditionsLabel}</Text>
          <View style={s.chips}>
            {ob.conditions.map(o => (
              <Chip key={o.v} label={o.l} selected={conditions.includes(o.v)} onPress={() => toggleCondition(o.v)} />
            ))}
          </View>
        </>}

        {ob?.contraLabel && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.contraLabel}</Text>
          <Text style={s.secSub}>{ob.contraQuestion}</Text>
          <View style={s.yesNoRow}>
            <TouchableOpacity style={[s.yesNoBtn, contraUse === true  && s.yesNoBtnActive]} onPress={() => setContraUse(true)}>
              <Text style={[s.yesNoTxt, contraUse === true  && s.yesNoTxtActive]}>{txt.yesLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.yesNoBtn, contraUse === false && s.yesNoBtnActive]} onPress={() => { setContraUse(false); setContraType(''); }}>
              <Text style={[s.yesNoTxt, contraUse === false && s.yesNoTxtActive]}>{txt.noLabel}</Text>
            </TouchableOpacity>
          </View>
          {contraUse === true && ob.contraOptions && <>
            <View style={[s.chips, { marginTop: 10 }]}>
              {ob.contraOptions.map(o => (
                <Chip key={o.v} label={o.l} selected={contraType === o.v} onPress={() => setContraType(o.v)} />
              ))}
            </View>
          </>}
        </>}

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnTxt}>{saving ? '…' : (p.common?.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── NUTRICIÓN ────────────────────────────────────────────────────────────────
export function NutriSetupCard({ lang, profileExtended, saveAll, saveProfileExtended, activityLevel, goal, dietary }) {
  const p    = T[lang] || T.es;
  const ob   = p.onboarding;
  const su   = p.setup;

  // ── Todos los hooks ANTES de cualquier return condicional ──────────────────
  const [open, setOpen]                 = useState(false);
  const [localGoal, setLocalGoal]       = useState(goal || 'lose_weight');
  const [localActivity, setLocalAct]    = useState(activityLevel || 'moderate');
  const [localDiet, setLocalDiet]       = useState(profileExtended?.diet || '');
  const [localAllergies, setAllergies]  = useState(profileExtended?.allergies || []);
  const [localDislikes, setDislikes]    = useState(profileExtended?.foodDislikes || []);
  const [localCooking, setCooking]      = useState(profileExtended?.cookingTime || '');
  const [saving, setSaving]             = useState(false);

  // Ya tiene datos completos de nutrición → no mostrar banner
  if (profileExtended?.diet) return null;

  const toggleArr = (arr, set, val) =>
    arr.includes(val) ? set(arr.filter(x => x !== val)) : set([...arr, val]);

  const save = async () => {
    setSaving(true);
    await saveAll({ activityLevel: localActivity, goal: localGoal });
    await saveProfileExtended({ diet: localDiet, allergies: localAllergies, foodDislikes: localDislikes, cookingTime: localCooking });
    setSaving(false);
    setOpen(false);
  };

  const GOAL_OPTS = [
    { id: 'lose_weight', emoji: '⚡', label: p.goals.lose_weight },
    { id: 'maintain',    emoji: '⚖️', label: p.goals.maintain },
    { id: 'gain_muscle', emoji: '💪', label: p.goals.gain_muscle },
  ];
  const ACT_OPTS = [
    { id: 'sedentary', emoji: '🛋️', label: p.activity.sedentary },
    { id: 'light',     emoji: '🚶', label: p.activity.light },
    { id: 'moderate',  emoji: '🏃', label: p.activity.moderate },
    { id: 'active',    emoji: '🏋️', label: p.activity.active },
  ];

  return (
    <>
      <TouchableOpacity style={[s.banner, { borderColor: '#22C55E22', backgroundColor: '#F0FDF4' }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}>🥗</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.bannerTitle, { color: '#166534' }]}>{lang === 'en' ? 'Set up your nutrition' : lang === 'fr' ? 'Configure ta nutrition' : lang === 'it' ? 'Configura la tua nutrizione' : 'Configura tu nutrición'}</Text>
          <Text style={[s.bannerSub, { color: '#4ADE80' }]}>{lang === 'en' ? 'Goal, diet type and allergies' : lang === 'fr' ? 'Objectif, régime et allergies' : lang === 'it' ? 'Obiettivo, dieta e allergie' : 'Objetivo, tipo de dieta y alergias'}</Text>
        </View>
        <Text style={[s.bannerArrow, { color: '#166534' }]}>→</Text>
      </TouchableOpacity>

      <SetupModal visible={open} onClose={() => setOpen(false)}
        title={lang === 'en' ? '🥗 Nutrition setup' : lang === 'fr' ? '🥗 Nutrition' : lang === 'it' ? '🥗 Nutrizione' : '🥗 Tu nutrición'}>

        <Text style={s.secLabel}>{(p.profile.objective || 'OBJETIVO').toUpperCase()}</Text>
        {GOAL_OPTS.map(o => <OptionCard key={o.id} icon={o.emoji} label={o.label} selected={localGoal === o.id} onPress={() => setLocalGoal(o.id)} />)}

        <Text style={[s.secLabel, { marginTop: 20 }]}>{(p.profile.activityLevel || 'ACTIVIDAD').toUpperCase()}</Text>
        {ACT_OPTS.map(o => <OptionCard key={o.id} icon={o.emoji} label={o.label} selected={localActivity === o.id} onPress={() => setLocalAct(o.id)} />)}

        {ob?.diets && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.dietLabel}</Text>
          {ob.diets.map(o => <OptionCard key={o.v} icon={o.ico} label={o.l} desc={o.d} selected={localDiet === o.v} onPress={() => setLocalDiet(o.v)} />)}
        </>}

        {ob?.allergies && <>
          <Text style={[s.secLabel, { marginTop: 20, color: '#FCA5A5' }]}>{ob.allergyLabel}</Text>
          <View style={s.chips}>
            {ob.allergies.map(o => <Chip key={o.v} label={o.l} danger selected={localAllergies.includes(o.v)} onPress={() => toggleArr(localAllergies, setAllergies, o.v)} />)}
          </View>
        </>}

        {ob?.dislikes && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.dislikesLabel}</Text>
          <View style={s.chips}>
            {ob.dislikes.map(o => <Chip key={o.v} label={o.l} selected={localDislikes.includes(o.v)} onPress={() => toggleArr(localDislikes, setDislikes, o.v)} />)}
          </View>
        </>}

        {ob?.cooking && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.cookingLabel}</Text>
          {ob.cooking.map(o => <OptionCard key={o.v} label={o.l} selected={localCooking === o.v} onPress={() => setCooking(o.v)} />)}
        </>}

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnTxt}>{saving ? '…' : (p.common.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── GIMNASIO ─────────────────────────────────────────────────────────────────
export function GymSetupCard({ lang, trainDays, setTrainDays, profileExtended, saveProfileExtended }) {
  const p  = T[lang] || T.es;
  const ob = p.onboarding;
  const DAY_LETTERS = p.dayLetters || ['D','L','M','X','J','V','S'];

  const [open, setOpen]                 = useState(false);
  const [localDays, setLocalDays]       = useState(trainDays?.length > 0 ? trainDays : []);
  const [localFitness, setLocalFitness] = useState(profileExtended?.fitnessLevel || '');
  const [localGym, setLocalGym]         = useState(profileExtended?.gymAccess || '');
  const [saving, setSaving]             = useState(false);

  // Se oculta una vez que la usuaria ha guardado la configuración (incluso con 0 días)
  if (profileExtended?.gymSetupDone) return null;

  const toggleDay = (d) => {
    if (localDays.includes(d)) {
      setLocalDays(localDays.filter(x => x !== d));   // sin mínimo — puede quedar vacío
    } else {
      if (localDays.length < 6) setLocalDays([...localDays, d].sort());
    }
  };

  const save = async () => {
    setSaving(true);
    await setTrainDays(localDays);
    await saveProfileExtended({ fitnessLevel: localFitness, gymAccess: localGym, gymSetupDone: true });
    setSaving(false);
    setOpen(false);
  };

  const noTrainingLabel = { es: 'Sin días fijos', en: 'No fixed days', fr: 'Pas de jours fixes', it: 'Nessun giorno fisso' }[lang] || 'Sin días fijos';
  const maxLabel        = { es: 'Máximo 6 días', en: 'Maximum 6 days', fr: 'Maximum 6 jours', it: 'Massimo 6 giorni' }[lang] || 'Máximo 6 días';

  return (
    <>
      <TouchableOpacity style={[s.banner, { borderColor: '#6366F122', backgroundColor: '#EEF2FF' }]} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.bannerEmoji}>🏋️</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.bannerTitle, { color: '#312E81' }]}>{lang === 'en' ? 'Set up your training' : lang === 'fr' ? 'Configure ton entraînement' : lang === 'it' ? 'Configura il tuo allenamento' : 'Configura tu entrenamiento'}</Text>
          <Text style={[s.bannerSub, { color: '#818CF8' }]}>{lang === 'en' ? 'Days, level and location' : lang === 'fr' ? 'Jours, niveau et lieu' : lang === 'it' ? 'Giorni, livello e luogo' : 'Días, nivel y lugar'}</Text>
        </View>
        <Text style={[s.bannerArrow, { color: '#312E81' }]}>→</Text>
      </TouchableOpacity>

      <SetupModal visible={open} onClose={() => setOpen(false)}
        title={lang === 'en' ? '🏋️ Training setup' : lang === 'fr' ? '🏋️ Entraînement' : lang === 'it' ? '🏋️ Allenamento' : '🏋️ Tu entrenamiento'}>

        <Text style={s.secLabel}>{(p.setup?.step6Title || '¿CUÁNDO ENTRENAS?').toUpperCase()}</Text>
        <Text style={s.secSub}>{maxLabel}</Text>
        <DayPicker trainDays={localDays} onToggle={toggleDay} dayLetters={DAY_LETTERS} />

        {/* Opción "sin días fijos" */}
        <TouchableOpacity
          style={[s.noTrainingBtn, localDays.length === 0 && s.noTrainingBtnActive]}
          onPress={() => setLocalDays([])}
        >
          <Text style={[s.noTrainingTxt, localDays.length === 0 && s.noTrainingTxtActive]}>
            {localDays.length === 0 ? '✓ ' : ''}{noTrainingLabel}
          </Text>
        </TouchableOpacity>

        {ob?.fitness && <>
          <Text style={[s.secLabel, { marginTop: 24 }]}>{ob.fitnessLabel}</Text>
          {ob.fitness.map(o => <OptionCard key={o.v} icon={o.ico} label={o.l} desc={o.d} selected={localFitness === o.v} onPress={() => setLocalFitness(o.v)} />)}
        </>}

        {ob?.gymOptions && <>
          <Text style={[s.secLabel, { marginTop: 20 }]}>{ob.gymLabel}</Text>
          {ob.gymOptions.map(o => <OptionCard key={o.v} icon={o.ico} label={o.l} selected={localGym === o.v} onPress={() => setLocalGym(o.v)} />)}
        </>}

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <Text style={s.saveBtnTxt}>{saving ? '…' : (p.common.save || 'Guardar')}</Text>
        </TouchableOpacity>
      </SetupModal>
    </>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Banner inline
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE',
  },
  bannerEmoji: { fontSize: 28 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#1E3A8A', marginBottom: 2 },
  bannerSub:   { fontSize: 12, color: '#3B82F6' },
  bannerArrow: { fontSize: 18, color: '#1E3A8A', fontWeight: '700' },

  // Modal
  modal:       { flex: 1, backgroundColor: BG },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: 'white' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  closeTxt:    { color: 'white', fontSize: 14, fontWeight: '600' },
  modalBody:   { padding: 20, paddingBottom: 60 },

  // Section
  secLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  secSub:   { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 },

  // Option card
  optCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  optCardActive: { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'white' },
  optIcon:       { fontSize: 22, flexShrink: 0 },
  optLabel:      { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  optLabelActive:{ color: 'white' },
  optDesc:       { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  check:         { fontSize: 14, color: 'white', fontWeight: '700' },

  // Chips
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  chipActive:     { backgroundColor: 'white', borderColor: 'white' },
  chipDanger:     { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  chipLabel:      { fontSize: 13, color: 'white', fontWeight: '500' },
  chipLabelActive:{ color: '#1A56DB' },

  // Day picker
  daysRow:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dayBtn:        { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  dayBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  dayLetter:     { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  dayLetterActive:{ color: '#1A56DB' },

  // Date buttons
  dateBtn:       { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginRight: 8, alignItems: 'center' },
  dateBtnActive: { backgroundColor: 'white' },
  dateBtnTxt:    { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  dateBtnTxtActive: { color: '#1A56DB', fontWeight: '700' },

  // Cycle length
  lenRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  lenBtn:        { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', minWidth: 44, alignItems: 'center' },
  lenBtnActive:  { backgroundColor: 'white' },
  lenTxt:        { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  lenTxtActive:  { color: '#1A56DB', fontWeight: '700' },

  // Sin días fijos
  noTrainingBtn:       { marginTop: 10, marginBottom: 4, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  noTrainingBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.5)' },
  noTrainingTxt:       { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  noTrainingTxtActive: { color: 'white', fontWeight: '600' },

  // Save button
  saveBtn:    { marginTop: 28, padding: 16, borderRadius: 50, backgroundColor: 'white', alignItems: 'center' },
  saveBtnTxt: { color: '#1A56DB', fontWeight: '700', fontSize: 16 },

  // Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },

  // Pregnant banner
  pregnantBanner: { fontSize: 13, color: '#FDE68A', backgroundColor: 'rgba(253,230,138,0.12)', borderRadius: 10, padding: 12, marginTop: 8, marginBottom: 4, lineHeight: 18 },

  // Yes/No toggle
  yesNoRow:        { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 6 },
  yesNoBtn:        { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center' },
  yesNoBtnActive:  { backgroundColor: 'white', borderColor: 'white' },
  yesNoTxt:        { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  yesNoTxtActive:  { color: '#1A56DB' },
});
