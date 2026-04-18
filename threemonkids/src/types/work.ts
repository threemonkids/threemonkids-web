export type WorkStatus = "draft" | "coming_soon" | "live" | "archived";
export type PlatformType = "web" | "ios" | "android" | "desktop" | "hybrid";
export type MonkeyType = "sunglasses" | "headphones" | "mask";

export type Work = {
  id: string;
  slug: string;
  status: WorkStatus;
  is_published: boolean;
  is_featured: boolean;
  platforms: PlatformType[];
  // Populated automatically from the creator's team_member.monkey_type at insert-time.
  // Not editable via the work form.
  monkey_types: MonkeyType[] | null;
  title_ko: string | null;
  title_en: string | null;
  summary_ko: string | null;
  summary_en: string | null;
  description_ko: string | null;
  description_en: string | null;
  core_features_ko: string[] | null;
  core_features_en: string[] | null;
  // URL columns — names match the DB schema exactly
  official_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  support_email: string | null;
  // Authorship — set by Server Actions, not the form
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkPages = {
  id: string;
  work_id: string;
  support_ko: string | null;
  support_en: string | null;
  privacy_ko: string | null;
  privacy_en: string | null;
  terms_ko: string | null;
  terms_en: string | null;
  updated_at: string;
};

export type WorkListItem = Pick<
  Work,
  "id" | "slug" | "status" | "is_published" | "title_ko" | "title_en" | "updated_at"
>;

// ---------------------------------------------------------------------------
// Public-facing types — shaped for the anon-key queries in lib/db/public.ts
// ---------------------------------------------------------------------------

export type TeamMemberPreview = {
  id: string;
  name_ko: string;
  name_en: string;
  role_ko: string;
  role_en: string;
  profile_image_url: string | null;
  monkey_type: MonkeyType | null;
};

export type WorkMemberPreview = {
  id: string;
  is_primary: boolean;
  team_members: TeamMemberPreview;
};

export type PublicWorkListItem = {
  id: string;
  slug: string;
  status: WorkStatus;
  title_ko: string | null;
  title_en: string | null;
  summary_ko: string | null;
  summary_en: string | null;
  thumbnail_url: string | null;
  logo_url: string | null;
  platforms: PlatformType[];
  sort_order: number;
};

export type PublicWorkDetail = {
  id: string;
  slug: string;
  status: WorkStatus;
  title_ko: string | null;
  title_en: string | null;
  summary_ko: string | null;
  summary_en: string | null;
  description_ko: string | null;
  description_en: string | null;
  core_features_ko: string[] | null;
  core_features_en: string[] | null;
  thumbnail_url: string | null;
  logo_url: string | null;
  official_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  platforms: PlatformType[];
  monkey_types: MonkeyType[] | null;
  work_members: WorkMemberPreview[];
};
