import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mockClinics } from '../data/mockClinics';

const PRESSURE_BADGE = {
  low: { label: '低い', className: 'bg-green-100 text-green-800 border border-green-300' },
  medium: { label: 'やや高い', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  high: { label: '高い', className: 'bg-red-100 text-red-800 border border-red-300' },
};

function ProgressBar({ value, max = 5, colorClass = 'bg-green-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function paymentLabel(clinic) {
  if (clinic.accepts_installment && clinic.accepts_credit) return '分割・CC';
  if (clinic.accepts_installment) return '分割のみ';
  if (clinic.accepts_credit) return 'CCのみ';
  return '一括のみ';
}

export default function ClinicsCompare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const { data, error } = await supabase.from('clinics').select('*');
        // デモ用フィールド（transparency_score等）がなければmockにフォールバック
        const hasDemo = data && data.length > 0 && 'transparency_score' in data[0];
        if (error || !hasDemo) {
          setClinics(mockClinics.filter(c => ids.includes(c.id)));
        } else {
          const filtered = data.filter(c => ids.includes(String(c.id)));
          setClinics(filtered.length > 0 ? filtered : mockClinics.filter(c => ids.includes(c.id)));
        }
      } catch {
        setClinics(mockClinics.filter(c => ids.includes(c.id)));
      } finally {
        setLoading(false);
      }
    }
    if (ids.length > 0) {
      fetchClinics();
    } else {
      setLoading(false);
    }
  }, []);

  // ハイライト計算
  const minExtraCost = clinics.length > 0 ? Math.min(...clinics.map(c => c.extra_cost_rate)) : null;
  const maxScore = clinics.length > 0 ? Math.max(...clinics.map(c => c.transparency_score)) : null;
  const minFee = clinics.length > 0 ? Math.min(...clinics.map(c => c.fee_min)) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* デモバナー */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <span className="text-yellow-800 text-sm font-medium">
          このページはデモ版です。データはすべてサンプルです。
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 戻るリンク */}
        <Link to="/clinics" className="inline-flex items-center gap-1 text-blue-900 hover:underline text-sm mb-5">
          ← 一覧に戻る
        </Link>

        {/* タイトル */}
        <h1 className="text-2xl font-bold text-blue-900 mb-6">クリニック比較</h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-4">比較するクリニックが選択されていません。</p>
            <Link to="/clinics" className="text-blue-900 underline">一覧ページへ</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full bg-white min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-4 px-5 w-36 bg-gray-50">
                    項目
                  </th>
                  {clinics.map(c => (
                    <th key={c.id} className="py-4 px-5 text-center">
                      <p className="font-bold text-blue-900 text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.area} &middot; {c.station}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">

                {/* 透明性スコア */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">透明性スコア</td>
                  {clinics.map(c => (
                    <td
                      key={c.id}
                      className={`py-4 px-5 text-center ${c.transparency_score === maxScore ? 'bg-green-50' : ''}`}
                    >
                      <p className="font-bold text-gray-800">{c.transparency_score.toFixed(1)}</p>
                      <ProgressBar value={c.transparency_score} max={5} colorClass="bg-green-500" />
                    </td>
                  ))}
                </tr>

                {/* 料金 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">料金（目安）</td>
                  {clinics.map(c => (
                    <td
                      key={c.id}
                      className={`py-4 px-5 text-center ${c.fee_min === minFee ? 'bg-green-50' : ''}`}
                    >
                      <p className="font-semibold text-gray-800">
                        {Math.round(c.fee_min / 10000)}〜{Math.round(c.fee_max / 10000)}万円
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 追加費用発生率 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">追加費用発生率</td>
                  {clinics.map(c => {
                    const isMin = c.extra_cost_rate === minExtraCost;
                    const isHigh = c.extra_cost_rate > 40;
                    return (
                      <td
                        key={c.id}
                        className={`py-4 px-5 text-center ${isHigh ? 'bg-red-50' : isMin ? 'bg-green-50' : ''}`}
                      >
                        <p className={`font-semibold ${isHigh ? 'text-red-500' : 'text-gray-800'}`}>
                          {c.extra_cost_rate}%
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* 説明満足度 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">説明満足度</td>
                  {clinics.map(c => (
                    <td key={c.id} className="py-4 px-5 text-center">
                      <p className="font-semibold text-gray-800">{c.explanation_score.toFixed(1)} / 5.0</p>
                      <ProgressBar value={c.explanation_score} max={5} colorClass="bg-blue-500" />
                    </td>
                  ))}
                </tr>

                {/* 契約圧力 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">契約圧力</td>
                  {clinics.map(c => {
                    const badge = PRESSURE_BADGE[c.pressure_level] ?? PRESSURE_BADGE.medium;
                    return (
                      <td key={c.id} className="py-4 px-5 text-center">
                        <span className={`inline-block text-xs font-semibold rounded-full px-3 py-1 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* 認定医 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">認定医</td>
                  {clinics.map(c => (
                    <td key={c.id} className="py-4 px-5 text-center text-lg">
                      {c.has_certified_doctor
                        ? <span className="text-green-600 font-bold">✓</span>
                        : <span className="text-gray-300 font-bold">✗</span>
                      }
                    </td>
                  ))}
                </tr>

                {/* 支払い方法 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">支払い方法</td>
                  {clinics.map(c => (
                    <td key={c.id} className="py-4 px-5 text-center">
                      <p className="text-sm text-gray-700">{paymentLabel(c)}</p>
                    </td>
                  ))}
                </tr>

                {/* 口コミ件数 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">口コミ件数</td>
                  {clinics.map(c => (
                    <td key={c.id} className="py-4 px-5 text-center">
                      <p className="text-sm text-gray-700">{c.review_count}件</p>
                    </td>
                  ))}
                </tr>

                {/* 最終更新 */}
                <tr>
                  <td className="py-4 px-5 text-sm text-gray-600 font-medium bg-gray-50">最終更新</td>
                  {clinics.map(c => (
                    <td key={c.id} className="py-4 px-5 text-center">
                      <p className="text-sm text-gray-500">{formatDate(c.updated_at)}</p>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}

        {/* 凡例 */}
        {!loading && clinics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-50 border border-green-200"></span>
              最良値
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-50 border border-red-200"></span>
              追加費用発生率 40%超
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
