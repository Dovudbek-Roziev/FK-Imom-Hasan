import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { photoUrl } from '../../api';
import { Users, Calendar, TrendingUp, AlertCircle, Dumbbell, Trophy } from 'lucide-react';

const MONTHS = ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function StatCard({ Icon, label, value, color, iconColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${color}`}>
        <Icon size={20} strokeWidth={1.75} className={iconColor} />
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incomeStats, setIncomeStats] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-xl font-bold text-slate-800">Bosh sahifa</h1>
        <p className="text-slate-500 text-sm mt-0.5">Umumiy ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard Icon={Users} label="Futbolchilar" value={stats?.totalPlayers} color="bg-blue-100" iconColor="text-blue-600" />
        <StatCard Icon={Calendar} label="Bugungi mashg'ulot" value={stats?.todayTraining ? 'Bor' : "Yo'q"} color="bg-green-100" iconColor="text-green-600" />
        <StatCard Icon={TrendingUp} label="Oylik daromad" value={stats?.totalIncome ? stats.totalIncome.toLocaleString() + " so'm" : '0'} color="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard Icon={AlertCircle} label="Qarzdorlar" value={stats?.debtorCount ?? 0} color="bg-orange-100" iconColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Oylik daromad (so'm)</h2>
          {incomeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={incomeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => v.toLocaleString('uz-UZ') + " so'm"} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Oxirgi mashg'ulotlar</h2>
          {recentTrainings.length > 0 ? (
            <div className="space-y-3">
              {recentTrainings.map((t) => (
                <div key={t._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} strokeWidth={1.75} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.date ? new Date(t.date).toLocaleDateString('uz-UZ') : '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    t.status === 'tugallangan' ? 'bg-green-100 text-green-700' :
                    t.status === 'bekor_qilindi' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {t.status === 'tugallangan' ? 'Tugagan' : t.status === 'bekor_qilindi' ? 'Bekor' : 'Rejalashtirilgan'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Mashg'ulotlar yo'q
            </div>
          )}
        </div>
      </div>

      {/* Top o'yinchilar */}
      {topPlayers.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Trophy size={16} strokeWidth={1.75} className="text-yellow-500" /> Top o'yinchilar
          </h2>
          <div className="space-y-3">
            {topPlayers.map((p, idx) => {
              const score = (p.stats?.goals || 0) * 2 + (p.stats?.assists || 0) + (p.stats?.trainingsAttended || 0);
              return (
                <div key={p._id} className="flex items-center gap-3">
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
                    <p className="text-sm font-medium text-slate-800 truncate">{p.firstName} {p.lastName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
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
                    <p className="text-sm font-bold text-slate-800">{score} ball</p>
                    <p className="text-xs text-slate-400">
                      {p.stats?.goals || 0}G · {p.stats?.assists || 0}A · {p.stats?.trainingsAttended || 0}T
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Ball = Gol×2 + Assist + Qatnashish soni</p>
        </div>
      )}
    </div>
  );
}
