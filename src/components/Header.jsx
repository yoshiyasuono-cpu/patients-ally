import { Link } from 'react-router-dom';

export default function Header({ showBack = false, backTo = '/', title }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack ? (
          <Link to={backTo} className="text-teal-700 p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : null}
        <Link to="/" className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">患</span>
          </div>
          {!showBack && (
            <div>
              <div className="text-teal-800 font-bold text-base leading-tight">患者の味方</div>
              <div className="text-gray-500 text-[10px] leading-tight">中立・第三者の矯正歯科ナビ</div>
            </div>
          )}
          {showBack && title && (
            <span className="text-gray-800 font-semibold text-sm">{title}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
