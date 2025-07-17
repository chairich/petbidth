
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles;', r.policyname);
  END LOOP;
END$$;

CREATE POLICY allow_insert_admin_or_service_role
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ) OR auth.role() = 'service_role'
);

CREATE POLICY allow_select_profiles
ON profiles
FOR SELECT
TO authenticated
USING (true);
