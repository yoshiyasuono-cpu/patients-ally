import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import before1 from '../assets/cases/before1.jpg';
import after1  from '../assets/cases/after1.png';
import before2 from '../assets/cases/before2_wire.jpg';
import after2  from '../assets/cases/after2.jpg';
import before3 from '../assets/cases/before3.jpg';
import after3  from '../assets/cases/after3.jpg';

const CASE_IMG_SETS = {
  1: { before: before1, after: after1 },
  2: { before: before2, after: after2 },
  3: { before: before3, after: after3 },
};

const DUMMY_CASES = [
  {
    id: 'dummy1',
    treatment: 'マウスピース矯正',
    duration: '18ヶ月',
    before: '叢生（ガタガタ）。前歯のでこぼこが気になっていた。',
    after: 'インビザラインにて改善。総額95万円（調整料込）。',
    beforeImg: 'https://images.unsplash.com/photo-1588776814546-1ffedac80fc0?w=400&h=300&fit=crop',
    afterImg: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
  },
  {
    id: 'dummy2',
    treatment: 'ワイヤー矯正',
    duration: '24ヶ月',
    before: '上顎前突（出っ歯）。口元が気になっていた。',
    after: '表側ワイヤーにて改善。抜歯あり。総額88万円。',
    beforeImg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop',
    afterImg: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
  },
];

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffedac80fc0?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1570612861542-284f4c12e75f?w=800&h=300&fit=crop',
];

const MARKET_AVG = {
  wire: 750000,
  mouthpiece: 950000,
  ceramic: 150000,
  partialWire: 350000,
  children: 400000,
  whitening: 55000,
  veneer: 160000,
};

function formatPrice(p) {
  return p >= 10000 ? Math.round(p / 10000) + '万円' : p.toLocaleString() + '円';
}

const TREATMENT_COLORS = {
  'マウスピース矯正': 'bg-blue-50 text-blue-700 border-blue-200',
  'ワイヤー矯正': 'bg-purple-50 text-purple-700 border-purple-200',
  'セラミック矯正': 'bg-pink-50 text-pink-700 border-pink-200',
  '小児矯正': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'ホワイトニング': 'bg-teal-50 text-teal-700 border-teal-200',
  'ラミネートベニア': 'bg-rose-50 text-rose-700 border-rose-200',
};

// 4カテゴリのスコアを算出
function calcScores(clinic) {
  // 料金透明性
  const priceScore =
    clinic.transparencyScore === '高' ? 5 :
    clinic.transparencyScore === '中' ? 3 : 1;

  // 設備充実度（scanner/ct/cephのうち「あり」含む数）
  const equipCount = [clinic.scanner, clinic.ct, clinic.ceph]
    .filter(v => v && /あり/.test(v)).length;
  const equipScore = equipCount === 3 ? 5 : equipCount === 2 ? 4 : equipCount === 1 ? 2 : 1;

  // リスク開示
  const riskScore =
    clinic.riskDisclosure && /あり/.test(clinic.riskDisclosure) ? 5 :
    clinic.riskDisclosure && /なし/.test(clinic.riskDisclosure) ? 2 : 1;

  // 口コミ充実
  const rc = clinic.reviewCount || 0;
  const reviewScore = rc >= 10 ? 5 : rc >= 5 ? 3 : rc >= 1 ? 2 : 1;

  const overall = Math.round(((priceScore + equipScore + riskScore + reviewScore) / 4) * 10) / 10;

  return { priceScore, equipScore, riskScore, reviewScore, overall };
}

// ★表示コンポーネント（amber-400）
function StarScore({ score, max = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < score ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

function CaseImage({ src, alt, label, labelColor, overlayColor, description, borderLeft = false }) {
  return (
    <div
      className={`relative${borderLeft ? ' border-l border-white/40' : ''}`}
      style={{ height: '200px' }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 ${overlayColor} pointer-events-none`} />
      <div
        className="absolute bottom-0 left-0 right-0 px-2 pt-3 pb-2"
        style={{ background: 'rgba(0,0,0,0.70)' }}
      >
        <p className="text-white text-[10px] leading-snug line-clamp-3">{description}</p>
      </div>
      <span className={`absolute top-2 left-2 ${labelColor} text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest shadow`}>
        {label}
      </span>
    </div>
  );
}

function TreatmentBadge({ treatment }) {
  const color = TREATMENT_COLORS[treatment] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${color}`}>{treatment}</span>
  );
}

export default function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setClinic(mapFromDb(data));
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">
        クリニックが見つかりません
      </div>
    );
  }

  const scores = calcScores(clinic);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack backTo="/" title={clinic.shortName} />

      {/* Hero banner */}
      <div className="max-w-4xl mx-auto relative overflow-hidden" style={{ minHeight: '200px' }}>
        <img
          src={DUMMY_IMAGES[(clinic.id.charCodeAt(0) || 0) % DUMMY_IMAGES.length]}
          alt={clinic.name}
          className="w-full h-full object-cover absolute inset-0"
          style={{ minHeight: '200px' }}
        />
        <div className="absolute inset-0 bg-teal-900/75" />
        <div className="relative z-10 px-4 py-5">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{clinic.name.charAt(0)}</span>
            </div>
            <div className="flex-1" />
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {clinic.badge && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full mb-2">
                  <svg className="w-3 h-3 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {clinic.badgeText}
                </span>
              )}
              <h1 className="text-white text-xl font-bold leading-tight">{clinic.name}</h1>
              <p className="text-teal-200 text-sm mt-1">{clinic.director} 院長　{clinic.directorTitle}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-white font-bold text-lg">{clinic.priceRange}</div>
              <div className="text-teal-200 text-xs">最低料金目安</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {clinic.rating ? (
              <>
                <StarRating rating={clinic.rating} size="md" />
                <span className="text-amber-300 font-bold text-sm">{clinic.rating}</span>
                <span className="text-teal-200 text-sm">（{clinic.reviewCount}件の口コミ）</span>
              </>
            ) : (
              <span className="text-teal-300 text-xs">口コミ未取得</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== ゾーン1：公式・調査情報 ===== */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="mt-4 bg-gray-50 border-l-4 border-gray-400 p-3 mb-4 rounded-lg">
          <p className="text-gray-700 font-bold text-sm">🔍 公式・調査情報</p>
          <p className="text-gray-400 text-[10px] mt-0.5">
            患者の味方がクリニックの公式HPおよび公開情報をもとに調査・掲載しています（2026年3月時点）
          </p>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-4">

          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
            <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">i</span>
              基本情報
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">住所</span>
                <span>{clinic.address}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">アクセス</span>
                <span>{clinic.access}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">電話</span>
                <span className="text-teal-700 font-semibold">{clinic.tel}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">診療時間</span>
                <span className="leading-relaxed">{clinic.hours}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">開業</span>
                <span>{clinic.established}年</span>
              </div>
            </div>
          </div>

          {/* 料金比較表 */}
          <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
            <h2 className="text-gray-800 font-bold text-base mb-1 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-700 rounded text-white text-xs flex items-center justify-center">¥</span>
              料金比較表
            </h2>
            <p className="text-gray-400 text-xs mb-3">相場は市場平均値</p>

            {Object.keys(clinic.prices).length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-gray-400 text-sm">このクリニックはHP上に料金を公開していません</p>
                <p className="text-gray-400 text-xs mt-1">カウンセリング時に必ず総額確認をお勧めします</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(clinic.prices).map(([key, val]) => {
                  const market = MARKET_AVG[key];
                  const diff = market ? market - val.price : null;
                  return (
                    <div key={key} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-semibold text-sm">{val.name || val.label}</span>
                        <span className="text-teal-700 font-bold text-base">{formatPrice(val.price)}</span>
                      </div>
                      {market && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${diff > 0 ? 'bg-teal-400' : 'bg-orange-300'}`}
                              style={{ width: `${Math.min((val.price / market) * 100, 100)}%` }}
                            />
                          </div>
                          {diff > 0 ? (
                            <span className="text-teal-600 text-xs font-bold bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              相場より{formatPrice(diff)}お得
                            </span>
                          ) : diff < 0 ? (
                            <span className="text-orange-500 text-xs bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              相場より高め
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              相場並み
                            </span>
                          )}
                        </div>
                      )}
                      {val.note && <p className="text-gray-400 text-xs mt-1.5">{val.note}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-amber-700 text-xs leading-relaxed">
                ⚠️ 表示料金は調査時点の情報です。調整料・保定装置代・検査料が別途かかる場合があります。必ずカウンセリングで総額を確認してください。
              </p>
            </div>
          </div>

        </div>{/* end 2-col grid */}

        {/* 総合スコア表示 */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">評</span>
            患者の味方スコア
          </h2>

          {/* 総合スコア */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{scores.overall}</div>
              <div className="text-amber-400 text-xs mt-0.5">総合</div>
            </div>
            <div className="flex-1">
              <StarScore score={Math.round(scores.overall)} />
              <p className="text-gray-500 text-[10px] mt-1">料金・設備・リスク開示・口コミの4項目平均</p>
            </div>
          </div>

          {/* 4カテゴリ */}
          <div className="space-y-3">
            {[
              { label: '料金透明性', score: scores.priceScore },
              { label: '設備充実度', score: scores.equipScore },
              { label: 'リスク開示', score: scores.riskScore },
              { label: '口コミ充実', score: scores.reviewScore },
            ].map(({ label, score }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-20 flex-shrink-0">{label}</span>
                <StarScore score={score} />
                <span className="text-amber-500 text-xs font-bold">{score}</span>
              </div>
            ))}
          </div>

        </div>

        {/* 設備・利便性 アイコングリッド */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">設</span>
            設備・利便性
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🦷', label: '口腔内スキャナー', value: clinic.scanner },
              { icon: '📡', label: '歯科用CT',         value: clinic.ct },
              { icon: '📐', label: 'セファロ',          value: clinic.ceph },
              { icon: '💻', label: 'Web予約',           value: clinic.webBooking },
              { icon: '💬', label: 'LINE相談',          value: clinic.lineConsult },
            ].map(({ icon, label, value }) => {
              const ok = value && value.startsWith('あり');
              return (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center ${
                    ok ? 'border-teal-200 bg-teal-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <span className="text-xl mb-1">{icon}</span>
                  <span className={`text-[10px] font-medium mb-1 ${ok ? 'text-teal-700' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  <span className="text-sm">{ok ? '✅' : '❌'}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>{/* end ゾーン1 */}

      {/* ===== ゾーン2：クリニック提供情報 ===== */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-lg">
          <p className="text-blue-800 font-bold text-sm">🏥 クリニック提供情報</p>
          <p className="text-blue-400 text-[10px] mt-0.5">
            クリニックが登録・提供した情報です。患者の味方は内容の正確性を保証しません
          </p>
        </div>

        {clinic.badge ? (
          <>
            {/* 患者の味方による評価 */}
            <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
              <h2 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
                <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">評</span>
                患者の味方による評価
              </h2>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-teal-700 text-xs font-bold">第三者評価済クリニック</span>
                </div>
                <p className="text-teal-700 text-[10px] leading-relaxed">
                  料金・リスク記載・設備の透明性が高く、「患者の味方」が紹介できると判断したクリニックです。
                </p>
              </div>
            </div>

            {/* クリニック説明文 */}
            {clinic.description && (
              <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
                <h2 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded text-white text-[10px] flex items-center justify-center">文</span>
                  クリニックからのメッセージ
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{clinic.description}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm mt-4 p-6 text-center">
            <p className="text-gray-500 text-sm mb-2">このクリニックはまだ情報を登録していません。</p>
            <p className="text-gray-400 text-xs">
              掲載・登録をご希望のクリニック様は
              <a href="#" className="text-blue-500 underline ml-1">こちらからお問い合わせください</a>。
            </p>
          </div>
        )}
      </div>{/* end ゾーン2 */}

      {/* ===== ゾーン3：患者の声 ===== */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-teal-50 border-l-4 border-teal-500 p-3 mb-4 rounded-lg">
          <p className="text-teal-800 font-bold text-sm">💬 患者の声</p>
          <p className="text-teal-600 text-[10px] mt-0.5">
            実際の受診者から収集した口コミ・症例です。クリニックによる編集・削除依頼には応じません
          </p>
        </div>

        {/* 口コミ */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">★</span>
            患者口コミ（{clinic.reviews.length}件）
          </h2>
          {clinic.reviews.length === 0 ? (
            <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-400 text-xs">
              口コミはまだ収集中です
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{clinic.rating}</div>
                  <StarRating rating={clinic.rating} size="md" />
                  <div className="text-gray-400 text-[10px] mt-1">{clinic.reviewCount}件</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map((s) => {
                    const count = clinic.reviews.filter(r => r.rating === s).length;
                    const pct = Math.round((count / clinic.reviews.length) * 100);
                    return (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 w-4">{s}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                {clinic.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-700 text-[10px] font-bold">{review.name.slice(0, 1)}</span>
                        </div>
                        <div>
                          <div className="text-gray-700 text-xs font-semibold">{review.name}</div>
                          <div className="text-gray-400 text-[10px]">{review.date}</div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <TreatmentBadge treatment={review.treatment} />
                    <p className="text-gray-600 text-xs leading-relaxed mt-2">{review.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-700 text-[10px] leading-relaxed">
              ✓ 口コミは「患者の味方」が実際の受診者から収集し、内容を確認した上で掲載しています。改ざん・削除依頼には応じません。
            </p>
          </div>
        </div>

        {/* 症例 Before/After */}
        {(() => {
          const displayCases = clinic.cases.length > 0 ? clinic.cases : DUMMY_CASES;
          return (
            <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-800 font-bold text-sm flex items-center gap-2">
                  <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">◎</span>
                  症例紹介（Before / After）
                </h2>
                <span className="text-gray-400 text-[10px]">※デモ用サンプル画像</span>
              </div>
              <div className="space-y-5">
                {displayCases.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                      <TreatmentBadge treatment={c.treatment} />
                      <span className="text-gray-400 text-[10px]">治療期間: {c.duration}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <CaseImage
                        src={c.beforeImg || (c.caseImgSet && CASE_IMG_SETS[c.caseImgSet]?.before)}
                        alt="矯正前（Before）"
                        label="BEFORE"
                        labelColor="bg-red-500"
                        overlayColor="bg-black/30"
                        description={c.before}
                      />
                      <CaseImage
                        src={c.afterImg || (c.caseImgSet && CASE_IMG_SETS[c.caseImgSet]?.after)}
                        alt="矯正後（After）"
                        label="AFTER"
                        labelColor="bg-teal-600"
                        overlayColor="bg-teal-900/20"
                        description={c.after}
                        borderLeft
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="h-4" />
      </div>{/* end ゾーン3 */}

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-4xl mx-auto p-3 space-y-2">
          <button
            onClick={() => navigate(`/consult?clinic=${clinic.id}`)}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            この医院に相談する（無料）
          </button>
          <p className="text-center text-gray-400 text-[10px]">48時間以内に専門スタッフからご連絡します</p>
        </div>
      </div>
    </div>
  );
}
