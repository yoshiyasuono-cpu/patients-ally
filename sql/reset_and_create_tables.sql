-- ============================================
-- 患者の味方 データベース完全リセット
-- Supabase SQL Editor に貼り付けて実行
-- 実行日: 2026-03-29
-- ============================================

-- ============================================
-- Step 1: 既存テーブルの全削除
-- ============================================
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- ============================================
-- Step 2: clinicsテーブル（公式情報のみ）
-- ============================================
CREATE TABLE clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  area TEXT,                          -- エリア（新宿、渋谷等）
  address TEXT,                       -- 住所
  station TEXT,                       -- 最寄り駅
  tel TEXT,
  url TEXT,                           -- 公式サイトURL
  fee_min INTEGER,                    -- 最低料金（円、公式記載）
  fee_max INTEGER,                    -- 最高料金（円、公式記載）
  fee_note TEXT,                      -- 料金備考
  total_fee BOOLEAN DEFAULT FALSE,    -- トータルフィー制かどうか
  wire_available BOOLEAN DEFAULT FALSE,       -- ワイヤー矯正対応
  invisalign_available BOOLEAN DEFAULT FALSE, -- マウスピース矯正対応
  risk_description BOOLEAN DEFAULT FALSE,     -- リスク記載の有無
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- clinicsのRLSポリシー（読み取りは全員、書き込みは認証済みのみ）
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select_all"
  ON clinics FOR SELECT
  USING (true);

CREATE POLICY "clinics_insert_auth"
  ON clinics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clinics_update_auth"
  ON clinics FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- Step 3: reviewsテーブル（患者口コミ）
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  nickname TEXT,
  treatment_type TEXT,                -- 治療種別（ワイヤー、マウスピース等）
  estimate_amount INTEGER,            -- 見積金額（円）
  actual_amount INTEGER,              -- 実際の支払額（円）
  extra_cost_occurred BOOLEAN DEFAULT FALSE,  -- 追加費用発生有無
  extra_cost_detail TEXT,             -- 追加費用の詳細
  explanation_clarity SMALLINT CHECK (explanation_clarity BETWEEN 1 AND 5),  -- 説明のわかりやすさ
  price_transparency SMALLINT CHECK (price_transparency BETWEEN 1 AND 5),   -- 価格透明性
  pushed_to_sign SMALLINT CHECK (pushed_to_sign BETWEEN 1 AND 5),           -- 契約を急かされたか
  risk_explained BOOLEAN,             -- リスク説明があったか
  comment_good TEXT,                  -- 良かった点
  comment_bad TEXT,                   -- 気になった点
  verified BOOLEAN DEFAULT FALSE,     -- 受診確認済みフラグ
  created_at TIMESTAMPTZ DEFAULT now()
);

-- reviewsのRLSポリシー（読み取りは全員、投稿は全員、更新は不可）
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_all"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Step 4: surveysテーブル（患者アンケート）
-- ============================================
CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group TEXT,                     -- 年代（20代、30代等）
  gender TEXT,                        -- 性別
  concern TEXT,                       -- 矯正を考えたきっかけ
  priority TEXT,                      -- 最も重視すること（費用、期間、見た目等）
  budget_min INTEGER,                 -- 予算下限（円）
  budget_max INTEGER,                 -- 予算上限（円）
  preferred_type TEXT,                -- 希望する治療法（ワイヤー、マウスピース、未定）
  fear TEXT,                          -- 不安に思うこと
  visited_count INTEGER DEFAULT 0,    -- これまでの相談院数
  created_at TIMESTAMPTZ DEFAULT now()
);

-- surveysのRLSポリシー（投稿は全員、読み取りは認証済みのみ）
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_insert_all"
  ON surveys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "surveys_select_auth"
  ON surveys FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_clinics_area ON clinics(area);
CREATE INDEX idx_reviews_clinic_id ON reviews(clinic_id);

-- ============================================
-- 完了確認
-- ============================================
SELECT 'テーブル作成完了' AS status,
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS table_count;
