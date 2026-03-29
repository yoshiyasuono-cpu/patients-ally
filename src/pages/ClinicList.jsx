import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mapFromDb } from '../lib/seedClinics';
import Header from '../components/Header';

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffedac80fc0?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1570612861542-284f4c12e75f?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=320&h=240&fit=crop',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=320&h=240&fit=crop',
];

const FILTERS = ['すべて', 'ワイヤー矯正', 'マウスピース矯正'];
const AREAS = [
  'すべて', '渋谷区', '新宿区', '港区', '中央区', '千代田区', '文京区',
  '世田谷区', '目黒区', '豊島区', '品川区', '大田区', '杉並区', '中野区',
  '板橋区', '練馬区', '北区', '台東区', '墨田区', '江東区', '葛飾区',
  '荒川区', '八王子市', '町田市', '立川市', '調布市', '府中市',
  '武蔵野市', '昭島市', '稲城市', '国分寺市',
];
const BUDGETS = ['指定なし', '〜80万円', '80〜100万円', '100〜120万円', '120万円以上'];

export default function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('すべて');
  const [budget, setBudget] = useState('指定なし');
  const [filter, setFilter] = useState('すべて');

  useEffect(() => {
    supabase
      .from('clinics')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) setClinics(data.map(mapFromDb));
        setLoading(false);
      });
  }, []);

  const filtered = clinics.filter((c) => {
    const matchSearch =
      search === '' ||
      c.name.includes(search) ||
      c.area.includes(search) ||
      c.station.includes(search);
    const matchArea = area === 'すべて' || c.area === area;
    const matchFilter =
      filter === 'すべて' ||
      (filter === 'ワイヤー矯正' && c.wireAvailable) ||
      (filter === 'マウスピース矯正' && c.invisalignAvailable);
    const matchBudget = (() => {
      if (budget === '指定なし') return true;
      const minPrice = c.feeMin;
      if (!minPrice) return budget === '指定なし';
      if (budget === '〜80万円') return minPrice <= 800000;
      if (budget === '80〜100万円') return minPrice >= 800000 && minPrice <= 1000000;
      if (budget === '100〜120万円') return minPrice >= 1000000 && minPrice <= 1200000;
      if (budget === '120万円以上') return minPrice >= 1200000;
      return true;
    })();
    return matchSearch && matchArea && matchFilter && matchBudget;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 px-4 pt-6 pb-8 w-full">
        <div className="text-white mb-4">
          <h1 className="text-2xl font-bold leading-tight mb-2">
            矯正する前に、比較する場所。
          </h1>
          <p className="text-teal-100 text-base leading-relaxed">
            料金・治療方針・リスク説明——比較に必要な事実情報を、医院ごとに整理してお届けします。
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-green-400/20 border border-green-300/40 text-green-200 text-sm font-medium px-4 py-1.5 rounded-full">
            <span className="text-green-300 font-bold">✓</span>
            ご利用は完全無料です。相談からクリニック紹介まで、患者様の費用負担はありません。
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['料金の透明性を審査', '投稿情報の改ざん禁止'].map((label) => (
            <span key={label} className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3 text-teal-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {label}
            </span>
          ))}
        </div>

        {/* 調査数値バナー */}
        <div className="bg-white/10 rounded-xl p-3 mb-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-white font-bold text-lg leading-tight">{clinics.length}院</div>
            <div className="text-teal-200 text-[9px] leading-tight mt-0.5">掲載クリニック数</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">
              {clinics.filter(c => c.feeMin || c.feeMax).length}院
            </div>
            <div className="text-teal-200 text-[9px] leading-tight mt-0.5">料金情報あり</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">
              {clinics.filter(c => c.totalFee).length}院
            </div>
            <div className="text-teal-200 text-[9px] leading-tight mt-0.5">トータルフィー制</div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="クリニック名・エリア・治療方法で検索"
            className="w-full pl-9 pr-4 rounded-lg text-sm bg-white text-gray-800 placeholder-gray-400 outline-none shadow"
            style={{ minHeight: '44px' }}
          />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Filter row */}
        <div className="flex gap-2 mt-4 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-sm px-4 rounded-full border transition-all flex items-center ${
                filter === f
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={{ minHeight: '44px' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sub filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 bg-white text-gray-700 outline-none"
            style={{ minHeight: '44px' }}
          >
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 bg-white text-gray-700 outline-none"
            style={{ minHeight: '44px' }}
          >
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        {/* Result count */}
        <div className="text-xs text-gray-500 mb-3">
          {filtered.length}件のクリニックが見つかりました
        </div>

        {/* Clinic cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              条件に合うクリニックが見つかりませんでした
            </div>
          ) : (
            filtered.map((clinic, idx) => (
              <Link to={`/clinic/${clinic.id}`} key={clinic.id}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Clinic header */}
                  <div className="p-3 pb-2 flex gap-3">
                    {/* イニシャルアイコン */}
                    <div className="flex-shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-lg bg-teal-50 flex items-center justify-center">
                      <span className="text-teal-700 font-bold text-2xl">{clinic.name.charAt(0)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-gray-400 text-[10px]">{clinic.area}</span>
                          </div>
                          <h2 className="text-gray-900 font-bold text-base leading-tight line-clamp-2">{clinic.name}</h2>
                        </div>
                        <div className="flex-shrink-0 text-right ml-1">
                          <div className="text-teal-700 font-bold text-sm">{clinic.priceRange}</div>
                          <div className="text-gray-400 text-[9px]">料金目安</div>
                        </div>
                      </div>

                      {/* 対応治療 */}
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {clinic.treatments.length > 0 ? (
                          clinic.treatments.map((t) => (
                            <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[10px]">対応治療：情報収集中</span>
                        )}
                        {clinic.totalFee && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                            トータルフィー制
                          </span>
                        )}
                      </div>

                      {/* 最寄り駅 */}
                      <p className="text-gray-400 text-xs line-clamp-1">
                        {clinic.station || clinic.address}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-100">
                    <span className="text-gray-400 text-xs">
                      <svg className="w-3 h-3 inline mr-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {clinic.station || ''}
                    </span>
                    <span className="text-teal-700 text-sm font-semibold flex items-center gap-0.5">
                      詳細を見る
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* フッター */}
      <footer className="w-full text-center py-8 pb-10 border-t border-gray-200 mt-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link to="/policy" className="text-gray-400 text-sm hover:text-gray-600">投稿情報掲載基準</Link>
          <Link to="/for-clinics" className="text-gray-400 text-sm hover:text-gray-600">クリニックの方へ</Link>
        </div>
        <p className="text-gray-400 text-xs">© 2026 患者の味方 — 矯正歯科の意思決定支援サービス</p>
      </footer>

      {/* Fixed CTA button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-5xl mx-auto p-3">
          <p className="text-center text-xs text-gray-500 mb-1">
            どれを選べばいいかわからない方は
            <a href="https://patient-mikata-lp.vercel.app" target="_blank" className="text-teal-700 font-bold underline ml-1">
              無料コンシェルジュに相談 →
            </a>
          </p>
          <Link to="/consult">
            <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              無料相談はこちら（48時間以内にご連絡）
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
