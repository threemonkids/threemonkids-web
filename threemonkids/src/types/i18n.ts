export type Lang = "ko" | "en";

export type Dictionary = {
  nav: {
    home: string;
    about: string;
    works: string;
    team: string;
  };
  home: {
    hero_eyebrow: string;
    hero_heading: string;
    hero_subheading: string;
    philosophy_heading: string;
    philosophy_line1: string;
    philosophy_line2: string;
    philosophy_line3: string;
    philosophy_body: string;
    monkey_section_heading: string;
    monkey_sunglasses_name: string;
    monkey_sunglasses_meaning: string;
    monkey_headphones_name: string;
    monkey_headphones_meaning: string;
    monkey_mask_name: string;
    monkey_mask_meaning: string;
    featured_works_heading: string;
    team_preview_heading: string;
    team_preview_body: string;
  };
  about: {
    heading: string;
    intro_eyebrow: string;
    intro_body: string;
    name_meaning_heading: string;
    name_meaning_body: string;
    philosophy_heading: string;
    philosophy_body: string;
    why_heading: string;
    why_body: string;
    cta_works: string;
    cta_team: string;
  };
  works: {
    heading: string;
    subheading: string;
    filter_all: string;
    filter_live: string;
    filter_coming_soon: string;
    filter_archived: string;
    status_live: string;
    status_coming_soon: string;
    status_archived: string;
    status_draft: string;
    platform_web: string;
    platform_ios: string;
    platform_android: string;
    platform_desktop: string;
    platform_hybrid: string;
    cta_app_store: string;
    cta_play_store: string;
    cta_open_web: string;
    why_heading: string;
    features_heading: string;
    team_heading: string;
    no_works: string;
  };
  team: {
    heading: string;
    subheading: string;
  };
  legal: {
    support_heading: string;
    privacy_heading: string;
    terms_heading: string;
    back_to_works: string;
    contact_support: string;
    last_updated: string;
  };
  common: {
    loading: string;
    error: string;
    not_found_heading: string;
    not_found_body: string;
    back_home: string;
    back: string;
    visit_site: string;
    learn_more: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    works: string;
    about: string;
    team: string;
  };
};
