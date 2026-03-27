import Header from '../components/Header';

export default function Policy() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header showBack backTo="/" title="投稿情報掲載基準" />

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">投稿情報掲載基準</h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          患者の味方では、患者さんが正確な情報をもとに意思決定できるよう、
          掲載する投稿情報の基準を定めています。
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-4xl mb-4">🛠️</p>
          <p className="text-gray-500 text-base">
            詳細なガイドラインは準備中です。<br />
            ご不明な点は <a href="mailto:info@kanja-mikata.com" className="text-teal-600 underline">info@kanja-mikata.com</a> までお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
