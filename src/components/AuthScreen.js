import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError('Completa todos los campos');
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message);
  };

  const handleRegister = async () => {
    if (!email || !password) return setError('Completa todos los campos');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) setError(err.message);
    else setConfirmed(true);
  };

  if (confirmed) return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📬</Text>
      <Text style={styles.title}>Revisa tu email</Text>
      <Text style={styles.subtitle}>Hemos enviado un enlace de confirmación a{'\n'}<Text style={{ fontWeight: '700' }}>{email}</Text></Text>
      <TouchableOpacity style={styles.btn} onPress={() => { setConfirmed(false); setMode('login'); }}>
        <Text style={styles.btnText}>Ir al login →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.title}>Meirins</Text>
      <Text style={styles.subtitle}>{mode === 'login' ? 'Bienvenida de nuevo' : 'Crea tu cuenta'}</Text>

      <View style={styles.toggle}>
        {[{ id: 'login', l: 'Iniciar sesión' }, { id: 'register', l: 'Registrarse' }].map(t => (
          <TouchableOpacity key={t.id} style={[styles.toggleBtn, mode === t.id && styles.toggleActive]}
            onPress={() => { setMode(t.id); setError(''); }}>
            <Text style={[styles.toggleText, mode === t.id && styles.toggleTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor="rgba(255,255,255,0.4)"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.4)"
        value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
        onPress={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Cargando...' : mode === 'login' ? 'Entrar →' : 'Crear cuenta →'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1F4A', alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji: { fontSize: 56, marginBottom: 10 },
  title: { fontFamily: 'serif', fontSize: 32, color: 'white', fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 30, padding: 3, marginBottom: 20, width: '100%' },
  toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 26, alignItems: 'center' },
  toggleActive: { backgroundColor: 'white' },
  toggleText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  toggleTextActive: { color: '#1A56DB', fontWeight: '700' },
  input: { width: '100%', padding: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 16, marginBottom: 12 },
  error: { color: '#FCA5A5', fontSize: 13, marginTop: 8, textAlign: 'center' },
  btn: { width: '100%', padding: 15, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', marginTop: 16 },
  btnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  btnText: { color: '#1A56DB', fontSize: 16, fontWeight: '700' },
});