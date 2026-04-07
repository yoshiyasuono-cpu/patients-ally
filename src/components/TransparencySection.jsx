// TransparencySection.jsx
// セクション4：透明性データ（レーダーチャート + 数値テーブル）
// Supabaseにデータが揃うまではmockTransparencyDataを使用。

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';

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

function buildRadarData(d) {
  return [
    {
      subject: '初回見積\n提示率',
      clinic: d.fee_presentation_rate,
      avg: d.area_avg.fee_presentation_rate,
    },
    {
      subject: '追加費用\nの少なさ',
      clinic: 100 - d.extra_cost_rate,
      avg: 100 - d.area_avg.extra_cost_rate,
    },
    {
      subject: '追加費用\n事前説明率',
      clinic: d.explanation_rate,
      avg: d.area_avg.explanation_rate,
    },
    {
      subject: 'リスク\n説明率',
      clinic: d.risk_explanation_rate,
      avg: d.area_avg.risk_explanation_rate,
    },
    {
      subject: '書面\n交付率',
      clinic: d.document_rate,
      avg: d.area_avg.document_rate,
    },
    {
      subject: '契約圧\nのなさ',
      clinic: 100 - d.pressure_rate,
      avg: 100 - d.area_avg.pressure_rate,
    },
  ];
}

// 軸ラベルを改行対応で描画するカスタムコンポーネント
function CustomAxisTick({ x, y, payload, cx, cy }) {
  const lines = payload.value.split('\n');
  // ラベルを中心から外側に配置する方向ベクトル
  const angle = Math.atan2(y - cy, x - cx);
  const offset = 12;
  const lx = x + Math.cos(angle) * offset;
  const ly = y + Math.sin(angle) * offset;
  const lineH = 13;
  return (
    <text
      x={lx}
      y={ly - ((lines.length - 1) * lineH) / 2}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 11, fill: '#555', fontFamily: 'sans-serif' }}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={lx} dy={i === 0 ? 0 : lineH}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

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
  const arrow = lowerIsBetter
    ? (clinicVal < avgVal ? '↓ 低い' : '↑ 高い')
    : (clinicVal > avgVal ? '↑ 高い' : '↓ 低い');

  return (
    <div className="flex items-center py-2.5 border-b border-gray-100 last:border-0 gap-2 text-sm">
      <span className="flex-1 text-gray-700">{label}</span>
      <span className="w-16 text-right font-bold" style={{ color: isGood ? '#27AE60' : '#E67E22' }}>
        {unit === '★' ? `★${clinicVal.toFixed(1)}` : `${clinicVal}${unit}`}
      </span>
      <span className="w-14 text-right text-gray-400 text-xs">
        {unit === '★' ? `★${avgVal.toFixed(1)}` : `${avgVal}${unit}`}
      </span>
      <span className="w-16 text-right text-xs font-semibold" style={{ color: isGood ? '#27AE60' : '#E67E22' }}>
        {arrow}
      </span>
    </div>
  );
}

// レーダーチャート＋数値テーブルの共通描画
function ChartAndTable({ d, radarData }) {
  return (
    <>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="62%">
            <PolarGrid stroke="#ccc" />
            <PolarAngleAxis dataKey="subject" tick={<CustomAxisTick />} tickLine={false} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} tick={{ fontSize: 9, fill: '#aaa' }} axisLine={false} />
            <Radar name="全体平均" dataKey="avg" stroke="#999" fill="#999" fillOpacity={0.1} strokeDasharray="4 3" strokeWidth={1.5} />
            <Radar name="この医院" dataKey="clinic" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
            <Legend iconType="line" iconSize={16} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Tooltip formatter={(val, name) => [`${val}%`, name]} contentStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 border-t border-green-100 pt-3">
        <div className="flex items-center gap-4 mb-1 text-xs text-gray-400 justify-end">
          <span>この医院</span>
          <span className="w-14 text-right">全体平均</span>
          <span className="w-16" />
        </div>
        <DataRow label="初回見積の提示"        clinicVal={d.fee_presentation_rate}  avgVal={d.area_avg.fee_presentation_rate}  unit="%" />
        <DataRow label="追加費用の発生率"       clinicVal={d.extra_cost_rate}         avgVal={d.area_avg.extra_cost_rate}         unit="%" lowerIsBetter />
        <DataRow label="追加費用の事前説明率"   clinicVal={d.explanation_rate}        avgVal={d.area_avg.explanation_rate}        unit="%" />
        <DataRow label="リスク説明率"           clinicVal={d.risk_explanation_rate}   avgVal={d.area_avg.risk_explanation_rate}   unit="%" />
        <DataRow label="書面交付率"             clinicVal={d.document_rate}           avgVal={d.area_avg.document_rate}           unit="%" />
        <DataRow label="当日契約プレッシャー率" clinicVal={d.pressure_rate}           avgVal={d.area_avg.pressure_rate}           unit="%" lowerIsBetter />
        <DataRow label="費用納得度"             clinicVal={d.satisfaction_score}      avgVal={d.area_avg.satisfaction_score}      unit="★" />
      </div>
      <p className="text-xs text-gray-400 mt-3">
        ※ ClinicCompass独自の匿名アンケートに基づくデータです。
      </p>
    </>
  );
}

export default function TransparencySection({ data: propData }) {
  const d = propData ?? mockTransparencyData;
  const count = d.count ?? 0;
  const radarData = (count >= 2 && d.area_avg) ? buildRadarData(d) : [];

  // ヘッダーバッジ
  let badgeEl = null;
  if (count >= 10) badgeEl = <Badge type="trust" />;
  else if (count >= 3) badgeEl = <Badge type="reference" />;

  // 3段階の表示内容
  let content;
  if (count === 0) {
    // n=0：調査中
    content = (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">
          調査中（あと<span className="font-bold text-gray-700">3</span>件で公開）
        </p>
        <p className="text-gray-400 text-xs mt-1">
          下の回答フォームにご協力いただくと、この医院の透明性データが表示されます。
        </p>
      </div>
    );
  } else if (count === 1) {
    // n=1：回答あり・調査中
    content = (
      <div className="text-center py-4">
        <span style={{
          display: 'inline-block', background: '#fffbeb', color: '#d97706',
          fontSize: 13, fontWeight: 600, padding: '4px 14px', borderRadius: 16, marginBottom: 12,
        }}>回答1件あり・調査中</span>
        <p className="text-gray-600 text-sm leading-relaxed">
          最初の経験談が届いています。<br />あと<span className="font-bold">1件</span>で参考データを公開します。
        </p>
        <p className="text-gray-400 text-xs mt-2">
          下の回答フォームにご協力いただくと、この医院の透明性データが表示されます。
        </p>
      </div>
    );
  } else if (count === 2) {
    // n=2：レーダーチャート表示＋参考値バッジ
    content = (
      <>
        <div className="text-center mb-3">
          <span style={{
            display: 'inline-block', background: '#fffbeb', color: '#d97706',
            fontSize: 14, fontWeight: 700, padding: '6px 20px', borderRadius: 20,
            border: '1.5px solid #fcd34d',
          }}>参考値 n=2</span>
          <p className="text-gray-500 text-xs mt-2">件数が少ないため参考表示です</p>
        </div>
        <ChartAndTable d={d} radarData={radarData} />
      </>
    );
  } else {
    // n=3以上：フル表示
    content = <ChartAndTable d={d} radarData={radarData} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-4">
      <div style={{ background: '#F0FFF4', borderLeft: '4px solid #27AE60', borderRadius: '8px', padding: '20px' }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-800 font-bold text-base">透明性データ</h2>
            {badgeEl}
          </div>
          <span className="text-xs text-gray-400">n={count}件</span>
        </div>
        {content}
      </div>
    </div>
  );
}
