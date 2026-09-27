@AGENTS.md

# Threemonkids

Next.js 16 App Router + Tailwind v4 + TypeScript. 회사 소개 + 서비스(앱) 소개 사이트.
Supabase가 붙어 있지만 **현재 화면에 보이는 서비스 정보는 전부 정적 TS 파일**에서 온다.

## 라우팅

모든 공개 페이지는 `[lang]` 세그먼트 아래. `lang`은 `"ko" | "en"` 두 개뿐
([src/lib/i18n/config.ts](src/lib/i18n/config.ts)).

- `/` → [src/proxy.ts](src/proxy.ts)가 `Accept-Language` 보고 `/ko` 또는 `/en`으로 리다이렉트. 기본값 `ko`.
- `/[lang]` — Home ([src/app/\[lang\]/page.tsx](src/app/[lang]/page.tsx))
- `/[lang]/works` — Services 페이지. 라우트 이름은 `works`지만 UI 라벨은 "Services" / "서비스"
- `/[lang]/about`, `/[lang]/team`
- `/[lang]/{support,privacy,terms}/[service]` — 서비스별 법적 고지 페이지 ← **살아있는 쪽**

### ⚠️ 죽은 라우트

`/[lang]/[service]/{support,privacy,terms}` 3개는 Supabase `works` 테이블을 읽는 옛 구현
(`getPublishedWorkLegal`). Next 라우팅에서 **정적 세그먼트가 동적 세그먼트를 이기므로**
`/ko/support/najeon` 같은 요청은 항상 정적 쪽(`/[lang]/support/[service]`)이 처리한다.
즉 이 3개 파일은 사실상 도달 불가. 작업할 때 헷갈리지 말 것.
`/[lang]/works/[slug]`도 같은 Supabase 계열이라 서비스 쇼케이스와 무관.

## 서비스 데이터 — Home과 Services는 데이터를 공유하지 않는다

이게 이 저장소에서 제일 헷갈리는 지점.

- **Services 페이지**는 [src/data/services.ts](src/data/services.ts)의 `SERVICES` 배열을 읽는다.
- **Home 페이지**는 `SERVICES`를 **import하지 않는다.** ko/en 두 벌의 `ServiceItem[]` 배열이
  [src/app/\[lang\]/page.tsx](src/app/[lang]/page.tsx) 안에 인라인으로 하드코딩돼 있다.

→ 서비스 하나 추가/수정하려면 **총 3군데**: `services.ts` 1곳 + Home의 ko 배열 + Home의 en 배열.

법적 고지 3개 라우트는 `SERVICES.find(s => s.slug === service)`로 slug만 검증한다.

## 다국어

두 갈래로 나뉜다.

- **껍데기 문구**(nav, 헤딩, 공통 라벨): [src/lib/i18n/dictionaries/{ko,en}.ts](src/lib/i18n/dictionaries/),
  타입은 [src/types/i18n.ts](src/types/i18n.ts)의 `Dictionary`. 양쪽 파일 키가 항상 같아야 한다.
- **서비스 문구**: 딕셔너리에 없다. `services.ts`가 `name_ko`/`name_en` 같은 **필드 쌍**으로 들고 있고,
  렌더 시 `lang === "ko" ? ... : ...` 삼항으로 고른다. Home은 배열 자체를 ko/en으로 분기.

## 흰색 강조는 마크다운 볼드가 아니라 대괄호 `[...]`

본문 문자열 안의 `[강조할 말]` → `<span className="text-white">`.
파서는 [src/lib/utils/highlight.tsx](src/lib/utils/highlight.tsx)의 `highlightBrackets`.

**적용 범위는 Services 페이지의 `description_*`뿐이다.** Home 쇼케이스의 `supportCopy`는
의도적으로 평문 — 강조 없이 톤을 낮게 유지한다. Home 문구에 대괄호를 쓰면
파싱되지 않고 화면에 그대로 보인다.

줄바꿈은 문자열 안의 `\n`. 렌더 쪽에서 `split("\n")` 후 줄마다 `<p>`.

Home의 `mainCopy`(태그라인)는 별개 — 줄 전체가 라임색 블록 배경으로 강조되며 대괄호를 쓰지 않는다.

## 상태 배지 / 카테고리 태그

- **Services 페이지**: [works/page.tsx](src/app/[lang]/works/page.tsx) 하단의 `STATUS_LABELS`
  (`live` → "Open", `coming_soon` → "Coming Soon"), `CATEGORY_LABELS`, `WHITE_CATEGORIES`
  (흰 테두리로 강조할 태그 집합). 값의 출처는 `services.ts`의 `status` / `categories`.
- **Home**: 같은 배지를 쓰지 않는다. `statusLabel` 문자열을 그대로 적고,
  `statusKind: "live"`면 초록 점, 생략하면 깜박이는 앰버 점
  ([ServicesShowcase.tsx](src/components/public/ServicesShowcase.tsx)).

⚠️ `CATEGORY_LABELS`는 **언어 무관 영어 고정**이다. ko에서도 "Dictionary", "Diary", "News"로 나온다.
의도된 현재 상태(일관성 우선).

카테고리를 새로 만들 때는 세 곳을 같이 고쳐야 타입이 통과한다:
`ServiceCategory` 유니온 → `CATEGORY_LABELS` → (강조하려면) `WHITE_CATEGORIES`.

## privacy / terms / support

전부 [StaticLegalLayout](src/components/public/StaticLegalLayout.tsx)이 렌더.
본문은 각 페이지 파일 안에 ko/en `sections: {heading, items[]}[]` 배열로 하드코딩.
`threemonkids@gmail.com`이 들어간 항목은 자동으로 mailto 링크가 된다.
"최종 업데이트" 기본 날짜는 `StaticLegalLayout`의 `updatedDate` 기본값.

세 페이지 모두 같은 구조다: 파일 상단에 `DEFAULT_INTRO` / `DEFAULT_SECTIONS`(전 서비스 공용)가
있고, 그 아래에 slug별 오버라이드 맵이 있다.

```ts
const intro    = INTRO_BY_SLUG[slug]?.[lang]    ?? DEFAULT_INTRO[lang];
const sections = SECTIONS_BY_SLUG[slug]?.[lang] ?? DEFAULT_SECTIONS[lang];
```

→ **`SERVICES`에 등록만 하면 세 페이지가 공용 문구로 바로 생긴다.** 서비스별 문구가 필요할 때만
해당 페이지의 `*_BY_SLUG`에 항목을 추가하면 된다.

현재 오버라이드 현황:

| 서비스 | support | privacy | terms |
|---|---|---|---|
| perfact | intro만 | 공용 | 공용 |
| already-me | intro + 날짜 | 공용 | 공용 |
| najeon | 전용 | **전용** | **전용** |
| touch-war | 전용 | **전용** | **전용** |

나전은 계정·서버가 없는 온디바이스 앱이라 공용 문구(회원가입 이메일 수집, 서버 운영 전제)가
사실과 맞지 않아 privacy/terms를 따로 썼다. Touch War는 반대로 **서버가 있는 쪽**이라 또 다르다 —
익명 로그인 식별자·국가 코드·공격 기록을 Supabase(호주 시드니 리전)에 저장하므로, 수집 항목과
저장 위치를 명시한 전용 문구를 쓴다. 새 앱을 추가할 때 **온디바이스면 나전, 서버가 붙으면
Touch War 쪽을 복사해 시작할 것.**

⚠️ **익명 로그인 서비스의 데이터 삭제는 "이메일로 요청"이 아니라 "앱 안에서 직접"이어야 한다.**
이용자를 식별할 수단이 없으니 메일을 받아도 누구 기록인지 찾을 수 없다. 지킬 수 없는 약속이므로
Touch War privacy/support는 앱 설정 화면에서의 직접 삭제를 안내하고, 이메일은 일반 문의용으로만 둔다.

Touch War 약관에는 다른 서비스에 없는 조항이 둘 있다. 의도적이니 지우지 말 것:
`2. 기록의 보관`(익명 식별자는 기기에 묶여 있고 복구 수단이 없다)과
`4. 게임 내용에 관하여`(등장 국가와 공격은 오락을 위한 설정이며 Three Monkids의 입장이 아니다).
국가를 공격하는 게임이라는 소재상 후자는 빼지 않는 편이 안전하다.

`UPDATED_DATE_BY_SLUG`는 전용 문구를 쓰는 서비스만 채운다. 비워두면
`StaticLegalLayout`의 프로젝트 기본 날짜가 나가므로, 문구를 고쳤으면 날짜도 같이 고칠 것.

**날짜 형식은 `YYYY.MM.DD` 점 표기로 통일한다** (ko/en 공통). `03/05/2026` 같은 슬래시 표기는
DD/MM인지 MM/DD인지 알 수 없어 쓰지 않는다.

## 이미지 / QR / 다운로드

전부 `public/` 정적 파일이고 경로 문자열로 지정한다.

- `cardSrc` — 서비스 카드 이미지 (`/services/*.png`). **없거나 필드를 비우면** 이름 앞 2글자
  플레이스홀더 박스가 렌더된다. 이미지 준비 전에도 페이지는 깨지지 않는다.
- `cardKind` — 이미지 대신 전용 컴포넌트를 그린다. 현재 `"najeon"` 하나뿐. 아래 참고.
- `avatarSrc` — 제작자 아바타, 보통 `/services/on_monkey.png`
- `qrCodeSrc` — 있을 때만 데스크톱에서 다운로드 버튼 아래 표시. 미출시면 필드 생략.
  앱을 출시하면 `downloadUrl`과 함께 채운다. QR은 파이썬 `segno`로 만든 흑백 SVG다
  (`najeon_qr.svg`). 표시 슬롯이 80px로 작아서 **quiet zone을 규격의 4모듈이 아니라 2모듈로**
  줄였다 — 렌더 컨테이너의 `bg-white p-1` 여백이 나머지 여백 역할을 하고, 그러지 않으면
  모듈이 너무 조밀해져 인식률이 떨어진다. URL의 한글은 퍼센트 인코딩해서 넣는다
  (스캐너의 문자셋 추측 여지를 없애기 위함).
- `downloadUrl` — 없으면 [DownloadButton](src/components/public/DownloadButton.tsx)이
  "앱 출시 준비 중입니다" 토스트로 동작. 미출시면 필드 생략.

### 컴포넌트 카드 — 나전, Touch War

두 서비스는 `cardSrc`(PNG) 대신 `cardKind`를 주면 전용 컴포넌트가 렌더된다.
공통 규칙: **315×439 고정 크기로 그린 뒤 `--<name>-scale`로 슬롯에 맞춰 축소**하고,
포인터 기기는 `:hover`, 터치는 IntersectionObserver로 1회 자동 재생한다.
두 카드가 같은 래퍼 CSS를 복사해 쓰고 있다 — 세 번째 카드가 생기면 그때 공통 클래스로 빼면 된다.

### Touch War 카드

[TouchWarCard.tsx](src/components/public/TouchWarCard.tsx)
+ `public/services/touch_war_map.svg` + [touchWarArcs.ts](src/components/public/touchWarArcs.ts).
**뒤의 둘은 생성물이다.** 고칠 곳은 [scripts/build-touchwar-map.py](scripts/build-touchwar-map.py).

**왜 이미지가 아닌가** — 보여줄 것이 정지 화면이 아니라 움직임이기 때문이다. 앱의
`ww/DESIGN.md`에 이렇게 적혀 있다: *"Live attacks: a dotted pencil curve draws itself from
attacker to target and fades"*, *"grey flash, crack shoots out in 0.1s and fades after ~2.5s"*.
카드는 이 두 문장을 그대로 재현한다. 카드에는 지도 말고 아무것도 없다 — 앱의 가로 모드처럼
지도가 화면을 꽉 채운다.

**모든 수치는 앱에서 가져왔다. 지어내지 말 것.**

| 항목 | 출처 |
|---|---|
| 국가 도형, 중심점 | `ww/src/map.json` (투영·손그림 지터가 이미 구워진 데이터) |
| 곡선 모양 | `ww/src/map.ts`의 `arcPoints()`, 휨 `LIVE.ARC_BOW` 0.22 |
| 금 모양 | 같은 파일의 `crackPath()`를 그대로 옮김 |
| 타이밍 | `ww/src/live.ts` `DRAW_MS` 400 · `ARC_MS` 1300, `WorldMap.tsx` `CRACK_MS` 2600(1.6초 유지 후 1초 페이드) · 플래시 450ms · 금 확장 100ms |
| 색 | `DESIGN.md`의 ink `#000000`, flash `#BDBDBD` |

CSS 키프레임은 이 값들을 **4.8초 주기에 대한 비율**로 옮긴 것이다(곡선 그리기 400ms = 8.3%).
주기나 앱 상수를 바꾸면 퍼센트를 다시 계산할 것.

⚠️ **지도가 세로로 크롭돼 있다.** 1000×520 세계지도는 2:1이라 315×439 카드에 통째로 안 들어간다.
꽉 채우려면 잘라야 하고, 그래서 유럽·아프리카·중동·서아시아만 보인다(`viewBox="455 50 251.1 350"`).
후보 크롭을 렌더해 비교하고 고른 값이다. **곡선 SVG와 지도 SVG의 viewBox가 같아야 한다** —
다르면 곡선이 엉뚱한 바다 위에 그려진다. 생성기가 곡선이 크롭을 벗어나면 에러를 내고 멈춘다.

**점선이면서 그려지는 효과는 마스크로 낸다.** 한 path에 `stroke-dasharray`를 점선용과
그리기용으로 동시에 쓸 수 없다. 점선 곡선을 굵은 흰 선 마스크로 덮고 마스크 쪽
`stroke-dashoffset`을 0으로 보내 드러낸다. CSS에서 `stroke-dashoffset`은 길이를 요구하므로
`calc(var(--len) * 1px)`로 단위를 붙인다(맨 숫자는 브라우저별로 갈린다).

금은 원점 기준으로 생성해 `translate`로 옮긴 뒤 `transform-box: fill-box` + `transform-origin: center`로
확장시키고, 타깃 국가 모양으로 `clipPath`를 걸어 국경 밖으로 새지 않게 한다(앱과 같다).

지도 SVG는 67KB(gzip 약 25KB)라 정적 자산으로 두고 `<img>`로 읽는다. 컴포넌트에 인라인하면
TSX가 감당이 안 된다. 곡선·금·타깃 도형만 TS로 생성해 인라인한다(7KB).

앱은 Patrick Hand를 쓰지만 카드에 글자가 없어서 웹폰트는 싣지 않는다. 글자를 다시 넣게 되면
`next/font`의 `Patrick_Hand`를 `preload: false`로 추가할 것.


### 나전 카드만 이미지가 아니라 컴포넌트다

[NajeonCard.tsx](src/components/public/NajeonCard.tsx). `cardSrc` 대신 `cardKind: "najeon"`을
주면 두 렌더 지점이 이미지 대신 이 컴포넌트를 그린다.

**왜 이미지가 아닌가** — 나전 카드의 내용은 정지 화면이 아니라 앱의 핵심 연출인 **덧쓰기**다.
사전 뜻이 회색으로 물러나고 그 위에 내가 쓴 문장이 한 글자씩 타이핑된다. PNG로는 이걸 못 담는다.
Already Me도 이미지 위에 타이핑 오버레이를 얹지만, 나전은 물러나는 텍스트까지 있어서
오버레이로는 안 되고 카드 전체가 살아있어야 한다.

**왜 비율이 폰 화면이 아닌가** — 실제 앱 스크린샷은 약 1:2.17(724×1568)인데, 형제 카드는
PerFact 315:439(1:1.39), Already Me 704:913(1:1.30)이다. 1:2.17을 그대로 쓰면 Services 페이지에서
260px 너비 → 564px 높이로 혼자 두 배 길어져 줄 리듬이 깨진다. 그래서 **iOS 상태바와 하단 여백을
빼고 형제 카드와 같은 315×439로 맞췄다.** 웹사이트에 가짜 상태바가 있는 것도 어색하다.
같은 이유로 앱 하단의 `덧쓰기 / 다시 찾기` 버튼도 뺐다 — 웹에서는 눌리지 않는 가짜 버튼이 된다.

**크기 대응** — Home은 높이 기준(`h-[260px]`~`lg:h-[380px]`), Services는 너비 기준
(`w-[220px] md:w-[260px]`)으로 슬롯 규칙이 다르다. 그래서 카드는 **315×439 고정 크기로 그린 뒤
`--najeon-scale`로 축소**한다. 호출 지점이 브레이크포인트마다 이 값을 준다
(Home `0.592/0.683/0.774/0.866` = 높이÷439, Services `0.698/0.825` = 너비÷315).
타이포를 한 번만 정하면 두 곳이 정확히 같은 그림이 된다. 슬롯 크기를 바꾸면 이 값도 다시 계산할 것.

**3D 틸트는 꺼져 있다** (`staticCard: true`). 안 그러면 호버 한 번에 카드가 펴지는 동작과
덧쓰기 연출이 동시에 일어나 서로 잡아먹는다. Already Me도 같은 이유로 꺼져 있다.

**모션** — [globals.css](src/app/globals.css)의 `.najeon-*`. 사전 뜻은 `transition`(1800ms,
`cubic-bezier(0.22, 1, 0.36, 1)`, 줄마다 120ms 시차), 타이핑은 글자마다 span을 만들고
`transition-delay: calc(var(--i) * 90ms)`.

⚠️ **타이핑은 `animation`이 아니라 `transition`이어야 한다.** 처음에 `animation ... forwards`로
만들었더니 문장이 완성됐다가 뒷부분이 도로 사라졌다. 애니메이션은 끝나고 나면 남는 값이
fill-mode 처리에 달려 있고, `steps(1, end)` + 1ms 지속시간은 그 처리가 가장 불안정한 조합이다.
트랜지션은 셀렉터가 맞는 동안 그 상태를 그냥 유지하므로 "호버하는 내내 문장이 남아 있어야 한다"가
구조적으로 보장된다. 시차를 호버 쪽 규칙에만 두어서, 들어올 때는 한 글자씩 찍히고 나갈 때는
한 번에 지워진다.

Already Me가 쓰는 `width: 19ch` + `steps()` 방식은 한글에 못 쓴다 — `ch`는 "0"의 너비라 한글 폭과
안 맞고, 줄바꿈되면 클리핑이 깨진다. `prefers-reduced-motion: reduce`에서는 둘 다 즉시 최종 상태로 간다.

**터치 대응** — 이 저장소에서 유일하게 `"use client"`인 애니메이션이다. 포인터 기기는 `:hover`로
동작하고, `(hover: none)`인 기기는 IntersectionObserver로 화면에 들어올 때 1회 자동 재생한 뒤
관찰을 끊는다. 덧쓰기 과정 자체가 메시지라 모바일에서 결과만 보여주면 의미가 사라져서 이렇게 했다.

**폰트** — 나눔명조를 [layout.tsx](src/app/layout.tsx)에서 `next/font/google`로 로드한다.
`preload: false`라 첫 로딩을 막지 않고, 도착 전에는 `AppleMyungjo`/`Batang`/`serif`로 떨어진다.
⚠️ `subsets`를 일부러 지정하지 않았다 — next/font의 이 폰트 메타데이터가 `"latin"`만 인정해서
`subsets: ["korean"]`은 타입 에러가 나고, `["latin"]`을 주면 한글 글리프가 빠진다. 생략하면
(preload가 꺼져 있어 허용된다) 유니코드 레인지 196조각을 전부 받아두고 브라우저가 실제로 쓰는
조각만 내려받는다.

**색은 컴포넌트에 가둬놨다** — 종이색/먹색/청먹/회색은 `.najeon-card`의 지역 커스텀 속성이다.
`@theme inline`의 브랜드 팔레트에 넣지 말 것. 사이트 브랜드 색이 아니라 앱 색이다.

카드 문구는 한국어 고정이다(ko/en 분기 없음). 한국어 사전 앱의 화면이라 번역 대상이 아니다.

### 이미지 자산

사이트 배경은 `--color-background: #080808`(거의 검정). **투명 배경 PNG를 올릴 때는
알파가 실제로 0인지 확인할 것.** `public/brand/logo.png`는 캔버스 전체에 알파 4~8 정도의
흰 막이 깔려 있어서 헤더에 옅은 사각형이 보였다(2026-09-20에 알파 ≤20을 0으로 잘라 수정).
Pillow로 알파 히스토그램을 보면 바로 드러난다.

## 새 서비스 추가 체크리스트

1. [src/data/services.ts](src/data/services.ts) — `SERVICES`에 객체 추가.
   새 카테고리를 쓰면 `ServiceCategory` 유니온에도 추가.
2. [src/app/\[lang\]/works/page.tsx](src/app/[lang]/works/page.tsx) — 새 카테고리면
   `CATEGORY_LABELS` + `WHITE_CATEGORIES` 등록.
3. [src/app/\[lang\]/page.tsx](src/app/[lang]/page.tsx) — **ko 배열과 en 배열 양쪽에** 항목 추가.
   `href`는 `/${l}/works#<slug>` (Services 페이지의 `section id`가 slug다).
4. `public/services/<slug>.png` — 카드 이미지. 없으면 플레이스홀더로 버틸 수 있다.
5. support / privacy / terms — 공용 문구로 충분하면 **건드릴 필요 없음** (1번만 하면 자동 생성).
   서비스별 문구가 필요하면 해당 페이지의 `INTRO_BY_SLUG` / `SECTIONS_BY_SLUG` /
   `UPDATED_DATE_BY_SLUG`에 추가.

## 로컬 실행

```
cd threemonkids
npm run dev      # http://localhost:3000
npx tsc --noEmit # 타입 체크
```

⚠️ `npx tsc --noEmit`은 `.next/types/validator.ts`에서 존재하지 않는 `src/app/admin/*`
라우트를 찾는 에러를 뱉는다. **오래된 빌드 산출물 때문이며 소스와 무관하다.**
실제 에러만 보려면 `npx tsc --noEmit | grep "^src/"`.

## 나중에 고칠 것

의도적으로 미뤄둔 것들. 새 작업에 끼워 넣지 말고 별도로 처리할 것.

- **Home ↔ Services 데이터 중복 해소** — Home이 `SERVICES`를 읽게 만들어 3중 편집을 없애기.
  Home은 짧은 문구(`supportCopy`)를, Services는 긴 문구(`description_*`)를 쓰므로
  `Service` 타입에 `home_*` 필드를 추가하는 방향이 유력.
- **죽은 Supabase 라우트 정리** — `/[lang]/[service]/{support,privacy,terms}`,
  `/[lang]/works/[slug]` 및 관련 `lib/db/public.ts` 코드. 도달 불가 상태.
- **태그 라벨 다국어화** — `CATEGORY_LABELS`를 ko/en 쌍으로. 하면 기존 Diary/News/App까지
  전부 한글 라벨을 정해야 하므로 일괄 작업 필요.
