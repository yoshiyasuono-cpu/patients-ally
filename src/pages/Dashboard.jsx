import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ---- モックデータ ----
const scoreData = [
  { month: '6月', myScore: 3.8, avg: 3.6 },
  { month: '7月', myScore: 3.9, avg: 3.6 },
  { month: '8月', myScore: 4.0, avg: 3.7 },
  { month: '9月', myScore: 4.0, avg: 3.7 },
  { month: '10月', myScore: 4.1, avg: 3.7 },
  { month: '11月', myScore: 4.2, avg: 3.7 },
];

const feeData = [
  { type: 'ワイヤー', myFee: 77, median: 72, max: 95 },
  { type: 'マウスピース', myFee: 115, median: 85, max: 130 },
  { type: '部分矯正', myFee: 38, median: 38, max: 55 },
];

const reviews = [
  { stars: 5, date: '2025年11月', treatment: 'ワイヤー矯正',
    text: '費用の内訳を丁寧に説明してくれた。追加費用もなく安心でした。' },
  { stars: 4, date: '2025年10月', treatment: 'マウスピース',
    text: '治療期間が少し延びたが、説明はしっかりしていた。' },
  { stars: 3, date: '2025年9月', treatment: '大人矯正',
    text: '予約が取りにくい時期があった。費用面は明確。' },
];

const advice = [
  { num: 1, text: '追加費用の発生条件をサイトに明記すると透明性スコアが +0.3 改善する見込みです。' },
  { num: 2, text: '「治療期間の目安」を掲載しているクリニックはレビュー満足度が平均 +0.4 高い傾向があります。' },
  { num: 3, text: '直近3件のレビューに返信がありません。返信率が高い医院は信頼スコアが向上します。' },
];

// ---- スタイル定数 ----
const C = {
  primary: '#1B4F72', accent: '#27AE60', warning: '#E67E22',
  bg: '#F4F6F9', card: '#FFFFFF', text: '#2C3E50', muted: '#7F8C8D',
};
const card = {
  background: C.card, borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '20px 24px',
};

function Stars({ n }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#F1C40F' : '#DDE' }}>★</span>
      ))}
    </span>
  );
}

// ---- KPI カード ----
function KpiCard({ icon, label, value, sub, valueColor }) {
  return (
    <div style={{ ...card, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: valueColor || C.primary, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ---- メインコンポーネント ----
export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", color: C.text }}>

      {/* ヘッダー */}
      <header style={{ background: C.primary, color: '#fff', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.05em' }}>患者の味方</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>|</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>クリニックダッシュボード</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>立川北・なお矯正歯科クリニック ▼</div>
            <div style={{ fontSize: 11, color: '#2ECC71' }}>✅ 透明性認証 取得済み</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* サイドナビ */}
        <nav style={{ width: 220, background: '#fff', borderRight: '1px solid #E8ECF0', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: '📊', label: 'ダッシュボード', active: true },
            { icon: '💬', label: 'レビュー管理', active: false },
            { icon: '📈', label: '地域分析', active: false },
            { icon: '⚙️', label: '設定', active: false },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', cursor: 'pointer', borderRadius: 0,
              background: item.active ? '#EAF2F8' : 'transparent',
              color: item.active ? C.primary : C.muted,
              fontWeight: item.active ? 700 : 400,
              fontSize: 14,
              borderLeft: item.active ? `3px solid ${C.primary}` : '3px solid transparent',
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
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
            <KpiCard icon="📊" label="透明性スコア" value="4.1 / 5.0"
              sub="地域平均 3.7 より +0.4 ↑" valueColor={C.accent} />
            <KpiCard icon="📈" label="今月の閲覧数" value="1,243"
              sub="先月比 +18% ↑" valueColor={C.primary} />
            <KpiCard icon="💬" label="レビュー件数" value="24件"
              sub="今月 +3件" valueColor={C.primary} />
            <KpiCard icon="⚠️" label="追加費用発生率" value="18%"
              sub="地域平均 38% より低い ↓" valueColor={C.accent} />
          </div>

          {/* グラフエリア */}
          <div style={{ display: 'flex', gap: 16 }}>

            {/* 左：スコア推移折れ線 */}
            <div style={{ ...card, flex: 3 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>透明性スコア推移</div>
                <div style={{ fontSize: 12, color: C.muted }}>2025年6月〜11月</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 12, fill: C.muted }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E0E0E0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="myScore" name="自院スコア"
                    stroke={C.primary} strokeWidth={2.5} dot={{ r: 4, fill: C.primary }} />
                  <Line type="monotone" dataKey="avg" name="地域平均"
                    stroke="#BDC3C7" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 右：料金比較横棒 */}
            <div style={{ ...card, flex: 2 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>地域相場との料金比較</div>
                <div style={{ fontSize: 12, color: C.muted }}>単位：万円</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={feeData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fill: C.muted }} width={68} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E0E0E0' }}
                    formatter={(v) => `${v}万円`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="myFee" name="自院" fill={C.primary} radius={[0, 3, 3, 0]} barSize={10} />
                  <Bar dataKey="median" name="地域中央値" fill="#BDC3C7" radius={[0, 3, 3, 0]} barSize={10} />
                  <Bar dataKey="max" name="地域最高値" fill="#E8ECF0" radius={[0, 3, 3, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 下段: アドバイス + レビュー */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

            {/* 改善アドバイス */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💡</span> 今月の改善アクション
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {advice.map(a => (
                  <div key={a.num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#EAF2F8', color: C.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {a.num}
                    </div>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0 }}>{a.text}</p>
                  </div>
                ))}
              </div>
            </div>

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
                      <span style={{ fontSize: 11, background: '#EAF2F8', color: C.primary, padding: '1px 8px', borderRadius: 10 }}>{r.treatment}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: '0 0 8px' }}>「{r.text}」</p>
                    <button style={{
                      fontSize: 11, color: C.primary, border: `1px solid ${C.primary}`,
                      background: 'transparent', borderRadius: 4, padding: '3px 10px',
                      cursor: 'pointer',
                    }}>
                      返信する
                    </button>
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
