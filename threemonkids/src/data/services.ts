export type ServiceCategory = "ios" | "android" | "web" | "desktop" | "app" | "news" | "utility" | "productivity" | "diary" | "dictionary" | "game";

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
  /** Renders a live component instead of `cardSrc`. See NajeonCard / CLAUDE.md. */
  cardKind?: "najeon" | "touch-war";
  cardWidth?: number;
  cardHeight?: number;
  logoSrc?: string;
  avatarSrc?: string;
  media: ServiceMedia[];
  /** External download URL (e.g. App Store). When set, the Download button links here in a new tab. */
  downloadUrl?: string;
  /** Path to a QR code image. Shown below the Download button on desktop only. */
  qrCodeSrc?: string;
};

export const SERVICES: Service[] = [
  {
    id: "najeon",
    slug: "najeon",
    name_ko: "나전",
    name_en: "Najeon",
    tagline_ko: "사전? 뜻? 나의 것.",
    tagline_en: "Dictionary? Definition? Mine.",
    description_ko:
      "사전은 그 말이 [모두에게] 무엇인지 알려줍니다.\n나전은 그 말이 [나에게] 무엇인지 묻습니다.\n말을 찾고, 그 위에 직접 겪은 것으로 [덧씁니다].\n쓴 글은 [내 기기에만] 저장됩니다.",
    description_en:
      "A dictionary tells you what a word means to [everyone].\nNajeon asks what it means to [you].\nLook up a word, then [write over it] with your own experience.\nWhat you write stays [only on your device].",
    status: "live",
    categories: ["ios", "app", "dictionary"],
    cardKind: "najeon",
    avatarSrc: "/services/on_monkey.png",
    downloadUrl: "https://apps.apple.com/us/app/나전/id6814106977",
    qrCodeSrc: "/services/najeon_qr.svg",
    media: [],
  },
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
    status: "live",
    categories: ["ios", "app", "diary"],
    cardSrc: "/services/Already_Me.png",
    avatarSrc: "/services/on_monkey.png",
    downloadUrl: "https://apps.apple.com/au/app/already-me/id6766051614",
    qrCodeSrc: "/services/already_me_qr.png",
    media: [],
  },
  {
    id: "touch-war",
    slug: "touch-war",
    name_ko: "Touch War",
    name_en: "Touch War",
    tagline_ko: "지도? 터치? 전쟁.",
    tagline_en: "Map? Touch? War.",
    description_ko:
      "세계지도 위에서 나라를 [터치]하면 공격이 됩니다.\n처음에 고른 나라가 [나의 편]이 됩니다.\n누가 누구를 쳤는지 [실시간]으로 쌓입니다.\n[국가 대항전]입니다.",
    description_en:
      "[Touch] a country on the world map to attack it.\nThe country you pick first becomes [your side].\nEvery attack is recorded [in real time].\nIt is a [war between nations].",
    status: "coming_soon",
    categories: ["ios", "app", "game"],
    cardKind: "touch-war",
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
