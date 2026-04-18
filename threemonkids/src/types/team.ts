import type { MonkeyType, WorkStatus } from "@/types/work";

export type PublicTeamMemberWork = {
  id: string;
  slug: string;
  title_ko: string | null;
  title_en: string | null;
  status: WorkStatus;
};

export type PublicTeamMemberContribution = {
  id: string;
  is_primary: boolean;
  contribution_role_ko: string | null;
  contribution_role_en: string | null;
  works: PublicTeamMemberWork;
};

// Slim type for the home page team preview — no work_members join needed
export type PublicTeamMemberPreview = {
  id: string;
  name_ko: string;
  name_en: string;
  role_ko: string;
  role_en: string;
  profile_image_url: string | null;
  monkey_type: MonkeyType | null;
};

export type PublicTeamMember = {
  id: string;
  name_ko: string;
  name_en: string;
  role_ko: string;
  role_en: string;
  bio_ko: string | null;
  bio_en: string | null;
  profile_image_url: string | null;
  monkey_type: MonkeyType | null;
  sort_order: number;
  work_members: PublicTeamMemberContribution[];
};
