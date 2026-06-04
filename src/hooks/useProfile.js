import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { syncNotifications } from '../utils/notifications';

export const useProfile = () => {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [programContent, setProgramContent] = useState(null); // { data_es, data_en, data_fr }
  const [setupDone, setSetupDone] = useState(false);
  const [lastPeriod, setLP] = useState('');
  const [cycleLength, setCL] = useState(28);
  const [trainDays, setTD] = useState([1, 2, 4, 5]);
  const [age, setAge] = useState(null);
  const [weight, setWeight] = useState(null);
  const [height, setHeight] = useState(null);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('lose_weight');
  const [dietary, setDietary] = useState([]);
  const [profileExtended, setProfileExtended] = useState(null);

  const profileOnboardingDone = !!(profileExtended && profileExtended.profileOnboardingComplete);
  const periodEnd = profileExtended?.periodEnd || null;
  const sleepLog  = profileExtended?.sleepLog  || [];

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      // Datos opcionales — pueden estar vacíos en el nuevo onboarding mínimo
      if (data.last_period) setLP(data.last_period);
      if (data.cycle_length) setCL(data.cycle_length);
      if (data.train_days)   setTD(data.train_days);
      if (data.activity_level) setActivityLevel(data.activity_level);
      if (data.goal)           setGoal(data.goal);
      if (data.dietary_restrictions) setDietary(data.dietary_restrictions);
      if (data.profile_extended)     setProfileExtended(data.profile_extended);
      // setupDone = true en cuanto existan los datos mínimos (edad)
      if (data.age) {
        setAge(data.age);
        setWeight(data.weight);
        setHeight(data.height);
        setSetupDone(true);
      }
    }
    setProfileLoaded(true);
  };

  // Load global program content (same for all users, all languages in one row)
  const loadProgramContent = async () => {
    const { data } = await supabase
      .from('program_content')
      .select('data_es, data_en, data_fr')
      .eq('id', 'marina')
      .single();
    if (data) setProgramContent(data);
  };

  useEffect(() => {
    // Program content is public — load it regardless of auth state
    loadProgramContent();

    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session) { setUser(session.user); setAuthState('authenticated'); loadProfile(session.user.id); }
      else { setAuthState('unauthenticated'); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setUser(session.user); setAuthState('authenticated'); loadProfile(session.user.id); }
      else { setUser(null); setAuthState('unauthenticated'); setSetupDone(false); setProfileLoaded(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveProfile = async (overrides = {}) => {
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      last_period: lastPeriod,
      cycle_length: cycleLength,
      train_days: trainDays,
      age, weight, height,
      activity_level: activityLevel,
      goal,
      dietary_restrictions: dietary,
      updated_at: new Date().toISOString(),
      ...overrides,
    });
  };

  const setLastPeriod = async (v) => {
    setLP(v);
    await saveProfile({ last_period: v });
    // Reprogramar aviso de ciclo si las notificaciones están activas
    const ns = profileExtended?.notifSettings;
    if (ns?.cycle !== false) {
      syncNotifications({
        lastPeriod:   v,
        cycleLength:  cycleLength,
        trainDays:    trainDays,
        notifSettings: ns || {},
      }, profileExtended?.language || 'es').catch(() => {});
    }
  };
  const setCycleLength = async (v) => { setCL(v); await saveProfile({ cycle_length: v }); };
  const setTrainDays = async (v) => { setTD(v); await saveProfile({ train_days: v }); };

  const saveAll = async ({ age: a, weight: w, height: h, activityLevel: al, goal: g, dietary: d, trainDays: td } = {}) => {
    // Solo actualiza los campos que se pasan (no resetea a null los que no se pasan)
    if (a != null) { setAge(a); }
    if (w != null) { setWeight(w); }
    if (h != null) { setHeight(h); }
    if (al != null) { setActivityLevel(al); }
    if (g  != null) { setGoal(g); }
    if (d  != null) { setDietary(d); }
    if (td != null) { setTD(td); }
    const overrides = {};
    if (a  != null) overrides.age             = a;
    if (w  != null) overrides.weight          = w;
    if (h  != null) overrides.height          = h;
    if (al != null) overrides.activity_level  = al;
    if (g  != null) overrides.goal            = g;
    if (d  != null) overrides.dietary_restrictions = d;
    if (td != null) overrides.train_days      = td;
    if (Object.keys(overrides).length) await saveProfile(overrides);
  };

  const handleSetupDone = async ({ name: n, age: a, weight: w, height: h, modules: m }) => {
    setAge(a); setWeight(w); setHeight(h);
    // Guardar nombre, módulos en profile_extended y marcar onboarding como completo
    const extended = { ...(profileExtended || {}), name: n || '', modules: m, profileOnboardingComplete: true };
    setProfileExtended(extended);
    await supabase.from('profiles').upsert({
      id: user.id,
      age: a, weight: w, height: h,
      // Valores por defecto — la usuaria los ajustará desde su perfil
      activity_level: 'moderate',
      goal: 'lose_weight',
      dietary_restrictions: [],
      train_days: [],
      profile_extended: extended,
      updated_at: new Date().toISOString(),
    });
    setSetupDone(true);
  };

  const saveProfileExtended = async (data) => {
    if (!user) return;
    const extended = { ...profileExtended, ...data };
    setProfileExtended(extended);
    await supabase.from('profiles').upsert({
      id: user.id,
      profile_extended: extended,
      updated_at: new Date().toISOString(),
    });
  };

  const setPeriodEnd = async (date) => {
    await saveProfileExtended({ periodEnd: date });
  };

  const logSleep = async (entry) => {
    // entry: { date: 'YYYY-MM-DD', hours: 7.5, quality: 3 }
    const existing = profileExtended?.sleepLog || [];
    const filtered = existing.filter(e => e.date !== entry.date);
    const updated  = [entry, ...filtered].slice(0, 60); // keep 60 days max
    await saveProfileExtended({ sleepLog: updated });
  };

  const logWeight = async (entry) => {
    // entry: { date: 'YYYY-MM-DD', weight: 65.2 }
    const existing = profileExtended?.weightLog || [];
    const filtered = existing.filter(e => e.date !== entry.date);
    const updated  = [entry, ...filtered]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 104); // keep ~2 years (weekly entries)
    await saveProfileExtended({ weightLog: updated });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLP(''); setCL(28); setTD([1, 2, 4, 5]);
    setAge(null); setWeight(null); setHeight(null);
    setProfileExtended(null);
  };

  return {
    authState, user, profileLoaded, setupDone,
    lastPeriod, cycleLength, trainDays,
    age, weight, height, activityLevel, goal, dietary,
    profileExtended, profileOnboardingDone,
    periodEnd, sleepLog,
    programContent,
    setLastPeriod, setCycleLength, setTrainDays,
    setPeriodEnd, logSleep, logWeight,
    handleSetupDone, saveAll, saveProfileExtended, signOut,
  };
};