-- =============================================================
-- 0004_triggers.sql
-- Two triggers:
--   1. updated_at — auto-updates timestamp on row change
--   2. work_pages auto-create — ensures every work always
--      has a corresponding work_pages row from birth
-- =============================================================


-- -----------------------------------------------------------
-- Trigger 1: updated_at
-- A single reusable function applied to multiple tables.
-- Fires BEFORE UPDATE and sets updated_at = now().
-- Applied to: works, work_pages, team_members
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER works_set_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER work_pages_set_updated_at
  BEFORE UPDATE ON work_pages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER team_members_set_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------
-- Trigger 2: work_pages auto-create
-- When a works row is inserted, automatically insert a
-- corresponding work_pages row with all content columns null.
-- This guarantees a work_pages row always exists for every
-- work, so the admin legal content editor never needs to
-- create it manually, and publish rule checks always find
-- a row to validate against.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION create_work_pages()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO work_pages (work_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER works_create_pages
  AFTER INSERT ON works
  FOR EACH ROW
  EXECUTE FUNCTION create_work_pages();
