import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Trophy } from 'lucide-react';

export default function PlayerMatches() {
  const { dark, t } = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const tm = t.playerMatches;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.get('/matches/my')
      .then(r => setMatches(r.data.matches || []))
      .catch(e => toast(e?.response?.data?.message || tm.error))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = matches.filter(m => m.status === 'upcoming' && new Date(m.date) >= now);
  const past = matches.filter(m => m.status !== 'upcoming' || new Date(m.date) < now);
  const items = tab === 'upcoming' ? upcoming : past;

  const matchResult = (m) => {
    if (m.status !== 'completed') return null;
    if (m.scoreUs > m.scoreThem) return 'win';
    if (m.scoreUs < m.scoreThem) return 'lose';
    return 'draw';
  };

  const myLineup = (m) => m.lineup?.find(l => {
    const pid = l.player?._id || l.player;
    return pid?.toString() === user?.id?.toString();
  });

  const venueLabel = (v) => ({ home: tm.home, away: tm.away, neutral: tm.neutral })[v] || v;
  const venueColor = (v) => {
    if (v === 'home') return dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700';
    if (v === 'away') return dark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-700';
    return dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600';
  };

  const resultLabel = (r) => ({ win: tm.win, lose: tm.lose, draw: tm.draw })[r] || '';
  const resultColor = (r) => {
    if (r === 'win') return dark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-700';
    if (r === 'lose') return dark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700';
    return dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600';
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4 max-w-lg pb-8">
      <h1 className={`text-xl font-bold ${textMain}`}>{tm.title}</h1>

      {/* Tabs */}
      <div className={`flex rounded-2xl p-1 gap-1 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[{ val: 'upcoming', label: tm.upcoming }, { val: 'past', label: tm.past }].map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === val
              ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
              : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
            }`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${card} rounded-2xl p-12 text-center`}>
          <Trophy size={28} className={`mx-auto mb-3 ${textSub}`} strokeWidth={1.5} />
          <p className={`text-sm ${textSub}`}>{tab === 'upcoming' ? tm.noUpcoming : tm.noPast}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(m => {
            const res = matchResult(m);
            const my = myLineup(m);
            const dateObj = new Date(m.date);

            return (
              <div key={m._id} className={`${card} rounded-2xl p-4`}>
                <div className="flex items-start gap-3">
                  {/* Date block */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <span className={`text-lg font-bold leading-none ${textMain}`}>{dateObj.getDate()}</span>
                    <span className={`text-xs mt-0.5 ${textSub}`}>{dateObj.toLocaleDateString('default', { month: 'short' })}</span>
                    {m.time && <span className={`text-xs mt-0.5 ${textSub}`}>{m.time}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base leading-tight ${textMain}`}>
                      FK Imom Hasan <span className={textSub}>vs</span> {m.opponent}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${venueColor(m.venue)}`}>{venueLabel(m.venue)}</span>
                      {m.competition && <span className={`text-xs ${textSub}`}>{m.competition}</span>}
                    </div>
                    {m.location && <p className={`text-xs mt-1 ${textSub}`}>{m.location}</p>}

                    {/* Completed match result */}
                    {m.status === 'completed' && (
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <span className={`text-2xl font-bold ${textMain}`}>{m.scoreUs}</span>
                          <span className={textSub}>:</span>
                          <span className={`text-2xl font-bold ${textMain}`}>{m.scoreThem}</span>
                        </div>
                        {res && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${resultColor(res)}`}>{resultLabel(res)}</span>}
                      </div>
                    )}

                    {/* My stats if in lineup */}
                    {my && (my.goals > 0 || my.assists > 0) && (
                      <div className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <span className={`text-xs font-semibold ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{tm.myStats}:</span>
                        {my.goals > 0 && <span className="text-xs font-bold">{my.goals}⚽</span>}
                        {my.assists > 0 && <span className="text-xs font-bold">{my.assists}🎯</span>}
                      </div>
                    )}

                    {/* Scorers */}
                    {m.status === 'completed' && m.lineup?.some(l => l.goals > 0) && (
                      <div className="mt-2">
                        <p className={`text-xs ${textSub}`}>
                          ⚽ {m.lineup.filter(l => l.goals > 0).map(l => `${l.player?.firstName || ''} ${l.player?.lastName || ''} (${l.goals})`).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
