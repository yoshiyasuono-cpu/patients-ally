// SurveyInlineForm.jsx
// クリニック詳細ページ埋め込みアンケート
// 回答データ → survey_responses テーブル（INSERT）

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

function Question({ label, text, required, optional, children }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-800 mb-2">
        {label && <span className="text-gray-400 text-xs font-normal mr-1.5">{label}</span>}
        {text}
        {required && <span className="text-red-500 ml-1 text-xs">必須</span>}
        {optional && <span className="text-gray-400 ml-1 text-xs">任意</span>}
      </p>
      {children}
    </div>
  );
}

// セクション区切り
function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{title}</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

export default function SurveyInlineForm({ clinicId, clinicSlug, clinicName }) {
  const [clinicNameInput, setClinicNameInput] = useState(clinicName || '');
  const [form, setForm] = useState({
    visitYear: '', treatmentType: '', quotedDuration: '',
    q1: '',
    quotedAmount: '',
    q2: '', q5: '', q6: '', q7: '',
    actualAmount: '', q3: '', q4: '',
    painLevel: '', resultSatisfaction: '', actualDuration: '',
    q8: '',
    verified: '', comment: '', consentPublish: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function set(key) {
    return (val) => setForm((f) => ({ ...f, [key]: val }));
  }

  // 条件分岐用
  const status = form.q1;
  const showSection3 = status === '治療中' || status === '治療完了';
  const showPain = status === '治療中' || status === '治療完了';
  const showResult = status === '治療完了';
  const showConsent = form.comment.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // バリデーション（常に必須）
    const alwaysRequired = ['visitYear', 'treatmentType', 'q1', 'q2', 'q5', 'q6', 'q7', 'q8', 'verified'];
    // セクション3表示時のみ必須
    const conditionalRequired = showSection3 ? ['q3', 'q4'] : [];
    const required = [...alwaysRequired, ...conditionalRequired];

    if (!clinicName && !clinicNameInput.trim()) {
      setError('医院名を入力してください');
      return;
    }
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
          clinic_name_snapshot: clinicNameInput || clinicName,
          source_channel: 'cliniccompass_inline',
          // 基本情報
          visit_year: form.visitYear,
          treatment_type: form.treatmentType,
          quoted_duration_range: form.quotedDuration || null,
          has_visited: form.q1,
          // 費用の透明性
          quoted_amount_range: form.quotedAmount || null,
          fee_presented: form.q2,
          risk_explanation: form.q5,
          document_provided: form.q6,
          pressure: form.q7,
          // 実費用データ（非表示時はnull）
          actual_amount_range: showSection3 ? (form.actualAmount || null) : null,
          extra_cost: showSection3 ? form.q3 : null,
          extra_cost_explanation: showSection3 ? form.q4 : null,
          // 治療体験（非表示時はnull）
          pain_level: showPain ? (form.painLevel || null) : null,
          result_satisfaction: showResult ? (form.resultSatisfaction || null) : null,
          actual_duration_range: showResult ? (form.actualDuration || null) : null,
          // 総合
          satisfaction: SATISFACTION_MAP[form.q8] ?? null,
          raw_comment: form.comment || null,
          consent_to_publish_comment: showConsent && form.consentPublish === 'yes',
          is_valid: true,
          is_published: false,
          moderation_status: 'pending',
        })
        .select('id')
        .single();

      if (dbError) throw dbError;
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
        <div style={{ background: '#F0FFF4', border: '1px solid #A3E4B7', borderRadius: '12px', padding: '28px 24px', textAlign: 'center' }}>
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-gray-800 font-bold text-base mb-2">ご回答ありがとうございました。</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            いただいた内容は審査後、このクリニックの<br />透明性データに反映されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-4" id="survey-form">
      <div style={{ background: '#F8F9FA', border: '1px solid #E8E8E8', borderRadius: '12px', padding: '24px' }}>
        {/* ヘッダー */}
        <div className="mb-5">
          <h2 className="text-gray-800 font-bold text-base mb-1">あなたの経験を教えてください</h2>
          <p className="text-gray-500 text-xs leading-relaxed">この医院の透明性向上に、あなたの声が役立ちます。</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">所要時間：約3分</span>
            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">完全匿名</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 医院名 */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-1">医院名</p>
            {clinicName ? (
              <div className="bg-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-500 border border-gray-200">{clinicName}</div>
            ) : (
              <input
                type="text"
                value={clinicNameInput}
                onChange={(e) => setClinicNameInput(e.target.value)}
                placeholder="例：〇〇矯正歯科"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-teal-400"
              />
            )}
          </div>

          {/* ===== セクション1：基本情報 ===== */}
          <SectionDivider title="基本情報" />

          <Question text="この医院を受診（相談）した時期はいつですか？" required>
            <RadioGroup name="visitYear" value={form.visitYear} onChange={set('visitYear')} required options={[
              { value: '2023年以前', label: '2023年以前' },
              { value: '2024年', label: '2024年' },
              { value: '2025年', label: '2025年' },
              { value: '2026年', label: '2026年' },
            ]} />
          </Question>

          <Question text="どの治療タイプですか？" required>
            <RadioGroup name="treatmentType" value={form.treatmentType} onChange={set('treatmentType')} required options={[
              { value: 'ワイヤー矯正', label: 'ワイヤー矯正' },
              { value: 'マウスピース矯正', label: 'マウスピース矯正' },
              { value: '部分矯正', label: '部分矯正' },
              { value: 'その他', label: 'その他' },
            ]} />
          </Question>

          <Question text="初回カウンセリングで説明された治療期間はどのくらいでしたか？" optional>
            <RadioGroup name="quotedDuration" value={form.quotedDuration} onChange={set('quotedDuration')} options={[
              { value: '6ヶ月未満', label: '6ヶ月未満' },
              { value: '6ヶ月〜1年', label: '6ヶ月〜1年' },
              { value: '1〜2年', label: '1〜2年' },
              { value: '2〜3年', label: '2〜3年' },
              { value: '3年以上', label: '3年以上' },
              { value: '説明がなかった', label: '説明がなかった' },
            ]} />
          </Question>

          <Question text="この医院で相談・通院したことがありますか？" required>
            <RadioGroup name="q1" value={form.q1} onChange={set('q1')} required options={[
              { value: '相談のみ', label: '相談のみ' },
              { value: '治療中', label: '治療中' },
              { value: '治療完了', label: '治療完了' },
              { value: 'まだこれから', label: 'まだこれから' },
            ]} />
          </Question>

          {/* ===== セクション2：費用の透明性 ===== */}
          <SectionDivider title="費用の透明性について" />

          <Question text="初回カウンセリングで説明された治療総額はどのくらいでしたか？" optional>
            <RadioGroup name="quotedAmount" value={form.quotedAmount} onChange={set('quotedAmount')} options={[
              { value: '50万円未満', label: '50万円未満' },
              { value: '50〜70万円', label: '50〜70万円' },
              { value: '70〜100万円', label: '70〜100万円' },
              { value: '100万円以上', label: '100万円以上' },
              { value: '説明がなかった', label: '説明がなかった' },
            ]} />
          </Question>

          <Question text="初回時に総額見積は提示されましたか？" required>
            <RadioGroup name="q2" value={form.q2} onChange={set('q2')} required options={[
              { value: '明確に提示された', label: '明確に提示された' },
              { value: 'おおよその説明があった', label: 'おおよその説明があった' },
              { value: '提示されなかった', label: '提示されなかった' },
              { value: '覚えていない', label: '覚えていない' },
            ]} />
          </Question>

          <Question text="リスクや注意点の説明はありましたか？" required>
            <RadioGroup name="q5" value={form.q5} onChange={set('q5')} required options={[
              { value: '十分にあった', label: '十分にあった' },
              { value: '少しあった', label: '少しあった' },
              { value: 'なかった', label: 'なかった' },
              { value: '覚えていない', label: '覚えていない' },
            ]} />
          </Question>

          <Question text="書面や資料はもらえましたか？" required>
            <RadioGroup name="q6" value={form.q6} onChange={set('q6')} required options={[
              { value: 'もらえた', label: 'もらえた' },
              { value: 'もらえなかった', label: 'もらえなかった' },
              { value: '覚えていない', label: '覚えていない' },
            ]} />
          </Question>

          <Question text="契約を急がされたと感じましたか？" required>
            <RadioGroup name="q7" value={form.q7} onChange={set('q7')} required options={[
              { value: '強く感じた', label: '強く感じた' },
              { value: '少し感じた', label: '少し感じた' },
              { value: '感じなかった', label: '感じなかった' },
              { value: '覚えていない', label: '覚えていない' },
            ]} />
          </Question>

          {/* ===== セクション3：実費用データ（条件付き） ===== */}
          {showSection3 && (
            <>
              <SectionDivider title="実際の費用について" />

              <Question text="実際に支払った（支払っている）総額はどのくらいですか？" optional>
                <RadioGroup name="actualAmount" value={form.actualAmount} onChange={set('actualAmount')} options={[
                  { value: '50万円未満', label: '50万円未満' },
                  { value: '50〜70万円', label: '50〜70万円' },
                  { value: '70〜100万円', label: '70〜100万円' },
                  { value: '100万円以上', label: '100万円以上' },
                ]} />
              </Question>

              <Question text="想定外の追加費用はありましたか？" required>
                <RadioGroup name="q3" value={form.q3} onChange={set('q3')} required options={[
                  { value: 'はい', label: 'はい' },
                  { value: 'いいえ', label: 'いいえ' },
                  { value: 'まだわからない', label: 'まだわからない' },
                ]} />
              </Question>

              <Question text="追加費用の説明は事前にありましたか？" required>
                <RadioGroup name="q4" value={form.q4} onChange={set('q4')} required options={[
                  { value: '明確にあった', label: '明確にあった' },
                  { value: '少しあった', label: '少しあった' },
                  { value: 'なかった', label: 'なかった' },
                  { value: '覚えていない', label: '覚えていない' },
                ]} />
              </Question>
            </>
          )}

          {/* ===== セクション4：治療体験（条件付き） ===== */}
          {(showPain || showResult) && (
            <>
              <SectionDivider title="治療の体験について" />

              {showPain && (
                <Question text="治療中の痛みはどの程度でしたか？" optional>
                  <RadioGroup name="painLevel" value={form.painLevel} onChange={set('painLevel')} options={[
                    { value: 'ほとんどなかった', label: 'ほとんどなかった' },
                    { value: '少しあった', label: '少しあった' },
                    { value: 'それなりにあった', label: 'それなりにあった' },
                    { value: 'かなりあった', label: 'かなりあった' },
                  ]} />
                </Question>
              )}

              {showResult && (
                <>
                  <Question text="最終的な仕上がりに満足していますか？" optional>
                    <RadioGroup name="resultSatisfaction" value={form.resultSatisfaction} onChange={set('resultSatisfaction')} options={[
                      { value: 'とても満足', label: 'とても満足' },
                      { value: 'まあ満足', label: 'まあ満足' },
                      { value: 'どちらでもない', label: 'どちらでもない' },
                      { value: 'あまり満足していない', label: 'あまり満足していない' },
                      { value: '満足していない', label: '満足していない' },
                    ]} />
                  </Question>

                  <Question text="実際の治療期間はどのくらいでしたか？" optional>
                    <RadioGroup name="actualDuration" value={form.actualDuration} onChange={set('actualDuration')} options={[
                      { value: '6ヶ月未満', label: '6ヶ月未満' },
                      { value: '6ヶ月〜1年', label: '6ヶ月〜1年' },
                      { value: '1〜2年', label: '1〜2年' },
                      { value: '2〜3年', label: '2〜3年' },
                      { value: '3年以上', label: '3年以上' },
                    ]} />
                  </Question>
                </>
              )}
            </>
          )}

          {/* ===== セクション5：総合・確認 ===== */}
          <SectionDivider title="総合評価" />

          <Question text="全体として費用や説明に納得感はありましたか？" required>
            <RadioGroup name="q8" value={form.q8} onChange={set('q8')} required options={[
              { value: 'very_satisfied', label: 'とてもある' },
              { value: 'satisfied', label: 'ある' },
              { value: 'neutral', label: 'どちらでもない' },
              { value: 'dissatisfied', label: 'あまりない' },
              { value: 'very_dissatisfied', label: 'まったくない' },
            ]} />
          </Question>

          {/* 実体験確認 */}
          <div style={{ background: 'white', border: '2px solid #E8E8E8', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              【確認】この回答は実体験に基づいています
              <span className="text-red-500 ml-1 text-xs">必須</span>
            </p>
            <RadioGroup name="verified" value={form.verified} onChange={set('verified')} required options={[
              { value: 'yes', label: 'はい、実体験に基づいています' },
              { value: 'no', label: 'いいえ（回答を終了してください）' },
            ]} />
          </div>

          {/* 一言コメント */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              この医院で感じたことを一言
              <span className="text-gray-400 text-xs font-normal ml-2">任意・80文字以内</span>
            </p>
            <p className="text-xs text-gray-400 mb-2">「もっと早く知りたかったこと」「良かったこと」など</p>
            <textarea
              value={form.comment}
              onChange={(e) => set('comment')(e.target.value)}
              maxLength={80}
              rows={3}
              placeholder="例：最初から費用の全体像を教えてくれたので安心だった"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-teal-400"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{form.comment.length}/80文字</p>
          </div>

          {/* コメント掲載同意（コメント入力時のみ表示） */}
          {showConsent && (
            <Question text="上記コメントを匿名でクリニック詳細ページに掲載してもよいですか？" optional>
              <RadioGroup name="consentPublish" value={form.consentPublish} onChange={set('consentPublish')} options={[
                { value: 'yes', label: 'はい、掲載OK' },
                { value: 'no', label: 'いいえ、集計のみに使用' },
              ]} />
            </Question>
          )}

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
              color: 'white', width: '100%', height: '56px', borderRadius: '8px',
              fontSize: '16px', fontWeight: 'bold', border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {submitting ? '送信中...' : '回答を送信する'}
          </button>

          {/* 注記 */}
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400 text-center">※ 回答は匿名で集計されます</p>
            <p className="text-xs text-gray-400 text-center">※ 医院名は透明性スコアの算出にのみ使用します</p>
          </div>
        </form>
      </div>
    </div>
  );
}
