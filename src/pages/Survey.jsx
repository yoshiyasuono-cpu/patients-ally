import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

const STATUS_OPTIONS = ['相談のみ', '契約した', '治療中', '治療完了'];
const EXTRA_COST_OPTIONS = ['あり', 'なし', '不明'];
const RISK_OPTIONS = ['十分', '一部', 'なし'];

// 1〜5段階の選択ボタン
function RatingSelect({ value, onChange, labels }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
            value === n
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {n}
        </button>
      ))}
      {labels && (
        <div className="flex items-center ml-2 text-gray-400 text-[10px]">
          {value === 1 && labels[0]}
          {value === 5 && labels[1]}
        </div>
      )}
    </div>
  );
}

export default function Survey() {
  const [form, setForm] = useState({
    clinic_name: '',
    status: '',
    estimate_amount: '',
    actual_amount: '',
    extra_cost: '',
    extra_cost_detail: '',
    risk_explanation: '',
    pushed_to_sign: 0,
    explanation_clarity: 0,
    overall_satisfaction: 0,
    free_comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!form.clinic_name.trim()) return setError('クリニック名を入力してください');
    if (!form.status) return setError('ステータスを選択してください');
    if (!form.pushed_to_sign) return setError('「契約を急かされたか」を選択してください');
    if (!form.explanation_clarity) return setError('「説明のわかりやすさ」を選択してください');
    if (!form.overall_satisfaction) return setError('「総合満足度」を選択してください');

    setSubmitting(true);

    const payload = {
      clinic_name: form.clinic_name.trim(),
      status: form.status,
      estimate_amount: form.estimate_amount ? Number(form.estimate_amount) : null,
      actual_amount: form.actual_amount ? Number(form.actual_amount) : null,
      extra_cost: form.extra_cost || null,
      extra_cost_detail: form.extra_cost_detail.trim() || null,
      risk_explanation: form.risk_explanation || null,
      pushed_to_sign: form.pushed_to_sign,
      explanation_clarity: form.explanation_clarity,
      overall_satisfaction: form.overall_satisfaction,
      free_comment: form.free_comment.trim() || null,
    };

    const { error: dbError } = await supabase.from('surveys').insert(payload);

    if (dbError) {
      setError('送信に失敗しました: ' + dbError.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  // 送信完了画面
  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack backTo="/" />
        <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ご協力ありがとうございました</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              いただいた情報は、矯正歯科の透明性向上に活用させていただきます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header showBack backTo="/" />

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">矯正治療アンケート</h1>
        <p className="text-gray-500 text-sm mb-6">
          あなたの体験が、これから矯正を検討する方の参考になります。回答は非公開です。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* クリニック名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              クリニック名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.clinic_name}
              onChange={(e) => update('clinic_name', e.target.value)}
              placeholder="例：〇〇矯正歯科"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              現在のステータス <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update('status', opt)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.status === opt
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 初回説明された総額 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">初回説明された総額（円）</label>
            <input
              type="number"
              value={form.estimate_amount}
              onChange={(e) => update('estimate_amount', e.target.value)}
              placeholder="例：900000"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* 実際の支払総額 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">実際の支払総額（円）</label>
            <input
              type="number"
              value={form.actual_amount}
              onChange={(e) => update('actual_amount', e.target.value)}
              placeholder="例：1050000"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* 追加費用の発生 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">追加費用の発生</label>
            <div className="flex gap-2">
              {EXTRA_COST_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update('extra_cost', opt)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.extra_cost === opt
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 追加費用の内容 */}
          {form.extra_cost === 'あり' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">追加費用の内容</label>
              <input
                type="text"
                value={form.extra_cost_detail}
                onChange={(e) => update('extra_cost_detail', e.target.value)}
                placeholder="例：調整費が別途かかった"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          )}

          {/* リスク説明があったか */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">リスク説明があったか</label>
            <div className="flex gap-2">
              {RISK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update('risk_explanation', opt)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.risk_explanation === opt
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 契約を急かされたか */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              契約を急かされたか <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-400 text-xs mb-2">1＝全くなかった　5＝強く感じた</p>
            <RatingSelect value={form.pushed_to_sign} onChange={(v) => update('pushed_to_sign', v)} />
          </div>

          {/* 説明のわかりやすさ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              説明のわかりやすさ <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-400 text-xs mb-2">1＝わかりにくい　5＝とてもわかりやすい</p>
            <RatingSelect value={form.explanation_clarity} onChange={(v) => update('explanation_clarity', v)} />
          </div>

          {/* 総合満足度 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              総合満足度 <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-400 text-xs mb-2">1＝不満　5＝とても満足</p>
            <RatingSelect value={form.overall_satisfaction} onChange={(v) => update('overall_satisfaction', v)} />
          </div>

          {/* 自由記述 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">自由記述（任意）</label>
            <textarea
              value={form.free_comment}
              onChange={(e) => update('free_comment', e.target.value)}
              placeholder="良かった点、気になった点など自由にお書きください"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50"
          >
            {submitting ? '送信中...' : '回答を送信する'}
          </button>

          <p className="text-gray-400 text-[10px] text-center leading-relaxed">
            回答は非公開で管理され、統計データとして活用されます。個人を特定する情報は収集しません。
          </p>
        </form>
      </div>
    </div>
  );
}
