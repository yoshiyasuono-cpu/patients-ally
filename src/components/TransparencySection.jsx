// TransparencySection.jsx
// セクション4：透明性データ
// Supabaseにデータが揃うまではmockTransparencyDataを使用。
// 実データは認証済みユーザーのみ取得可能なため、
// 将来的にはSupabase RPC（集計関数）に差し替える。

const mockTransparencyData = {
  count: 5,
  fee_presentation_rate: 100,
  extra_cost_rate: 20,
  explanation_rate: 100,
  risk_explanation_rate: 80,
  document_rate: 90,
  pressure_rate: 0,
  satisfaction_score: 4.4,
  area_avg: {
    fee_presentation_rate: 71,
    extra_cost_rate: 42,
    explanation_rate: 58,
    risk_explanation_rate: 65,
    document_rate: 70,
    pressure_rate: 31,
    satisfaction_score: 3.4,
  },
};

function Badge({ type }) {
  if (type === 'trust') {
    return (
      <span style={{
        background: '#27AE60', color: 'white',
        padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
      }}>
        信頼度の高いデータ ✓
      </span>
    );
  }
  if (type === 'reference') {
    return (
      <span style={{
        background: '#7F8C8D', color: 'white',
        padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
      }}>
        参考値
      </span>
    );
  }
  return null;
}

function DataRow({ label, clinicVal, avgVal, unit = '%', lowerIsBetter = false }) {
  const isGood = lowerIsBetter ? clinicVal < avgVal : clinicVal > avgVal;
  const diff = Math.abs(clinicVal - avgVal);
  const arrow = lowerIsBetter
    ? (clinicVal < avgVal ? '↓ 低い' : '↑ 高い')
    : (clinicVal > avgVal ? '↑ 高い' : '↓ 低い');

  return (
    <div className="flex items-center py-2.5 border-b border-gray-100 last:border-0 gap-2 text-sm">
      <span className="flex-1 text-gray-700">{label}</span>
      <span
        className="w-16 text-right font-bold"
        style={{ color: isGood ? '#27AE60' : '#E67E22' }}
      >
        {unit === '★' ? `★${clinicVal.toFixed(1)}` : `${clinicVal}${unit}`}
      </span>
      <span className="w-14 text-right text-gray-400 text-xs">
        {unit === '★' ? `★${avgVal.toFixed(1)}` : `${avgVal}${unit}`}
      </span>
      <span
        className="w-16 text-right text-xs font-semibold"
        style={{ color: isGood ? '#27AE60' : '#E67E22' }}
      >
        {arrow}
      </span>
    </div>
  );
}

export default function TransparencySection({ data: propData }) {
  const d = propData ?? mockTransparencyData;
  const count = d.count ?? 0;

  let badgeType = null;
  if (count >= 10) badgeType = 'trust';
  else if (count >= 3) badgeType = 'reference';

  return (
    <div className="max-w-4xl mx-auto px-4 mt-4">
      <div
        style={{
          background: '#F0FFF4',
          borderLeft: '4px solid #27AE60',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-800 font-bold text-base">透明性データ</h2>
            {badgeType && <Badge type={badgeType} />}
          </div>
          <span className="text-xs text-gray-400">n={count}件</span>
        </div>

        {count < 3 ? (
          /* 調査中 */
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              調査中（あと<span className="font-bold text-gray-700">{3 - count}</span>件で公開）
            </p>
            <p className="text-gray-400 text-xs mt-1">
              下の回答フォームにご協力いただくと、この医院の透明性データが表示されます。
            </p>
          </div>
        ) : (
          <>
            {/* 凡例 */}
            <div className="flex items-center gap-4 mb-2 text-xs text-gray-400 justify-end">
              <span>この医院</span>
              <span>全体平均</span>
              <span className="w-16" />
            </div>

            {/* データ行 */}
            <div>
              <DataRow label="初回見積の提示"         clinicVal={d.fee_presentation_rate}  avgVal={d.area_avg.fee_presentation_rate}  unit="%" />
              <DataRow label="追加費用の発生率"        clinicVal={d.extra_cost_rate}         avgVal={d.area_avg.extra_cost_rate}         unit="%" lowerIsBetter />
              <DataRow label="追加費用の事前説明率"    clinicVal={d.explanation_rate}         avgVal={d.area_avg.explanation_rate}         unit="%" />
              <DataRow label="リスク説明率"            clinicVal={d.risk_explanation_rate}   avgVal={d.area_avg.risk_explanation_rate}   unit="%" />
              <DataRow label="書面交付率"              clinicVal={d.document_rate}            avgVal={d.area_avg.document_rate}            unit="%" />
              <DataRow label="当日契約プレッシャー率"  clinicVal={d.pressure_rate}            avgVal={d.area_avg.pressure_rate}            unit="%" lowerIsBetter />
              <DataRow label="費用納得度"              clinicVal={d.satisfaction_score}      avgVal={d.area_avg.satisfaction_score}      unit="★" />
            </div>

            <p className="text-xs text-gray-400 mt-3">
              ※ ClinicCompass独自の匿名アンケートに基づくデータです。
            </p>
          </>
        )}
      </div>
    </div>
  );
}
