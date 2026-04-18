/**
 * Public-facing DB queries — uses the anon key (createClient) so RLS applies.
 * Only published content is returned.
 *
 * RLS policies that gate these calls:
 *   "works: public reads published"      — is_published = true
 *   "work_members: public reads published" — via works join
 *   "team_members: public reads public"  — is_public = true
 */

import { createClient } from "@/lib/supabase/server";
import type { PublicWorkListItem, PublicWorkDetail } from "@/types/work";
import type { PublicTeamMember, PublicTeamMemberPreview } from "@/types/team";

// ---------------------------------------------------------------------------
// Works listing
// ---------------------------------------------------------------------------

/**
 * Return all published works ordered by sort_order ASC, then updated_at DESC.
 * Only the columns needed for list cards are selected.
 */
export async function getPublishedWorks(): Promise<PublicWorkListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("works")
    .select(
      "id, slug, status, title_ko, title_en, summary_ko, summary_en, thumbnail_url, logo_url, platforms, sort_order"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch works: ${error.message}`);
  return (data ?? []) as PublicWorkListItem[];
}

// ---------------------------------------------------------------------------
// Work detail
// ---------------------------------------------------------------------------

/**
 * Return a single published work by slug, including its linked team members.
 * Returns null if the slug does not exist or the work is not published.
 *
 * The nested select follows PostgREST FK inference:
 *   work_members.work_id  → works.id      (join root)
 *   work_members.member_id → team_members.id  (nested)
 */
export async function getPublishedWorkBySlug(
  slug: string
): Promise<PublicWorkDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("works")
    .select(
      `
      id, slug, status,
      title_ko, title_en,
      summary_ko, summary_en,
      description_ko, description_en,
      core_features_ko, core_features_en,
      thumbnail_url, logo_url,
      official_url, app_store_url, play_store_url,
      platforms, monkey_types,
      work_members (
        id, is_primary,
        team_members (
          id, name_ko, name_en, role_ko, role_en,
          profile_image_url, monkey_type
        )
      )
      `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found / not published
    throw new Error(`Failed to fetch work "${slug}": ${error.message}`);
  }

  return data as unknown as PublicWorkDetail;
}

// ---------------------------------------------------------------------------
// Legal / support pages
// ---------------------------------------------------------------------------

export type WorkLegalContent = {
  slug: string;
  title_ko: string | null;
  title_en: string | null;
  support_ko: string | null;
  support_en: string | null;
  privacy_ko: string | null;
  privacy_en: string | null;
  terms_ko: string | null;
  terms_en: string | null;
  pages_updated_at: string;
};

/**
 * Fetch legal page content for a published work identified by slug.
 * Returns null if the work does not exist, is not published, or has no
 * work_pages row (the trigger normally creates this on works INSERT).
 *
 * Two sequential queries:
 *   1. Verify the work exists and is published, capture its id + title.
 *   2. Fetch the work_pages row (RLS allows anon reads for published works).
 */
export async function getPublishedWorkLegal(
  slug: string
): Promise<WorkLegalContent | null> {
  const supabase = await createClient();

  // Step 1 — verify work is published
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("id, slug, title_ko, title_en")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (workError || !work) return null;

  // Step 2 — fetch legal content
  const { data: pages, error: pagesError } = await supabase
    .from("work_pages")
    .select(
      "support_ko, support_en, privacy_ko, privacy_en, terms_ko, terms_en, updated_at"
    )
    .eq("work_id", work.id)
    .single();

  if (pagesError || !pages) return null;

  return {
    slug: work.slug,
    title_ko: work.title_ko,
    title_en: work.title_en,
    support_ko: pages.support_ko,
    support_en: pages.support_en,
    privacy_ko: pages.privacy_ko,
    privacy_en: pages.privacy_en,
    terms_ko: pages.terms_ko,
    terms_en: pages.terms_en,
    pages_updated_at: pages.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Team page
// ---------------------------------------------------------------------------

/**
 * Return all public team members ordered by sort_order ASC, including their
 * contributed published works.
 *
 * RLS automatically filters:
 *   - team_members WHERE is_public = true
 *   - work_members only for published works (via "work_members: public reads published")
 *   - nested works only where is_published = true (via "works: public reads published")
 *
 * The nested works object is a single row per work_members entry (PostgREST
 * treats many-to-one FK as an object, not an array).
 */
export async function getPublicTeamMembers(): Promise<PublicTeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id, name_ko, name_en, role_ko, role_en,
      bio_ko, bio_en, profile_image_url, monkey_type, sort_order,
      work_members (
        id, is_primary,
        contribution_role_ko, contribution_role_en,
        works (
          id, slug, title_ko, title_en, status
        )
      )
      `
    )
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch team members: ${error.message}`);
  return (data ?? []) as unknown as PublicTeamMember[];
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

const WORK_LIST_COLS =
  "id, slug, status, title_ko, title_en, summary_ko, summary_en, thumbnail_url, logo_url, platforms, sort_order";

/**
 * Return up to `limit` featured published works (is_featured = true).
 * Falls back to the most recent published works if no featured ones exist.
 */
export async function getFeaturedPublishedWorks(
  limit = 3
): Promise<PublicWorkListItem[]> {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("works")
    .select(WORK_LIST_COLS)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (featured && featured.length > 0) {
    return featured as PublicWorkListItem[];
  }

  // Fallback: most recently updated published works
  const { data: recent, error } = await supabase
    .from("works")
    .select(WORK_LIST_COLS)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch featured works: ${error.message}`);
  return (recent ?? []) as PublicWorkListItem[];
}

/**
 * Return up to `limit` public team members for the home page preview.
 * Slim select — no work_members join, only what the avatar row needs.
 */
export async function getPublicTeamPreview(
  limit = 4
): Promise<PublicTeamMemberPreview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("id, name_ko, name_en, role_ko, role_en, profile_image_url, monkey_type")
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch team preview: ${error.message}`);
  return (data ?? []) as PublicTeamMemberPreview[];
}
