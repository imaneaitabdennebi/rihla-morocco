import { useState } from 'react';
import api from '../api/axios';
import { exportExcel, exportPdf } from '../utils/exportReservations';

export default function ExportButtons({ title = 'Liste des réservations' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (format) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/export/reservations');
      if (data.length === 0) {
        setError('Aucune réservation à exporter.');
        return;
      }
      if (format === 'pdf') exportPdf(data, title);
      else exportExcel(data);
    } catch {
      setError("L'export a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '12px 0' }}>
      <button disabled={loading} onClick={() => run('pdf')}>📄 Exporter en PDF</button>{' '}
      <button disabled={loading} onClick={() => run('excel')}>📊 Exporter en Excel</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}