-- =====================================================
-- survey_responses テーブル（回答データ）
-- =====================================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  clinic_slug TEXT,
  clinic_name_snapshot TEXT,
  source_channel TEXT DEFAULT 'cliniccompass_inline',
  -- source_channel: 'cliniccompass_inline' or 'kyoseidatalab_external'

  -- 回答内容
  has_visited TEXT,             -- Q1: 相談のみ / 治療中 / 治療完了 / まだこれから
  fee_presented TEXT,           -- Q2: 初回見積の提示有無
  extra_cost TEXT,              -- Q3: 想定外の追加費用の有無
  extra_cost_explanation TEXT,  -- Q4: 追加費用の事前説明
  risk_explanation TEXT,        -- Q5: リスク説明の有無
  document_provided TEXT,       -- Q6: 書面・資料の提供
  pressure TEXT,                -- Q7: 契約を急かされたか
  satisfaction INTEGER,         -- Q8: 全体納得度（1〜5）

  -- コメント
  raw_comment TEXT,             -- 自由記述（そのまま）
  published_comment TEXT,       -- 審査・編集後の公開用コメント

  -- 管理
  is_valid BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending',
  -- moderation_status: 'pending' / 'approved' / 'rejected'
  matched_clinic_confidence TEXT DEFAULT 'high',
  -- 'high'（clinic_id直接）/ 'low'（外部フォームの文字列マッチ）

  created_at TIMESTAMP DEFAULT now()
);

-- RLS: INSERTは全員可、SELECTは認証済みのみ
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'insert_anon'
  ) THEN
    CREATE POLICY "insert_anon" ON survey_responses FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'select_auth'
  ) THEN
    CREATE POLICY "select_auth" ON survey_responses FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- =====================================================
-- reward_claims テーブル（謝礼情報・回答データと分離）
-- =====================================================
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_response_id UUID REFERENCES survey_responses(id),
  email TEXT NOT NULL,
  reward_status TEXT DEFAULT 'pending',
  -- 'pending' / 'sent' / 'failed'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS: INSERTは全員可、SELECTは認証済みのみ
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'insert_anon'
  ) THEN
    CREATE POLICY "insert_anon" ON reward_claims FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'select_auth'
  ) THEN
    CREATE POLICY "select_auth" ON reward_claims FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
