import { useEffect, useState } from 'react';
import api, { photoUrl } from '../../api';

const MONTHS = ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function Avatar({ player, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  if (player?.photo) {
    return <img src={photoUrl(player.photo)} alt="" className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0`}>
      {player?.firstName?.[0]}{player?.lastName?.[0]}
    </div>
  );
}

function TopList({ title, players, valueKey, suffix = '', icon }) {
  if (!players?.length) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{icon} {title}</h3>
      <div className="space-y-3">
        {players.map((p, i) => (
          <div key={p._id} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
            <Avatar player={p} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{p.firstName} {p.lastName}</p>
              <p className="text-xs text-slate-400">{p.position}</p>
            </div>
            <span className="text-sm font-bold text-blue-600">{p.stats?.[valueKey] || 0}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('top');

  useEffect(() => {
    api.get('/stats/team')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxTrainings = data?.monthlyTrainings?.length
    ? Math.max(...data.monthlyTrainings.map((m) => m.count), 1)
    : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Jamoa statistikasi</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm print:hidden"
        >
          🖨️ Chop etish
        </button>
      </div>

      <div className="flex gap-2">
        {[['top', 'Top ro\'yxat'], ['monthly', 'Oylik'], ['players', 'Hammasi']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === val ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
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
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">Ma'lumot yo'q</div>
      ) : tab === 'top' ? (
        <div className="space-y-4">
          <TopList title="Top golchilar" players={data.topScorers} valueKey="goals" suffix=" gol" icon="⚽" />
          <TopList title="Top assistlar" players={data.topAssists} valueKey="assists" suffix=" assist" icon="🎯" />
          <TopList title="Eng ko'p kelgan" players={data.topAttendance} valueKey="trainingsAttended" suffix=" ta" icon="📅" />
        </div>
      ) : tab === 'monthly' ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">📊 Oylik mashg'ulotlar</h3>
          {data.monthlyTrainings?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Ma'lumot yo'q</p>
          ) : (
            <div className="space-y-3">
              {data.monthlyTrainings?.map((m) => (
                <div key={`${m._id.year}-${m._id.month}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{MONTHS[m._id.month]} {m._id.year}</span>
                    <span className="font-semibold text-slate-800">{m.count} ta mashg'ulot</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
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
          {data.players?.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">Futbolchilar yo'q</div>
          ) : (
            data.players?.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <Avatar player={p} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-slate-400">{p.position}</p>
                </div>
                <div className="flex gap-4 text-center flex-shrink-0">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.stats?.goals || 0}</p>
                    <p className="text-xs text-slate-400">Gol</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.stats?.assists || 0}</p>
                    <p className="text-xs text-slate-400">Assist</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.stats?.trainingsAttended || 0}</p>
                    <p className="text-xs text-slate-400">Kelgan</p>
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
