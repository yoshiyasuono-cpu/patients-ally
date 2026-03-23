import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ClinicList from './pages/ClinicList';
import ClinicDetail from './pages/ClinicDetail';
import ConsultationForm from './pages/ConsultationForm';
import ClinicAdmin from './pages/ClinicAdmin';
import SupabaseTest from './pages/SupabaseTest';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ClinicList />} />
        <Route path="/clinic/:id" element={<ClinicDetail />} />
        <Route path="/consult" element={<ConsultationForm />} />
        <Route path="/clinic-admin" element={<ClinicAdmin />} />
        <Route path="/supabase-test" element={<SupabaseTest />} />
      </Routes>
    </BrowserRouter>
  );
}
