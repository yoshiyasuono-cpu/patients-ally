-- ============================================
-- clinicsテーブルにスクレイピング取得フィールドを追加
-- Supabase SQL Editor で実行
-- 実行日: 2026-04-07
-- ============================================

-- バッジ系（基本情報セクション）
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS free_consultation BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS holiday_available BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS evening_available BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS dental_loan BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS certified_orthodontist BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS invisalign_certified BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS total_fee_system BOOLEAN DEFAULT FALSE;

-- 対応治療（既存のwire/invisalignに加えて）
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS lingual_available BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS partial_available BOOLEAN DEFAULT FALSE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS kids_available BOOLEAN DEFAULT FALSE;

-- 治療別料金
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS fee_wire_min INTEGER;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS fee_wire_max INTEGER;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS fee_invisalign_min INTEGER;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS fee_invisalign_max INTEGER;

-- データソース情報
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS data_source_url TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- 確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'clinics'
ORDER BY ordinal_position;
