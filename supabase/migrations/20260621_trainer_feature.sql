-- ── Trainer feature — tablas MVP ─────────────────────────────────────────────

-- 1. Campo en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trainer_code_used TEXT;

-- 2. Tabla trainers
CREATE TABLE IF NOT EXISTS trainers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_code TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  specialty    TEXT,
  plan_tier    TEXT DEFAULT 'free',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Relación entrenadora ↔ clienta
CREATE TABLE IF NOT EXISTS trainer_clients (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id   UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT DEFAULT 'active',   -- active | inactive
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  program_id   UUID,
  UNIQUE(trainer_id, client_id)
);

-- 4. Catálogo de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  JSONB NOT NULL,   -- { es, en, fr, it }
  muscle_groups         TEXT[],
  equipment             TEXT,
  created_by_trainer_id UUID REFERENCES trainers(id),
  verified              BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Programas de entrenamiento
CREATE TABLE IF NOT EXISTS workout_programs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id  UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Ejercicios dentro de un programa
CREATE TABLE IF NOT EXISTS program_exercises (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id      UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES exercises(id),
  sets            INTEGER,
  reps            INTEGER,
  weight_kg       NUMERIC,
  phase_modifiers JSONB,
  order_index     INTEGER DEFAULT 0
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE trainers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

-- Trainers: cualquier usuaria autenticada puede buscar por código
CREATE POLICY "trainers_select" ON trainers FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainers_manage" ON trainers FOR ALL    TO authenticated USING (user_id = auth.uid());

-- Trainer clients: la clienta puede insertarse; la entrenadora gestiona
CREATE POLICY "tc_select" ON trainer_clients FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "tc_insert" ON trainer_clients FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "tc_update" ON trainer_clients FOR UPDATE TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Workout programs: entrenadora escribe, clienta lee
CREATE POLICY "wp_select" ON workout_programs FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "wp_manage" ON workout_programs FOR ALL TO authenticated
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Exercises: todas leen las verificadas; entrenadora añade las suyas
CREATE POLICY "ex_select" ON exercises FOR SELECT TO authenticated
  USING (verified = true OR created_by_trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));
CREATE POLICY "ex_insert" ON exercises FOR INSERT TO authenticated
  WITH CHECK (created_by_trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Program exercises: misma lógica que workout_programs
CREATE POLICY "pe_select" ON program_exercises FOR SELECT TO authenticated
  USING (program_id IN (
    SELECT id FROM workout_programs
    WHERE client_id = auth.uid()
       OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  ));
CREATE POLICY "pe_manage" ON program_exercises FOR ALL TO authenticated
  USING (program_id IN (
    SELECT id FROM workout_programs
    WHERE trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
  ));
