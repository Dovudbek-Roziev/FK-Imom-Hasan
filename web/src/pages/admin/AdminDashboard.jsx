import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/admin/stats')
      .then((r) => setStats(r.data.stats))
      .catch(() => setError('Statistikani yuklashda xato.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-center">{error}</div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Tizim umumiy ko'rinishi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon="👥" label="Jami trenerlar" value={stats.totalCoaches} color="bg-blue-50" />
        <StatCard icon="⚽" label="Jami futbolchilar" value={stats.totalPlayers} color="bg-green-50" />
        <StatCard icon="⭐" label="Premium trenerlar" value={stats.premiumCoaches} sub={`${stats.freeCoaches} ta bepul`} color="bg-yellow-50" />
        <StatCard icon="💰" label="Bu oylik daromad" value={`$${stats.monthlyRevenue}`} color="bg-purple-50" />
        <StatCard icon="📊" label="Jami daromad" value={`$${stats.totalRevenue}`} color="bg-slate-100" />
        <StatCard icon="🆓" label="Bepul foydalanuvchilar" value={stats.freeCoaches} color="bg-orange-50" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Tezkor havolalar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/admin/coaches" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-slate-800 text-sm">Trenerlar boshqaruvi</p>
              <p className="text-xs text-slate-500">Yaratish, bloklash, premium berish</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-slate-800 text-sm">To'lovlar tarixi</p>
              <p className="text-xs text-slate-500">Tez orada...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
