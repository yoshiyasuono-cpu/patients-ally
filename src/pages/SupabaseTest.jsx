import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase 接続テスト</h1>

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
        <p className="text-gray-400 text-sm">clinics テーブルにデータがありません。SQL Editorからデータを投入してください。</p>
      )}
    </div>
  );
}
