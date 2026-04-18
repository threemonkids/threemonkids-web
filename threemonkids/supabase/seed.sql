-- =============================================================
-- seed.sql
-- Demo data for local development and preview environments.
-- Do NOT run in production.
-- Assumes auth.users already has a super admin user.
-- Replace 'YOUR-AUTH-USER-UUID' with your actual Supabase
-- auth user ID before running.
-- =============================================================

-- -----------------------------------------------------------
-- Admin profile
-- -----------------------------------------------------------
INSERT INTO admin_profiles (user_id, role, display_name)
VALUES
  ('YOUR-AUTH-USER-UUID', 'super_admin', 'Studio Admin')
ON CONFLICT (user_id) DO NOTHING;


-- -----------------------------------------------------------
-- Team members
-- -----------------------------------------------------------
INSERT INTO team_members (name_ko, name_en, role_ko, role_en, bio_ko, bio_en, monkey_type, is_public, sort_order)
VALUES
  (
    '김민준', 'Minjun Kim',
    '프로덕트 디자이너', 'Product Designer',
    '감각을 믿고, 남의 시선보다 제품을 먼저 본다.',
    'Trusts instinct over opinion. Builds with the eye, not the crowd.',
    'sunglasses', true, 1
  ),
  (
    '이서연', 'Seoyeon Lee',
    '풀스택 개발자', 'Full-stack Engineer',
    '집중이 무기다. 소음을 끄고 코드를 짠다.',
    'Focus is the weapon. Tunes out the noise, ships the code.',
    'headphones', true, 2
  ),
  (
    '박준호', 'Junho Park',
    '프로덕트 매니저', 'Product Manager',
    '설명보다 실행. 말보다 결과물로 보여준다.',
    'Execution over explanation. Results over rhetoric.',
    'mask', true, 3
  );


-- -----------------------------------------------------------
-- Works
-- (work_pages rows are auto-created by trigger)
-- -----------------------------------------------------------
INSERT INTO works (
  slug, title_ko, title_en,
  summary_ko, summary_en,
  description_ko, description_en,
  why_it_exists_ko, why_it_exists_en,
  core_features_ko, core_features_en,
  monkey_types, status, platforms,
  is_featured, is_published, sort_order
)
VALUES
  (
    'memozip',
    '메모집', 'MemoZip',
    '생각을 빠르게 잡는 메모 앱', 'Capture thoughts before they disappear',
    '메모집은 복잡한 메모 앱이 지겨운 사람들을 위해 만들었습니다. 열고, 쓰고, 닫으면 끝.',
    'MemoZip was built for people tired of overcomplicated note apps. Open it, write, close it. Done.',
    '완벽한 메모 앱을 찾다 지쳐서, 그냥 직접 만들었다.',
    'We got tired of looking for the perfect notes app. So we built our own.',
    '["즉시 캡처", "태그 없음", "폴더 없음", "검색으로 찾기"]',
    '["Instant capture", "No tags", "No folders", "Find by search"]',
    ARRAY['sunglasses']::monkey_type[],
    'live',
    ARRAY['ios', 'android']::platform_type[],
    true, true, 1
  ),
  (
    'focusboard',
    '포커스보드', 'FocusBoard',
    '집중을 방해하는 것들을 없애는 작업 공간', 'A workspace that removes everything in the way of focus',
    '포커스보드는 알림, 탭, 프로젝트 트리가 없는 작업 공간입니다. 지금 해야 할 일 하나만 보입니다.',
    'FocusBoard is a workspace with no notifications, no tabs, no project trees. Just the one thing you need to do right now.',
    '멀티태스킹 도구가 오히려 집중을 망친다는 걸 깨닫고 만들었다.',
    'We realized multi-tasking tools were killing focus. So we built the opposite.',
    '["단일 작업 뷰", "타이머 내장", "방해 없는 UI"]',
    '["Single task view", "Built-in timer", "Distraction-free UI"]',
    ARRAY['headphones']::monkey_type[],
    'coming_soon',
    ARRAY['web']::platform_type[],
    false, true, 2
  );


-- -----------------------------------------------------------
-- work_pages content for published works
-- (rows already created by trigger — just update content)
-- -----------------------------------------------------------
UPDATE work_pages
SET
  support_ko  = '문의사항이 있으시면 support@threemonkids.com 으로 이메일을 보내주세요. 영업일 기준 1-2일 내에 답변드립니다.',
  support_en  = 'For any inquiries, please email support@threemonkids.com. We respond within 1-2 business days.',
  privacy_ko  = '메모집은 사용자의 개인정보를 소중히 여깁니다. 수집하는 정보는 서비스 개선에만 사용됩니다.',
  privacy_en  = 'MemoZip values your privacy. Any information we collect is used solely for improving the service.',
  terms_ko    = '메모집을 사용함으로써 본 이용약관에 동의하시는 것으로 간주됩니다.',
  terms_en    = 'By using MemoZip, you agree to these Terms of Service.'
WHERE work_id = (SELECT id FROM works WHERE slug = 'memozip');

UPDATE work_pages
SET
  support_ko  = 'FocusBoard 관련 문의는 support@threemonkids.com으로 연락주세요.',
  support_en  = 'For FocusBoard support, contact us at support@threemonkids.com.',
  privacy_ko  = 'FocusBoard는 사용자 데이터를 수집하지 않습니다.',
  privacy_en  = 'FocusBoard does not collect any user data.',
  terms_ko    = 'FocusBoard를 사용함으로써 본 약관에 동의합니다.',
  terms_en    = 'By using FocusBoard, you agree to these terms.'
WHERE work_id = (SELECT id FROM works WHERE slug = 'focusboard');


-- -----------------------------------------------------------
-- work_members (connect team to works)
-- -----------------------------------------------------------
INSERT INTO work_members (work_id, member_id, contribution_role_ko, contribution_role_en, is_primary)
SELECT
  w.id, m.id,
  'UI 디자인 & 제품 기획', 'UI Design & Product',
  true
FROM works w, team_members m
WHERE w.slug = 'memozip' AND m.name_en = 'Minjun Kim';

INSERT INTO work_members (work_id, member_id, contribution_role_ko, contribution_role_en, is_primary)
SELECT
  w.id, m.id,
  'iOS & Android 개발', 'iOS & Android Development',
  false
FROM works w, team_members m
WHERE w.slug = 'memozip' AND m.name_en = 'Seoyeon Lee';

INSERT INTO work_members (work_id, member_id, contribution_role_ko, contribution_role_en, is_primary)
SELECT
  w.id, m.id,
  'UI 디자인', 'UI Design',
  true
FROM works w, team_members m
WHERE w.slug = 'focusboard' AND m.name_en = 'Minjun Kim';

INSERT INTO work_members (work_id, member_id, contribution_role_ko, contribution_role_en, is_primary)
SELECT
  w.id, m.id,
  '웹 개발', 'Web Development',
  false
FROM works w, team_members m
WHERE w.slug = 'focusboard' AND m.name_en = 'Seoyeon Lee';
