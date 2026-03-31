import { Link, useParams } from 'react-router-dom';
import { mockClinics } from '../data/mockClinics';

const PRESSURE_BADGE = {
  low:    { label: '低い',    className: 'bg-green-100 text-green-800 border border-green-300' },
  medium: { label: 'やや高い', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  high:   { label: '高い',    className: 'bg-red-100 text-red-800 border border-red-300' },
};

// クリニックごとのモック口コミ（デモ用）
const MOCK_REVIEWS = [
  { nickname: '30代・女性', treatment: 'マウスピース矯正', score: 5, comment: '説明がとても丁寧で、追加費用についても事前に書面で説明してもらえました。安心して治療を進められています。' },
  { nickname: '20代・女性', treatment: 'ワイヤー矯正',     score: 4, comment: '先生の説明は分かりやすいですが、受付の対応が少し事務的に感じることも。治療自体は満足しています。' },
  { nickname: '40代・男性', treatment: 'マウスピース矯正', score: 4, comment: '途中で追加費用が発生しましたが、事前に説明があったので納得できました。スタッフの方は親切です。' },
];

function ScoreBar({ value, max = 5, colorClass = 'bg-green-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StarDisplay({ score }) {
  const full  = Math.floor(score);
  const half  = score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="inline-flex items-center gap-0.5 text-lg">
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="text-yellow-400">★</span>)}
      {half && <span className="text-yellow-400">☆</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
    </span>
  );
}

export default function ClinicDemoDetail() {
  const { id } = useParams();
  const clinic = mockClinics.find(c => c.id === id);

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">クリニックが見つかりませんでした。</p>
          <Link to="/clinics" className="text-blue-900 underline">一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const badge = PRESSURE_BADGE[clinic.pressure_level] ?? PRESSURE_BADGE.medium;
  const feeMin = Math.round(clinic.fee_min / 10000);
  const feeMax = Math.round(clinic.fee_max / 10000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* デモバナー */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <span className="text-yellow-800 text-sm font-medium">
          このページはデモ版です。データはすべてサンプルです。
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 戻るリンク */}
        <Link to="/clinics" className="inline-flex items-center gap-1 text-blue-900 hover:underline text-sm mb-6">
          ← 一覧に戻る
        </Link>

        {/* クリニック名・基本情報 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-blue-900 mb-1">{clinic.name}</h1>
              <p className="text-sm text-gray-500">{clinic.area} &middot; {clinic.station}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {clinic.has_certified_doctor && (
                <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-3 py-1">
                  日本矯正歯科学会 認定医在籍
                </span>
              )}
              <span className={`text-xs font-semibold rounded-full px-3 py-1 ${badge.className}`}>
                契約圧力：{badge.label}
              </span>
            </div>
          </div>

          {/* 料金 */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-gray-400 mb-0.5">料金目安（税込）</p>
            <p className="text-2xl font-bold text-blue-900">{feeMin}〜{feeMax}万円</p>
            <p className="text-xs text-gray-400 mt-0.5">
              支払い：{clinic.accepts_installment ? '分割払い可' : '分割不可'}
              {clinic.accepts_credit ? '・クレジットカード可' : ''}
            </p>
          </div>

          {/* スコアグリッド */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">透明性スコア</p>
              <p className="text-xl font-bold text-gray-800 mb-1">{clinic.transparency_score.toFixed(1)}</p>
              <ScoreBar value={clinic.transparency_score} colorClass="bg-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">説明満足度</p>
              <p className="text-xl font-bold text-gray-800 mb-1">{clinic.explanation_score.toFixed(1)} / 5.0</p>
              <ScoreBar value={clinic.explanation_score} colorClass="bg-blue-500" />
            </div>
            <div className={`rounded-lg p-2 -m-2 ${clinic.extra_cost_rate >= 40 ? 'bg-red-50' : ''}`}>
              <p className="text-xs text-gray-400 mb-1">追加費用発生率</p>
              <p className={`text-xl font-bold mb-1 ${clinic.extra_cost_rate >= 40 ? 'text-red-500' : 'text-gray-800'}`}>
                {clinic.extra_cost_rate >= 40 && '⚠ '}{clinic.extra_cost_rate}%
              </p>
              {clinic.extra_cost_rate >= 40 && (
                <p className="text-xs text-red-400">要注意：追加費用が発生しやすい傾向があります</p>
              )}
            </div>
          </div>
        </div>

        {/* 透明性スコアの内訳 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">透明性スコアの内訳</h2>
          <div className="space-y-3">
            {[
              { label: '料金の明確さ', value: (clinic.transparency_score * 0.95).toFixed(1) },
              { label: '追加費用の説明',value: clinic.extra_cost_rate < 20 ? '4.5' : clinic.extra_cost_rate < 40 ? '3.5' : '2.2' },
              { label: '治療計画の共有', value: clinic.explanation_score.toFixed(1) },
              { label: 'リスク説明の充実度', value: (clinic.transparency_score * 0.9).toFixed(1) },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <p className="text-sm text-gray-600 w-36 flex-shrink-0">{item.label}</p>
                <div className="flex-1">
                  <ScoreBar value={parseFloat(item.value)} colorClass="bg-green-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 w-8 text-right">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 口コミ */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">患者の声</h2>
            <span className="text-xs text-gray-400">{clinic.review_count}件の口コミより</span>
          </div>
          <div className="space-y-4">
            {MOCK_REVIEWS.map((r, i) => (
              <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <StarDisplay score={r.score} />
                  <span className="text-xs text-gray-400">{r.nickname} &middot; {r.treatment}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 比較ボタン */}
        <div className="flex gap-3">
          <Link
            to={`/clinics/compare?ids=${clinic.id}`}
            className="flex-1 text-center bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            このクリニックを比較リストに追加
          </Link>
          <Link
            to="/clinics"
            className="flex-1 text-center bg-white text-blue-900 font-bold py-3 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
