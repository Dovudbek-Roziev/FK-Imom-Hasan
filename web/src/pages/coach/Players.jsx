import { useEffect, useRef, useState } from 'react';
import api, { photoUrl } from '../../api';
import { useTheme } from '../../context/ThemeContext';

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

function PlayerForm({ editPlayer, onSave, onCancel }) {
  const { dark, t } = useTheme();
  const tp = t.players;
  const [form, setForm] = useState({
    firstName: editPlayer?.firstName || '',
    lastName: editPlayer?.lastName || '',
    dateOfBirth: editPlayer?.dateOfBirth ? editPlayer.dateOfBirth.split('T')[0] : '',
    position: editPlayer?.position || 'goalkeeper',
    healthStatus: editPlayer?.healthStatus || 'healthy',
    notes: editPlayer?.notes || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(editPlayer?.photo ? photoUrl(editPlayer.photo) : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
    dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  }`;
  const lbl = `block text-sm font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-700'}`;

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      if (editPlayer) {
        await api.put(`/players/${editPlayer._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/players', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSave();
    } catch {
      setError(tp.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => fileRef.current.click()}
          className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed transition-colors ${
            dark ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-slate-100 border-slate-300 hover:border-blue-400'
          }`}
        >
          {photoPreview
            ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            : <span className={`text-3xl ${dark ? 'text-slate-600' : 'text-slate-300'}`}>+</span>
          }
        </div>
        <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{tp.photoLabel}</span>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>{tp.firstName}</label>
          <input className={inp} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required placeholder={tp.firstName} />
        </div>
        <div>
          <label className={lbl}>{tp.lastName}</label>
          <input className={inp} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required placeholder={tp.lastName} />
        </div>
      </div>

      <div>
        <label className={lbl}>{tp.birthDate}</label>
        <input className={inp} type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>{tp.position}</label>
          <select className={inp} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
            {Object.entries(tp.positions).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{tp.health}</label>
          <select className={inp} value={form.healthStatus} onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}>
            {Object.entries(tp.healthStatuses).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>{tp.notes}</label>
        <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={tp.notesPlaceholder} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {tp.cancel}
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? tp.saving : tp.save}
        </button>
      </div>
    </form>
  );
}

export default function Players() {
  const { dark, t } = useTheme();
  const tp = t.players;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  const getHealthColor = (val) => {
    const colors = {
      healthy: dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      injured: dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
      sick: dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      resting: dark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600',
    };
    return colors[val] || (dark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600');
  };

  const load = () => {
    setLoading(true);
    api.get('/players')
      .then((r) => setPlayers(r.data.players || []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    setShowAdd(false);
    setEditPlayer(null);
    load();
  };

  const handleDelete = async () => {
    try { await api.delete(`/players/${deleteId}`); } catch {}
    setDeleteId(null);
    load();
  };

  const filtered = players.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textMain}`}>{tp.title}</h1>
          <p className={`text-sm ${textSub}`}>{tp.count(players.length)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span>+</span> {tp.addBtn}
        </button>
      </div>

      <input
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          dark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 ring-1 ring-white/10' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
        }`}
        placeholder={tp.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} rounded-2xl p-10 text-center ${textSub}`}>
          {search ? tp.noResult : tp.noPlayers}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className={`${card} rounded-2xl p-4 flex items-start gap-3`}>
              {p.photo ? (
                <img src={photoUrl(p.photo)} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${dark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${textMain}`}>{p.firstName} {p.lastName}</p>
                <p className={`text-xs ${textSub}`}>{tp.positions[p.position] || p.position} · {p.age} {tp.yosh}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${getHealthColor(p.healthStatus)}`}>
                  {tp.healthStatuses[p.healthStatus] || p.healthStatus}
                </span>
                {p.team && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.team.color }} />
                    <span className={`text-xs font-medium ${textSub}`}>{p.team.name}</span>
                  </div>
                )}
                <p className="text-xs text-blue-500 font-mono mt-1 font-semibold">{tp.code}: {p.accessCode}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditPlayer(p)} className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {tp.editBtn}
                  </button>
                  <button onClick={() => setDeleteId(p._id)} className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${dark ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                    {tp.deleteBtn}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title={tp.addTitle} onClose={() => setShowAdd(false)}>
          <PlayerForm editPlayer={null} onSave={handleSaved} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {editPlayer && (
        <Modal title={tp.editTitle} onClose={() => setEditPlayer(null)}>
          <PlayerForm editPlayer={editPlayer} onSave={handleSaved} onCancel={() => setEditPlayer(null)} />
        </Modal>
      )}
      {deleteId && (
        <Modal title={tp.deleteTitle} onClose={() => setDeleteId(null)}>
          <p className={`mb-5 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tp.deleteConfirm}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>{tp.cancel}</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">{tp.deleteBtn}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
