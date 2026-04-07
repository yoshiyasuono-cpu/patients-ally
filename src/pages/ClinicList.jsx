import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';

const FILTERS = ['すべて', 'ワイヤー矯正', 'マウスピース矯正', '裏側矯正', '部分矯正', '小児矯正', '無料相談あり', '土日祝診療', '夜間診療', '認定医在籍', 'トータルフィー制'];

// エリアグループ定義
const AREA_GROUPS = {
  '都心エリア': ['千代田区', '中央区', '港区'],
  '渋谷・表参道エリア': ['渋谷区', '目黒区'],
  '新宿・高田馬場エリア': ['新宿区', '中野区'],
  '銀座・有楽町エリア': ['中央区', '千代田区'],
  '池袋・巣鴨エリア': ['豊島区', '北区', '板橋区'],
  '吉祥寺・三鷹エリア': ['武蔵野市', '三鷹市', '杉並区'],
  '立川・多摩エリア': ['立川市', '八王子市', '町田市', '調布市', '府中市', '昭島市', '稲城市', '国分寺市', '国立市', '小平市', '日野市', '西東京市'],
};

const AREA_OPTIONS = [
  { label: 'すべて', value: 'すべて' },
  { label: '--- エリアで探す ---', value: '', disabled: true },
  ...Object.keys(AREA_GROUPS).map(g => ({ label: g, value: g })),
  { label: '--- 区・市で探す ---', value: '', disabled: true },
  ...['渋谷区', '新宿区', '港区', '中央区', '千代田区', '文京区',
    '世田谷区', '目黒区', '豊島区', '品川区', '大田区', '杉並区', '中野区',
    '板橋区', '練馬区', '北区', '台東区', '墨田区', '江東区', '葛飾区',
    '荒川区', '足立区', '江戸川区',
    '八王子市', '町田市', '立川市', '調布市', '府中市', '武蔵野市', '三鷹市',
    '昭島市', '稲城市', '国分寺市', '国立市', '小平市', '日野市', '西東京市',
  ].map(a => ({ label: a, value: a })),
];

const BUDGETS = ['指定なし', '〜80万円', '80〜100万円', '100〜120万円', '120万円以上'];

// n数表示ルール（トップ・詳細共通）
export function nLabel(n) {
  if (n == null || n <= 2) return { text: '調査中', color: '#94a3b8', bg: '#f1f5f9' };
  if (n <= 9) return { text: `参考値（n=${n}）`, color: '#d97706', bg: '#fffbeb' };
  return { text: `信頼度の高いデータ（n=${n}）`, color: '#0f766e', bg: '#f0fdfa' };
}

// バーの色判定
function barColor(v) {
  if (v >= 80) return '#1a9e75';
  if (v >= 50) return '#f59e0b';
  return '#ef4444';
}

// 比較デモデータ
const DEMO_CARDS = [
  {
    name: 'みなと矯正歯科クリニック',
    area: '港区',
    sub: 'ワイヤー・マウスピース',
    score: 82,
    scoreBg: '#1a9e75',
    metrics: [
      { label: '見積提示率', value: 100 },
      { label: '追加費用の説明', value: 88 },
      { label: 'リスク説明率', value: 88 },
      { label: '契約圧力の低さ', value: 95 },
    ],
    n: 24,
    verified: true,
  },
  {
    name: 'さくら矯正歯科',
    area: '渋谷区',
    sub: 'ワイヤー・マウスピース',
    score: 71,
    scoreBg: '#0f3d5c',
    metrics: [
      { label: '見積提示率', value: 85 },
      { label: '追加費用の説明', value: 60 },
      { label: 'リスク説明率', value: 70 },
      { label: '契約圧力の低さ', value: 75 },
    ],
    n: 7,
    verified: false,
  },
  {
    name: 'あおば矯正歯科',
    area: '新宿区',
    sub: 'マウスピース専門',
    score: null,
    scoreBg: '#94a3b8',
    metrics: [
      { label: '見積提示率', value: null },
      { label: '追加費用の説明', value: null },
      { label: 'リスク説明率', value: null },
      { label: '契約圧力の低さ', value: null },
    ],
    n: 1,
    verified: false,
  },
];

function matchesArea(clinicArea, selectedArea) {
  if (selectedArea === 'すべて') return true;
  if (AREA_GROUPS[selectedArea]) {
    return AREA_GROUPS[selectedArea].includes(clinicArea);
  }
  return clinicArea === selectedArea;
}

// ============================
// スタイル定数
// ============================
const S = {
  font: "'Hiragino Kaku Gothic ProN', 'Helvetica Neue', Arial, sans-serif",
  navy: '#0f3d5c',
  teal: '#1a9e75',
  accent: '#4dd4a8',
  heroBg1: '#0a2e44',
  heroBg2: '#0f3d5c',
  pageBg: '#f5f7fa',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  muted: '#94a3b8',
  text: '#0f1b2d',
};

export default function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('すべて');
  const [budget, setBudget] = useState('指定なし');
  const [filter, setFilter] = useState('すべて');
  const [showCompany, setShowCompany] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    supabase
      .from('clinics')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map(mapFromDb);
          mapped.sort((a, b) => {
            const aHasFee = a.feeMin != null ? 0 : 1;
            const bHasFee = b.feeMin != null ? 0 : 1;
            return aHasFee - bHasFee;
          });
          setClinics(mapped);
        }
        setLoading(false);
      });
  }, []);

  const filtered = clinics.filter((c) => {
    const q = search.trim();
    const matchSearch =
      q === '' ||
      c.name.includes(q) ||
      c.area.includes(q) ||
      c.station.includes(q) ||
      c.address.includes(q);
    const matchArea = matchesArea(c.area, area);
    const matchFilter =
      filter === 'すべて' ||
      (filter === 'ワイヤー矯正' && c.wireAvailable) ||
      (filter === 'マウスピース矯正' && c.invisalignAvailable) ||
      (filter === '裏側矯正' && c.lingualAvailable) ||
      (filter === '部分矯正' && c.partialAvailable) ||
      (filter === '小児矯正' && c.kidsAvailable) ||
      (filter === '無料相談あり' && c.freeConsultation) ||
      (filter === '土日祝診療' && c.weekendHoliday) ||
      (filter === '夜間診療' && c.nightClinic) ||
      (filter === '認定医在籍' && c.certifiedDoctor) ||
      (filter === 'トータルフィー制' && c.totalFeeSystem);
    const matchBudget = (() => {
      if (budget === '指定なし') return true;
      const minPrice = c.feeMin;
      if (!minPrice) return budget === '指定なし';
      if (budget === '〜80万円') return minPrice <= 800000;
      if (budget === '80〜100万円') return minPrice >= 800000 && minPrice <= 1000000;
      if (budget === '100〜120万円') return minPrice >= 1000000 && minPrice <= 1200000;
      if (budget === '120万円以上') return minPrice >= 1200000;
      return true;
    })();
    return matchSearch && matchArea && matchFilter && matchBudget;
  });

  // フィルター変更時に表示件数をリセット
  useEffect(() => {
    setDisplayCount(20);
  }, [search, area, budget, filter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: S.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.font }}>
        <p style={{ color: S.muted, fontSize: 14 }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: S.pageBg, fontFamily: S.font, color: S.text, paddingBottom: 80 }}>

      {/* ============ ナビゲーション ============ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${S.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {/* ロゴ */}
          <a href="/" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ color: S.navy }}>Clinic</span>
            <span style={{ color: S.teal }}>Compass</span>
          </a>
          {/* 中央リンク（モバイルでは非表示） */}
          <div className="hidden md:flex" style={{ gap: 24, alignItems: 'center' }}>
            <a href="#clinics" style={{ color: S.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>クリニックを探す</a>
            <a href="https://medbase.jp/#problems" target="_blank" rel="noopener noreferrer" style={{ color: S.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>比較の仕組み</a>
            <a href="https://kyoseidatalab.jp" target="_blank" rel="noopener noreferrer" style={{ color: S.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>データラボ</a>
            <a href="/chat" style={{ color: S.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>AIに矯正相談</a>
          </div>
          {/* 右ボタン */}
          <a href="/survey" style={{
            background: S.navy, color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '7px 14px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}>アンケートに協力</a>
        </div>
      </nav>

      {/* ============ ヒーロー ============ */}
      <section style={{
        background: `linear-gradient(135deg, ${S.heroBg1} 0%, ${S.heroBg2} 100%)`,
        padding: '48px 20px 40px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* バッジ */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(26,158,117,0.2)', border: '1px solid rgba(26,158,117,0.4)',
            color: S.accent, fontSize: 12, fontWeight: 600,
            padding: '6px 18px', borderRadius: 24, marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.accent }} />
            自由診療比較インフラ — フェーズ1稼働中
          </div>

          {/* H1 */}
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, letterSpacing: '0.02em' }}>
            自由診療を、<br />
            <span style={{ color: S.accent }}>比較可能</span>・
            <span style={{ color: S.accent }}>説明可能</span>・
            <span style={{ color: S.accent }}>検証可能</span>に。
          </h1>

          {/* サブコピー */}
          <p style={{ color: S.muted, fontSize: 15, lineHeight: 1.9, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            価格、追加費用、説明の丁寧さまで。矯正治療を"納得して選ぶ"ための比較サイト。<br />口コミではなく構造化データで選ぶ。
          </p>

          {/* 数値ブロック */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, marginBottom: 36, maxWidth: 600, margin: '0 auto 36px',
          }}>
            {[
              { num: '517', label: '掲載クリニック数', accent: false },
              { num: '4', label: '比較軸', accent: true },
              { num: '集計中', label: 'アンケート回収数', accent: false },
              { num: '0円', label: '患者利用料', accent: true },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '20px 8px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontSize: item.num === '集計中' ? 16 : 28, fontWeight: 700, color: item.accent ? S.accent : '#fff', lineHeight: 1.2 }}>
                  {item.num}
                </div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* CTA 3本（モバイル縦並び） */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#clinics" style={{
              background: S.teal, color: '#fff', fontSize: 14, fontWeight: 700,
              padding: '12px 28px', borderRadius: 8, textDecoration: 'none',
              border: 'none', whiteSpace: 'nowrap',
            }}>クリニックを探す</a>
            <a href="/survey" style={{
              background: 'transparent', color: S.accent, fontSize: 13, fontWeight: 600,
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              border: `1.5px solid ${S.accent}`, whiteSpace: 'nowrap',
            }}>アンケートに協力する</a>
            <a href="https://medbase.jp/#problems" target="_blank" rel="noopener noreferrer" style={{
              background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
              padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.25)', whiteSpace: 'nowrap',
            }}>比較の仕組みを見る</a>
          </div>
        </div>
      </section>

      {/* ============ 比較デモセクション ============ */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* ラベル + タイトル */}
          <p style={{ fontSize: 11, fontWeight: 700, color: S.teal, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            比較デモ — DEMO DATA
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>
            こんなふうに比較できます
          </h2>
          <p style={{ fontSize: 14, color: S.muted, marginBottom: 28, lineHeight: 1.8 }}>
            口コミの数ではなく、"説明の丁寧さ"と"追加費用の透明性"を数値で比較。
          </p>

          {/* 信頼度ルール説明バー */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
            border: `1.5px solid ${S.border}`, borderRadius: 10, padding: '12px 20px', marginBottom: 24,
            background: '#fafbfc',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: '#f0fdfa', color: '#0f766e', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>n=10以上</span>
              <span style={{ fontSize: 12, color: S.muted }}>信頼度の高いデータ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>n=3〜9</span>
              <span style={{ fontSize: 12, color: S.muted }}>参考値</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>n=0〜2</span>
              <span style={{ fontSize: 12, color: S.muted }}>調査中</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#b0bec5' }}>透明性スコアや比較順位は課金で変わりません</span>
          </div>

          {/* 比較カード3枚（モバイルは縦並び） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEMO_CARDS.map((card, ci) => {
              const nl = nLabel(card.n);
              const isBlank = card.score === null;
              return (
                <div key={ci} style={{
                  background: S.cardBg, border: `1.5px solid ${S.border}`, borderRadius: 12,
                  padding: 0, overflow: 'hidden',
                  opacity: isBlank ? 0.7 : 1,
                }}>
                  {/* カードヘッダー */}
                  <div style={{ padding: '20px 20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: S.muted }}>{card.area}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{card.name}</div>
                        <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{card.sub}</div>
                      </div>
                      {/* スコアバッジ */}
                      <div style={{
                        background: card.scoreBg, color: '#fff',
                        width: 52, height: 52, borderRadius: 12,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: isBlank ? 10 : 20, fontWeight: 700, lineHeight: 1 }}>
                          {isBlank ? '調査中' : card.score}
                        </span>
                        {!isBlank && <span style={{ fontSize: 9, opacity: 0.8 }}>点</span>}
                      </div>
                    </div>
                  </div>

                  {/* 指標バー */}
                  <div style={{ padding: '0 20px 16px' }}>
                    {card.metrics.map((m, mi) => (
                      <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: S.muted, width: 110, flexShrink: 0 }}>{m.label}</span>
                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                          {m.value != null && (
                            <div style={{ height: '100%', borderRadius: 4, background: barColor(m.value), width: `${m.value}%` }} />
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.value != null ? S.text : S.muted, width: 36, textAlign: 'right' }}>
                          {m.value != null ? `${m.value}%` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* カードフッター */}
                  <div style={{
                    background: '#fafbfc', borderTop: `1px solid ${S.border}`,
                    padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: nl.color, background: nl.bg, padding: '3px 10px', borderRadius: 12 }}>
                      n={card.n}
                    </span>
                    <span style={{ fontSize: 11, color: S.muted }}>
                      {card.verified ? '運営確認済み' : card.n <= 2 ? '回答数が少ないため非表示' : '参考値'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* デモ注釈 */}
          <p style={{ fontSize: 11, color: '#b0bec5', textAlign: 'center', marginTop: 16 }}>
            ※ すべてデモデータです。実データは今後順次公開予定。
          </p>

          {/* CTAストリップ */}
          <div style={{
            background: S.navy, borderRadius: 12, padding: '28px 32px', marginTop: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>517院のデータを見る</div>
              <div style={{ color: S.muted, fontSize: 13 }}>エリア・料金・治療方法で絞り込んで比較できます</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="#clinics" style={{
                background: S.teal, color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '12px 24px', borderRadius: 8, textDecoration: 'none', border: 'none',
              }}>クリニックを探す</a>
              <a href="/survey" style={{
                background: 'transparent', color: S.accent, fontSize: 13, fontWeight: 600,
                padding: '12px 24px', borderRadius: 8, textDecoration: 'none',
                border: `1.5px solid ${S.accent}`,
              }}>アンケートに協力する</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 検索・一覧 ============ */}
      <section id="clinics" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 0' }}>
        {/* 検索バー */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: S.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="クリニック名・駅名・エリアで検索"
            style={{
              width: '100%', padding: '12px 12px 12px 36px', borderRadius: 10,
              fontSize: 14, background: '#fff', color: S.text,
              border: `1.5px solid ${S.border}`, outline: 'none',
              fontFamily: S.font,
            }}
          />
        </div>

        {/* 人気エリアから探す */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 8, fontWeight: 600 }}>人気エリアから探す</div>
          {/* 23区 */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 6, paddingBottom: 2 }}>
            {['港区', '渋谷区', '新宿区', '中央区', '千代田区', '目黒区', '世田谷区', '豊島区', '品川区', '文京区'].map(c => (
              <button key={c} onClick={() => setArea(area === c ? 'すべて' : c)} style={{
                flexShrink: 0, fontSize: 12, padding: '6px 14px', borderRadius: 20,
                background: area === c ? S.teal : '#fff',
                color: area === c ? '#fff' : '#64748b',
                border: `1px solid ${area === c ? S.teal : S.border}`,
                cursor: 'pointer', fontWeight: area === c ? 700 : 400, fontFamily: S.font,
              }}>{c}</button>
            ))}
          </div>
          {/* 23区外 */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { label: '立川市', value: '立川市' },
              { label: '吉祥寺', value: '武蔵野市' },
              { label: '八王子市', value: '八王子市' },
              { label: '町田市', value: '町田市' },
            ].map(c => (
              <button key={c.value} onClick={() => setArea(area === c.value ? 'すべて' : c.value)} style={{
                flexShrink: 0, fontSize: 12, padding: '6px 14px', borderRadius: 20,
                background: area === c.value ? S.teal : '#fff',
                color: area === c.value ? '#fff' : '#64748b',
                border: `1px solid ${area === c.value ? S.teal : S.border}`,
                cursor: 'pointer', fontWeight: area === c.value ? 700 : 400, fontFamily: S.font,
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* フィルター */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, fontSize: 13, padding: '10px 20px', borderRadius: 24,
                border: `1.5px solid ${filter === f ? S.teal : S.border}`,
                background: filter === f ? S.teal : '#fff',
                color: filter === f ? '#fff' : '#64748b',
                fontWeight: filter === f ? 700 : 400,
                cursor: 'pointer', fontFamily: S.font,
              }}
            >{f}</button>
          ))}
        </div>

        {/* エリア・予算フィルター */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            style={{ flex: 1, fontSize: 13, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${S.border}`, background: '#fff', color: '#64748b', outline: 'none', fontFamily: S.font }}
          >
            {AREA_OPTIONS.map((opt, i) =>
              opt.disabled ? <option key={i} disabled value="">{opt.label}</option>
                : <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{ flex: 1, fontSize: 13, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${S.border}`, background: '#fff', color: '#64748b', outline: 'none', fontFamily: S.font }}
          >
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        {/* 件数 */}
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 16 }}>
          {filtered.length}件のクリニックが見つかりました
        </div>

        {/* クリニックカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: S.muted, padding: '48px 0', fontSize: 14 }}>
              条件に合うクリニックが見つかりませんでした
            </div>
          ) : (
            filtered.slice(0, displayCount).map((clinic) => (
              <Link to={`/clinic/${clinic.id}`} key={clinic.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: S.cardBg, borderRadius: 12, border: `1.5px solid ${S.border}`,
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ padding: 16, display: 'flex', gap: 12 }}>
                    {/* イニシャル */}
                    <div style={{
                      width: 72, height: 72, borderRadius: 10, background: '#f0fdfa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: S.teal, fontWeight: 700, fontSize: 24 }}>{clinic.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div>
                          <span style={{ fontSize: 10, color: S.muted }}>{clinic.area}</span>
                          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{clinic.name}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: S.teal }}>{clinic.priceRange}</div>
                          <div style={{ fontSize: 9, color: S.muted }}>料金目安</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                        {clinic.treatments.length > 0 ? clinic.treatments.map((t) => (
                          <span key={t} style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 12 }}>{t}</span>
                        )) : (
                          <span style={{ fontSize: 10, color: S.muted }}>対応治療：情報収集中</span>
                        )}
                        {clinic.totalFeeSystem && (
                          <span style={{ fontSize: 10, background: '#f0fdfa', color: S.teal, padding: '2px 8px', borderRadius: 12, border: '1px solid #ccfbf1' }}>トータルフィー制</span>
                        )}
                      </div>
                      {/* 診療情報バッジ */}
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
                        {clinic.freeConsultation && <span style={{ fontSize: 9, color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: 8 }}>無料相談</span>}
                        {clinic.weekendHoliday && <span style={{ fontSize: 9, color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: 8 }}>土日祝</span>}
                        {clinic.nightClinic && <span style={{ fontSize: 9, color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: 8 }}>夜間</span>}
                        {clinic.certifiedDoctor && <span style={{ fontSize: 9, color: '#7c3aed', background: '#f5f3ff', padding: '1px 6px', borderRadius: 8 }}>認定医</span>}
                        {clinic.dentalLoan && <span style={{ fontSize: 9, color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 8 }}>ローン可</span>}
                      </div>
                      <div style={{ fontSize: 11, color: S.muted }}>{clinic.station || clinic.address}</div>
                    </div>
                  </div>
                  <div style={{ background: '#fafbfc', borderTop: `1px solid ${S.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: S.muted }}>{clinic.station || ''}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: S.teal }}>
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* もっと見るボタン */}
        {filtered.length > displayCount && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => setDisplayCount(prev => prev + 20)}
              style={{
                background: '#fff', color: S.teal, fontSize: 14, fontWeight: 700,
                padding: '14px 36px', borderRadius: 10,
                border: `1.5px solid ${S.teal}`, cursor: 'pointer', fontFamily: S.font,
              }}
            >
              もっと見る（残り{filtered.length - displayCount}件）
            </button>
          </div>
        )}
      </section>

      {/* ============ MedBaseエコシステム共通フッター ============ */}
      <footer style={{ background: '#0a2e44', color: S.muted, marginTop: 48 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, lineHeight: 1.9, marginBottom: 24 }}>
            MedBaseエコシステムは、ClinicCompass・矯正データラボ・MedBaseを通じて、<br />
            自由診療の比較可能性と透明性の向上を目指しています。
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <a href="https://medbase.jp" target="_blank" rel="noopener noreferrer" style={{ color: S.muted, fontSize: 13, textDecoration: 'none' }}>MedBase</a>
            <a href="/" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>ClinicCompass</a>
            <a href="https://kyoseidatalab.jp" target="_blank" rel="noopener noreferrer" style={{ color: S.muted, fontSize: 13, textDecoration: 'none' }}>矯正データラボ</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <Link to="/policy" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>投稿情報掲載基準</Link>
            <Link to="/for-clinics" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>クリニックの方へ</Link>
            <a href="/contact.php" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>お問い合わせ</a>
            <button onClick={() => setShowCompany(true)} style={{ color: '#64748b', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.font }}>運営会社</button>
          </div>
          <p style={{ fontSize: 11, color: '#475569' }}>&copy; 2026 ClinicCompass by MedBase. All rights reserved.</p>
        </div>
      </footer>

      {/* 運営会社モーダル */}
      {showCompany && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCompany(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 440, width: '90%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCompany(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: S.muted }}>&times;</button>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>運営会社</h3>
            <div style={{ fontSize: 14, lineHeight: 2.2 }}>
              <div style={{ color: S.muted, fontSize: 12 }}>会社名</div><div>株式会社ユナイテッドプロモーションズ</div>
              <div style={{ color: S.muted, fontSize: 12, marginTop: 4 }}>代表者</div><div>大野芳裕</div>
              <div style={{ color: S.muted, fontSize: 12, marginTop: 4 }}>所在地</div><div>〒190-0012 東京都立川市曙町2-14-19 シュールビル6階</div>
              <div style={{ color: S.muted, fontSize: 12, marginTop: 4 }}>TEL</div><div>042-519-3582</div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', borderTop: `1px solid ${S.border}`,
        boxShadow: '0 -2px 16px rgba(0,0,0,0.06)', zIndex: 100, backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
            どれを選べばいいかわからない方は
            <Link to="/consult" style={{ color: S.teal, fontWeight: 700, marginLeft: 4, textDecoration: 'none' }}>無料コンシェルジュに相談 →</Link>
          </p>
          <Link to="/consult" style={{ textDecoration: 'none' }}>
            <button style={{
              background: S.teal, color: '#fff', fontSize: 13, fontWeight: 700,
              padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: S.font,
            }}>無料相談はこちら</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
