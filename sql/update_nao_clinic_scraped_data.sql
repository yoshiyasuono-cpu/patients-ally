-- ============================================
-- なお矯正歯科クリニックにスクレイピングデータを反映
-- Supabase SQL Editor で実行
-- 実行日: 2026-04-07
-- ============================================
-- 注意: 先に alter_clinics_add_scraped_fields.sql を実行してカラムを追加すること

UPDATE clinics
SET
  free_consultation = TRUE,
  holiday_available = TRUE,
  evening_available = TRUE,
  dental_loan = TRUE,
  certified_orthodontist = TRUE,
  invisalign_certified = TRUE,
  total_fee_system = TRUE,
  lingual_available = TRUE,
  partial_available = TRUE,
  kids_available = TRUE,
  fee_wire_min = 770000,
  fee_wire_max = 1100000,
  fee_invisalign_min = 880000,
  fee_invisalign_max = 1100000,
  data_source_url = 'https://nao-ortho.com/',
  last_verified_at = '2026-04-07T00:00:00Z'
WHERE id = '3b667e24-aa24-47bf-bd97-008f5b039627';

-- 確認
SELECT name, free_consultation, holiday_available, evening_available,
       dental_loan, certified_orthodontist, invisalign_certified,
       total_fee_system, lingual_available, partial_available, kids_available,
       fee_wire_min, fee_wire_max, fee_invisalign_min, fee_invisalign_max,
       data_source_url, last_verified_at
FROM clinics
WHERE id = '3b667e24-aa24-47bf-bd97-008f5b039627';
