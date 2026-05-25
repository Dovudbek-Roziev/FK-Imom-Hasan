import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { photoUrl } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { Users, Calendar, TrendingUp, AlertCircle, Dumbbell, Trophy } from 'lucide-react';

function StatCard({ Icon, label, value, color, iconColor, dark }) {
  return (
    <div className={`rounded-2xl p-5 transition-colors ${dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm'}`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${color}`}>
        <Icon size={20} strokeWidth={1.75} className={iconColor} />
      </div>
      <p className={`text-sm mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{value ?? '—'}</p>
    </div>
  );
}

export default function Dashboard() {
  const { dark, t } = useTheme();
  const td = t.dashboard;
  const [stats, setStats] = useState(null);
  const [incomeStats, setIncomeStats] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const MONTHS = td.months || ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

  useEffect(() => {
    Promise.all([
      api.get('/stats/dashboard'),
      api.get('/payments/income-stats'),
      api.get('/stats/team'),
    ]).then(([s, inc, team]) => {
      setStats(s.data.stats || null);
      const monthly = (inc.data.monthlyIncome || []).map((item) => ({
        month: MONTHS[item._id.month] || item._id.month,
        total: item.total,
      }));
      setIncomeStats(monthly);
      const players = team.data.players || [];
      const sorted = [...players].sort((a, b) => {
        const scoreA = (a.stats?.goals || 0) * 2 + (a.stats?.assists || 0) + (a.stats?.trainingsAttended || 0);
        const scoreB = (b.stats?.goals || 0) * 2 + (b.stats?.assists || 0) + (b.stats?.trainingsAttended || 0);
        return scoreB - scoreA;
      }).slice(0, 10);
      setTopPlayers(sorted);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusLabel = {
    tugallangan: td.statusDone,
    bekor_qilindi: td.statusCancelled,
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const gridLine = dark ? '#334155' : '#f1f5f9';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const recentTrainings = stats?.recentTrainings || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${textMain}`}>{td.title}</h1>
        <p className={`text-sm mt-0.5 ${textSub}`}>{td.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard dark={dark} Icon={Users} label={td.players} value={stats?.totalPlayers}
          color={dark ? 'bg-blue-600/20' : 'bg-blue-100'} iconColor="text-blue-500" />
        <StatCard dark={dark} Icon={Calendar} label={td.todayTraining}
          value={stats?.todayTraining ? td.hasTraining : td.noTraining}
          color={dark ? 'bg-green-600/20' : 'bg-green-100'} iconColor="text-green-500" />
        <StatCard dark={dark} Icon={TrendingUp} label={td.income}
          value={stats?.totalIncome ? stats.totalIncome.toLocaleString() + ` ${td.currency}` : '0'}
          color={dark ? 'bg-emerald-600/20' : 'bg-emerald-100'} iconColor="text-emerald-500" />
        <StatCard dark={dark} Icon={AlertCircle} label={td.debtors} value={stats?.debtorCount ?? 0}
          color={dark ? 'bg-orange-600/20' : 'bg-orange-100'} iconColor="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-5 ${card}`}>
          <h2 className={`text-sm font-semibold mb-4 ${textMain}`}>{td.incomeChart}</h2>
          {incomeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={incomeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: dark ? '#1e293b' : '#fff', borderColor: dark ? '#334155' : '#e2e8f0', color: dark ? '#f1f5f9' : '#1e293b' }}
                  formatter={(v) => v.toLocaleString('uz-UZ') + ` ${td.currency}`}
                />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-40 text-sm ${textSub}`}>{td.noData}</div>
          )}
        </div>

        <div className={`rounded-2xl p-5 ${card}`}>
          <h2 className={`text-sm font-semibold mb-4 ${textMain}`}>{td.recentTrainings}</h2>
          {recentTrainings.length > 0 ? (
            <div className="space-y-3">
              {recentTrainings.map((tr) => (
                <div key={tr._id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-600/20' : 'bg-blue-50'}`}>
                    <Dumbbell size={18} strokeWidth={1.75} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${textMain}`}>{tr.title}</p>
                    <p className={`text-xs ${textSub}`}>{tr.date ? new Date(tr.date).toLocaleDateString('uz-UZ') : '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tr.status === 'tugallangan' ? 'bg-green-500/20 text-green-400' :
                    tr.status === 'bekor_qilindi' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {statusLabel[tr.status] || td.statusPlanned}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex items-center justify-center h-40 text-sm ${textSub}`}>{td.noTrainings}</div>
          )}
        </div>
      </div>

      {topPlayers.length > 0 && (
        <div className={`rounded-2xl p-5 ${card}`}>
          <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textMain}`}>
            <Trophy size={16} strokeWidth={1.75} className="text-yellow-500" /> {td.topPlayers}
          </h2>
          <div className="space-y-3">
            {topPlayers.map((p, idx) => {
              const score = (p.stats?.goals || 0) * 2 + (p.stats?.assists || 0) + (p.stats?.trainingsAttended || 0);
              return (
                <div key={p._id} className="flex items-center gap-3">
                  <span className={`w-6 text-center text-xs font-bold flex-shrink-0 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : textSub}`}>
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
                    <p className={`text-sm font-medium truncate ${textMain}`}>{p.firstName} {p.lastName}</p>
                    <div className={`flex items-center gap-2 text-xs ${textSub}`}>
                      <span>{p.position}</span>
                      {p.team && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: p.team.color }} />
                            {p.team.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className={`text-sm font-bold ${textMain}`}>{score} {td.ball}</p>
                    <p className={`text-xs ${textSub}`}>
                      {p.stats?.goals || 0}G · {p.stats?.assists || 0}A · {p.stats?.trainingsAttended || 0}T
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`text-xs mt-3 text-center ${textSub}`}>{td.scoreFormula}</p>
        </div>
      )}
    </div>
  );
}
