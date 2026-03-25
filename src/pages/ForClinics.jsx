import Header from '../components/Header';

// お問い合わせ先（差し替え時はここだけ変更）
const CONTACT_EMAIL = 'mailto:info@kanja-mikata.com';

// 収益モデルカードのデータ
const REVENUE_MODELS = [
  {
    type: 'ストック収益',
    title: '月額PR枠',
    price: '1万円/月〜',
    description: 'クリニック発信エリアに自院情報・症例・医師プロフィールを掲載。',
    note: '※ 患者の味方は掲載内容を保証・推薦するものではありません',
    color: 'bg-teal-50 border-teal-200',
    labelColor: 'bg-teal-100 text-teal-700',
    priceColor: 'text-teal-700',
  },
  {
    type: 'フロー収益A',
    title: 'カウンセリング送客',
    price: '5,000円/件',
    description: '相談・教育済みの患者をカウンセリングに送客。予算確保済み・リスク理解済みの状態で来院。',
    note: null,
    color: 'bg-blue-50 border-blue-200',
    labelColor: 'bg-blue-100 text-blue-700',
    priceColor: 'text-blue-700',
  },
  {
    type: 'フロー収益B',
    title: '成約成功報酬',
    price: '36,000円/件',
    description: '治療契約成立時のみ発生。平均単価90万円の約4%。Google広告経由より費用対効果が高い。',
    note: null,
    color: 'bg-indigo-50 border-indigo-200',
    labelColor: 'bg-indigo-100 text-indigo-700',
    priceColor: 'text-indigo-700',
  },
];

export default function ForClinics() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header showBack backTo="/" title="クリニックの方へ" />

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ページタイトル */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          クリニック・歯科医の先生へ
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          患者の味方は、矯正患者と誠実なクリニックをつなぐ中立エージェントです。
        </p>

        {/* セクション1：患者の味方とは */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center flex-shrink-0">1</span>
            患者の味方とは
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            {[
              '矯正患者のための中立エージェントサービスです。',
              '特定のクリニックから広告料を取りません（掲載順位は広告費で変わりません）。',
              '教育済み・予算確保済みの患者を送客します。',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-gray-700 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* セクション2：費用の仕組み */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center flex-shrink-0">2</span>
            費用の仕組み（3つの収益モデル）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVENUE_MODELS.map((m) => (
              <div key={m.title} className={`rounded-xl border p-5 ${m.color}`}>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.labelColor} mb-3 inline-block`}>
                  {m.type}
                </span>
                <div className={`text-xl font-bold ${m.priceColor} mb-1`}>{m.price}</div>
                <div className="text-gray-800 font-semibold text-sm mb-2">{m.title}</div>
                <p className="text-gray-600 text-xs leading-relaxed">{m.description}</p>
                {m.note && (
                  <p className="text-gray-400 text-[10px] mt-2">{m.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* セクション3：お問い合わせ */}
        <section>
          <h2 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center flex-shrink-0">3</span>
            お問い合わせ
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-5">
              まずはヒアリングから。費用は発生しません。
            </p>
            <a
              href={CONTACT_EMAIL}
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              掲載・送客についてお問い合わせ
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
