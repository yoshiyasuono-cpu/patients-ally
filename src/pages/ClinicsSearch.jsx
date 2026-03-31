import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mockClinics } from '../data/mockClinics';

const AREAS = ['立川', '新宿', '渋谷', '池袋', '品川', 'その他'];

const FEE_RANGES = [
  { label: '指定なし', value: 'all' },
  { label: '〜50万円', value: 'under50' },
  { label: '50〜80万円', value: '50to80' },
  { label: '80万円〜', value: 'over80' },
];

const SCORE_OPTIONS = [
  { label: '指定なし', value: 'all' },
  { label: '3.0以上', value: '3.0' },
  { label: '4.0以上', value: '4.0' },
  { label: '4.5以上', value: '4.5' },
];

function StarDisplay({ score }) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className="text-yellow-400">★</span>
      ))}
      {half && <span className="text-yellow-400">☆</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
    </span>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-900' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function ClinicsSearch() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [feeRange, setFeeRange] = useState('all');
  const [installment, setInstallment] = useState(false);
  const [credit, setCredit] = useState(false);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [minScore, setMinScore] = useState('all');
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const { data, error } = await supabase.from('clinics').select('*');
        // デモ用フィールド（transparency_score等）がなければmockにフォールバック
        const hasDemo = data && data.length > 0 && 'transparency_score' in data[0];
        if (error || !hasDemo) {
          setClinics(mockClinics);
        } else {
          setClinics(data);
        }
      } catch {
        setClinics(mockClinics);
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, []);

  function toggleArea(area) {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  }

  function toggleCompare(id) {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const filtered = clinics.filter(c => {
    if (selectedAreas.length > 0 && !selectedAreas.includes(c.area)) return false;
    if (feeRange === 'under50' && c.fee_min >= 500000) return false;
    if (feeRange === '50to80' && (c.fee_max < 500000 || c.fee_min > 800000)) return false;
    if (feeRange === 'over80' && c.fee_max < 800000) return false;
    if (installment && !c.accepts_installment) return false;
    if (credit && !c.accepts_credit) return false;
    if (certifiedOnly && !c.has_certified_doctor) return false;
    if (minScore !== 'all' && c.transparency_score < parseFloat(minScore)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* デモバナー */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <span className="text-yellow-800 text-sm font-medium">
          このページはデモ版です。データはすべてサンプルです。
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-1">矯正歯科クリニック 比較・検索</h1>
          <p className="text-gray-500 text-sm">料金の透明性・説明満足度などの実態データで比較できます</p>
        </div>

        {/* フィルターエリア */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-6">
            {/* エリア */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">エリア</p>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(area => (
                  <label key={area} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleArea(area)}
                      className="accent-blue-900"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 料金帯 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">料金帯</p>
              <div className="flex flex-wrap gap-3">
                {FEE_RANGES.map(r => (
                  <label key={r.value} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="feeRange"
                      value={r.value}
                      checked={feeRange === r.value}
                      onChange={() => setFeeRange(r.value)}
                      className="accent-blue-900"
                    />
                    <span className="text-sm text-gray-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 支払い */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">支払い</p>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={installment}
                    onChange={e => setInstallment(e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span className="text-sm text-gray-700">分割払い可</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credit}
                    onChange={e => setCredit(e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span className="text-sm text-gray-700">クレジットカード可</span>
                </label>
              </div>
            </div>

            {/* 認定医 */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">認定医</p>
              <ToggleSwitch
                checked={certifiedOnly}
                onChange={setCertifiedOnly}
                label="認定医のみ表示"
              />
            </div>

            {/* 透明性スコア */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">透明性スコア</p>
              <select
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {SCORE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 件数表示 */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? '読み込み中...' : `${filtered.length}件のクリニック`}
        </p>

        {/* クリニックカード一覧 */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">条件に一致するクリニックがありません</div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {filtered.map(clinic => {
              const isSelected = compareList.includes(clinic.id);
              const isFull = compareList.length >= 3 && !isSelected;
              return (
                <div
                  key={clinic.id}
                  className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${isSelected ? 'border-green-500 ring-1 ring-green-400' : 'border-gray-200'}`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-blue-900 text-base leading-tight">{clinic.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{clinic.area} &middot; {clinic.station}</p>
                    </div>
                    {clinic.has_certified_doctor && (
                      <span className="shrink-0 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-2 py-0.5">認定医在籍</span>
                    )}
                  </div>

                  {/* データグリッド */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">透明性スコア</p>
                      <div className="flex items-center gap-1">
                        <StarDisplay score={clinic.transparency_score} />
                        <span className="font-semibold text-gray-700">{clinic.transparency_score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">料金帯</p>
                      <p className="font-semibold text-gray-700">
                        {Math.round(clinic.fee_min / 10000)}〜{Math.round(clinic.fee_max / 10000)}万円
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">追加費用発生率</p>
                      <p className={`font-semibold ${clinic.extra_cost_rate >= 40 ? 'text-red-500' : 'text-gray-700'}`}>
                        {clinic.extra_cost_rate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">説明満足度</p>
                      <p className="font-semibold text-gray-700">{clinic.explanation_score.toFixed(1)} / 5.0</p>
                    </div>
                  </div>

                  {/* ボタン */}
                  <div className="flex gap-2 mt-auto pt-1">
                    <button
                      onClick={() => toggleCompare(clinic.id)}
                      disabled={isFull}
                      className={`flex-1 text-sm font-medium rounded-lg py-2 transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      {isSelected ? '選択済み ✓' : '比較リストに追加'}
                    </button>
                    <Link
                      to={`/clinic/${clinic.id}`}
                      className="flex-1 text-center text-sm font-medium rounded-lg py-2 bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* フローティング比較バー */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-blue-900 text-white rounded-full shadow-xl px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{compareList.length}件選択中</span>
            <button
              onClick={() => navigate(`/clinics/compare?ids=${compareList.join(',')}`)}
              className="bg-white text-blue-900 font-bold text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors"
            >
              比較する →
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-blue-300 hover:text-white text-xs"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
