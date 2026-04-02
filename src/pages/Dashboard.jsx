import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine,
} from 'recharts';

// ================================================================
// モックデータ
// ================================================================

// 既存：料金比較
const feeData = [
  { type: 'ワイヤー',    myFee: 77,  median: 72, max: 95 },
  { type: 'マウスピース', myFee: 115, median: 85, max: 130 },
  { type: '部分矯正',    myFee: 38,  median: 38, max: 55 },
];

// 既存：レビュー
const reviews = [
  { stars: 5, date: '2025年11月', treatment: 'ワイヤー矯正',
    text: '費用の内訳を丁寧に説明してくれた。追加費用もなく安心でした。' },
  { stars: 4, date: '2025年10月', treatment: 'マウスピース',
    text: '治療期間が少し延びたが、説明はしっかりしていた。' },
  { stars: 3, date: '2025年9月',  treatment: '大人矯正',
    text: '予約が取りにくい時期があった。費用面は明確。' },
];

// セクションC：スコア推移
const trendData = [
  { month: '10月', 自院: 3.8, エリア平均: 3.6 },
  { month: '11月', 自院: 3.9, エリア平均: 3.6 },
  { month: '12月', 自院: 4.0, エリア平均: 3.7 },
  { month: '1月',  自院: 4.0, エリア平均: 3.7 },
  { month: '2月',  自院: 4.1, エリア平均: 3.7 },
  { month: '3月',  自院: 4.2, エリア平均: 3.7 },
];

// セクションA：競合レーダー
const competitorData = [
  { subject: '見積提示率',      自院: 100, A院: 80, B院: 60, エリア平均: 71 },
  { subject: '追加費用の少なさ', 自院: 80,  A院: 65, B院: 75, エリア平均: 58 },
  { subject: '事前説明率',      自院: 100, A院: 70, B院: 55, エリア平均: 58 },
  { subject: 'リスク説明率',    自院: 80,  A院: 75, B院: 50, エリア平均: 65 },
  { subject: '書面交付率',      自院: 90,  A院: 60, B院: 70, エリア平均: 70 },
  { subject: '契約圧のなさ',    自院: 100, A院: 85, B院: 65, エリア平均: 69 },
];

// セクションA：エリアランキング
const rankingData = [
  { name: '渋谷スマイル矯正歯科',    score: 4.4, isSelf: false },
  { name: '立川北・なお矯正歯科',    score: 4.1, isSelf: true  },
  { name: '立川みなみ矯正歯科',      score: 3.8, isSelf: false },
  { name: '多摩センター矯正歯科',    score: 3.2, isSelf: false },
];

// セクションB：改善提案
const improvements = [
  {
    priority: 'high',
    icon: '🔴',
    label: '優先度：高',
    title: 'リスク説明率がエリア平均より15%低い',
    action: '初回カウンセリングで「歯根吸収・後戻り・治療期間延長」の3点を必ず書面で説明することで改善できます。',
    effect: '透明性スコア +0.3 見込み',
  },
  {
    priority: 'medium',
    icon: '🟡',
    label: '優先度：中',
    title: '書面交付率がエリア平均と同水準',
    action: '見積書・同意書・リスク説明書をセットで渡す医院は患者満足度が平均 +0.4 高い傾向があります。',
    effect: '患者満足度 +0.4 期待',
  },
  {
    priority: 'low',
    icon: '🟢',
    label: '優先度：低',
    title: '追加費用の事前説明率はエリアトップ水準',
    action: 'この強みをWebサイトに明記すると新患獲得に効果的です。',
    effect: '新患獲得率向上',
  },
];

// セクション：自院 vs エリア平均 差分データ
const gapData = competitorData.map(d => ({
  subject: d.subject,
  diff: d['自院'] - d['エリア平均'],
}));

// ================================================================
// スタイル定数
// ================================================================
const C = {
  self:       '#1B4F72',
  competitor: '#95A5A6',
  average:    '#E67E22',
  good:       '#27AE60',
  warning:    '#E74C3C',
  caution:    '#F39C12',
  bg:         '#F4F6F9',
  card:       '#FFFFFF',
  text:       '#2C3E50',
  muted:      '#7F8C8D',
};

const card = {
  background: C.card,
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '20px 24px',
};

const PRIORITY_BADGE = {
  high:   { background: '#E74C3C', color: 'white' },
  medium: { background: '#F39C12', color: 'white' },
  low:    { background: '#27AE60', color: 'white' },
};

// ================================================================
// 小コンポーネント
// ================================================================
function Stars({ n }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#F1C40F' : '#DDE' }}>★</span>
      ))}
    </span>
  );
}

function KpiCard({ icon, label, value, sub, valueColor }) {
  return (
    <div style={{ ...card, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: valueColor || C.self, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</span>
        {sub && (
          <>
            <span style={{ color: '#CBD5E0', fontSize: 14 }}>|</span>
            <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ランキング用カスタムラベル
function RankingLabel({ x, y, width, value, name, isSelf }) {
  return (
    <text x={x + width + 6} y={y + 10} fill={isSelf ? C.good : C.muted} fontSize={12} fontWeight={isSelf ? 700 : 400}>
      {value}
    </text>
  );
}

// ================================================================
// メインコンポーネント
// ================================================================
export default function Dashboard() {
  const [doneActions, setDoneActions] = useState([]);
  const latestSelf = trendData[trendData.length - 1]['自院'];
  const prevSelf   = trendData[trendData.length - 2]['自院'];
  const latestAvg  = trendData[trendData.length - 1]['エリア平均'];
  const momDiff    = (latestSelf - prevSelf).toFixed(1);
  const avgDiff    = (latestSelf - latestAvg).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", color: C.text }}>

      {/* ヘッダー */}
      <header style={{ background: C.self, color: '#fff', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.05em' }}>患者の味方</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>|</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>クリニックダッシュボード</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>立川北・なお矯正歯科クリニック ▼</div>
          <div style={{ fontSize: 11, color: '#2ECC71' }}>✅ 透明性認証 取得済み</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* サイドナビ */}
        <nav style={{ width: 220, background: '#fff', borderRight: '1px solid #E8ECF0', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: '📊', label: 'ダッシュボード', active: true },
            { icon: '💬', label: 'レビュー管理',   active: false },
            { icon: '📈', label: '地域分析',       active: false },
            { icon: '⚙️', label: '設定',           active: false },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', cursor: 'pointer',
              background: item.active ? '#EAF2F8' : 'transparent',
              color: item.active ? C.self : C.muted,
              fontWeight: item.active ? 700 : 400, fontSize: 14,
              borderLeft: item.active ? `3px solid ${C.self}` : '3px solid transparent',
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* メインコンテンツ */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* デモバナー */}
          <div style={{ background: '#FEF9E7', border: '1px solid #F9E79F', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#856404', fontWeight: 500 }}>
            ⚠️ このページはデモ版です。データはサンプルです。
          </div>

          {/* KPIカード */}
          <div style={{ display: 'flex', gap: 16 }}>
            <KpiCard icon="📊" label="透明性スコア"    value="4.1 / 5.0" sub="地域平均 3.7 より +0.4 ↑"  valueColor={C.good} />
            <KpiCard icon="📈" label="今月の閲覧数"    value="1,243"     sub="先月比 +18% ↑"              valueColor={C.self} />
            <KpiCard icon="💬" label="レビュー件数"    value="24件"      sub="今月 +3件"                  valueColor={C.self} />
            <KpiCard icon="⚠️" label="追加費用発生率"  value="18%"       sub="地域平均 38% より低い ↓"   valueColor={C.good} />
          </div>

          {/* ============================================
              セクションC：スコア推移グラフ
          ============================================ */}
          <div style={{ display: 'flex', gap: 16 }}>

            {/* 折れ線グラフ */}
            <div style={{ ...card, flex: 3 }}>
              <SectionHeader icon="📈" title="スコア推移" sub="2025年10月〜2026年3月" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#EAF6F0', color: C.good,
                  fontSize: 12, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  先月比 +{momDiff} ↑
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  エリア平均との差：<strong style={{ color: C.self }}>+{avgDiff}</strong>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 12, fill: C.muted }} tickCount={5} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E0E0E0' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="自院" stroke={C.self} strokeWidth={2.5}
                    dot={{ r: 4, fill: C.self }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="エリア平均" stroke={C.competitor}
                    strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 料金比較（既存） */}
            <div style={{ ...card, flex: 2 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>地域相場との料金比較</div>
                <div style={{ fontSize: 12, color: C.muted }}>単位：万円</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={feeData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fill: C.muted }} width={68} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v) => `${v}万円`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="myFee"  name="自院"      fill={C.self}       radius={[0, 3, 3, 0]} barSize={10} />
                  <Bar dataKey="median" name="地域中央値" fill="#BDC3C7"      radius={[0, 3, 3, 0]} barSize={10} />
                  <Bar dataKey="max"    name="地域最高値" fill="#E8ECF0"      radius={[0, 3, 3, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ============================================
              セクションA：競合分析
          ============================================ */}
          <div style={{ display: 'flex', gap: 16 }}>

            {/* レーダーチャート */}
            <div style={{ ...card, flex: 3 }}>
              <SectionHeader icon="📊" title="競合分析" sub="立川エリア内での自院ポジション" />
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={competitorData} outerRadius="65%">
                  <PolarGrid stroke="#E0E0E0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: C.muted }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5}
                    tick={{ fontSize: 9, fill: '#bbb' }} axisLine={false} />
                  {/* エリア平均（オレンジ点線） */}
                  <Radar name="エリア平均" dataKey="エリア平均"
                    stroke={C.average} fill={C.average} fillOpacity={0.05}
                    strokeDasharray="4 3" strokeWidth={1.5} />
                  {/* A院（グレー線のみ） */}
                  <Radar name="A院" dataKey="A院"
                    stroke={C.competitor} fill={C.competitor} fillOpacity={0.05} strokeWidth={1.5} />
                  {/* B院（グレー線のみ） */}
                  <Radar name="B院" dataKey="B院"
                    stroke="#BDC3C7" fill="#BDC3C7" fillOpacity={0.05} strokeWidth={1.5} />
                  {/* 自院（青塗りつぶし） */}
                  <Radar name="自院" dataKey="自院"
                    stroke={C.self} fill={C.self} fillOpacity={0.2} strokeWidth={2.5} />
                  <Legend iconType="line" iconSize={16} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Tooltip formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* エリア内ランキング */}
            <div style={{ ...card, flex: 2 }}>
              <SectionHeader icon="🏆" title="エリア内ランキング" sub="立川エリア 透明性スコア" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rankingData.map((clinic, i) => (
                  <div key={i} style={{
                    background: clinic.isSelf ? '#EAF6F0' : '#F8F9FA',
                    border: clinic.isSelf ? `1.5px solid ${C.good}` : '1px solid #E8ECF0',
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: i === 0 ? '#F1C40F' : i === 1 ? '#BDC3C7' : '#CD6133',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>{i + 1}</span>
                        <span style={{
                          fontSize: 13, fontWeight: clinic.isSelf ? 700 : 400,
                          color: clinic.isSelf ? C.good : C.text,
                        }}>
                          {clinic.name}
                          {clinic.isSelf && <span style={{ fontSize: 10, marginLeft: 6, color: C.good }}>← 自院</span>}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: clinic.isSelf ? C.good : C.text }}>
                        {clinic.score.toFixed(1)}
                      </span>
                    </div>
                    {/* バー */}
                    <div style={{ background: '#E8ECF0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: clinic.isSelf ? C.good : C.competitor,
                        width: `${(clinic.score / 5.0) * 100}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================
              セクションB：透明性改善提案（カード形式）
          ============================================ */}
          <div>
            <div style={{ ...card, paddingBottom: 8 }}>
              <SectionHeader icon="📋" title="改善アクション" sub="優先度順・自動抽出" />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {improvements.map((item, i) => {
                const isDone = doneActions.includes(i);
                return (
                  <div key={i} style={{
                    flex: 1,
                    background: isDone ? '#F0F9F4' : C.card,
                    border: isDone ? `1.5px solid ${C.good}` : '1px solid #E8ECF0',
                    borderRadius: 12,
                    padding: '20px 20px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    opacity: isDone ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* ヘッダー：優先度バッジ + 期待効果 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        <span style={{
                          ...PRIORITY_BADGE[item.priority],
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 12px', borderRadius: 20,
                        }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        background: '#EAF6F0', color: C.good,
                        padding: '3px 10px', borderRadius: 20,
                      }}>
                        📈 {item.effect}
                      </span>
                    </div>
                    {/* タイトル */}
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: C.text,
                      marginBottom: 8, lineHeight: 1.5,
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {item.title}
                    </p>
                    {/* アクション説明 */}
                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.75, marginBottom: 16, flex: 1 }}>
                      → {item.action}
                    </p>
                    {/* 対応済みボタン */}
                    <button
                      onClick={() => {
                        setDoneActions(prev =>
                          prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                        );
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        borderRadius: 8,
                        border: isDone ? `1.5px solid ${C.good}` : '1.5px solid #D5D8DC',
                        background: isDone ? C.good : 'transparent',
                        color: isDone ? 'white' : C.muted,
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isDone ? '✓ 対応済み' : '対応済みにする'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================
              セクション：自院 vs エリア平均 差分グラフ
          ============================================ */}
          <div style={card}>
            <SectionHeader icon="📊" title="競合との差分" sub="自院スコア − エリア平均（項目別）" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={gapData} layout="vertical" margin={{ top: 4, right: 30, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-30, 40]}
                  tick={{ fontSize: 11, fill: C.muted }}
                  tickFormatter={v => `${v > 0 ? '+' : ''}${v}`}
                />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 12, fill: C.muted }} width={110} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E0E0E0' }}
                  formatter={(val) => [`${val > 0 ? '+' : ''}${val}%`, '差分']}
                />
                <ReferenceLine x={0} stroke="#CBD5E0" strokeWidth={1.5} />
                <Bar dataKey="diff" name="自院 − エリア平均" radius={[0, 4, 4, 0]} barSize={18}>
                  {gapData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.diff >= 0 ? C.self : C.average} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, background: C.self, borderRadius: 2, display: 'inline-block' }} />
                自院が上回る項目
              </span>
              <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, background: C.average, borderRadius: 2, display: 'inline-block' }} />
                自院が下回る項目
              </span>
            </div>
          </div>

          {/* ============================================
              既存：レビュー ＋ アドバイス
          ============================================ */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

            {/* 最新レビュー */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💬</span> 最新レビュー
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F0F0F0' : 'none', paddingBottom: i < reviews.length - 1 ? 14 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Stars n={r.stars} />
                      <span style={{ fontSize: 11, color: C.muted }}>{r.date}</span>
                      <span style={{ fontSize: 11, background: '#EAF2F8', color: C.self, padding: '1px 8px', borderRadius: 10 }}>{r.treatment}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: '0 0 8px' }}>「{r.text}」</p>
                    <button style={{ fontSize: 11, color: C.self, border: `1px solid ${C.self}`, background: 'transparent', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                      返信する
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 今月のアドバイス */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💡</span> 今月の改善アクション
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  '追加費用の発生条件をサイトに明記すると透明性スコアが +0.3 改善する見込みです。',
                  '「治療期間の目安」を掲載しているクリニックはレビュー満足度が平均 +0.4 高い傾向があります。',
                  '直近3件のレビューに返信がありません。返信率が高い医院は信頼スコアが向上します。',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EAF2F8', color: C.self, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
