import { useEffect, useState } from 'react';
import api, { photoUrl } from '../../api';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function TeamForm({ editTeam, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: editTeam?.name || '',
    description: editTeam?.description || '',
    color: editTeam?.color || '#3b82f6',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Jamoa nomi</label>
        <input
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="Masalan: Asosiy jamoa, U-14, B-guruh..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tavsif (ixtiyoriy)</label>
        <input
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Jamoa haqida qisqacha..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Rang</label>
        <div className="flex flex-wrap gap-3">
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

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-slate-100">
        <div className="h-1.5" style={{ backgroundColor: form.color }} />
        <div className="p-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
          <span className="text-sm font-medium text-slate-700">{form.name || 'Jamoa nomi'}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50"
        >
          Bekor
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

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
          p._id === playerId
            ? { ...p, team: teamId ? { _id: teamId } : null }
            : p
        )
      );
      loadTeams();
    } catch {}
  };

  const playersInTeam = (teamId) =>
    allPlayers.filter((p) => p.team?._id === teamId);

  const unassignedPlayers = allPlayers.filter((p) => !p.team);

  const otherTeamPlayers = (teamId) =>
    allPlayers.filter((p) => p.team && p.team._id !== teamId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Jamoalar</h1>
          <p className="text-slate-500 text-sm">{teams.length} ta jamoa</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <span>+</span> Jamoa qo'shish
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-5xl mb-3">🏃</p>
          <p className="font-semibold text-slate-700">Hali jamoa yo'q</p>
          <p className="text-sm text-slate-400 mt-1">Yangi jamoa qo'shing va futbolchilarni birlang</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            Birinchi jamoani qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-2" style={{ backgroundColor: team.color }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: team.color + '20', color: team.color }}
                  >
                    {team.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 leading-tight">{team.name}</h3>
                    {team.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{team.description}</p>
                    )}
                  </div>
                </div>

                <div
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl mb-4 font-medium"
                  style={{ backgroundColor: team.color + '15', color: team.color }}
                >
                  <span>👥</span>
                  <span>{team.playerCount} ta futbolchi</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAssign(team)}
                    className="flex-1 py-2 text-xs rounded-xl font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: team.color }}
                  >
                    Boshqarish
                  </button>
                  <button
                    onClick={() => setEditTeam(team)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Tahrir
                  </button>
                  <button
                    onClick={() => setDeleteId(team._id)}
                    className="px-3 py-2 text-xs rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                  >
                    O'chir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Modal title="Yangi jamoa" onClose={() => setShowForm(false)}>
          <TeamForm editTeam={null} onSave={handleSaved} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editTeam && (
        <Modal title="Jamoani tahrirlash" onClose={() => setEditTeam(null)}>
          <TeamForm editTeam={editTeam} onSave={handleSaved} onCancel={() => setEditTeam(null)} />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="O'chirishni tasdiqlang" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 mb-1">Bu jamoani o'chirishni istaysizmi?</p>
          <p className="text-sm text-slate-400 mb-5">Futbolchilar jamoasiz qoladi, o'chirilmaydi.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
            >
              Bekor
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              O'chirish
            </button>
          </div>
        </Modal>
      )}

      {/* Assign players modal */}
      {assignModal && (
        <Modal
          title={`${assignModal.name} — Futbolchilar`}
          onClose={() => { setAssignModal(null); setAllPlayers([]); }}
        >
          {assignLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Players in this team */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Bu jamoada ({playersInTeam(assignModal._id).length})
                </p>
                {playersInTeam(assignModal._id).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                    Hali futbolchi yo'q
                  </p>
                ) : (
                  <div className="space-y-2">
                    {playersInTeam(assignModal._id).map((p) => (
                      <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: assignModal.color }}
                          >
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-400">{p.position}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(p._id, null)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                        >
                          Chiqar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unassigned players */}
              {unassignedPlayers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Jamoasiz ({unassignedPlayers.length})
                  </p>
                  <div className="space-y-2">
                    {unassignedPlayers.map((p) => (
                      <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-400">{p.position}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(p._id, assignModal._id)}
                          className="text-xs px-2.5 py-1 rounded-lg text-white font-medium hover:opacity-90"
                          style={{ backgroundColor: assignModal.color }}
                        >
                          Qo'shish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players in other teams */}
              {otherTeamPlayers(assignModal._id).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Boshqa jamoada ({otherTeamPlayers(assignModal._id).length})
                  </p>
                  <div className="space-y-2">
                    {otherTeamPlayers(assignModal._id).map((p) => (
                      <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                        {p.photo ? (
                          <img src={photoUrl(p.photo)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: p.team?.color || '#94a3b8' }}
                            />
                            <p className="text-xs text-slate-400">{p.team?.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssign(p._id, assignModal._id)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                        >
                          Ko'chir
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
