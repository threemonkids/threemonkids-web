export type ServiceCategory = "ios" | "android" | "web" | "desktop" | "app" | "news" | "utility" | "productivity" | "diary";

export type ServiceStatus = "live" | "coming_soon" | "archived" | "draft";

export type ServiceMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

export type Service = {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  tagline_ko: string;
  tagline_en: string;
  description_ko: string;
  description_en: string;
  status: ServiceStatus;
  categories: ServiceCategory[];
  cardSrc?: string;
  cardWidth?: number;
  cardHeight?: number;
  logoSrc?: string;
  avatarSrc?: string;
  media: ServiceMedia[];
};

export const SERVICES: Service[] = [
  {
    id: "already-me",
    slug: "already-me",
    name_ko: "Already Me",
    name_en: "Already Me",
    tagline_ko: "일기? 계획? 미래.",
    tagline_en: "Diary? Plan? Future.",
    description_ko:
      "[오늘 있었던 일]을 적는 데서 끝나지 않습니다.\n되고 싶은 [나의 모습]을 [먼저 기록]합니다.\n[Already Me]는 [글]을 방향으로, 방향을 [현실]로 바꾸는 [미래 다이어리] 앱입니다.",
    description_en:
      "[Don't just write] what happened today.\nWrite the version of yourself [you want to become].\n[Already Me] is a [future diary] app that helps you turn [words] into direction, and direction into [reality].",
    status: "coming_soon",
    categories: ["ios", "app", "diary"],
    cardSrc: "/services/Already_Me.png",
    avatarSrc: "/services/on_monkey.png",
    media: [],
  },
  {
    id: "perfact",
    slug: "perfact",
    name_ko: "PerFact 카드",
    name_en: "PerFact Card",
    tagline_ko: "카드 한장, 팩트 하나.",
    tagline_en: "One Card, One Fact.",
    description_ko:
      "복잡한 글 대신, [수치]와 [팩트]만 카드 한 장으로 정리합니다.\n[사건의 흐름]과 [배경지식]도 연계카드를 통해 파악할 수 있습니다.\n남의 해석을 따라가지 말고, 이슈를 [직접 판단]하세요.",
    description_en:
      "Instead of long articles, we turn [figures] and [facts] into a single clear card.\nUnderstand the [flow of an issue] and its [background] through linked cards.\nDon't follow someone else's interpretation.\n[Judge the issue yourself].",
    status: "coming_soon",
    categories: ["ios", "app", "news"],
    cardSrc: "/services/perfact_card.png",
    cardWidth: 315,
    cardHeight: 439,
    avatarSrc: "/services/on_monkey.png",
    media: [],
  },
];
