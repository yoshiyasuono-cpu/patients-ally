import { supabase } from './supabase';
import { clinics } from '../data/clinics_real';

// reviews 配列から患者の味方AIスコアを計算する
function calcAiScore(reviews) {
  if (!reviews || reviews.length === 0) return null;

  const axes = [
    'price_transparency',
    'skill',
    'hospitality',
    'process_integrity',
    'overall_satisfaction',
  ];

  // 各軸の平均を計算
  const axisScores = {};
  axes.forEach(axis => {
    const vals = reviews
      .map(r => r.scores?.[axis])
      .filter(v => v != null && !isNaN(v));
    axisScores[axis] = vals.length > 0
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      : null;
  });

  // 重み付き平均（患者の味方独自アルゴリズム）
  const weights = {
    price_transparency:   1.3,
    skill:                1.2,
    hospitality:          1.0,
    process_integrity:    1.3,
    overall_satisfaction: 1.2,
  };

  const weightedVals = axes
    .filter(a => axisScores[a] != null)
    .map(a => ({ score: axisScores[a], weight: weights[a] }));

  if (weightedVals.length === 0) return null;

  const totalWeight = weightedVals.reduce((a, b) => a + b.weight, 0);
  const weightedSum = weightedVals.reduce((a, b) => a + b.score * b.weight, 0);
  const total = Math.round((weightedSum / totalWeight) * 10) / 10;

  return { ...axisScores, total };
}

// clinics_real.js のデータ形式 → Supabase カラム名に変換
function mapClinic(c) {
  const aiScore = calcAiScore(c.reviews);
  return {
    name: c.name,
    short_name: c.shortName,
    area: c.area,
    address: c.address || null,
    access: c.access,
    hp_url: c.hpUrl || null,
    director: c.director,
    director_title: c.directorTitle,
    board_certified: /認定医|専門医/.test(c.directorTitle || ''),
    tel: c.tel || null,
    hours: c.hours,
    established: c.established,
    description: c.description,
    thumbnail_img: c.thumbnailImg || null,
    treatments: c.treatments || [],
    prices: c.prices || {},
    price_range: c.priceRange || null,
    fee_system: c.feeSystem || null,
    adjustment_fee: c.adjustmentFee || null,
    retainer_included: c.retainerIncluded || null,
    dental_loan: c.dentalLoan || null,
    refund_policy: c.returnGuarantee || null,
    scanner: c.scanner || null,
    ct: c.ct || null,
    ceph: c.ceph || null,
    web_booking: /あり/.test(c.webBooking || ''),
    web_booking_detail: c.webBooking || null,
    line_consult: /あり/.test(c.lineConsult || ''),
    line_consult_detail: c.lineConsult || null,
    case_photos: c.casePhotos || null,
    risk_disclosure: c.riskDisclosure || null,
    transparency_score: c.transparencyScore,
    badge: c.badge,
    badge_text: c.badgeText || null,
    rating: c.rating || null,
    review_count: c.reviews?.length ?? c.reviewCount ?? 0,
    reviews: c.reviews || [],
    cases: c.cases || [],
    average_satisfaction: c.rating || null,
    total_cases: c.cases ? c.cases.length : 0,
    score: aiScore,
  };
}

// clinicsテーブルに全データをupsert
export async function seedClinics() {
  const rows = clinics.map(mapClinic);
  const { data, error } = await supabase
    .from('clinics')
    .upsert(rows, { onConflict: 'name' });

  if (error) throw error;
  return rows.length;
}

// Supabase から取得したデータをコンポーネントが使う形式に変換
export function mapFromDb(c) {
  return {
    id: c.id,
    name: c.name,
    shortName: c.short_name,
    area: c.area,
    access: c.access,
    hpUrl: c.hp_url,
    director: c.director,
    directorTitle: c.director_title,
    rating: c.rating,
    reviewCount: c.review_count,
    hours: c.hours,
    description: c.description,
    established: c.established,
    thumbnailImg: c.thumbnail_img,
    treatments: c.treatments || [],
    prices: c.prices || {},
    priceRange: c.price_range,
    feeSystem: c.fee_system,
    adjustmentFee: c.adjustment_fee,
    retainerIncluded: c.retainer_included,
    dentalLoan: c.dental_loan,
    returnGuarantee: c.refund_policy,
    scanner: c.scanner,
    ct: c.ct,
    ceph: c.ceph,
    webBooking: c.web_booking_detail || (c.web_booking ? 'あり' : '不明'),
    lineConsult: c.line_consult_detail || (c.line_consult ? 'あり' : '不明'),
    casePhotos: c.case_photos,
    riskDisclosure: c.risk_disclosure,
    transparencyScore: c.transparency_score,
    badge: c.badge,
    badgeText: c.badge_text,
    reviews: c.reviews || [],
    cases: c.cases || [],
    address: c.address,
    tel: c.tel,
    score: c.score || null,
  };
}
