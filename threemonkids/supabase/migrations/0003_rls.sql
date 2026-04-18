-- =============================================================
-- 0003_rls.sql
-- Row Level Security policies for all core tables.
--
-- Role model:
--   anon          = public visitor, no auth
--   authenticated = any logged-in user (includes admins)
--   is_admin()    = has an admin_profiles row (any role)
--   is_super()    = has role = 'super_admin'
--
-- Note: Server Actions using the service role key bypass RLS
-- entirely. RLS protects the anon/authenticated key paths
-- (public reads and direct client queries).
-- =============================================================


-- -----------------------------------------------------------
-- Helper functions
-- Used inside policy expressions to avoid subquery repetition.
-- SECURITY DEFINER runs as the function owner (postgres),
-- allowing safe access to admin_profiles from within policies.
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION get_my_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM admin_profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  )
$$;


-- =============================================================
-- admin_profiles
-- =============================================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public: no access whatsoever
-- (no SELECT policy for anon means anon gets nothing)

-- Any admin: can read their own profile only
CREATE POLICY "admin_profiles: admin reads own"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admin: full access to all profiles
CREATE POLICY "admin_profiles: super admin full access"
  ON admin_profiles
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- =============================================================
-- works
-- =============================================================
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- Public: read published works only
CREATE POLICY "works: public reads published"
  ON works
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Any admin: read all works (all statuses)
CREATE POLICY "works: admin reads all"
  ON works
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Any admin: insert new works
-- created_by is set to auth.uid() in the Server Action before insert
CREATE POLICY "works: admin inserts"
  ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admin: update own works only (created_by matches)
-- Super admin: update any work (checked separately below)
CREATE POLICY "works: admin updates own"
  ON works
  FOR UPDATE
  TO authenticated
  USING (
    is_admin() AND created_by = auth.uid()
  )
  WITH CHECK (
    is_admin() AND created_by = auth.uid()
  );

-- Super admin: update any work
CREATE POLICY "works: super admin updates any"
  ON works
  FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Super admin: delete any work
CREATE POLICY "works: super admin deletes"
  ON works
  FOR DELETE
  TO authenticated
  USING (is_super_admin());


-- =============================================================
-- work_pages
-- =============================================================
ALTER TABLE work_pages ENABLE ROW LEVEL SECURITY;

-- Public: read pages for published works only
CREATE POLICY "work_pages: public reads published"
  ON work_pages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_pages.work_id
        AND works.is_published = true
    )
  );

-- Any admin: read all work_pages
CREATE POLICY "work_pages: admin reads all"
  ON work_pages
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin: insert/update pages for own works
CREATE POLICY "work_pages: admin manages own"
  ON work_pages
  FOR ALL
  TO authenticated
  USING (
    is_admin() AND EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_pages.work_id
        AND works.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() AND EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_pages.work_id
        AND works.created_by = auth.uid()
    )
  );

-- Super admin: manage any work_pages
CREATE POLICY "work_pages: super admin full access"
  ON work_pages
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- =============================================================
-- team_members
-- =============================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public: read members where is_public = true
CREATE POLICY "team_members: public reads public"
  ON team_members
  FOR SELECT
  TO anon
  USING (is_public = true);

-- Any admin: read all members (including is_public = false)
CREATE POLICY "team_members: admin reads all"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Any admin: insert new members
CREATE POLICY "team_members: admin inserts"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Any admin: update any member
-- (team members are shared resources, not owned per-admin)
CREATE POLICY "team_members: admin updates"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Super admin: delete members
CREATE POLICY "team_members: super admin deletes"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (is_super_admin());


-- =============================================================
-- work_members
-- =============================================================
ALTER TABLE work_members ENABLE ROW LEVEL SECURITY;

-- Public: read contributors for published works only
CREATE POLICY "work_members: public reads published"
  ON work_members
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_members.work_id
        AND works.is_published = true
    )
  );

-- Any admin: read all work_members
CREATE POLICY "work_members: admin reads all"
  ON work_members
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin: manage contributors on own works
CREATE POLICY "work_members: admin manages own work"
  ON work_members
  FOR ALL
  TO authenticated
  USING (
    is_admin() AND EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_members.work_id
        AND works.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() AND EXISTS (
      SELECT 1 FROM works
      WHERE works.id = work_members.work_id
        AND works.created_by = auth.uid()
    )
  );

-- Super admin: manage contributors on any work
CREATE POLICY "work_members: super admin full access"
  ON work_members
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
