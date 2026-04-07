// 金額を万円表記に変換するヘルパー
function toMan(yen) {
  return Math.round(yen / 10000);
}

// Supabase clinicsテーブル → フロントエンド形式に変換
export function mapFromDb(c) {
  // 対応治療法をタグ配列に変換
  const treatments = [];
  if (c.wire_available) treatments.push('ワイヤー矯正');
  if (c.invisalign_available) treatments.push('マウスピース矯正');

  // 料金レンジの表示テキスト（全体）
  let priceRange = '要問合せ';
  if (c.fee_min && c.fee_max) {
    priceRange = `${toMan(c.fee_min)}〜${toMan(c.fee_max)}万円`;
  } else if (c.fee_min) {
    priceRange = `${toMan(c.fee_min)}万円〜`;
  } else if (c.fee_max) {
    priceRange = `〜${toMan(c.fee_max)}万円`;
  }

  // 治療別料金テキスト
  let feeWireRange = null;
  if (c.fee_wire_min && c.fee_wire_max) {
    feeWireRange = `${toMan(c.fee_wire_min)}〜${toMan(c.fee_wire_max)}万円`;
  } else if (c.fee_wire_min) {
    feeWireRange = `${toMan(c.fee_wire_min)}万円〜`;
  } else if (c.fee_wire_max) {
    feeWireRange = `〜${toMan(c.fee_wire_max)}万円`;
  }

  let feeInvisalignRange = null;
  if (c.fee_invisalign_min && c.fee_invisalign_max) {
    feeInvisalignRange = `${toMan(c.fee_invisalign_min)}〜${toMan(c.fee_invisalign_max)}万円`;
  } else if (c.fee_invisalign_min) {
    feeInvisalignRange = `${toMan(c.fee_invisalign_min)}万円〜`;
  } else if (c.fee_invisalign_max) {
    feeInvisalignRange = `〜${toMan(c.fee_invisalign_max)}万円`;
  }

  return {
    id: c.id,
    name: c.name,
    area: c.area || '',
    address: c.address || '',
    station: c.station || '',
    tel: c.tel || '',
    url: c.url || '',
    feeMin: c.fee_min,
    feeMax: c.fee_max,
    feeNote: c.fee_note || '',
    totalFee: c.total_fee || false,
    wireAvailable: c.wire_available || false,
    invisalignAvailable: c.invisalign_available || false,
    riskDescription: c.risk_description || false,
    treatments,
    priceRange,
    // スクレイピング追加フィールド
    freeConsultation: c.free_consultation || false,
    weekendHoliday: c.holiday_available || false,
    nightClinic: c.evening_available || false,
    dentalLoan: c.dental_loan || false,
    certifiedDoctor: c.certified_orthodontist || false,
    invisalignCertified: c.invisalign_certified || false,
    totalFeeSystem: c.total_fee_system || false,
    lingualAvailable: c.lingual_available || false,
    partialAvailable: c.partial_available || false,
    kidsAvailable: c.kids_available || false,
    feeWireRange,
    feeInvisalignRange,
    dataSourceUrl: c.data_source_url || '',
    lastVerifiedAt: c.last_verified_at || null,
  };
}
