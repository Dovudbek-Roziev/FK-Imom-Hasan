import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { photoUrl } from '../../api';

function StatBadge({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-blue-600">{value ?? 0}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

const healthColors = { healthy: 'bg-green-100 text-green-700', injured: 'bg-red-100 text-red-700', sick: 'bg-orange-100 text-orange-700', resting: 'bg-slate-100 text-slate-600' };
const healthLabels = { healthy: "Sog'lom", injured: 'Jarohat', sick: 'Kasal', resting: 'Dam olmoqda' };

export default function PlayerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/my').then((r) => setStats(r.data.stats || null)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-slate-800">Mening profilim</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.photo ? (
            <img src={photoUrl(user.photo)} alt="" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-slate-500">{user?.position} · {user?.age} yosh</p>
            {user?.healthStatus && (
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${healthColors[user.healthStatus] || 'bg-slate-100 text-slate-600'}`}>
                {healthLabels[user.healthStatus] || user.healthStatus}
              </span>
            )}
          </div>
        </div>

        {user?.coach && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
              {user.coach.firstName?.[0]}
            </div>
            <div>
              <p className="text-xs text-slate-500">Trener</p>
              <p className="text-sm font-medium text-slate-800">{user.coach.firstName} {user.coach.lastName}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatBadge label="Jami mashg'ulotlar" value={stats?.totalTrainings} />
          <StatBadge label="Qatnashgan" value={stats?.trainingsAttended} />
          <StatBadge label="Gollar" value={stats?.goals} />
          <StatBadge label="Assists" value={stats?.assists} />
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Statistika</h3>
          <div className="space-y-3">
            {[
              { label: 'Gollar', val: stats.goals, max: 50 },
              { label: 'Assists', val: stats.assists, max: 50 },
              { label: 'Qatnashgan', val: stats.trainingsAttended, max: Math.max(stats.totalTrainings || 1, 1) },
              { label: 'Davomat foizi', val: stats.totalTrainings ? Math.round((stats.trainingsAttended / stats.totalTrainings) * 100) : 0, max: 100, suffix: '%' },
            ].map(({ label, val, max, suffix }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-800">{val || 0}{suffix || ''}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(((val || 0) / max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
