import { Link, useParams } from 'react-router-dom';
import { mockClinics } from '../data/mockClinics';

// ---- 汎用モック口コミ（richデータのないクリニック用） ----
const FALLBACK_REVIEWS = [
  { rating: 5, date: '2025年10月', treatment: 'マウスピース矯正', verified: true,
    text: '説明がとても丁寧で、追加費用についても事前に書面で説明してもらえました。安心して治療を進められています。' },
  { rating: 4, date: '2025年8月', treatment: 'ワイヤー矯正', verified: true,
    text: '先生の説明は分かりやすいですが、受付の対応が少し事務的に感じることも。治療自体は満足しています。' },
  { rating: 4, date: '2025年6月', treatment: 'マウスピース矯正', verified: false,
    text: '途中で追加費用が発生しましたが、事前に説明があったので納得できました。スタッフの方は親切です。' },
];

const PRESSURE_LABEL = { low: '低い', medium: 'やや高い', high: '高い' };
const PRESSURE_COLOR = {
  low:    'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high:   'bg-red-100 text-red-800 border-red-300',
};

function ScoreBar({ value, max = 5 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-green-50 rounded-full h-2">
      <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StarDisplay({ score, size = 'text-base' }) {
  const full  = Math.floor(score);
  const half  = score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="text-yellow-400">★</span>)}
      {half && <span className="text-yellow-300">★</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
    </span>
  );
}

function BadgeCertified({ children }) {
  return (
    <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
      ✓ {children}
    </span>
  );
}

function BadgeReviewed() {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
      ✓ 患者の味方 審査済み
    </span>
  );
}

function formatPrice(yen) {
  return `¥${yen.toLocaleString('ja-JP')}`;
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

  const pressureClass = PRESSURE_COLOR[clinic.pressure_level] ?? PRESSURE_COLOR.medium;
  const pressureLabel = PRESSURE_LABEL[clinic.pressure_level] ?? 'やや高い';
  const reviews = clinic.reviews ?? FALLBACK_REVIEWS;

  // スコア内訳（richデータがあれば使用、なければ算出）
  const scoreBreakdown = clinic.score_breakdown ?? [
    { label: '料金の明確さ',     score: parseFloat((clinic.transparency_score * 0.95).toFixed(1)), description: '' },
    { label: '追加費用の説明',   score: clinic.extra_cost_rate < 20 ? 4.5 : clinic.extra_cost_rate < 40 ? 3.5 : 2.2, description: '' },
    { label: '治療計画の共有',   score: clinic.explanation_score, description: '' },
    { label: 'リスク説明の充実度', score: parseFloat((clinic.transparency_score * 0.9).toFixed(1)), description: '' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ① デモバナー */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800 font-medium">
        ⚠️ このページはデモ版です。データはサンプルを含みます。
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/clinics" className="inline-flex items-center gap-1 text-blue-900 hover:underline text-sm mb-5">
          ← 一覧に戻る
        </Link>

        {/* ② ヒーローセクション */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-tight">{clinic.name}</h1>
              {clinic.nameEn && (
                <p className="text-xs text-gray-400 tracking-widest mt-0.5">{clinic.nameEn}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {clinic.has_certified_doctor && <BadgeCertified>認定医在籍</BadgeCertified>}
              <BadgeReviewed />
            </div>
          </div>

          {/* 総合スコア */}
          <div className="flex items-center gap-2 mb-4">
            <StarDisplay score={clinic.transparency_score} size="text-xl" />
            <span className="text-2xl font-bold text-gray-800">{clinic.transparency_score.toFixed(1)}</span>
            <span className="text-sm text-gray-400">透明性スコア</span>
          </div>

          {/* アクセス情報 */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>📍 {clinic.address ?? `${clinic.area} · ${clinic.station}`}</p>
            {clinic.tel && <p>📞 {clinic.tel}</p>}
            <p>🚉 {clinic.station}</p>
          </div>
        </div>

        {/* ③ KPI 4枚 */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">透明性スコア</p>
            <p className="text-2xl font-bold text-blue-900">{clinic.transparency_score.toFixed(1)}</p>
            <p className="text-[11px] text-green-600 mt-0.5">地域平均3.7より +0.4</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">説明満足度</p>
            <p className="text-2xl font-bold text-blue-900">{clinic.explanation_score.toFixed(1)}</p>
            <p className="text-[11px] text-green-600 mt-0.5">地域平均3.8より +0.5</p>
          </div>
          <div className={`bg-white rounded-xl border shadow-sm p-4 text-center ${clinic.extra_cost_rate >= 40 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-400 mb-1">追加費用発生率</p>
            <p className={`text-2xl font-bold ${clinic.extra_cost_rate >= 40 ? 'text-red-500' : 'text-green-600'}`}>
              {clinic.extra_cost_rate}%
            </p>
            <p className={`text-[11px] mt-0.5 ${clinic.extra_cost_rate >= 40 ? 'text-red-400' : 'text-green-600'}`}>
              {clinic.extra_cost_rate >= 40 ? '⚠ 地域平均より高い' : '地域平均38%より低い ↓'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">契約圧力</p>
            <p className={`text-lg font-bold ${clinic.pressure_level === 'low' ? 'text-green-600' : clinic.pressure_level === 'high' ? 'text-red-500' : 'text-yellow-600'}`}>
              {pressureLabel}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">当日契約を急かさない</p>
          </div>
        </div>

        {/* ④ 透明性スコア内訳 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">透明性スコアの内訳</h2>
          <div className="space-y-4">
            {scoreBreakdown.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-gray-400 ml-2">{item.description}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-8 text-right">{Number(item.score).toFixed(1)}</span>
                </div>
                <ScoreBar value={Number(item.score)} />
              </div>
            ))}
          </div>
        </div>

        {/* ⑤ 料金表 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            治療費（税込・総額表示）
          </h2>
          {clinic.fees ? (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {clinic.fees.map((f, i) => (
                  <tr key={i} className={f.price >= 500000 ? 'bg-gray-50' : ''}>
                    <td className="py-2.5 text-gray-700">{f.type}</td>
                    <td className="py-2.5 text-right font-semibold text-blue-900 tabular-nums">
                      {formatPrice(f.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-700 font-semibold text-lg">
              {Math.round(clinic.fee_min / 10000)}〜{Math.round(clinic.fee_max / 10000)}万円
            </p>
          )}
          <div className="mt-4 text-xs text-gray-500 space-y-0.5">
            <p>※ 追加費用が発生した患者の割合: {clinic.extra_cost_rate}%（{clinic.review_count}件中{Math.round(clinic.review_count * clinic.extra_cost_rate / 100)}件）</p>
          </div>

          {/* 注記ボックス */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed">
            <p className="font-semibold mb-1">💡 この料金表について</p>
            <p>医院公式サイトの掲載料金をもとに構造化しています。実際の費用は症例により異なります。必ず医院に確認ください。</p>
          </div>

          {/* 支払い情報 */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`text-xs border rounded-full px-3 py-1 ${clinic.accepts_installment ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {clinic.accepts_installment ? '✓ 分割払い可' : '✗ 分割不可'}
            </span>
            <span className={`text-xs border rounded-full px-3 py-1 ${clinic.accepts_credit ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {clinic.accepts_credit ? '✓ クレジットカード可' : 'クレジットカード 要確認'}
            </span>
          </div>
        </div>

        {/* ⑥ 患者レビュー */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">患者の声</h2>
            <span className="text-xs text-gray-400">{clinic.review_count}件の口コミより</span>
          </div>
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <StarDisplay score={r.rating} />
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{r.treatment}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                  {r.verified && <BadgeReviewed />}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ⑦ 診療情報 */}
        {clinic.hours && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
            <h2 className="text-base font-bold text-gray-800 mb-4">診療情報</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 text-gray-400 w-24">火〜土</td>
                  <td className="py-2.5 text-gray-700">{clinic.hours.weekday}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-400">土曜</td>
                  <td className="py-2.5 text-gray-700">{clinic.hours.saturday}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-gray-400">休診日</td>
                  <td className="py-2.5 text-gray-700">{clinic.hours.closed}</td>
                </tr>
                {clinic.address && (
                  <tr>
                    <td className="py-2.5 text-gray-400">住所</td>
                    <td className="py-2.5 text-gray-700">{clinic.address}</td>
                  </tr>
                )}
                {clinic.tel && (
                  <tr>
                    <td className="py-2.5 text-gray-400">電話</td>
                    <td className="py-2.5 text-gray-700">
                      <a href={`tel:${clinic.tel}`} className="text-blue-900 hover:underline">{clinic.tel}</a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ⑧ 中立性説明ボックス */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 px-5 py-4 mb-6 text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-700 mb-2">📋 このページの情報について</p>
          <ul className="space-y-1">
            <li>・料金情報は医院公式サイトをもとに構造化しています。</li>
            <li>・レビュースコアは患者の味方の独自調査に基づきます。</li>
            <li>・医院からの広告費は一切受け取っていません。</li>
            <li>・情報の誤りは <span className="text-blue-700 underline cursor-pointer">修正申請</span> から</li>
          </ul>
        </div>

        {/* 比較・一覧ボタン */}
        <div className="flex gap-3">
          <Link
            to={`/clinics/compare?ids=${clinic.id}`}
            className="flex-1 text-center bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm"
          >
            このクリニックを比較する
          </Link>
          <Link
            to="/clinics"
            className="flex-1 text-center bg-white text-blue-900 font-bold py-3 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
