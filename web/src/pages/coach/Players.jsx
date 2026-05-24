import { useEffect, useRef, useState } from 'react';
import api, { photoUrl } from '../../api';

const POSITIONS = [
  { value: 'goalkeeper', label: 'Darvozabon' },
  { value: 'defender', label: 'Himoyachi' },
  { value: 'midfielder', label: 'Yarim himoyachi' },
  { value: 'forward', label: 'Hujumchi' },
];

const HEALTH = [
  { value: 'healthy', label: "Sog'lom" },
  { value: 'injured', label: 'Jarohat' },
  { value: 'sick', label: 'Kasal' },
  { value: 'resting', label: 'Dam olmoqda' },
];

const posLabel = (val) => POSITIONS.find((p) => p.value === val)?.label || val;
const healthLabel = (val) => HEALTH.find((h) => h.value === val)?.label || val;
const healthColor = {
  healthy: 'bg-green-100 text-green-700',
  injured: 'bg-red-100 text-red-700',
  sick: 'bg-orange-100 text-orange-700',
  resting: 'bg-slate-100 text-slate-600',
};

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

function PlayerForm({ editPlayer, onSave, onCancel }) {
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
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

      {/* Rasm */}
      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => fileRef.current.click()}
          className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
        >
          {photoPreview
            ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            : <span className="text-3xl text-slate-300">+</span>
          }
        </div>
        <span className="text-xs text-slate-400">Rasm yuklash (ixtiyoriy)</span>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ism</label>
          <input className="inp" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required placeholder="Ism" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Familiya</label>
          <input className="inp" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required placeholder="Familiya" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tug'ilgan sana</label>
        <input className="inp" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lavozim</label>
          <select className="inp" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {editPlayer && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sog'liq</label>
            <select className="inp" value={form.healthStatus} onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}>
              {HEALTH.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Izoh (ixtiyoriy)</label>
        <textarea className="inp resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Qo'shimcha ma'lumot..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">
          Bekor
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

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
          <h1 className="text-xl font-bold text-slate-800">Futbolchilar</h1>
          <p className="text-slate-500 text-sm">{players.length} ta futbolchi</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span>+</span> Qo'shish
        </button>
      </div>

      <input
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
          {search ? 'Natija topilmadi' : "Futbolchilar yo'q"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
              {p.photo ? (
                <img src={photoUrl(p.photo)} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{p.firstName} {p.lastName}</p>
                <p className="text-xs text-slate-500">{posLabel(p.position)} · {p.age} yosh</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${healthColor[p.healthStatus] || 'bg-slate-100 text-slate-600'}`}>
                  {healthLabel(p.healthStatus)}
                </span>
                {p.team && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.team.color }} />
                    <span className="text-xs text-slate-500 font-medium">{p.team.name}</span>
                  </div>
                )}
                <p className="text-xs text-blue-600 font-mono mt-1 font-semibold">Kod: {p.accessCode}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditPlayer(p)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                    Tahrirlash
                  </button>
                  <button onClick={() => setDeleteId(p._id)} className="flex-1 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Futbolchi qo'shish" onClose={() => setShowAdd(false)}>
          <PlayerForm editPlayer={null} onSave={handleSaved} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {editPlayer && (
        <Modal title="Futbolchini tahrirlash" onClose={() => setEditPlayer(null)}>
          <PlayerForm editPlayer={editPlayer} onSave={handleSaved} onCancel={() => setEditPlayer(null)} />
        </Modal>
      )}
      {deleteId && (
        <Modal title="O'chirishni tasdiqlang" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 mb-5">Bu futbolchini o'chirishni istaysizmi?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Bekor</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">O'chirish</button>
          </div>
        </Modal>
      )}

      <style>{`.inp { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; color: #1e293b; background: white; box-sizing: border-box; } .inp:focus { border-color: #3b82f6; }`}</style>
    </div>
  );
}
