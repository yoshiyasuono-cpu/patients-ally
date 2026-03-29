import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';

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
      <Header showBack backTo="/" title={clinic.name} />

      {/* Hero banner */}
      <div className="max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900" style={{ minHeight: '160px' }}>
        <div className="relative z-10 px-4 py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold leading-tight">{clinic.name}</h1>
              <p className="text-teal-200 text-sm mt-1">{clinic.area}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-white font-bold text-lg">{clinic.priceRange}</div>
              <div className="text-teal-200 text-xs">料金目安</div>
            </div>
          </div>

          {/* 対応治療タグ */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {clinic.treatments.map((t) => (
              <span key={t} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
            {clinic.totalFee && (
              <span className="bg-green-400/20 text-green-200 text-xs px-3 py-1 rounded-full border border-green-300/40">
                トータルフィー制
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">i</span>
            基本情報
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">住所</span>
              <span>{clinic.address || '情報なし'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">最寄り駅</span>
              <span>{clinic.station || '情報なし'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">電話番号</span>
              <span className="text-teal-700 font-semibold">{clinic.tel || '情報なし'}</span>
            </div>
            {clinic.url && (
              <div className="flex gap-3">
                <span className="text-gray-400 w-20 flex-shrink-0">公式サイト</span>
                <a href={clinic.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline break-all">
                  {clinic.url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 料金情報 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-xs flex items-center justify-center">&#165;</span>
            料金情報
          </h2>

          {(!clinic.feeMin && !clinic.feeMax) ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-gray-400 text-sm">料金情報はまだ登録されていません</p>
              <p className="text-gray-400 text-xs mt-1">カウンセリング時に必ず総額を確認してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold text-sm">料金レンジ</span>
                  <span className="text-teal-700 font-bold text-base">{clinic.priceRange}</span>
                </div>
              </div>
              {clinic.feeNote && (
                <p className="text-gray-500 text-xs">{clinic.feeNote}</p>
              )}
            </div>
          )}

          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-amber-700 text-xs leading-relaxed">
              表示料金は調査時点の公式サイト記載情報です。調整料・保定装置代・検査料が別途かかる場合があります。必ずカウンセリングで総額を確認してください。
            </p>
          </div>
        </div>
      </div>

      {/* 対応治療・特徴 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 text-xs font-bold flex-shrink-0">対応</span>
          {[
            { label: 'ワイヤー矯正', ok: clinic.wireAvailable },
            { label: 'マウスピース矯正', ok: clinic.invisalignAvailable },
            { label: 'トータルフィー制', ok: clinic.totalFee },
            { label: 'リスク説明あり', ok: clinic.riskDescription },
          ].map(({ label, ok }) => (
            <span
              key={label}
              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                ok
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              {label}{ok ? ' ✓' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* 口コミ（今後reviewsテーブルから取得） */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-gray-400 text-sm">口コミ情報を収集中です</p>
          <p className="text-gray-400 text-xs mt-1">投稿情報が集まり次第、患者の味方スコアを算出します</p>
        </div>
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
