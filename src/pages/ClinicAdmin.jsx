import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminData, clinics } from '../data/clinics';
import StarRating from '../components/StarRating';

const STATUS_COLORS = {
  '相談中': 'bg-blue-50 text-blue-700 border-blue-200',
  '来院済': 'bg-amber-50 text-amber-700 border-amber-200',
  '成約': 'bg-teal-50 text-teal-700 border-teal-200',
};

const REFERRAL_FEE_RATES = {
  'ワイヤー矯正': 0.10,
  'マウスピース矯正': 0.10,
  'セラミック矯正': 0.12,
  '部分矯正': 0.10,
  '小児矯正': 0.10,
  'ホワイトニング': 0.15,
};

function formatMoney(n) {
  return n.toLocaleString() + '円';
}

function StatCard({ label, value, sub, color = 'teal', icon }) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
      <div className="text-xs font-semibold mb-1 opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

function SimulatorTab() {
  const [treatment, setTreatment] = useState('ワイヤー矯正');
  const [price, setPrice] = useState(700000);
  const [count, setCount] = useState(5);

  const rate = REFERRAL_FEE_RATES[treatment] || 0.10;
  const perCase = Math.round(price * rate);
  const total = perCase * count;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-700 text-xs leading-relaxed">
          「患者の味方」経由で成約した場合の紹介料をシミュレーションできます。費用はクリニック負担（成果報酬型）で、患者さまへの請求は一切ありません。
        </p>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">治療種別</label>
        <select
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-500 bg-white"
        >
          {Object.keys(REFERRAL_FEE_RATES).map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          治療費（税込）: {formatMoney(price)}
        </label>
        <input
          type="range"
          min={200000}
          max={1500000}
          step={50000}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-teal-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>20万円</span>
          <span>150万円</span>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          月間成約件数: {count}件
        </label>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-teal-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>1件</span>
          <span>30件</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">紹介料率（{treatment}）</span>
          <span className="text-gray-800 font-bold">{(rate * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">1件あたり紹介料</span>
          <span className="text-teal-700 font-bold">{formatMoney(perCase)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
          <span className="text-gray-700 font-semibold text-sm">月間紹介料合計</span>
          <span className="text-teal-700 font-bold text-xl">{formatMoney(total)}</span>
        </div>
      </div>

      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-amber-700 text-[10px] leading-relaxed">
          ※ 紹介料は成約（治療契約締結）時のみ発生します。相談・来院のみの場合は費用不要です。詳細はご契約時にご確認ください。
        </p>
      </div>
    </div>
  );
}

export default function ClinicAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('すべて');

  const clinic = clinics[0]; // デモ用：立川矯正歯科センター

  const { monthlyStats, consultations, reviews } = adminData;

  const filtered = statusFilter === 'すべて'
    ? consultations
    : consultations.filter((c) => c.status === statusFilter);

  const TABS = [
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'consultations', label: '相談者一覧' },
    { id: 'reviews', label: '投稿情報管理' },
    { id: 'simulator', label: '紹介料 試算' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Admin header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">患</span>
            </div>
            <div>
              <div className="text-xs font-bold">患者の味方 管理画面</div>
              <div className="text-gray-400 text-[10px]">{clinic.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">DEMO</span>
            <Link to="/" className="text-gray-400 text-xs hover:text-white transition-colors">← 患者側へ</Link>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200 sticky top-[52px] z-40 overflow-x-auto">
        <div className="max-w-[430px] mx-auto flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pt-4">

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-gray-800 font-bold text-sm mb-3">今月の実績（2026年3月）</h2>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="相談件数" value={`${monthlyStats.consultations}件`} sub="先月比 +12%" color="blue" />
                <StatCard label="来院件数" value={`${monthlyStats.visits}件`} sub="成約率 57.9%" color="amber" />
                <StatCard label="成約件数" value={`${monthlyStats.contracts}件`} sub="今月目標達成" color="teal" />
                <StatCard label="紹介料合計" value={formatMoney(monthlyStats.referralFee)} sub="税込" color="purple" />
              </div>
            </div>

            {/* Funnel */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-gray-700 font-bold text-sm mb-3">転換ファネル</h3>
              <div className="space-y-2">
                {[
                  { label: '相談受付', count: monthlyStats.consultations, color: 'bg-blue-500' },
                  { label: '来院', count: monthlyStats.visits, color: 'bg-amber-500' },
                  { label: '成約', count: monthlyStats.contracts, color: 'bg-teal-600' },
                ].map(({ label, count, color }) => {
                  const pct = Math.round((count / monthlyStats.consultations) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span>{count}件（{pct}%）</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent consultations */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-700 font-bold text-sm">最近の相談</h3>
                <button
                  onClick={() => setActiveTab('consultations')}
                  className="text-teal-600 text-xs"
                >
                  すべて見る →
                </button>
              </div>
              <div className="space-y-2">
                {consultations.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-gray-700 text-xs font-semibold">{c.name}</span>
                      <span className="text-gray-400 text-[10px] ml-2">{c.treatment}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <h3 className="text-teal-700 font-bold text-sm mb-2">💡 患者の味方 活用Tips</h3>
              <ul className="space-y-1.5">
                {[
                  '投稿情報への返信は成約率向上に効果的です',
                  '料金の明朗化がリピーター獲得につながります',
                  '48時間以内の初回連絡で来院率が2倍になります',
                ].map((tip) => (
                  <li key={tip} className="text-teal-700 text-xs flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Consultations tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['すべて', '相談中', '来院済', '成約'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    statusFilter === s
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {s}
                  {s !== 'すべて' && (
                    <span className="ml-1">
                      ({consultations.filter((c) => c.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-gray-800 font-bold text-sm">{c.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{c.age}歳</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 flex-shrink-0">希望治療</span>
                      <span className="text-gray-700">{c.treatment}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 flex-shrink-0">予算</span>
                      <span className="text-gray-700">{c.budget}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 flex-shrink-0">連絡方法</span>
                      <span className="text-gray-700">{c.contactMethod}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 flex-shrink-0">相談日</span>
                      <span className="text-gray-700">{c.date}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 leading-relaxed">
                    <span className="text-gray-400 font-semibold text-[10px]">お悩み: </span>
                    {c.concern}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {c.status === '相談中' && (
                      <button className="flex-1 bg-teal-700 text-white text-xs py-2 rounded-lg font-semibold">
                        来院済みに更新
                      </button>
                    )}
                    {c.status === '来院済' && (
                      <button className="flex-1 bg-teal-700 text-white text-xs py-2 rounded-lg font-semibold">
                        成約に更新
                      </button>
                    )}
                    <button className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 rounded-lg">
                      連絡する
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-amber-700 text-xs leading-relaxed">
                ⚠️ 投稿情報の削除・改ざんリクエストには対応しておりません。不正な投稿情報を発見した場合は運営にご連絡ください。
              </p>
            </div>

            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-gray-800 font-semibold text-sm">{review.name}</span>
                    <span className="text-gray-400 text-[10px] ml-2">{review.date}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                  {review.treatment}
                </span>
                <p className="text-gray-600 text-xs leading-relaxed mt-2">{review.text}</p>

                {review.replied ? (
                  <div className="mt-3 ml-3 p-2.5 bg-teal-50 rounded-lg border-l-2 border-teal-400">
                    <div className="text-teal-600 text-[10px] font-bold mb-1">クリニックからの返信</div>
                    <p className="text-teal-700 text-xs">{review.reply}</p>
                  </div>
                ) : (
                  <>
                    {replyingId === review.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          placeholder="患者さまへの返信を入力..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:border-teal-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setReplyingId(null); setReplyText(''); }}
                            className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 rounded-lg"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={() => { setReplyingId(null); setReplyText(''); }}
                            className="flex-1 bg-teal-700 text-white text-xs py-2 rounded-lg font-semibold"
                          >
                            返信する
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingId(review.id)}
                        className="mt-3 w-full border border-teal-200 text-teal-700 text-xs py-2 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        返信する
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Simulator tab */}
        {activeTab === 'simulator' && <SimulatorTab />}

      </div>
    </div>
  );
}
