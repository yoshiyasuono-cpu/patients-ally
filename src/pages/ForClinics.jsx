import Header from '../components/Header';

const CONTACT_EMAIL = 'mailto:info@kanja-mikata.com';

export default function ForClinics() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header showBack backTo="/" title="クリニックの皆様へ" />

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ページタイトル */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          クリニックの皆様へ
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-10">
          患者の味方は、患者さんの矯正歯科選びを支援する情報サービスです。<br />
          特定の医院を有利にする広告媒体ではなく、<br />
          比較可能な事実情報を整理して患者さんに届けることを目的としています。
        </p>

        {/* 3つのカードセクション */}
        <div className="space-y-6 mb-12">

          {/* 掲載について */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-700 rounded text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              掲載について
            </h2>
            <ul className="space-y-3">
              {[
                '掲載は公開情報をベースに行っています',
                '掲載順位は広告料や紹介料で変動しません',
                '情報の訂正・更新のご依頼を歓迎します',
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-gray-700 text-base">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 送客について */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-teal-700 rounded text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              送客について
            </h2>
            <ul className="space-y-3">
              {[
                '患者さんからの相談を受け、ご希望に合う医院をご紹介しています',
                '紹介料は来院時一律で、医院による単価差はありません',
                '成約の有無で報酬は変わりません',
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-gray-700 text-base">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 矯正比較インテリジェンス */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 bg-blue-700 rounded text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <h2 className="text-lg font-bold text-blue-800">
                矯正比較インテリジェンス
              </h2>
            </div>
            <p className="text-blue-600 text-sm mb-4 ml-8">今後提供予定</p>
            <ul className="space-y-3">
              {[
                '自院の見積もりがエリア内でどう見えているかを可視化するレポート',
                '患者が何で不安になっているか、比較で決め手になっているかのインサイト',
                'ご契約クリニック様に提供予定',
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">→</span>
                  <p className="text-gray-700 text-base">{text}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* お問い合わせ */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">お問い合わせ</h2>
            <p className="text-gray-500 text-base mb-6">
              掲載情報の訂正・更新、送客に関するご相談など、お気軽にご連絡ください。
            </p>
            <a
              href={CONTACT_EMAIL}
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold text-base px-8 py-3 rounded-xl shadow-sm transition-colors"
            >
              メールでお問い合わせ
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
