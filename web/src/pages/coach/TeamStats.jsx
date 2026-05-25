import { useEffect, useState } from 'react';
import api, { photoUrl } from '../../api';
import { Printer } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function Avatar({ player, size = 'sm', dark }) {
  const cls = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  if (player?.photo) {
    return <img src={photoUrl(player.photo)} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
      {player?.firstName?.[0]}{player?.lastName?.[0]}
    </div>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];

function TopList({ title, players, valueKey, suffix = '', icon, dark, textMain, textSub, card, ts }) {
  if (!players?.length) return null;
  const maxVal = Math.max(...players.map((p) => p.stats?.[valueKey] || 0), 1);
  return (
    <div className={`${card} rounded-2xl p-5`}>
      <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        <span>{icon}</span>{title}
      </h3>
      <div className="space-y-3">
        {players.map((p, i) => {
          const val = p.stats?.[valueKey] || 0;
          const pct = Math.round((val / maxVal) * 100);
          return (
            <div key={p._id}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm w-6 text-center flex-shrink-0">{MEDALS[i] || <span className={`text-xs font-bold ${textSub}`}>{i + 1}</span>}</span>
                <Avatar player={p} dark={dark} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${textMain}`}>{p.firstName} {p.lastName}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{val}{suffix}</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ml-9 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div
                  className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamStats() {
  const { dark, t } = useTheme();
  const ts = t.stats;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('top');

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    api.get('/stats/team')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxTrainings = data?.monthlyTrainings?.length
    ? Math.max(...data.monthlyTrainings.map((m) => m.count), 1)
    : 1;

  const tabs = [
    { val: 'top', label: ts.tabTop },
    { val: 'monthly', label: ts.tabMonthly },
    { val: 'players', label: ts.tabAll },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-bold ${textMain}`}>{ts.title}</h1>
        <button
          onClick={() => window.print()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium print:hidden transition-colors ${dark ? 'bg-slate-800 ring-1 ring-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
        >
          <Printer size={15} strokeWidth={1.75} /> {ts.print}
        </button>
      </div>

      <div className={`flex rounded-2xl p-1 gap-1 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {tabs.map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === val
                ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className={`${card} rounded-2xl p-10 text-center ${textSub}`}>{ts.noData}</div>
      ) : tab === 'top' ? (
        <div className="space-y-4">
          <TopList title={ts.topScorers} players={data.topScorers} valueKey="goals" suffix={` ${ts.goals}`} icon="⚽" dark={dark} textMain={textMain} textSub={textSub} card={card} ts={ts} />
          <TopList title={ts.topAssists} players={data.topAssists} valueKey="assists" suffix={` ${ts.assists}`} icon="🎯" dark={dark} textMain={textMain} textSub={textSub} card={card} ts={ts} />
          <TopList title={ts.topAttendance} players={data.topAttendance} valueKey="trainingsAttended" suffix=" ta" icon="📅" dark={dark} textMain={textMain} textSub={textSub} card={card} ts={ts} />
        </div>
      ) : tab === 'monthly' ? (
        <div className={`${card} rounded-2xl p-5`}>
          <h3 className={`text-sm font-semibold mb-4 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>📊 {ts.monthly}</h3>
          {!data.monthlyTrainings?.length ? (
            <p className={`text-sm text-center py-8 ${textSub}`}>{ts.noData}</p>
          ) : (
            <div className="space-y-3">
              {data.monthlyTrainings.map((m) => (
                <div key={`${m._id.year}-${m._id.month}`}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={textSub}>{ts.months[m._id.month]} {m._id.year}</span>
                    <span className={`font-semibold ${textMain}`}>{m.count} {ts.trainings}</span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                      style={{ width: `${Math.min((m.count / maxTrainings) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!data.players?.length ? (
            <div className={`${card} rounded-2xl p-10 text-center ${textSub}`}>{ts.noPlayers}</div>
          ) : (
            data.players.map((p) => (
              <div key={p._id} className={`${card} rounded-2xl p-4 flex items-center gap-3`}>
                <Avatar player={p} size="lg" dark={dark} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${textMain}`}>{p.firstName} {p.lastName}</p>
                  <p className={`text-xs ${textSub}`}>{p.position}</p>
                </div>
                <div className="flex gap-4 text-center flex-shrink-0">
                  <div>
                    <p className={`text-base font-bold ${textMain}`}>{p.stats?.goals || 0}</p>
                    <p className={`text-xs ${textSub}`}>{ts.goals}</p>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${textMain}`}>{p.stats?.assists || 0}</p>
                    <p className={`text-xs ${textSub}`}>{ts.assists}</p>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${textMain}`}>{p.stats?.trainingsAttended || 0}</p>
                    <p className={`text-xs ${textSub}`}>{ts.attended}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
