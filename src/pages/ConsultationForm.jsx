import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clinics } from '../data/clinics';
import Header from '../components/Header';

const TREATMENTS = [
  'ワイヤー矯正（全顎）',
  'マウスピース矯正（インビザライン等）',
  'セラミック矯正',
  '部分矯正',
  '小児矯正',
  'ホワイトニング',
  'ラミネートベニア',
  'まだ決まっていない・相談したい',
];

const BUDGETS = [
  '30万円未満',
  '30〜60万円',
  '60〜80万円',
  '80〜100万円',
  '100万円以上',
  '費用より結果を重視',
];

const CONTACT_METHODS = [
  { value: 'line', label: 'LINE', icon: '💬' },
  { value: 'email', label: 'メール', icon: '✉️' },
  { value: 'phone', label: '電話', icon: '📞' },
];

export default function ConsultationForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const clinicId = params.get('clinic');
  const selectedClinic = clinics.find((c) => c.id === Number(clinicId));

  const [form, setForm] = useState({
    name: '',
    treatments: [],
    budget: '',
    concern: '',
    contactMethod: '',
    contact: '',
    timing: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function toggleTreatment(t) {
    setForm((f) => ({
      ...f,
      treatments: f.treatments.includes(t)
        ? f.treatments.filter((x) => x !== t)
        : [...f.treatments, t],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <CompletePage name={form.name} contactMethod={form.contactMethod} clinicName={selectedClinic?.name} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header showBack backTo={selectedClinic ? `/clinic/${selectedClinic.id}` : '/'} title="無料相談フォーム" />

      <div className="max-w-[430px] mx-auto">
        {/* Info banner */}
        <div className="bg-teal-700 px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-bold text-sm">完全無料・強引な勧誘は一切ありません</span>
          </div>
          <p className="text-teal-200 text-xs leading-relaxed">
            「ClinicCompass」は第三者の立場でご相談を受け付けています。クリニックへの紹介料はクリニック側からのみいただくため、患者さまへの費用は0円です。
          </p>
        </div>

        {selectedClinic && (
          <div className="mx-4 mt-4 p-3 bg-white rounded-xl border border-teal-200 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">医院</span>
            </div>
            <div>
              <div className="text-[10px] text-teal-600 font-semibold">相談先クリニック</div>
              <div className="text-gray-800 font-bold text-sm">{selectedClinic.name}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              お名前 <span className="text-red-500 text-xs">必須</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例：山田 花子"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white"
            />
          </div>

          {/* Treatments */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-1">
              気になる治療 <span className="text-red-500 text-xs">必須（複数可）</span>
            </label>
            <p className="text-gray-400 text-[10px] mb-2">まだ決まっていなくてもOKです</p>
            <div className="grid grid-cols-2 gap-2">
              {TREATMENTS.map((t) => {
                const checked = form.treatments.includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleTreatment(t)}
                    className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all leading-snug ${
                      checked
                        ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                    } ${t === 'まだ決まっていない・相談したい' ? 'col-span-2' : ''}`}
                  >
                    {checked && '✓ '}{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              予算感 <span className="text-red-500 text-xs">必須</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGETS.map((b) => {
                const selected = form.budget === b;
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setForm((f) => ({ ...f, budget: b }))}
                    className={`text-xs px-3 py-2.5 rounded-xl border transition-all ${
                      selected
                        ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    {selected && '✓ '}{b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concern */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              今一番困っていること・ご要望
            </label>
            <textarea
              value={form.concern}
              onChange={(e) => setForm((f) => ({ ...f, concern: e.target.value }))}
              rows={4}
              placeholder="例：前歯のすきっ歯が気になっています。仕事柄目立たない方法を希望しています。費用はできれば抑えたいです。"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white resize-none"
            />
          </div>

          {/* Timing */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              治療開始希望時期
            </label>
            <select
              value={form.timing}
              onChange={(e) => setForm((f) => ({ ...f, timing: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-teal-500 bg-white"
            >
              <option value="">選択してください</option>
              <option>できるだけ早く（1ヶ月以内）</option>
              <option>3ヶ月以内</option>
              <option>半年以内</option>
              <option>まだ検討段階</option>
            </select>
          </div>

          {/* Contact method */}
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              希望連絡方法 <span className="text-red-500 text-xs">必須</span>
            </label>
            <div className="flex gap-2">
              {CONTACT_METHODS.map((m) => {
                const selected = form.contactMethod === m.value;
                return (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setForm((f) => ({ ...f, contactMethod: m.value }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact info */}
          {form.contactMethod && (
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-2">
                {form.contactMethod === 'line' && 'LINE ID'}
                {form.contactMethod === 'email' && 'メールアドレス'}
                {form.contactMethod === 'phone' && '電話番号'}
                <span className="text-red-500 text-xs ml-1">必須</span>
              </label>
              <input
                type={form.contactMethod === 'email' ? 'email' : 'text'}
                required
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder={
                  form.contactMethod === 'line' ? '@your_line_id' :
                  form.contactMethod === 'email' ? 'example@email.com' :
                  '090-0000-0000'
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white"
              />
            </div>
          )}

          {/* Privacy note */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-[10px] leading-relaxed">
              ご入力いただいた情報は、相談対応および適切なクリニックへの紹介のみに使用し、第三者（クリニックを除く）に提供しません。プライバシーポリシーに基づき適切に管理します。
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!form.name || form.treatments.length === 0 || !form.budget || !form.contactMethod || !form.contact}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-base shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            相談内容を送信する
          </button>
          <div className="text-center text-gray-400 text-xs pb-4">
            送信後、48時間以内に担当者からご連絡します
          </div>
        </form>
      </div>
    </div>
  );
}

function CompletePage({ name, contactMethod, clinicName }) {
  const navigate = useNavigate();
  const contactLabel = contactMethod === 'line' ? 'LINE' : contactMethod === 'email' ? 'メール' : 'お電話';
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack={false} />
      <div className="max-w-[430px] mx-auto px-4 pt-12 text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-gray-800 font-bold text-xl mb-2">
          ご相談を受け付けました！
        </h1>
        {name && <p className="text-gray-600 text-sm mb-1">{name} さん</p>}
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          ありがとうございます。<br />
          専門スタッフが内容を確認し、<br />
          <strong className="text-teal-700">48時間以内に{contactLabel}でご連絡</strong>します。
        </p>
        {clinicName && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-left">
            <div className="text-teal-600 text-xs font-bold mb-1">相談先クリニック</div>
            <div className="text-teal-800 font-semibold text-sm">{clinicName}</div>
          </div>
        )}
        <div className="space-y-3 text-left mb-8">
          {[
            { icon: '🔍', text: '相談内容をもとに最適な治療プランを専門家が検討します' },
            { icon: '💬', text: 'ご連絡の際に追加で気になる点をご質問いただけます' },
            { icon: '🏥', text: 'ご希望に合わせてクリニックへのご紹介を行います' },
            { icon: '✅', text: '勧誘は一切行いません。納得いくまでご検討ください' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full border border-teal-600 text-teal-700 py-3.5 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"
        >
          クリニック一覧に戻る
        </button>
      </div>
    </div>
  );
}
