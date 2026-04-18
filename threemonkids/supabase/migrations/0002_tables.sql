-- =============================================================
-- 0002_tables.sql
-- Core table definitions with all constraints and indexes.
-- Requires 0001_enums.sql to have run first.
-- =============================================================


-- -----------------------------------------------------------
-- admin_profiles
-- Extends auth.users with role data for admin panel access.
-- Not self-registerable. Created by super_admin only.
-- user_id is UNIQUE — one auth user can have one profile.
-- -----------------------------------------------------------
CREATE TABLE admin_profiles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role         admin_role  NOT NULL DEFAULT 'admin',
  display_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Index: fast lookup by auth user id (used in every auth check)
CREATE INDEX admin_profiles_user_id_idx ON admin_profiles (user_id);


-- -----------------------------------------------------------
-- works
-- Core content entity. One row per product/work.
-- -----------------------------------------------------------
CREATE TABLE works (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text          NOT NULL,

  -- Bilingual content (paired _ko / _en columns)
  title_ko         text          NOT NULL,
  title_en         text          NOT NULL,
  summary_ko       text          NOT NULL,
  summary_en       text          NOT NULL,
  description_ko   text,
  description_en   text,
  why_it_exists_ko text,
  why_it_exists_en text,

  -- Stored as JSON arrays: ["feature A", "feature B"]
  core_features_ko jsonb,
  core_features_en jsonb,

  -- Brand archetype tags (1-3 values)
  monkey_types     monkey_type[],

  -- Multi-platform: native Postgres array of enum values
  -- e.g. '{ios,android}' or '{web}' or '{ios,android,web}'
  -- Queried with: 'ios' = ANY(platforms)
  platforms        platform_type[],

  status           work_status   NOT NULL DEFAULT 'draft',

  -- URLs
  thumbnail_url    text,
  logo_url         text,
  official_url     text,
  app_store_url    text,
  play_store_url   text,
  support_email    text,

  -- Visibility
  is_featured      boolean       NOT NULL DEFAULT false,
  is_published     boolean       NOT NULL DEFAULT false,
  sort_order       integer       NOT NULL DEFAULT 0,

  -- Authorship: two separate FK columns, both nullable.
  -- created_by: set once at creation, never updated.
  -- updated_by: updated on every save.
  -- ON DELETE SET NULL: admin deletion does not orphan works.
  created_by       uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by       uuid          REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now(),

  -- Slug must be unique across all works
  CONSTRAINT works_slug_unique UNIQUE (slug),

  -- Slug format: lowercase alphanumeric and hyphens only.
  -- Must start and end with alphanumeric character.
  -- Minimum 2 characters (single-char slugs are ambiguous).
  CONSTRAINT works_slug_format CHECK (
    slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
  ),

  -- Slug must not collide with reserved static route segments.
  -- Enforced here as a hard DB constraint in addition to
  -- application-layer Zod validation.
  CONSTRAINT works_slug_not_reserved CHECK (
    slug NOT IN (
      'about', 'works', 'team', 'admin',
      'api', 'login', 'dashboard', 'new',
      'edit', 'pages', 'support', 'privacy',
      'terms', 'ko', 'en'
    )
  )
);

-- Indexes on works
-- Note: works_slug_unique constraint already creates an implicit unique index on slug.
-- No separate slug index needed.
CREATE INDEX works_published_idx     ON works (is_published, status);
CREATE INDEX        works_featured_idx      ON works (is_featured) WHERE is_featured = true;
CREATE INDEX        works_sort_idx          ON works (sort_order ASC);
CREATE INDEX        works_created_by_idx    ON works (created_by);


-- -----------------------------------------------------------
-- work_pages
-- Legal and support content per product.
-- One-to-one with works (enforced by UNIQUE on work_id).
-- Kept separate to allow independent editing without
-- touching the main works row.
-- All content columns are nullable — filled in admin editor.
-- -----------------------------------------------------------
CREATE TABLE work_pages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id    uuid        NOT NULL UNIQUE REFERENCES works(id) ON DELETE CASCADE,
  support_ko text,
  support_en text,
  privacy_ko text,
  privacy_en text,
  terms_ko   text,
  terms_en   text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Note: UNIQUE constraint on work_id already creates an implicit index. No separate index needed.


-- -----------------------------------------------------------
-- team_members
-- Studio members as a public content entity.
-- Intentionally separate from auth.users / admin_profiles:
--   - A team member may not have admin access
--   - An admin may not appear on the public team page
--   - Auth identity and public identity are independent
-- -----------------------------------------------------------
CREATE TABLE team_members (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ko           text        NOT NULL,
  name_en           text        NOT NULL,
  role_ko           text        NOT NULL,
  role_en           text        NOT NULL,
  bio_ko            text,
  bio_en            text,
  profile_image_url text,
  monkey_type       monkey_type,
  is_public         boolean     NOT NULL DEFAULT true,
  sort_order        integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes on team_members
CREATE INDEX team_members_public_idx ON team_members (is_public) WHERE is_public = true;
CREATE INDEX team_members_sort_idx   ON team_members (sort_order ASC);


-- -----------------------------------------------------------
-- work_members
-- Join table: works <-> team_members (many-to-many).
-- Records who contributed to each work and in what role.
-- UNIQUE(work_id, member_id): one member per work, no duplicates.
-- Both FKs use ON DELETE CASCADE:
--   - Deleting a work removes its contributor links
--   - Deleting a member removes their contribution links
-- -----------------------------------------------------------
CREATE TABLE work_members (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id              uuid        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  member_id            uuid        NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  contribution_role_ko text,
  contribution_role_en text,
  is_primary           boolean     NOT NULL DEFAULT false,

  -- One member cannot be linked to the same work more than once
  CONSTRAINT work_members_pair_unique UNIQUE (work_id, member_id)
);

-- Indexes on work_members
CREATE INDEX work_members_work_idx   ON work_members (work_id);
CREATE INDEX work_members_member_idx ON work_members (member_id);
