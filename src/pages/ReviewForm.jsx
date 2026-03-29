import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

const TREATMENT_TYPES = ['ワイヤー矯正', 'マウスピース矯正', '裏側矯正', '部分矯正', 'その他'];

// 1〜5段階の選択ボタン
function RatingSelect({ value, onChange, lowLabel, highLabel }) {
  return (
    <div>
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
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-gray-400 text-[10px]">{lowLabel}</span>
        <span className="text-gray-400 text-[10px]">{highLabel}</span>
      </div>
    </div>
  );
}

export default function ReviewForm() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic');
  const [clinicName, setClinicName] = useState('');
  const [form, setForm] = useState({
    nickname: '',
    treatment_type: '',
    estimate_amount: '',
    actual_amount: '',
    extra_cost_occurred: null,
    extra_cost_detail: '',
    explanation_clarity: 0,
    price_transparency: 0,
    pushed_to_sign: 0,
    risk_explained: null,
    comment_good: '',
    comment_bad: '',
    requested_by_clinic: null,
    received_incentive: null,
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // クリニック名を取得
  useEffect(() => {
    if (clinicId) {
      supabase.from('clinics').select('name').eq('id', clinicId).single()
        .then(({ data }) => { if (data) setClinicName(data.name); });
    }
  }, [clinicId]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!clinicId) return setError('クリニックが指定されていません');
    if (!form.nickname.trim()) return setError('ニックネームを入力してください');
    if (!form.treatment_type) return setError('治療種別を選択してください');
    if (!form.explanation_clarity) return setError('説明のわかりやすさを選択してください');
    if (!form.price_transparency) return setError('価格の透明性を選択してください');
    if (!form.pushed_to_sign) return setError('契約を急かされたかを選択してください');
    if (form.requested_by_clinic === null) return setError('投稿依頼の有無を選択してください');
    if (form.received_incentive === null) return setError('特典の有無を選択してください');
    if (!agreed) return setError('投稿ガイドラインに同意してください');

    setSubmitting(true);

    const payload = {
      clinic_id: clinicId,
      nickname: form.nickname.trim(),
      treatment_type: form.treatment_type,
      estimate_amount: form.estimate_amount ? Number(form.estimate_amount) : null,
      actual_amount: form.actual_amount ? Number(form.actual_amount) : null,
      extra_cost_occurred: form.extra_cost_occurred,
      extra_cost_detail: form.extra_cost_detail.trim() || null,
      explanation_clarity: form.explanation_clarity,
      price_transparency: form.price_transparency,
      pushed_to_sign: form.pushed_to_sign,
      risk_explained: form.risk_explained,
      comment_good: form.comment_good.trim() || null,
      comment_bad: form.comment_bad.trim() || null,
      requested_by_clinic: form.requested_by_clinic,
      received_incentive: form.received_incentive,
      status: 'pending',
    };

    const { error: dbError } = await supabase.from('reviews').insert(payload);

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
        <Header showBack backTo={clinicId ? `/clinic/${clinicId}` : '/'} />
        <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ご投稿ありがとうございました</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              投稿内容は運営チームが確認後に公開されます。確認には数日かかる場合があります。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header showBack backTo={clinicId ? `/clinic/${clinicId}` : '/'} />

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">口コミを投稿する</h1>
        {clinicName && (
          <p className="text-teal-700 font-semibold text-sm mb-1">{clinicName}</p>
        )}
        <p className="text-gray-500 text-sm mb-6">
          投稿は運営チームが確認後に公開されます。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ニックネーム */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              ニックネーム <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => update('nickname', e.target.value)}
              placeholder="例：矯正中の30代"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* 治療種別 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              治療種別 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {TREATMENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('treatment_type', t)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    form.treatment_type === t
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 見積金額 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">見積金額（円）</label>
            <input
              type="number"
              value={form.estimate_amount}
              onChange={(e) => update('estimate_amount', e.target.value)}
              placeholder="例：900000"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* 実際の支払額 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">実際の支払額（円）</label>
            <input
              type="number"
              value={form.actual_amount}
              onChange={(e) => update('actual_amount', e.target.value)}
              placeholder="例：1050000"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {/* 追加費用 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">追加費用は発生しましたか？</label>
            <div className="flex gap-2">
              {[{ label: 'あり', val: true }, { label: 'なし', val: false }].map(({ label, val }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update('extra_cost_occurred', val)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.extra_cost_occurred === val
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.extra_cost_occurred && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">追加費用の内容</label>
              <input
                type="text"
                value={form.extra_cost_detail}
                onChange={(e) => update('extra_cost_detail', e.target.value)}
                placeholder="例：調整費が毎回5,000円かかった"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          )}

          {/* 説明のわかりやすさ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              説明のわかりやすさ <span className="text-red-500">*</span>
            </label>
            <RatingSelect
              value={form.explanation_clarity}
              onChange={(v) => update('explanation_clarity', v)}
              lowLabel="わかりにくい"
              highLabel="とてもわかりやすい"
            />
          </div>

          {/* 価格の透明性 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              価格の透明性 <span className="text-red-500">*</span>
            </label>
            <RatingSelect
              value={form.price_transparency}
              onChange={(v) => update('price_transparency', v)}
              lowLabel="不透明だった"
              highLabel="とても明確だった"
            />
          </div>

          {/* 契約を急かされたか */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              契約を急かされたか <span className="text-red-500">*</span>
            </label>
            <RatingSelect
              value={form.pushed_to_sign}
              onChange={(v) => update('pushed_to_sign', v)}
              lowLabel="全くなかった"
              highLabel="強く感じた"
            />
          </div>

          {/* リスク説明 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">リスク説明はありましたか？</label>
            <div className="flex gap-2">
              {[{ label: 'あった', val: true }, { label: 'なかった', val: false }].map(({ label, val }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update('risk_explained', val)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.risk_explained === val
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 良かった点 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">良かった点</label>
            <textarea
              value={form.comment_good}
              onChange={(e) => update('comment_good', e.target.value)}
              placeholder="良かった点を教えてください"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* 気になった点 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">気になった点</label>
            <textarea
              value={form.comment_bad}
              onChange={(e) => update('comment_bad', e.target.value)}
              placeholder="気になった点・改善してほしい点を教えてください"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* === 利害関係チェック === */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4">利害関係の確認</h3>

            {/* クリニックからの依頼 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                クリニックから投稿を依頼されましたか？ <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[{ label: 'はい', val: true }, { label: 'いいえ', val: false }].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update('requested_by_clinic', val)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      form.requested_by_clinic === val
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 特典の有無 */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                投稿の対価として特典・割引・金銭を受けましたか？ <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[{ label: 'はい', val: true }, { label: 'いいえ', val: false }].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => update('received_incentive', val)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      form.received_incentive === val
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ガイドライン同意 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-700 border-gray-300 rounded focus:ring-teal-500"
              />
              <div className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold">投稿ガイドラインに同意します</span>
                <span className="text-red-500 ml-1">*</span>
                <ul className="mt-2 space-y-1 text-gray-500">
                  <li>- 実際に受診・相談した体験に基づく投稿であること</li>
                  <li>- 虚偽の内容、誹謗中傷、個人を特定できる情報を含まないこと</li>
                  <li>- 運営チームの審査後に公開されること</li>
                  <li>- 掲載基準に満たない場合は非公開となること</li>
                </ul>
              </div>
            </label>
          </div>

          {/* エラー */}
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
            {submitting ? '送信中...' : '口コミを投稿する'}
          </button>

          <p className="text-gray-400 text-[10px] text-center leading-relaxed">
            投稿は運営チームが確認後に公開されます。投稿内容の改ざん・削除依頼には応じません。
          </p>
        </form>
      </div>
    </div>
  );
}
