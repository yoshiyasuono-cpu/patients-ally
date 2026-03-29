// Supabase clinicsテーブル → フロントエンド形式に変換
export function mapFromDb(c) {
  // 対応治療法をタグ配列に変換
  const treatments = [];
  if (c.wire_available) treatments.push('ワイヤー矯正');
  if (c.invisalign_available) treatments.push('マウスピース矯正');

  // 料金レンジの表示テキスト
  let priceRange = '要問合せ';
  if (c.fee_min && c.fee_max) {
    priceRange = `${Math.round(c.fee_min / 10000)}〜${Math.round(c.fee_max / 10000)}万円`;
  } else if (c.fee_min) {
    priceRange = `${Math.round(c.fee_min / 10000)}万円〜`;
  } else if (c.fee_max) {
    priceRange = `〜${Math.round(c.fee_max / 10000)}万円`;
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
  };
}
