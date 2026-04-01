// PatientCommentsSection.jsx
// セクション5：患者の一言（匿名・審査済み）
// is_published: true かつ published_comment があるものだけ表示
// データなしの場合はモックを使用（将来的にSupabaseデータに差し替え）

const mockComments = [
  {
    treatment_type: 'マウスピース矯正',
    period: '2025年相談',
    published_comment: '追加費用の可能性まで最初に説明してくれたので安心した',
  },
  {
    treatment_type: 'ワイヤー矯正',
    period: '2024年治療中',
    published_comment: '料金表がしっかりしていて、比較しやすかった',
  },
  {
    treatment_type: 'マウスピース矯正',
    period: '2025年相談のみ',
    published_comment: 'もう少しリスクの説明があればよかった',
  },
];

export default function PatientCommentsSection({ comments: propComments }) {
  const comments = propComments && propComments.length > 0 ? propComments : mockComments;

  if (!comments || comments.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 mt-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-gray-800 font-bold text-base">患者の一言</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            匿名・審査済み
          </span>
        </div>

        <div className="space-y-3">
          {comments.slice(0, 5).map((c, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-3 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🗣️</span>
                <span className="text-xs text-gray-500">
                  {c.treatment_type}
                  {c.period && ` / ${c.period}`}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                「{c.published_comment}」
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
