import { supabase } from './supabase';
import { clinics } from '../data/clinics_real';

// clinics_real.js のデータ形式 → Supabase カラム名に変換
function mapClinic(c) {
  return {
    id: c.id,
    name: c.name,
    short_name: c.shortName,
    area: c.area,
    access: c.access,
    hp_url: c.hpUrl,
    director: c.director,
    director_title: c.directorTitle,
    board_certified: /認定医|専門医/.test(c.directorTitle || ''),
    tel: null,
    hours: c.hours,
    established: c.established,
    description: c.description,
    rating: c.rating,
    review_count: c.reviewCount,
    price_range: c.priceRange,
    thumbnail_img: c.thumbnailImg,
    treatments: c.treatments,
    prices: c.prices,
    fee_system: c.feeSystem,
    adjustment_fee: c.adjustmentFee,
    retainer_included: c.retainerIncluded,
    dental_loan: c.dentalLoan,
    refund_policy: c.returnGuarantee,
    scanner: c.scanner,
    itero: /あり/.test(c.scanner || ''),
    ct: c.ct,
    dental_ct: /あり/.test(c.ct || ''),
    ceph: c.ceph,
    web_booking: /あり/.test(c.webBooking || ''),
    web_booking_detail: c.webBooking,
    line_consult: /あり/.test(c.lineConsult || ''),
    line_consult_detail: c.lineConsult,
    case_photos: c.casePhotos,
    risk_disclosure: c.riskDisclosure,
    transparency_score: c.transparencyScore,
    badge: c.badge,
    badge_text: c.badgeText,
    reviews: c.reviews,
    cases: c.cases,
  };
}

// clinicsテーブルに全データをupsert
export async function seedClinics() {
  const rows = clinics.map(mapClinic);
  const { data, error } = await supabase
    .from('clinics')
    .upsert(rows, { onConflict: 'id' });

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
  };
}
