import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api, { photoUrl } from '../../api';
import { CalendarDays, CheckCircle2, Target, Zap, Trophy } from 'lucide-react';

function Avatar({ photo, firstName, lastName, size = 'md', dark }) {
  const cls = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base';
  if (photo) return <img src={photoUrl(photo)} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${dark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-600 text-white'}`}>
      {firstName?.[0]}{lastName?.[0]}
    </div>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function PlayerHome() {
  const { user } = useAuth();
  const { dark, t } = useTheme();
  const toast = useToast();
  const th = t.playerHome;

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
    }).catch((e) => {
      toast(e?.response?.data?.message || t.players.error);
    }).finally(() => setLoading(false));
  }, []);

  const p = profile || user;
  const myId = user?.id;

  const attendancePct = stats?.totalTrainings
    ? Math.round((stats.trainingsAttended / stats.totalTrainings) * 100)
    : 0;

  const attBarColor = attendancePct >= 80 ? '#22c55e' : attendancePct >= 50 ? '#f59e0b' : '#ef4444';

  const healthColor = {
    healthy: dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
    injured: dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    sick: dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
    resting: dark ? 'bg-slate-600/40 text-slate-300' : 'bg-slate-100 text-slate-600',
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  const statusColor = (s) => {
    if (s === 'keldi') return dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    if (s === 'kech_keldi') return dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
    return dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
  };

  const statusLabel = (s) => {
    if (s === 'keldi') return th.statusKeldi;
    if (s === 'kech_keldi') return th.statusKech;
    return th.statusKelmadi;
  };

  return (
    <div className="space-y-4 max-w-lg pb-8">

      {/* Profile hero card */}
      <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-gradient-to-br from-blue-600/80 to-indigo-700/80 ring-1 ring-white/10' : 'bg-gradient-to-br from-blue-600 to-indigo-600'} shadow-lg`}>
        <div className="p-5 text-white">
          <div className="flex items-center gap-4">
            <Avatar photo={p?.photo} firstName={p?.firstName} lastName={p?.lastName} size="lg" dark={dark} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-tight">{p?.firstName} {p?.lastName}</h2>
              <p className="text-blue-200 text-sm mt-0.5">
                {th.positions?.[p?.position] || p?.position} · {p?.age} {th.yosh}
              </p>
              {p?.healthStatus && (
                <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${healthColor[p.healthStatus] || healthColor.healthy}`}>
                  {th.healthStatuses?.[p.healthStatus] || p.healthStatus}
                </span>
              )}
            </div>
          </div>

          {(p?.team || p?.coach) && (
            <div className={`mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3`}>
              {p?.team && (
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 text-white"
                    style={{ backgroundColor: p.team.color || 'rgba(255,255,255,0.2)' }}
                  >
                    {p.team.name?.[0]}
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">{th.team}</p>
                    <p className="text-white text-sm font-semibold leading-tight">{p.team.name}</p>
                  </div>
                </div>
              )}
              {p?.coach && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0 text-white">
                    {p.coach.firstName?.[0]}
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">{th.coach}</p>
                    <p className="text-white text-sm font-semibold leading-tight">{p.coach.firstName} {p.coach.lastName}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: th.trainings, value: stats?.totalTrainings ?? 0, Icon: CalendarDays, bg: dark ? 'bg-blue-500/15' : 'bg-blue-50', color: 'text-blue-500' },
              { label: th.attended, value: stats?.trainingsAttended ?? 0, Icon: CheckCircle2, bg: dark ? 'bg-green-500/15' : 'bg-green-50', color: 'text-green-500' },
              { label: th.goals, value: stats?.goals ?? 0, Icon: Target, bg: dark ? 'bg-orange-500/15' : 'bg-orange-50', color: 'text-orange-500' },
              { label: th.assists, value: stats?.assists ?? 0, Icon: Zap, bg: dark ? 'bg-purple-500/15' : 'bg-purple-50', color: 'text-purple-500' },
            ].map(({ label, value, Icon, bg, color }) => (
              <div key={label} className={`${card} rounded-2xl p-3 text-center`}>
                <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon size={16} strokeWidth={1.75} className={color} />
                </div>
                <p className={`text-lg font-bold ${textMain}`}>{value}</p>
                <p className={`text-xs leading-tight mt-0.5 ${textSub}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Attendance progress */}
          {stats && (
            <div className={`${card} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{th.attendance}</h3>
                <span className="text-lg font-bold" style={{ color: attBarColor }}>{attendancePct}%</span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${attendancePct}%`, backgroundColor: attBarColor }}
                />
              </div>
              <p className={`text-xs mt-2 ${textSub}`}>{th.attendedCount(stats.trainingsAttended, stats.totalTrainings)}</p>
            </div>
          )}

          {/* Recent trainings */}
          {ratingHistory.length > 0 && (
            <div className={`${card} rounded-2xl p-5`}>
              <h3 className={`text-sm font-semibold mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{th.recentTitle}</h3>
              <div className="space-y-3">
                {ratingHistory.slice(-5).reverse().map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      r.status === 'keldi' ? 'bg-green-500' :
                      r.status === 'kech_keldi' ? 'bg-orange-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${textMain}`}>{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs ${textSub}`}>{r.date ? new Date(r.date).toLocaleDateString() : ''}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${statusColor(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {r.goals > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          {r.goals}⚽
                        </span>
                      )}
                      {r.assists > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          {r.assists}🎯
                        </span>
                      )}
                      {r.rating > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                          {r.rating}/10
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top players leaderboard */}
          {topPlayers.length > 0 && (
            <div className={`${card} rounded-2xl p-5`}>
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Trophy size={16} strokeWidth={1.75} className="text-yellow-500" />
                {th.topTitle}
              </h3>
              <div className="space-y-2">
                {topPlayers.map((pl, idx) => {
                  const score = (pl.stats?.goals || 0) * 2 + (pl.stats?.assists || 0) + (pl.stats?.trainingsAttended || 0);
                  const isMe = pl._id === myId;
                  return (
                    <div
                      key={pl._id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        isMe
                          ? dark ? 'bg-blue-500/15 ring-1 ring-blue-500/30' : 'bg-blue-50 ring-1 ring-blue-200'
                          : dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-6 text-center text-base flex-shrink-0">
                        {idx < 3 ? MEDALS[idx] : <span className={`text-xs font-bold ${textSub}`}>{idx + 1}</span>}
                      </span>
                      <Avatar photo={pl.photo} firstName={pl.firstName} lastName={pl.lastName} size="sm" dark={dark} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? (dark ? 'text-blue-400' : 'text-blue-700') : textMain}`}>
                          {pl.firstName} {pl.lastName}
                          {isMe && <span className={`text-xs font-normal ml-1 ${dark ? 'text-blue-500' : 'text-blue-500'}`}>{th.me}</span>}
                        </p>
                        <p className={`text-xs ${textSub}`}>{th.positions?.[pl.position] || pl.position}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${textMain}`}>{score}</p>
                        <p className={`text-xs ${textSub}`}>{pl.stats?.goals || 0}⚽ {pl.stats?.assists || 0}🎯</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className={`text-xs mt-3 text-center ${textSub}`}>{th.topFormula}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
