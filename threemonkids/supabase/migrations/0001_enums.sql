-- =============================================================
-- 0001_enums.sql
-- All custom enum types used across the schema.
-- Must run before table creation.
-- =============================================================

-- Work lifecycle state
CREATE TYPE work_status AS ENUM (
  'draft',
  'coming_soon',
  'live',
  'archived'
);

-- Supported platform targets for a work
CREATE TYPE platform_type AS ENUM (
  'web',
  'ios',
  'android',
  'desktop',
  'hybrid'
);

-- Brand archetype tags
CREATE TYPE monkey_type AS ENUM (
  'sunglasses',
  'headphones',
  'mask'
);

-- Admin access level
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'admin'
);
