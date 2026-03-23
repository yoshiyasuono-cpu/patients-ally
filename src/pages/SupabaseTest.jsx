import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { seedClinics } from '../lib/seedClinics';

export default function SupabaseTest() {
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  async function fetchClinics() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .limit(5);

    if (error) {
      setError(error.message);
    } else {
      setClinics(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchClinics();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setSeedResult(null);
    setError(null);
    try {
      const count = await seedClinics();
      setSeedResult(`${count}件のデータを投入しました`);
      await fetchClinics();
    } catch (e) {
      setError(e.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase 接続テスト</h1>

      <button
        onClick={handleSeed}
        disabled={seeding}
        className="mb-4 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
      >
        {seeding ? '投入中...' : 'シードデータを投入する'}
      </button>

      {seedResult && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-700 text-sm mb-4">
          ✓ {seedResult}
        </div>
      )}

      {loading && <p className="text-gray-500">取得中...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm mb-4">
          <strong>エラー：</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700 text-sm mb-4">
          ✓ Supabase 接続成功 — {clinics.length} 件取得（上位5件）
        </div>
      )}

      {clinics.length > 0 && (
        <pre className="bg-gray-100 rounded p-4 text-xs overflow-auto">
          {JSON.stringify(clinics, null, 2)}
        </pre>
      )}

      {!loading && !error && clinics.length === 0 && (
        <p className="text-gray-400 text-sm">clinics テーブルにデータがありません。上のボタンでシードデータを投入してください。</p>
      )}
    </div>
  );
}
