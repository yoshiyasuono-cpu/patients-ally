-- AIスコア格納カラムの追加
-- Supabase の SQL Editor から手動で実行すること

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS score JSONB;

-- コメント
COMMENT ON COLUMN clinics.score IS
'患者の味方AIスコア。
構造: {
  total: number,               -- 重み付き総合スコア（5点満点）
  price_transparency: number,  -- 料金の透明性
  skill: number,               -- 技術・仕上がり
  hospitality: number,         -- 説明・ホスピタリティ
  process_integrity: number,   -- プロセスの誠実さ
  overall_satisfaction: number -- 総合満足度
}
口コミが0件の場合はnull。';
