-- ============================================
-- reviewsテーブルにstatus・利害関係カラム追加
-- Supabase SQL Editor に貼り付けて実行
-- ============================================

-- ステータスカラム追加（pending/published/rejected）
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('submitted', 'pending', 'published', 'rejected'));

-- 利害関係チェック用カラム追加
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS requested_by_clinic BOOLEAN DEFAULT FALSE;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS received_incentive BOOLEAN DEFAULT FALSE;

-- RLSポリシー更新: 閲覧はpublishedのみに制限
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;

CREATE POLICY "reviews_select_published"
  ON reviews FOR SELECT
  USING (status = 'published');

-- 管理者（authenticated）は全件閲覧可能
CREATE POLICY "reviews_select_admin"
  ON reviews FOR SELECT
  USING (auth.role() = 'authenticated');

SELECT 'reviews テーブル更新完了' AS status;
