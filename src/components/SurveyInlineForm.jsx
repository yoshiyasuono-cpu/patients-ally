// SurveyInlineForm.jsx
// セクション6：あなたの経験を教えてください（インラインフォーム）
// 回答データ → survey_responses テーブル（INSERT）
// 謝礼情報  → reward_claims テーブル（別途分離）

import { useState } from 'react';
import { supabase } from '../lib/supabase';

const SATISFACTION_MAP = {
  very_satisfied:   5,
  satisfied:        4,
  neutral:          3,
  dissatisfied:     2,
  very_dissatisfied: 1,
};

function RadioGroup({ name, options, value, onChange, required }) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-100 bg-white px-3"
          style={{ minHeight: '44px' }}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            required={required}
            className="accent-green-600 w-4 h-4 flex-shrink-0"
          />
          <span className="text-sm text-gray-700 py-2">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function Question({ number, text, required, children }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-800 mb-2">
        Q{number}. {text}
        {required && <span className="text-red-500 ml-1 text-xs">必須</span>}
      </p>
      {children}
    </div>
  );
}

export default function SurveyInlineForm({ clinicId, clinicSlug, clinicName }) {
  const [form, setForm] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    verified: '', comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseId, setResponseId] = useState(null);
  const [error, setError] = useState('');

  function set(key) {
    return (val) => setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // バリデーション
    const required = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'verified'];
    if (required.some((k) => !form[k])) {
      setError('必須項目をすべて選択してください');
      return;
    }
    if (form.verified === 'no') {
      setError('実体験に基づく回答のみ受け付けています。ご協力ありがとうございました。');
      return;
    }
    if (form.comment.length > 80) {
      setError('コメントは80文字以内で入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: dbError } = await supabase
        .from('survey_responses')
        .insert({
          clinic_id: clinicId,
          clinic_slug: clinicSlug || clinicId,
          clinic_name_snapshot: clinicName,
          source_channel: 'cliniccompass_inline',
          has_visited: form.q1,
          fee_presented: form.q2,
          extra_cost: form.q3,
          extra_cost_explanation: form.q4,
          risk_explanation: form.q5,
          document_provided: form.q6,
          pressure: form.q7,
          satisfaction: SATISFACTION_MAP[form.q8] ?? null,
          raw_comment: form.comment || null,
          is_valid: true,
          is_published: false,
          moderation_status: 'pending',
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      setResponseId(data?.id ?? null);
      setSubmitted(true);
    } catch (err) {
      console.error('survey submit error:', err);
      setError('送信に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }

  // 送信完了メッセージ
  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-4" id="survey-form">
        <div
          style={{
            background: '#F0FFF4',
            border: '1px solid #A3E4B7',
            borderRadius: '12px',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-gray-800 font-bold text-base mb-2">
            ありがとうございました
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            あなたの回答は透明性スコアに反映されます。<br />
            審査後、このページに掲載されます。
          </p>
          <a
            href="#"
            style={{
              display: 'inline-block',
              background: '#27AE60',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            QUOカードPay 500円を受け取る →
          </a>
          <p className="text-xs text-gray-400 mt-2">先着100名様限定</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-4" id="survey-form">
      <div
        style={{
          background: '#F8F9FA',
          border: '1px solid #E8E8E8',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        {/* ヘッダー */}
        <div className="mb-5">
          <h2 className="text-gray-800 font-bold text-base mb-1">
            あなたの経験を教えてください
          </h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            この医院の透明性向上に、あなたの声が役立ちます。
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
              所要時間：約2分
            </span>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
              完全匿名
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 医院名（変更不可） */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-1">医院名</p>
            <div className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-500 border border-gray-200">
              {clinicName}
            </div>
          </div>

          <hr className="border-gray-200 mb-5" />

          {/* Q1 */}
          <Question number={1} text="この医院で相談・通院したことがありますか" required>
            <RadioGroup
              name="q1"
              value={form.q1}
              onChange={set('q1')}
              required
              options={[
                { value: '相談のみ', label: '相談のみ' },
                { value: '治療中',   label: '治療中' },
                { value: '治療完了', label: '治療完了' },
                { value: 'まだこれから', label: 'まだこれから' },
              ]}
            />
          </Question>

          {/* Q2 */}
          <Question number={2} text="初回時に総額見積は提示されましたか" required>
            <RadioGroup
              name="q2"
              value={form.q2}
              onChange={set('q2')}
              required
              options={[
                { value: '明確に提示された',       label: '明確に提示された' },
                { value: 'おおよその説明があった',   label: 'おおよその説明があった' },
                { value: '提示されなかった',         label: '提示されなかった' },
                { value: '覚えていない',             label: '覚えていない' },
              ]}
            />
          </Question>

          {/* Q3 */}
          <Question number={3} text="想定外の追加費用はありましたか" required>
            <RadioGroup
              name="q3"
              value={form.q3}
              onChange={set('q3')}
              required
              options={[
                { value: 'はい',           label: 'はい' },
                { value: 'いいえ',         label: 'いいえ' },
                { value: 'まだわからない', label: 'まだわからない' },
              ]}
            />
          </Question>

          {/* Q4 */}
          <Question number={4} text="追加費用の説明は事前にありましたか" required>
            <RadioGroup
              name="q4"
              value={form.q4}
              onChange={set('q4')}
              required
              options={[
                { value: '明確にあった',   label: '明確にあった' },
                { value: '少しあった',     label: '少しあった' },
                { value: 'なかった',       label: 'なかった' },
                { value: '覚えていない',   label: '覚えていない' },
              ]}
            />
          </Question>

          {/* Q5 */}
          <Question number={5} text="リスクや注意点の説明はありましたか" required>
            <RadioGroup
              name="q5"
              value={form.q5}
              onChange={set('q5')}
              required
              options={[
                { value: '十分にあった',   label: '十分にあった' },
                { value: '少しあった',     label: '少しあった' },
                { value: 'なかった',       label: 'なかった' },
                { value: '覚えていない',   label: '覚えていない' },
              ]}
            />
          </Question>

          {/* Q6 */}
          <Question number={6} text="書面や資料はもらえましたか" required>
            <RadioGroup
              name="q6"
              value={form.q6}
              onChange={set('q6')}
              required
              options={[
                { value: 'もらえた',     label: 'もらえた' },
                { value: 'もらえなかった', label: 'もらえなかった' },
                { value: '覚えていない', label: '覚えていない' },
              ]}
            />
          </Question>

          {/* Q7 */}
          <Question number={7} text="契約を急がされたと感じましたか" required>
            <RadioGroup
              name="q7"
              value={form.q7}
              onChange={set('q7')}
              required
              options={[
                { value: '強く感じた',     label: '強く感じた' },
                { value: '少し感じた',     label: '少し感じた' },
                { value: '感じなかった',   label: '感じなかった' },
                { value: '覚えていない',   label: '覚えていない' },
              ]}
            />
          </Question>

          {/* Q8 */}
          <Question number={8} text="全体として費用や説明に納得感はありましたか" required>
            <RadioGroup
              name="q8"
              value={form.q8}
              onChange={set('q8')}
              required
              options={[
                { value: 'very_satisfied',    label: 'とてもある' },
                { value: 'satisfied',         label: 'ある' },
                { value: 'neutral',           label: 'どちらでもない' },
                { value: 'dissatisfied',      label: 'あまりない' },
                { value: 'very_dissatisfied', label: 'まったくない' },
              ]}
            />
          </Question>

          {/* 確認 */}
          <div
            style={{
              background: 'white',
              border: '2px solid #E8E8E8',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <p className="text-sm font-semibold text-gray-800 mb-2">
              【確認】この回答は実体験に基づいています
              <span className="text-red-500 ml-1 text-xs">必須</span>
            </p>
            <RadioGroup
              name="verified"
              value={form.verified}
              onChange={set('verified')}
              required
              options={[
                { value: 'yes', label: 'はい、実体験に基づいています' },
                { value: 'no',  label: 'いいえ（回答を終了してください）' },
              ]}
            />
          </div>

          {/* 自由記述 */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              💬 この医院で感じたことを一言
              <span className="text-gray-400 text-xs font-normal ml-2">任意・80文字以内</span>
            </p>
            <p className="text-xs text-gray-400 mb-2">
              「もっと早く知りたかったこと」「良かったこと」など
            </p>
            <textarea
              value={form.comment}
              onChange={(e) => set('comment')(e.target.value)}
              maxLength={80}
              rows={3}
              placeholder="例：最初から費用の全体像を教えてくれたので安心だった"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-teal-400"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">
              {form.comment.length}/80文字
            </p>
          </div>

          {/* エラー */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#95C9A8' : '#27AE60',
              color: 'white',
              width: '100%',
              height: '56px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {submitting ? '送信中...' : '回答を送信する'}
          </button>

          {/* 注記 */}
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400 text-center">※ 回答は匿名で集計されます</p>
            <p className="text-xs text-gray-400 text-center">※ 医院名は透明性スコアの算出にのみ使用します</p>
            <p className="text-xs text-center" style={{ color: '#27AE60', fontWeight: '600' }}>
              ※ 先着100名にQUOカードPay 500円分をプレゼント
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
