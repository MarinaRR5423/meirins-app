-- ═══════════════════════════════════════════════════════════════════════════
-- MEIRINS · Función para eliminar cuenta de usuario
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Función que borra todos los datos del usuario y su cuenta de auth
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- 1. Borrar perfil y datos extendidos (cascada a otras tablas si las hay)
  DELETE FROM profiles WHERE id = v_uid;

  -- 2. Borrar el usuario de auth (requiere SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Permitir que los usuarios autenticados llamen a esta función
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
