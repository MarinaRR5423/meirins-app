import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useProfile = () => {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
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

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data && data.last_period) {
      setLP(data.last_period);
      setCL(data.cycle_length || 28);
      setTD(data.train_days || [1, 2, 4, 5]);
      setAge(data.age);
      setWeight(data.weight);
      setHeight(data.height);
      setActivityLevel(data.activity_level || 'moderate');
      setGoal(data.goal || 'lose_weight');
      setDietary(data.dietary_restrictions || []);
      setSetupDone(true);
    }
    setProfileLoaded(true);
  };

  useEffect(() => {
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

  const setLastPeriod = async (v) => { setLP(v); await saveProfile({ last_period: v }); };
  const setCycleLength = async (v) => { setCL(v); await saveProfile({ cycle_length: v }); };
  const setTrainDays = async (v) => { setTD(v); await saveProfile({ train_days: v }); };

  const saveAll = async ({ age: a, weight: w, height: h, activityLevel: al, goal: g, dietary: d, trainDays: td }) => {
    setAge(a); setWeight(w); setHeight(h);
    setActivityLevel(al); setGoal(g); setDietary(d); setTD(td);
    await saveProfile({
      age: a, weight: w, height: h,
      activity_level: al, goal: g,
      dietary_restrictions: d,
      train_days: td,
    });
  };

  const handleSetupDone = async ({ date, len, trainDays: td, age: a, weight: w, height: h, activityLevel: al, goal: g, dietary: d }) => {
    setLP(date); setCL(len); setTD(td);
    setAge(a); setWeight(w); setHeight(h);
    setActivityLevel(al); setGoal(g); setDietary(d);
    await supabase.from('profiles').upsert({
      id: user.id,
      last_period: date, cycle_length: len, train_days: td,
      age: a, weight: w, height: h,
      activity_level: al, goal: g, dietary_restrictions: d,
      updated_at: new Date().toISOString(),
    });
    setSetupDone(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLP(''); setCL(28); setTD([1, 2, 4, 5]);
    setAge(null); setWeight(null); setHeight(null);
  };

  return {
    authState, user, profileLoaded, setupDone,
    lastPeriod, cycleLength, trainDays,
    age, weight, height, activityLevel, goal, dietary,
    setLastPeriod, setCycleLength, setTrainDays,
    handleSetupDone, saveAll, signOut,
  };
};