import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';
import TransparencySection from '../components/TransparencySection';
import PatientCommentsSection from '../components/PatientCommentsSection';
import SurveyInlineForm from '../components/SurveyInlineForm';

export default function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [transparencyData, setTransparencyData] = useState(null);
  const [patientComments, setPatientComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('clinics').select('*').eq('id', id).single(),
      supabase.from('reviews').select('*').eq('clinic_id', id).eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('survey_responses').select('*').eq('clinic_id', id).eq('is_valid', true),
    ]).then(([clinicRes, reviewsRes, surveyRes]) => {
      if (!clinicRes.error && clinicRes.data) setClinic(mapFromDb(clinicRes.data));
      if (!reviewsRes.error && reviewsRes.data) setReviews(reviewsRes.data);

      // survey_responsesの集計
      const rows = (!surveyRes.error && surveyRes.data) ? surveyRes.data : [];
      const NAO_CLINIC_ID = '3b667e24-aa24-47bf-bd97-008f5b039627';

      if (id === NAO_CLINIC_ID) {
        // Nao Clinicのみ：面談デモ用にモック表示（TransparencySectionのデフォルトモックを使用）
        setTransparencyData(null);
      } else if (rows.length > 0) {
        const n = rows.length;
        const pct = (arr, matchFn) => Math.round((arr.filter(matchFn).length / n) * 100);

        setTransparencyData({
          count: n,
          fee_presentation_rate: pct(rows, r => r.fee_presented === '明確に提示された'),
          extra_cost_rate: pct(rows, r => r.extra_cost === 'はい'),
          explanation_rate: pct(rows, r => r.extra_cost_explanation === '明確にあった'),
          risk_explanation_rate: pct(rows, r => r.risk_explanation === '十分にあった'),
          document_rate: pct(rows, r => r.document_provided === 'もらえた'),
          pressure_rate: pct(rows, r => r.pressure === '強く感じた' || r.pressure === '少し感じた'),
          satisfaction_score: rows.reduce((sum, r) => sum + (r.satisfaction || 0), 0) / n,
          area_avg: {
            fee_presentation_rate: 71, extra_cost_rate: 42, explanation_rate: 58,
            risk_explanation_rate: 65, document_rate: 70, pressure_rate: 31, satisfaction_score: 3.4,
          },
        });

        // コメントがあるものだけ抽出
        const comments = rows
          .filter(r => r.raw_comment && r.raw_comment.trim())
          .map(r => ({
            treatment_type: r.has_visited || '',
            period: '',
            published_comment: r.raw_comment,
          }));
        setPatientComments(comments);
      } else {
        // それ以外：データなし = 調査中表示
        setTransparencyData({ count: 0 });
      }

      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">
        クリニックが見つかりません
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack backTo="/" title={clinic.name} />

      {/* Hero banner */}
      <div className="max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900" style={{ minHeight: '160px' }}>
        <div className="relative z-10 px-4 py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold leading-tight">{clinic.name}</h1>
              <p className="text-teal-200 text-sm mt-1">{clinic.area}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-white font-bold text-lg">{clinic.priceRange}</div>
              <div className="text-teal-200 text-xs">料金目安</div>
            </div>
          </div>

          {/* 対応治療タグ */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {clinic.treatments.map((t) => (
              <span key={t} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
            {clinic.totalFee && (
              <span className="bg-green-400/20 text-green-200 text-xs px-3 py-1 rounded-full border border-green-300/40">
                トータルフィー制
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">i</span>
            基本情報
          </h2>

          {/* バッジ・タグ */}
          {(() => {
            const badges = [
              { key: 'freeConsultation', label: '無料相談あり' },
              { key: 'weekendHoliday', label: '土日祝診療' },
              { key: 'nightClinic', label: '夜間診療（19時以降）' },
              { key: 'dentalLoan', label: 'デンタルローン対応' },
              { key: 'certifiedDoctor', label: '学会認定医在籍' },
              { key: 'invisalignCertified', label: 'インビザライン認定医在籍' },
              { key: 'totalFeeSystem', label: 'トータルフィー制' },
            ].filter(b => clinic[b.key]);
            return badges.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {badges.map(b => (
                  <span key={b.key} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    <span className="text-teal-500">&#10003;</span> {b.label}
                  </span>
                ))}
              </div>
            );
          })()}

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">住所</span>
              <span>{clinic.address || '情報なし'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">最寄り駅</span>
              <span>{clinic.station || '情報なし'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-20 flex-shrink-0">電話番号</span>
              <span className="text-teal-700 font-semibold">{clinic.tel || '情報なし'}</span>
            </div>
            {clinic.url && (
              <div className="flex gap-3">
                <span className="text-gray-400 w-20 flex-shrink-0">公式サイト</span>
                <a href={clinic.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline break-all">
                  {clinic.url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 対応している治療 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-xs flex items-center justify-center">&#9654;</span>
            対応している治療
          </h2>
          <div className="space-y-2">
            {[
              { label: 'ワイヤー矯正', ok: clinic.wireAvailable },
              { label: 'マウスピース矯正', ok: clinic.invisalignAvailable },
              { label: '裏側（舌側）矯正', ok: clinic.lingualAvailable },
              { label: '部分矯正', ok: clinic.partialAvailable },
              { label: '小児矯正', ok: clinic.kidsAvailable },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                {ok ? (
                  <span className="text-teal-600 font-bold w-5 text-center">&#10003;</span>
                ) : (
                  <span className="text-gray-300 w-5 text-center">ー</span>
                )}
                <span className={ok ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 料金情報 */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 rounded text-white text-xs flex items-center justify-center">&#165;</span>
            料金情報
          </h2>

          {(!clinic.feeMin && !clinic.feeMax && !clinic.feeWireRange && !clinic.feeInvisalignRange) ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-gray-400 text-sm">料金情報はまだ登録されていません</p>
              <p className="text-gray-400 text-xs mt-1">カウンセリング時に必ず総額を確認してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 治療別料金 */}
              {clinic.feeWireRange && (
                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-gray-700 font-semibold text-sm">ワイヤー矯正</span>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-700 font-bold text-base">{clinic.feeWireRange}</span>
                      {clinic.totalFeeSystem && (
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">トータルフィー制</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {clinic.feeInvisalignRange && (
                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-gray-700 font-semibold text-sm">マウスピース矯正</span>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-700 font-bold text-base">{clinic.feeInvisalignRange}</span>
                      {clinic.totalFeeSystem && (
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">トータルフィー制</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* 治療別がない場合は従来の全体料金レンジを表示 */}
              {!clinic.feeWireRange && !clinic.feeInvisalignRange && (clinic.feeMin || clinic.feeMax) && (
                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-gray-700 font-semibold text-sm">料金レンジ</span>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-700 font-bold text-base">{clinic.priceRange}</span>
                      {clinic.totalFeeSystem && (
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">トータルフィー制</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {clinic.feeNote && (
                <p className="text-gray-500 text-xs">{clinic.feeNote}</p>
              )}
            </div>
          )}

          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-amber-700 text-xs leading-relaxed">
              表示料金は調査時点の公式サイト記載情報です。調整料・保定装置代・検査料が別途かかる場合があります。必ずカウンセリングで総額を確認してください。
            </p>
          </div>
        </div>
      </div>

      {/* セクション4：透明性データ */}
      <TransparencySection data={transparencyData} />

      {/* セクション5：患者の一言（コメントがある場合のみ表示） */}
      {patientComments.length > 0 && (
        <PatientCommentsSection comments={patientComments} />
      )}

      {/* セクション6：インラインフォーム */}
      <SurveyInlineForm
        clinicId={id}
        clinicSlug={null}
        clinicName={clinic.name}
      />

      {/* 口コミ */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800 font-bold text-base flex items-center gap-2">
              <span className="w-4 h-4 bg-teal-700 rounded text-white text-[10px] flex items-center justify-center">&#9733;</span>
              患者の声（{reviews.length}件）
            </h2>
            <a
              href="#survey-form"
              onClick={(e) => { e.preventDefault(); document.getElementById('survey-form')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-teal-700 text-xs font-semibold border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50"
            >
              あなたの経験を教えてください
            </a>
          </div>

          {reviews.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-400 text-sm">口コミ情報を収集中です</p>
              <p className="text-gray-400 text-xs mt-1">投稿情報が集まり次第、ClinicCompassスコアを算出します</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-700 text-[10px] font-bold">
                          {(r.nickname || '匿名').slice(0, 1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700 text-xs font-semibold">{r.nickname || '匿名'}</span>
                        <span className="text-gray-400 text-[10px] ml-2">{r.treatment_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* スコアバッジ */}
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {r.explanation_clarity && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        説明 {r.explanation_clarity}/5
                      </span>
                    )}
                    {r.price_transparency && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        透明性 {r.price_transparency}/5
                      </span>
                    )}
                    {r.pushed_to_sign && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        契約圧 {r.pushed_to_sign}/5
                      </span>
                    )}
                  </div>

                  {r.comment_good && (
                    <p className="text-gray-600 text-xs leading-relaxed mb-1">
                      <span className="text-teal-600 font-bold">良い点：</span>{r.comment_good}
                    </p>
                  )}
                  {r.comment_bad && (
                    <p className="text-gray-600 text-xs leading-relaxed">
                      <span className="text-orange-500 font-bold">気になる点：</span>{r.comment_bad}
                    </p>
                  )}

                  {r.requested_by_clinic && (
                    <p className="text-amber-600 text-[10px] mt-2 bg-amber-50 px-2 py-1 rounded inline-block">
                      クリニックからの依頼による投稿
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* データソース情報 */}
      {(clinic.dataSourceUrl || clinic.lastVerifiedAt) && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 space-y-1">
            {clinic.dataSourceUrl && (
              <p>
                情報取得元：
                <a href={clinic.dataSourceUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline ml-1">
                  公式サイト
                </a>
              </p>
            )}
            {clinic.lastVerifiedAt && (
              <p>
                最終確認：{new Date(clinic.lastVerifiedAt).getFullYear()}年{new Date(clinic.lastVerifiedAt).getMonth() + 1}月
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-4xl mx-auto p-3 space-y-2">
          <button
            onClick={() => navigate(`/consult?clinic=${clinic.id}`)}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            この医院に相談する（無料）
          </button>
          <p className="text-center text-gray-400 text-[10px]">48時間以内に専門スタッフからご連絡します</p>
        </div>
      </div>
    </div>
  );
}
