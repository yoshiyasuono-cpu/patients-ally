import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';

const FILTERS = ['すべて', 'ワイヤー矯正', 'マウスピース矯正'];

// エリアグループ定義（グループ名 → 含まれる区/市）
const AREA_GROUPS = {
  '都心エリア': ['千代田区', '中央区', '港区'],
  '渋谷・表参道エリア': ['渋谷区', '目黒区'],
  '新宿・高田馬場エリア': ['新宿区', '中野区'],
  '銀座・有楽町エリア': ['中央区', '千代田区'],
  '池袋・巣鴨エリア': ['豊島区', '北区', '板橋区'],
  '吉祥寺・三鷹エリア': ['武蔵野市', '三鷹市', '杉並区'],
  '立川・多摩エリア': ['立川市', '八王子市', '町田市', '調布市', '府中市', '昭島市', '稲城市', '国分寺市', '国立市', '小平市', '日野市', '西東京市'],
};

// セレクトボックス用の選択肢（グループ → 個別区市）
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
  if (n == null || n <= 2) return { text: '調査中', color: 'text-gray-400', bg: 'bg-gray-100' };
  if (n <= 9) return { text: `参考値（n=${n}）`, color: 'text-amber-600', bg: 'bg-amber-50' };
  return { text: `信頼度の高いデータ（n=${n}）`, color: 'text-teal-700', bg: 'bg-teal-50' };
}

// ダミー比較カードデータ
const COMPARE_CLINICS = [
  {
    name: 'A矯正歯科',
    area: '渋谷区',
    priceRange: '80〜120万円',
    estimate: 95, extraExplain: 90, riskExplain: 85, document: true, n: 14,
  },
  {
    name: 'B矯正歯科',
    area: '立川市',
    priceRange: '39〜140万円',
    estimate: 100, extraExplain: 80, riskExplain: 80, document: true, n: 6,
  },
  {
    name: 'C矯正歯科',
    area: '新宿区',
    priceRange: '70〜100万円',
    estimate: 70, extraExplain: 50, riskExplain: 40, document: false, n: 2,
  },
];

// エリアマッチ判定（グループまたは個別区市）
function matchesArea(clinicArea, selectedArea) {
  if (selectedArea === 'すべて') return true;
  if (AREA_GROUPS[selectedArea]) {
    return AREA_GROUPS[selectedArea].includes(clinicArea);
  }
  return clinicArea === selectedArea;
}

// 比較項目のバー表示
function CompareBar({ label, value, suffix = '%' }) {
  const barColor = value >= 80 ? 'bg-teal-600' : value >= 50 ? 'bg-amber-500' : 'bg-gray-300';
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-[11px] w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-gray-700 text-xs font-semibold w-10 text-right">{value}{suffix}</span>
    </div>
  );
}

export default function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('すべて');
  const [budget, setBudget] = useState('指定なし');
  const [filter, setFilter] = useState('すべて');
  const [showCompany, setShowCompany] = useState(false);

  useEffect(() => {
    supabase
      .from('clinics')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) {
          // fee_minがある医院を上位に表示（透明性データ充実順）
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
      (filter === 'マウスピース矯正' && c.invisalignAvailable);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header />

      {/* ===== Hero ===== */}
      <div className="bg-gradient-to-br from-[#0f1b2d] to-[#1a2a42] px-4 pt-8 pb-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
            自由診療を、<br className="md:hidden" />比較可能・説明可能・検証可能に。
          </h1>
          <p className="text-[#94a3b8] text-sm md:text-base leading-relaxed mb-5">
            価格、追加費用、説明の丁寧さまで。<br className="md:hidden" />矯正治療を"納得して選ぶ"ための比較サイト。
          </p>

          {/* 進捗表示 */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            現在{clinics.length}院掲載・アンケート収集中
          </div>

          {/* CTA 3本 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#clinics" className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-3 px-6 rounded-lg transition-colors">
              クリニックを探す
            </a>
            <a href="https://medbase.jp/#problems" target="_blank" rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-3 px-6 rounded-lg border border-white/20 transition-colors">
              比較の仕組みを見る
            </a>
            <a href="https://kyoseidatalab.jp/survey/" target="_blank" rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-3 px-6 rounded-lg border border-white/20 transition-colors">
              アンケートに協力する
            </a>
          </div>
        </div>
      </div>

      {/* ===== 比較カードセクション ===== */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 -mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-800 font-bold text-base">透明性データで比較する</h2>
              <p className="text-gray-400 text-xs mt-0.5">比較軸：見積提示率 / 追加費用の事前説明率 / リスク説明率 / 書面交付 / n数</p>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">サンプル表示</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPARE_CLINICS.map((c, i) => {
              const nl = nLabel(c.n);
              return (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  {/* クリニック名 */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-gray-400 text-[10px]">{c.area}</div>
                      <h3 className="text-gray-800 font-bold text-sm">{c.name}</h3>
                    </div>
                    <div className="text-teal-700 font-bold text-xs">{c.priceRange}</div>
                  </div>

                  {/* 比較バー */}
                  <div className="space-y-2 mb-3">
                    <CompareBar label="見積提示率" value={c.estimate} />
                    <CompareBar label="追加費用の説明率" value={c.extraExplain} />
                    <CompareBar label="リスク説明率" value={c.riskExplain} />
                  </div>

                  {/* 書面 + n数 */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.document ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      書面交付 {c.document ? '✓' : '—'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${nl.bg} ${nl.color}`}>
                      {nl.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex gap-2 mb-5 flex-wrap justify-center">
          {['料金の透明性を審査', '投稿情報の改ざん禁止', '広告費による順位操作なし'].map((label) => (
            <span key={label} className="bg-white text-gray-500 text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-100">
              <svg className="w-3.5 h-3.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ===== 検索・一覧 ===== */}
      <div id="clinics" className="w-full max-w-6xl mx-auto px-3 sm:px-6">
        {/* Search bar */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="クリニック名・駅名・エリアで検索"
            className="w-full pl-9 pr-4 rounded-lg text-sm bg-white text-gray-800 placeholder-gray-400 outline-none shadow-sm border border-gray-100"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Filter row */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-sm px-4 rounded-full border transition-all flex items-center ${
                filter === f
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={{ minHeight: '44px' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sub filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 bg-white text-gray-700 outline-none"
            style={{ minHeight: '44px' }}
          >
            {AREA_OPTIONS.map((opt, i) =>
              opt.disabled ? (
                <option key={i} disabled value="">{opt.label}</option>
              ) : (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              )
            )}
          </select>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 bg-white text-gray-700 outline-none"
            style={{ minHeight: '44px' }}
          >
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        {/* Result count */}
        <div className="text-xs text-gray-500 mb-3">
          {filtered.length}件のクリニックが見つかりました
        </div>

        {/* Clinic cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              条件に合うクリニックが見つかりませんでした
            </div>
          ) : (
            filtered.map((clinic) => (
              <Link to={`/clinic/${clinic.id}`} key={clinic.id}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Clinic header */}
                  <div className="p-3 pb-2 flex gap-3">
                    {/* イニシャルアイコン */}
                    <div className="flex-shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-lg bg-teal-50 flex items-center justify-center">
                      <span className="text-teal-700 font-bold text-2xl">{clinic.name.charAt(0)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-gray-400 text-[10px]">{clinic.area}</span>
                          </div>
                          <h2 className="text-gray-900 font-bold text-base leading-tight line-clamp-2">{clinic.name}</h2>
                        </div>
                        <div className="flex-shrink-0 text-right ml-1">
                          <div className="text-teal-700 font-bold text-sm">{clinic.priceRange}</div>
                          <div className="text-gray-400 text-[9px]">料金目安</div>
                        </div>
                      </div>

                      {/* 対応治療 */}
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {clinic.treatments.length > 0 ? (
                          clinic.treatments.map((t) => (
                            <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[10px]">対応治療：情報収集中</span>
                        )}
                        {clinic.totalFee && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                            トータルフィー制
                          </span>
                        )}
                      </div>

                      {/* 最寄り駅 */}
                      <p className="text-gray-400 text-xs line-clamp-1">
                        {clinic.station || clinic.address}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-100">
                    <span className="text-gray-400 text-xs">
                      <svg className="w-3 h-3 inline mr-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {clinic.station || ''}
                    </span>
                    <span className="text-teal-700 text-sm font-semibold flex items-center gap-0.5">
                      詳細を見る
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ===== MedBaseエコシステム共通フッター ===== */}
      <footer className="w-full bg-[#0f1b2d] text-[#94a3b8] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-center text-xs leading-relaxed mb-6">
            MedBaseエコシステムは、ClinicCompass・矯正データラボ・MedBaseを通じて、<br className="hidden sm:inline" />
            自由診療の比較可能性と透明性の向上を目指しています。
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
            <a href="https://medbase.jp" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-sm hover:text-white transition-colors">MedBase</a>
            <a href="https://cliniccompass.jp" className="text-white text-sm font-semibold">ClinicCompass</a>
            <a href="https://kyoseidatalab.jp" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-sm hover:text-white transition-colors">矯正データラボ</a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5 border-t border-white/10 pt-5">
            <Link to="/policy" className="text-[#64748b] text-xs hover:text-white transition-colors">投稿情報掲載基準</Link>
            <Link to="/for-clinics" className="text-[#64748b] text-xs hover:text-white transition-colors">クリニックの方へ</Link>
            <a href="/contact.php" className="text-[#64748b] text-xs hover:text-white transition-colors">お問い合わせ</a>
            <button onClick={() => setShowCompany(true)} className="text-[#64748b] text-xs hover:text-white transition-colors bg-transparent border-none cursor-pointer">運営会社</button>
          </div>
          <p className="text-center text-[#64748b] text-[11px]">
            &copy; 2026 ClinicCompass by MedBase. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 運営会社モーダル */}
      {showCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCompany(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md w-[90%] relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCompany(false)} className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer">&times;</button>
            <h3 className="font-bold text-base mb-4">運営会社</h3>
            <div className="text-sm leading-8">
              <p className="text-gray-400 text-xs">会社名</p><p>株式会社ユナイテッドプロモーションズ</p>
              <p className="text-gray-400 text-xs mt-1">代表者</p><p>大野芳裕</p>
              <p className="text-gray-400 text-xs mt-1">所在地</p><p>〒190-0012 東京都立川市曙町2-14-19 シュールビル6階</p>
              <p className="text-gray-400 text-xs mt-1">TEL</p><p>042-519-3582</p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed CTA button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-5xl mx-auto p-3">
          <p className="text-center text-xs text-gray-500 mb-1">
            どれを選べばいいかわからない方は
            <a href="https://patient-mikata-lp.vercel.app" target="_blank" className="text-teal-700 font-bold underline ml-1">
              無料コンシェルジュに相談 →
            </a>
          </p>
          <Link to="/consult">
            <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              無料相談はこちら（48時間以内にご連絡）
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
