import { useParams, Link, useNavigate } from 'react-router-dom';
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
    beforeImg: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
    afterImg: 'https://images.unsplash.com/photo-1588776814546-1ffedac80fc0?w=400&h=300&fit=crop',
  },
  {
    id: 'dummy2',
    treatment: 'ワイヤー矯正',
    duration: '24ヶ月',
    before: '上顎前突（出っ歯）。口元が気になっていた。',
    after: '表側ワイヤーにて改善。抜歯あり。総額88万円。',
    beforeImg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop',
    afterImg: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&h=300&fit=crop',
  },
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

function PriceDiff({ price, market }) {
  const diff = market - price;
  const pct = Math.round((diff / market) * 100);
  if (diff > 0) {
    return (
      <span className="text-teal-600 text-[10px] font-bold bg-teal-50 px-1.5 py-0.5 rounded ml-1">
        相場より{formatPrice(diff)}お得
      </span>
    );
  } else if (diff < 0) {
    return (
      <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded ml-1">
        相場より高め
      </span>
    );
  }
  return <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded ml-1">相場並み</span>;
}

const TREATMENT_COLORS = {
  'マウスピース矯正': 'bg-blue-50 text-blue-700 border-blue-200',
  'ワイヤー矯正': 'bg-purple-50 text-purple-700 border-purple-200',
  'セラミック矯正': 'bg-pink-50 text-pink-700 border-pink-200',
  '小児矯正': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'ホワイトニング': 'bg-teal-50 text-teal-700 border-teal-200',
  'ラミネートベニア': 'bg-rose-50 text-rose-700 border-rose-200',
};

function CaseImage({ src, alt, label, labelColor, overlayColor, description, borderLeft = false }) {
  return (
    <div
      className={`relative${borderLeft ? ' border-l border-white/40' : ''}`}
      style={{ height: '200px' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {/* 全体オーバーレイ */}
      <div className={`absolute inset-0 ${overlayColor} pointer-events-none`} />
      {/* 下部テキスト帯 */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 pt-3 pb-2"
        style={{ background: 'rgba(0,0,0,0.70)' }}
      >
        <p className="text-white text-[10px] leading-snug line-clamp-3">{description}</p>
      </div>
      {/* BEFORE / AFTER バッジ */}
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack backTo="/" title={clinic.shortName} />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 max-w-4xl mx-auto px-4 py-5">
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

      <div className="max-w-4xl mx-auto px-4">

        <div className="md:grid md:grid-cols-2 md:gap-4">

        {/* Basic info */}
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
          <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-teal-800 text-sm leading-relaxed">{clinic.description}</p>
          </div>
        </div>

        {/* Price table */}
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

        {/* 料金の透明性（詳細） */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">透</span>
            料金の透明性（詳細）
          </h2>
          {/* 透明性スコア */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">透明性スコア</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              clinic.transparencyScore === '高'
                ? 'bg-teal-100 text-teal-700'
                : clinic.transparencyScore === '中'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {clinic.transparencyScore}
            </span>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              { label: '料金制度', value: clinic.feeSystem },
              { label: '調整料', value: clinic.adjustmentFee },
              { label: '保定装置', value: clinic.retainerIncluded },
              { label: 'デンタルローン', value: clinic.dentalLoan },
              { label: '後戻り保証', value: clinic.returnGuarantee },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
                <span>{value || '不明'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 設備・利便性 */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">設</span>
            設備・利便性
          </h2>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              { label: '口腔内スキャナー', value: clinic.scanner },
              { label: '歯科用CT', value: clinic.ct },
              { label: 'セファロ', value: clinic.ceph },
              { label: 'Web予約', value: clinic.webBooking },
              { label: 'LINE相談', value: clinic.lineConsult },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
                <span className={value && value.startsWith('あり') ? 'text-teal-700 font-medium' : ''}>
                  {value || '不明'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* コンテンツ品質・患者の味方評価 */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">評</span>
            患者の味方による評価
          </h2>
          <div className="space-y-2 text-xs text-gray-600 mb-3">
            {[
              { label: '症例写真', value: clinic.casePhotos },
              { label: 'リスク開示', value: clinic.riskDisclosure },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
                <span>{value || '不明'}</span>
              </div>
            ))}
          </div>
          {clinic.badge ? (
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
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-400 text-[10px] leading-relaxed">
                現時点ではHP上の公開情報が不足しているため、第三者評価済バッジの付与条件を満たしていません。
              </p>
            </div>
          )}
        </div>

        {/* Reviews */}
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

        {/* Cases */}
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
                    {/* Header */}
                    <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                      <TreatmentBadge treatment={c.treatment} />
                      <span className="text-gray-400 text-[10px]">治療期間: {c.duration}</span>
                    </div>

                    {/* Images side by side */}
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
      </div>

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
