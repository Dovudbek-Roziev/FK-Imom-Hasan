import { useEffect, useState } from 'react';
import api, { photoUrl } from '../../api';
import { useTheme } from '../../context/ThemeContext';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

function Modal({ title, onClose, children }) {
  const { dark } = useTheme();
  const bg = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white';
  const border = dark ? 'border-slate-700/60' : 'border-slate-200';
  const titleCls = dark ? 'text-white' : 'text-slate-800';
  const closeCls = dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${bg} rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <h3 className={`font-semibold ${titleCls}`}>{title}</h3>
          <button onClick={onClose} className={`${closeCls} text-xl`}>✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function TeamForm({ editTeam, onSave, onCancel }) {
  const { dark, t } = useTheme();
  const tt = t.teams;
  const [form, setForm] = useState({
    name: editTeam?.name || '',
    description: editTeam?.description || '',
    color: editTeam?.color || '#3b82f6',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
    dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  }`;
  const lbl = `block text-sm font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-700'}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editTeam) {
        await api.put(`/teams/${editTeam._id}`, form);
      } else {
        await api.post('/teams', form);
      }
      onSave();
    } catch {
      setError(tt.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

      <div>
        <label className={lbl}>{tt.name}</label>
        <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={tt.namePlaceholder} />
      </div>

      <div>
        <label className={lbl}>{tt.description}</label>
        <input className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={tt.descPlaceholder} />
      </div>

      <div>
        <label className={lbl}>{tt.color}</label>
        <div className="flex flex-wrap gap-3 mt-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-9 h-9 rounded-full transition-all ${
                form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className={`rounded-xl overflow-hidden border ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="h-1.5" style={{ backgroundColor: form.color }} />
        <div className={`p-3 flex items-center gap-2 ${dark ? 'bg-slate-800' : ''}`}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
          <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{form.name || tt.previewName}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {tt.cancel}
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? tt.saving : tt.save}
        </button>
      </div>
    </form>
  );
}

export default function Teams() {
  const { dark, t } = useTheme();
  const tt = t.teams;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const rowBg = dark ? 'bg-slate-800' : 'bg-slate-50';
  const sectionLabel = dark ? 'text-slate-500' : 'text-slate-400';

  const loadTeams = () => {
    setLoading(true);
    api.get('/teams')
      .then((r) => setTeams(r.data.teams || []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTeams(); }, []);

  const handleSaved = () => {
    setShowForm(false);
    setEditTeam(null);
    loadTeams();
  };

  const handleDelete = async () => {
    try { await api.delete(`/teams/${deleteId}`); } catch {}
    setDeleteId(null);
    loadTeams();
  };

  const openAssign = async (team) => {
    setAssignModal(team);
    setAssignLoading(true);
    try {
      const r = await api.get('/players');
      setAllPlayers(r.data.players || []);
    } catch {
      setAllPlayers([]);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (playerId, teamId) => {
    try {
      await api.post('/teams/assign', { playerId, teamId });
      setAllPlayers((prev) =>
        prev.map((p) =>
          p._id === playerId ? { ...p, team: teamId ? { _id: teamId } : null } : p
        )
      );
      loadTeams();
    } catch {}
  };

  const playersInTeam = (teamId) => allPlayers.filter((p) => p.team?._id === teamId);
  const unassignedPlayers = allPlayers.filter((p) => !p.team);
  const otherTeamPlayers = (teamId) => allPlayers.filter((p) => p.team && p.team._id !== teamId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textMain}`}>{tt.title}</h1>
          <p className={`text-sm ${textSub}`}>{tt.count(teams.length)}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span>+</span> {tt.addBtn}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className={`${card} rounded-2xl p-12 text-center`}>
          <p className="text-5xl mb-3">🏃</p>
          <p className={`font-semibold ${textMain}`}>{tt.noTeams}</p>
          <p className={`text-sm mt-1 ${textSub}`}>{tt.noTeamsSub}</p>
          <button onClick={() => setShowForm(true)} className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            {tt.firstTeam}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team._id} className={`${card} rounded-2xl overflow-hidden`}>
              <div className="h-2" style={{ backgroundColor: team.color }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: team.color + '25', color: team.color }}
                  >
                    {team.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold leading-tight ${textMain}`}>{team.name}</h3>
                    {team.description && (
                      <p className={`text-xs mt-0.5 truncate ${textSub}`}>{team.description}</p>
                    )}
                  </div>
                </div>

                <div
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl mb-4 font-medium"
                  style={{ backgroundColor: team.color + '18', color: team.color }}
                >
                  <span>👥</span>
                  <span>{team.playerCount} {tt.players}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAssign(team)}
                    className="flex-1 py-2 text-xs rounded-xl font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: team.color }}
                  >
                    {tt.manageBtn}
                  </button>
                  <button
                    onClick={() => setEditTeam(team)}
                    className={`px-3 py-2 text-xs rounded-xl border font-medium ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {tt.editBtn}
                  </button>
                  <button
                    onClick={() => setDeleteId(team._id)}
                    className={`px-3 py-2 text-xs rounded-xl border font-medium ${dark ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                  >
                    {tt.deleteBtn}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={tt.addTitle} onClose={() => setShowForm(false)}>
          <TeamForm editTeam={null} onSave={handleSaved} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editTeam && (
        <Modal title={tt.editTitle} onClose={() => setEditTeam(null)}>
          <TeamForm editTeam={editTeam} onSave={handleSaved} onCancel={() => setEditTeam(null)} />
        </Modal>
      )}

      {deleteId && (
        <Modal title={tt.deleteTitle} onClose={() => setDeleteId(null)}>
          <p className={`mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tt.deleteConfirm}</p>
          <p className={`text-sm mb-5 ${textSub}`}>{tt.deleteNote}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>{tt.cancel}</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">{tt.deleteBtn}</button>
          </div>
        </Modal>
      )}

      {assignModal && (
        <Modal
          title={`${assignModal.name} — ${t.nav.players}`}
          onClose={() => { setAssignModal(null); setAllPlayers([]); }}
        >
          {assignLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sectionLabel}`}>
                  {tt.inTeam(playersInTeam(assignModal._id).length)}
                </p>
                {playersInTeam(assignModal._id).length === 0 ? (
                  <p className={`text-sm text-center py-4 rounded-xl ${dark ? 'text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-50'}`}>
                    {tt.noInTeam}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {playersInTeam(assignModal._id).map((p) => (
                      <div key={p._id} className={`flex items-center gap-3 p-2.5 rounded-xl ${rowBg}`}>
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: assignModal.color }}>
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${textMain}`}>{p.firstName} {p.lastName}</p>
                          <p className={`text-xs ${textSub}`}>{p.position}</p>
                        </div>
                        <button onClick={() => handleAssign(p._id, null)} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${dark ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                          {tt.removeBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {unassignedPlayers.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sectionLabel}`}>
                    {tt.unassigned(unassignedPlayers.length)}
                  </p>
                  <div className="space-y-2">
                    {unassignedPlayers.map((p) => (
                      <div key={p._id} className={`flex items-center gap-3 p-2.5 rounded-xl ${rowBg}`}>
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${textMain}`}>{p.firstName} {p.lastName}</p>
                          <p className={`text-xs ${textSub}`}>{p.position}</p>
                        </div>
                        <button onClick={() => handleAssign(p._id, assignModal._id)} className="text-xs px-2.5 py-1 rounded-lg text-white font-medium hover:opacity-90" style={{ backgroundColor: assignModal.color }}>
                          {tt.addToTeamBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherTeamPlayers(assignModal._id).length > 0 && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sectionLabel}`}>
                    {tt.otherTeam(otherTeamPlayers(assignModal._id).length)}
                  </p>
                  <div className="space-y-2">
                    {otherTeamPlayers(assignModal._id).map((p) => (
                      <div key={p._id} className={`flex items-center gap-3 p-2.5 rounded-xl ${rowBg}`}>
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${textMain}`}>{p.firstName} {p.lastName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.team?.color || '#94a3b8' }} />
                            <p className={`text-xs ${textSub}`}>{p.team?.name}</p>
                          </div>
                        </div>
                        <button onClick={() => handleAssign(p._id, assignModal._id)} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          {tt.moveBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
