import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { useProfile } from './src/hooks/useProfile';
import { getPhaseInfo } from './src/data/phases';
import AuthScreen from './src/components/AuthScreen';
import SetupScreen from './src/components/SetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CicloScreen from './src/screens/CicloScreen';
import NutriScreen from './src/screens/NutriScreen';
import GimnasioScreen from './src/screens/GimnasioScreen';
import PerfilScreen from './src/screens/IAScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const profile = useProfile();
  const { authState, profileLoaded, setupDone, lastPeriod, cycleLength } = profile;
  const pi = lastPeriod ? getPhaseInfo(lastPeriod, cycleLength) : null;

  if (authState === 'loading' || (authState === 'authenticated' && !profileLoaded)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1F4A' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌙</Text>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (authState === 'unauthenticated') return <AuthScreen />;
  if (!setupDone) return <SetupScreen onDone={profile.handleSetupDone} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: 'white', borderTopColor: '#E2E8F0', paddingBottom: 20, height: 70 },
          tabBarActiveTintColor: '#1A56DB',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}>
        <Tab.Screen name="Inicio" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}>
          {() => <HomeScreen pi={pi} profile={{
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
  }} />}
        </Tab.Screen>
        <Tab.Screen name="Ciclo" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🌙</Text> }}>
          {() => <CicloScreen pi={pi} setLastPeriod={profile.setLastPeriod} setCycleLength={profile.setCycleLength} />}
        </Tab.Screen>
        <Tab.Screen name="Nutrición" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🥗</Text> }}>
          {() => <NutriScreen pi={pi} />}
        </Tab.Screen>
        <Tab.Screen name="Gimnasio" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏋️</Text> }}>
          {() => <GimnasioScreen pi={pi} trainDays={profile.trainDays} setTrainDays={profile.setTrainDays} />}
        </Tab.Screen>
        <Tab.Screen name="Perfil" options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}>
          {() => <PerfilScreen pi={pi} profile={{
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
            dietary: profile.dietary,
            trainDays: profile.trainDays,
            saveAll: profile.saveAll,
          }} signOut={profile.signOut} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}