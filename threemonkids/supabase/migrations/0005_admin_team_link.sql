-- =============================================================
-- 0005_admin_team_link.sql
-- Link admin accounts to their public team_members identity.
--
-- Motivation:
--   Works should reflect the creator's avatar/character (monkey_type)
--   automatically. Rather than having admins manually select a
--   monkey type on every work form, each admin account is linked
--   to a single team_members row. The Server Action reads this
--   link at create-time to populate work_members and monkey_types.
--
-- Design decisions:
--   - Nullable: not every admin needs a public team identity.
--     (e.g. a super_admin who manages but does not appear publicly)
--   - ON DELETE SET NULL: removing a team_member does not delete
--     the admin_profiles row — it simply clears the link.
--   - One admin → one team member (the column is not UNIQUE on
--     team_member_id, so two admins could share a team member,
--     though that should be avoided in practice).
-- =============================================================

ALTER TABLE admin_profiles
  ADD COLUMN team_member_id uuid
    REFERENCES team_members(id)
    ON DELETE SET NULL;

-- Index: allows fast lookup of which admin is linked to a given team member
CREATE INDEX admin_profiles_team_member_idx ON admin_profiles (team_member_id)
  WHERE team_member_id IS NOT NULL;
