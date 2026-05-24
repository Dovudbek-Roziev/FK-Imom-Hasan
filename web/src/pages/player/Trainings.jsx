import { useEffect, useState } from 'react';
import api from '../../api';

const attColor = { keldi: 'bg-green-100 text-green-700', kech_keldi: 'bg-orange-100 text-orange-700', kelmadi: 'bg-red-100 text-red-700' };
const attLabel = { keldi: 'Qatnashgan', kech_keldi: 'Kech keldi', kelmadi: 'Qatnashmagan' };

export default function PlayerTrainings() {
  const [history, setHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    Promise.all([
      api.get('/trainings/my/upcoming'),
      api.get('/trainings/my/history'),
    ]).then(([u, h]) => {
      setUpcoming(u.data.trainings || []);
      setHistory(h.data.trainings || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const items = tab === 'upcoming' ? upcoming : history;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Mashg'ulotlar</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Kelayotgan
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Tarix
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
          {tab === 'upcoming' ? "Kelayotgan mashg'ulotlar yo'q" : "Mashg'ulot tarixi yo'q"}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600 leading-tight">
                  {t.date ? new Date(t.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : '—'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{t.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  {t.startTime && <span>🕐 {t.startTime}{t.endTime ? ` – ${t.endTime}` : ''}</span>}
                  {t.location && <span>📍 {t.location}</span>}
                </div>
                {tab === 'history' && t.myAttendance && (
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${attColor[t.myAttendance.status] || 'bg-slate-100 text-slate-600'}`}>
                    {attLabel[t.myAttendance.status] || t.myAttendance.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
