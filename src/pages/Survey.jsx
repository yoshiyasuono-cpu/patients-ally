// /survey ページ
// 既存の SurveyInlineForm コンポーネントを再利用
// ?clinic_id= があれば医院名を自動取得、なければ空欄

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import SurveyInlineForm from '../components/SurveyInlineForm';

export default function Survey() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic_id') || '';
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(!!clinicId);

  // clinic_idがあればSupabaseから医院名を取得
  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single()
      .then(({ data }) => {
        if (data?.name) setClinicName(data.name);
        setLoading(false);
      });
  }, [clinicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack backTo={clinicId ? `/clinic/${clinicId}` : '/'} />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <p className="text-gray-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  const heading = clinicName
    ? `${clinicName}のアンケートに回答する`
    : '矯正治療の体験談を教えてください';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header showBack backTo={clinicId ? `/clinic/${clinicId}` : '/'} />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{heading}</h1>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
          あなたの正直な体験談が、これから治療を考える患者さんの役に立ちます。
          回答は匿名で、所要時間は約3分です。
        </p>
      </div>

      <SurveyInlineForm
        clinicId={clinicId || null}
        clinicSlug={null}
        clinicName={clinicName || ''}
      />
    </div>
  );
}
