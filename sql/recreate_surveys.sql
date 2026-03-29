-- ============================================
-- surveysテーブル再作成（アンケート項目変更）
-- Supabase SQL Editor に貼り付けて実行
-- ============================================

DROP TABLE IF EXISTS surveys CASCADE;

CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL,                    -- クリニック名
  status TEXT NOT NULL,                          -- 相談のみ / 契約した / 治療中 / 治療完了
  estimate_amount INTEGER,                       -- 初回説明された総額（円）
  actual_amount INTEGER,                         -- 実際の支払総額（円）
  extra_cost TEXT,                               -- 追加費用の発生（あり / なし / 不明）
  extra_cost_detail TEXT,                        -- 追加費用の内容（任意）
  risk_explanation TEXT,                          -- リスク説明（十分 / 一部 / なし）
  pushed_to_sign SMALLINT CHECK (pushed_to_sign BETWEEN 1 AND 5),       -- 契約を急かされたか
  explanation_clarity SMALLINT CHECK (explanation_clarity BETWEEN 1 AND 5), -- 説明のわかりやすさ
  overall_satisfaction SMALLINT CHECK (overall_satisfaction BETWEEN 1 AND 5), -- 総合満足度
  free_comment TEXT,                             -- 自由記述（任意）
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: 投稿は全員可、閲覧は認証済みのみ
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_insert_all"
  ON surveys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "surveys_select_auth"
  ON surveys FOR SELECT
  USING (auth.role() = 'authenticated');

SELECT 'surveys テーブル再作成完了' AS status;
