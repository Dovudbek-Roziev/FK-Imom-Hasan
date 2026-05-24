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
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/my'),
      api.get('/stats/top-players'),
    ]).then(([myRes, topRes]) => {
      setStats(myRes.data.stats || null);
      setTopPlayers(topRes.data.players || []);
    }).catch(() => {}).finally(() => setLoading(false));
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

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {user?.team && (
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: user.team.color || '#e2e8f0' }}
              >
                <span className="text-white font-bold text-sm">{user.team.name?.[0]}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jamoa</p>
                <p className="text-sm font-medium text-slate-800">{user.team.name}</p>
              </div>
            </div>
          )}

          {user?.coach && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                {user.coach.firstName?.[0]}
              </div>
              <div>
                <p className="text-xs text-slate-500">Trener</p>
                <p className="text-sm font-medium text-slate-800">{user.coach.firstName} {user.coach.lastName}</p>
              </div>
            </div>
          )}
        </div>
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

      {/* Top o'yinchilar */}
      {topPlayers.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">🏆 Top o'yinchilar</h3>
          <div className="space-y-3">
            {topPlayers.map((p, idx) => {
              const score = (p.stats?.goals || 0) * 2 + (p.stats?.assists || 0) + (p.stats?.trainingsAttended || 0);
              const isMe = p._id === user?.id;
              return (
                <div key={p._id} className={`flex items-center gap-3 p-2 rounded-xl ${isMe ? 'bg-blue-50' : ''}`}>
                  <span className={`w-6 text-center text-xs font-bold flex-shrink-0 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  {p.photo ? (
                    <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-700' : 'text-slate-800'}`}>
                      {p.firstName} {p.lastName} {isMe && '(Sen)'}
                    </p>
                    <p className="text-xs text-slate-400">{p.position}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{score}</p>
                    <p className="text-xs text-slate-400">ball</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Ball = Gol×2 + Assist + Qatnashish</p>
        </div>
      )}
    </div>
  );
}
