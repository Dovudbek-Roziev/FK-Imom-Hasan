import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { photoUrl } from '../../api';

const healthColors = {
  healthy: 'bg-green-100 text-green-700',
  injured: 'bg-red-100 text-red-700',
  sick: 'bg-orange-100 text-orange-700',
  resting: 'bg-slate-100 text-slate-600'
};
const healthLabels = {
  healthy: "Sog'lom",
  injured: 'Jarohat',
  sick: 'Kasal',
  resting: 'Dam olmoqda'
};

function Avatar({ photo, firstName, lastName, size = 'md' }) {
  const cls = size === 'lg'
    ? 'w-20 h-20 text-2xl'
    : size === 'sm'
    ? 'w-9 h-9 text-sm'
    : 'w-10 h-10 text-base';
  if (photo) {
    return <img src={photoUrl(photo)} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {firstName?.[0]}{lastName?.[0]}
    </div>
  );
}

export default function PlayerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/my'),
      api.get('/stats/top-players').catch(() => ({ data: { players: [] } })),
    ]).then(([myRes, topRes]) => {
      setStats(myRes.data.stats || null);
      setProfile(myRes.data.profile || null);
      setRatingHistory(myRes.data.ratingHistory || []);
      setTopPlayers(topRes.data.players || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const p = profile || user;
  const myId = user?.id;

  const attendancePct = stats?.totalTrainings
    ? Math.round((stats.trainingsAttended / stats.totalTrainings) * 100)
    : 0;

  return (
    <div className="space-y-4 max-w-lg pb-6">
      {/* Profil karta */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar photo={p?.photo} firstName={p?.firstName} lastName={p?.lastName} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{p?.firstName} {p?.lastName}</h2>
            <p className="text-blue-200 text-sm mt-0.5">{p?.position} · {p?.age} yosh</p>
            {p?.healthStatus && (
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${healthColors[p.healthStatus]}`}>
                {healthLabels[p.healthStatus] || p.healthStatus}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-500/50 grid grid-cols-2 gap-3">
          {p?.team && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: p.team.color || '#fff3', color: 'white' }}
              >
                {p.team.name?.[0]}
              </div>
              <div>
                <p className="text-blue-200 text-xs">Jamoa</p>
                <p className="text-white text-sm font-semibold">{p.team.name}</p>
              </div>
            </div>
          )}
          {p?.coach && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0 text-white">
                {p.coach.firstName?.[0]}
              </div>
              <div>
                <p className="text-blue-200 text-xs">Trener</p>
                <p className="text-white text-sm font-semibold">{p.coach.firstName} {p.coach.lastName}</p>
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
        <>
          {/* Statistika kartalar */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Trening', value: stats?.totalTrainings ?? 0, icon: '📅' },
              { label: 'Qatnashdi', value: stats?.trainingsAttended ?? 0, icon: '✅' },
              { label: 'Gol', value: stats?.goals ?? 0, icon: '⚽' },
              { label: 'Assist', value: stats?.assists ?? 0, icon: '🎯' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Davomat progress */}
          {stats && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Davomat</h3>
                <span className="text-lg font-bold text-blue-600">{attendancePct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${attendancePct}%`,
                    backgroundColor: attendancePct >= 80 ? '#22c55e' : attendancePct >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span>{stats.trainingsAttended} ta qatnashdi</span>
                <span>{stats.totalTrainings} ta jami</span>
              </div>
            </div>
          )}

          {/* So'nggi trenirovkalar tarixi */}
          {ratingHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">So'nggi trenirovkalar</h3>
              <div className="space-y-2.5">
                {ratingHistory.slice(-5).reverse().map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      r.status === 'keldi' ? 'bg-green-500' :
                      r.status === 'kech_keldi' ? 'bg-orange-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{r.title}</p>
                      <p className="text-xs text-slate-400">{r.date ? new Date(r.date).toLocaleDateString('uz-UZ') : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                      {r.goals > 0 && <span className="text-blue-600 font-medium">{r.goals}G</span>}
                      {r.assists > 0 && <span className="text-green-600 font-medium">{r.assists}A</span>}
                      {r.rating > 0 && (
                        <span className="bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-lg">
                          {r.rating}/10
                        </span>
                      )}
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
                {topPlayers.map((pl, idx) => {
                  const score = (pl.stats?.goals || 0) * 2 + (pl.stats?.assists || 0) + (pl.stats?.trainingsAttended || 0);
                  const isMe = pl._id === myId;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={pl._id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isMe ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}>
                      <span className="w-6 text-center text-base flex-shrink-0">
                        {idx < 3 ? medals[idx] : <span className="text-xs text-slate-400 font-bold">{idx + 1}</span>}
                      </span>
                      <Avatar photo={pl.photo} firstName={pl.firstName} lastName={pl.lastName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-blue-700' : 'text-slate-800'}`}>
                          {pl.firstName} {pl.lastName} {isMe && <span className="text-xs font-normal">(Sen)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{pl.position}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-800">{score}</p>
                        <p className="text-xs text-slate-400">{pl.stats?.goals || 0}⚽ {pl.stats?.assists || 0}🎯</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Ball = Gol×2 + Assist + Qatnashish</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
