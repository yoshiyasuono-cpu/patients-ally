import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClinicList from './pages/ClinicList';
import ClinicDetail from './pages/ClinicDetail';
import ConsultationForm from './pages/ConsultationForm';
import ClinicAdmin from './pages/ClinicAdmin';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClinicList />} />
        <Route path="/clinic/:id" element={<ClinicDetail />} />
        <Route path="/consult" element={<ConsultationForm />} />
        <Route path="/clinic-admin" element={<ClinicAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
