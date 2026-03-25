import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
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
    beforeImg: before1,
    afterImg: after1,
  },
  {
    id: 'dummy2',
    treatment: 'ワイヤー矯正',
    duration: '24ヶ月',
    before: '上顎前突（出っ歯）。口元が気になっていた。',
    after: '表側ワイヤーにて改善。抜歯あり。総額88万円。',
    beforeImg: before2,
    afterImg: after2,
  },
  {
    id: 'dummy3',
    treatment: 'マウスピース矯正',
    duration: '12ヶ月',
    before: '前歯の軽度な乱れが気になっていた。',
    after: 'マウスピース矯正にて改善。',
    beforeImg: before3,
    afterImg: after3,
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

// 新旧両フォーマットに対応したレビューレーティング取得
function getReviewRating(review) {
  if (review.scores) {
    const vals = Object.values(review.scores);
    return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
  }
  return review.rating ?? 0;
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
        <div className="absolute inset-0 bg-teal-900/40" />
        <div className="relative z-10 px-4 py-5">

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold leading-tight">{clinic.name}</h1>
              <p className="text-teal-200 text-sm mt-1">{clinic.director} 院長　{clinic.directorTitle}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-white font-bold text-lg">{clinic.priceRange}</div>
              <div className="text-teal-200 text-xs">最低料金目安</div>
            </div>
          </div>
          {(() => {
            // reviews配列から実計算（古いrating/reviewCountフィールドは使わない）
            const reviewCount = clinic.reviews?.length ?? 0;
            const reviewAvgHero = reviewCount > 0
              ? Math.round(
                  clinic.reviews.reduce((sum, r) => {
                    const vals = Object.values(r.scores ?? {}).filter(v => v != null);
                    const avg = vals.length > 0
                      ? vals.reduce((a, b) => a + b, 0) / vals.length
                      : 0;
                    return sum + avg;
                  }, 0) / reviewCount * 10
                ) / 10
              : null;
            return (
              <div className="flex items-center gap-1.5 mt-3">
                {reviewAvgHero !== null ? (
                  <>
                    <StarRating rating={reviewAvgHero} size="md" />
                    <span className="text-amber-300 font-bold text-sm">{reviewAvgHero}</span>
                    <span className="text-teal-200 text-sm">（{reviewCount}件の口コミ）</span>
                  </>
                ) : (
                  <span className="text-teal-300 text-xs">口コミ未取得</span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ===== 患者の味方スコア（ヒーロー直下・最上部） ===== */}
      {(() => {
        // 口コミ平均を算出（新旧フォーマット対応）
        const reviewAvg = clinic.reviews.length > 0
          ? Math.round((clinic.reviews.reduce((s, r) => s + getReviewRating(r), 0) / clinic.reviews.length) * 10) / 10
          : null;

        const hasScore = clinic.score != null && clinic.score.total != null;

        // 5軸スコア（clinic.scoreが存在する場合のみ実値を使う）
        const subScores = hasScore ? [
          { label: '料金の透明性',         score: clinic.score.price_transparency    ?? 0 },
          { label: '技術・仕上がり',       score: clinic.score.skill                 ?? 0 },
          { label: '説明・ホスピタリティ', score: clinic.score.hospitality           ?? 0 },
          { label: 'プロセスの誠実さ',     score: clinic.score.process_integrity     ?? 0 },
          { label: '総合満足度',           score: clinic.score.overall_satisfaction  ?? 0 },
        ] : [];

        // 総合スコア（scoreがあればtotalを使い、なければ「-」表示用にnull）
        const overallScore = hasScore ? clinic.score.total : null;

        // レーダーチャート用データ（scoreがある場合のみ・短縮ラベル）
        const radarData = hasScore ? [
          { axis: '料金透明性',     value: clinic.score.price_transparency    ?? 0 },
          { axis: '技術・仕上がり', value: clinic.score.skill                 ?? 0 },
          { axis: 'ホスピタリティ', value: clinic.score.hospitality           ?? 0 },
          { axis: 'プロセス誠実さ', value: clinic.score.process_integrity     ?? 0 },
          { axis: '総合満足度',     value: clinic.score.overall_satisfaction  ?? 0 },
        ] : [];

        return (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-6">

                {/* 左：総合スコア */}
                <div className="flex flex-col items-center justify-center md:w-44 flex-shrink-0">
                  <p className="text-gray-400 text-xs mb-1">患者の味方 総合評価</p>
                  {overallScore !== null ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-amber-400 text-3xl leading-none mb-1">★</span>
                        <span style={{ fontSize: '4rem', lineHeight: 1 }} className="font-bold text-teal-600 leading-none">
                          {overallScore}
                        </span>
                        <span className="text-gray-400 text-lg mb-2 ml-0.5">/ 5.0</span>
                      </div>
                      <p className="text-gray-400 text-[10px] mt-2 text-center leading-relaxed">
                        患者の味方が独自に算出した評価です
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm text-center leading-relaxed mt-2">
                      口コミが集まり次第、患者の味方スコアを算出します
                    </p>
                  )}
                </div>

                {/* 中：レーダーチャート（scoreある場合のみ） */}
                {hasScore && (() => {
                  const CustomTick = ({ x, y, payload, textAnchor }) => (
                    <text x={x} y={y} textAnchor={textAnchor} fill="#555" fontSize={10} dy={4}>
                      {payload.value}
                    </text>
                  );
                  return (
                    <div className="flex items-center justify-center flex-shrink-0">
                      <RadarChart
                        width={280}
                        height={280}
                        data={radarData}
                        margin={{ top: 30, right: 40, bottom: 30, left: 40 }}
                      >
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={<CustomTick />}
                          tickLine={false}
                        />
                        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar
                          dataKey="value"
                          fill="#0d9488"
                          fillOpacity={0.3}
                          stroke="#0d9488"
                        />
                      </RadarChart>
                    </div>
                  );
                })()}

                {/* 右：5軸サブスコア ＋ 口コミ */}
                <div className="flex-1">
                  <div className="space-y-2.5">
                    {hasScore ? subScores.map(({ label, score }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-24 flex-shrink-0">{label}</span>
                        <StarScore score={score} />
                        <span className="text-amber-500 text-xs font-bold w-4">{score}</span>
                      </div>
                    )) : (
                      <p className="text-gray-400 text-xs leading-relaxed">
                        口コミが集まり次第、スコアを算出します
                      </p>
                    )}
                  </div>

                  {/* 区切り線 ＋ 口コミ平均 */}
                  <div className="border-t border-gray-100 mt-3 pt-3">
                    {reviewAvg !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-xs">患者口コミ平均</span>
                        <StarRating rating={reviewAvg} />
                        <span className="text-amber-500 text-xs font-bold">{reviewAvg}</span>
                        <span className="text-gray-400 text-xs">（{clinic.reviews.length}件）</span>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs">口コミはまだありません</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== ゾーン1：調査・公式情報 ===== */}
      <div className="max-w-4xl mx-auto mt-8">
        {/* ラベルバー */}
        <div className="bg-gray-700 py-3 px-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-white font-bold text-sm">🔍 調査・公式情報</span>
          <span className="text-white/70 text-xs">患者の味方がクリニック公式HPから収集・調査したデータです</span>
        </div>
        {/* エリア本体 */}
        <div className="bg-gray-50 border-l-4 border-gray-400 px-4 pb-6">

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

        {/* 設備（コンパクトバッジ） */}
        <div className="bg-white rounded-xl shadow-sm mt-4 px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 text-xs font-bold flex-shrink-0">設備</span>
          {[
            { label: '口腔内スキャナー', value: clinic.scanner },
            { label: '歯科用CT',         value: clinic.ct },
            { label: 'セファロ',          value: clinic.ceph },
            { label: 'Web予約',           value: clinic.webBooking },
            { label: 'LINE相談',          value: clinic.lineConsult },
          ].map(({ label, value }) => {
            const ok = value && value.startsWith('あり');
            return (
              <span
                key={label}
                className={`text-[11px] px-2 py-0.5 rounded-full border ${
                  ok
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200 line-through'
                }`}
              >
                {label}{ok ? ' ✓' : ''}
              </span>
            );
          })}
        </div>

        </div>{/* end エリア本体 */}
      </div>{/* end ゾーン1 */}

      {/* ===== ゾーン2：クリニック提供情報（PR） ===== */}
      <div className="max-w-4xl mx-auto mt-8">
        {/* ラベルバー */}
        <div className="bg-gray-500 py-3 px-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-white font-bold text-sm">📢 クリニック提供情報（PR）</span>
          <span className="text-white/70 text-xs">クリニックが自ら提供している情報です。患者の味方はこの内容を保証しません。</span>
        </div>
        {/* エリア本体 */}
        <div className="bg-gray-50 border-l-4 border-gray-300 px-4 pb-6">
          {clinic.badge ? (
            /* badge=true：クリニック提供コンテンツを表示 */
            <>
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
            /* badge=false：未登録メッセージ */
            <p className="text-gray-400 text-sm italic text-center py-8">
              このクリニックからのPR情報はまだ登録されていません。
            </p>
          )}
        </div>{/* end エリア本体 */}
      </div>{/* end ゾーン2 */}

      {/* ===== ゾーン3：患者の声 ===== */}
      <div className="max-w-4xl mx-auto mt-8">
        {/* ラベルバー */}
        <div className="bg-teal-600 py-3 px-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-white font-bold text-sm">💬 患者の声</span>
          <span className="text-white/70 text-xs">実際に治療を受けた患者から収集した体験談・口コミです</span>
        </div>
        {/* エリア本体 */}
        <div className="bg-teal-50 border-l-4 border-teal-400 px-4 pb-6">

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
              {(() => {
                // 口コミ平均（新旧フォーマット対応）
                const avg = Math.round(
                  (clinic.reviews.reduce((s, r) => s + getReviewRating(r), 0) / clinic.reviews.length) * 10
                ) / 10;
                return (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{avg}</div>
                      <StarRating rating={avg} size="md" />
                      <div className="text-gray-400 text-[10px] mt-1">{clinic.reviews.length}件</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map((s) => {
                        const count = clinic.reviews.filter(r => Math.round(getReviewRating(r)) === s).length;
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
                );
              })()}
              <div className="space-y-4">
                {clinic.reviews.map((review) => {
                  const displayName = review.author || review.name || '匿名';
                  const displayText = review.comment || review.text || '';
                  const displayRating = getReviewRating(review);
                  return (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 text-[10px] font-bold">{displayName.slice(0, 1)}</span>
                          </div>
                          <div>
                            <div className="text-gray-700 text-xs font-semibold">{displayName}</div>
                            <div className="text-gray-400 text-[10px]">{review.date}</div>
                          </div>
                        </div>
                        <StarRating rating={displayRating} />
                      </div>
                      <TreatmentBadge treatment={review.treatment} />
                      <p className="text-gray-600 text-xs leading-relaxed mt-2">{displayText}</p>
                    </div>
                  );
                })}
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
        </div>{/* end エリア本体 */}
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
