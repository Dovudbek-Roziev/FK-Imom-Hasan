import { useEffect, useState } from 'react';
import api from '../../api';
import { X, Plus, Clock, MapPin, Users, Repeat, CalendarDays } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const statusLabel = { rejalashtirilgan: 'Rejalashtirilgan', tugallangan: 'Tugagan', bekor_qilindi: 'Bekor' };
const statusColor = { rejalashtirilgan: 'bg-blue-100 text-blue-700', tugallangan: 'bg-green-100 text-green-700', bekor_qilindi: 'bg-red-100 text-red-700' };
const attOptions = [
  { value: 'keldi', label: 'Keldi', color: 'bg-green-100 text-green-700' },
  { value: 'kech_keldi', label: 'Kech keldi', color: 'bg-orange-100 text-orange-700' },
  { value: 'kelmadi', label: 'Kelmadi', color: 'bg-red-100 text-red-700' },
  { value: 'sababli', label: 'Sababli', color: 'bg-slate-100 text-slate-600' },
];
const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const DAY_SHORT = { Dushanba: 'Du', Seshanba: 'Se', Chorshanba: 'Ch', Payshanba: 'Pa', Juma: 'Ju', Shanba: 'Sh', Yakshanba: 'Ya' };

function AttendanceModal({ training, onClose, onSaved }) {
  const [rows, setRows] = useState(
    (training.attendance || []).map((a) => ({
      playerId: a.player?._id || a.player,
      name: a.player?.firstName ? `${a.player.firstName} ${a.player.lastName}` : "Noma'lum",
      status: a.status || 'kelmadi',
      goals: a.goals || 0,
      assists: a.assists || 0,
      distance: a.distance || 0,
      rating: a.rating || '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (idx, field, val) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  const handleSave = async (finish) => {
    setSaving(true);
    setError('');
    try {
      const attendance = rows.map((r) => ({
        player: r.playerId,
        status: r.status,
        goals: Number(r.goals) || 0,
        assists: Number(r.assists) || 0,
        distance: Number(r.distance) || 0,
        rating: r.rating ? Number(r.rating) : null,
      }));
      await api.put(`/trainings/${training._id}`, {
        title: training.title,
        date: training.date,
        days: training.days || [],
        startTime: training.startTime,
        endTime: training.endTime,
        location: training.location,
        exercises: training.exercises || [],
        notes: training.notes,
        attendance,
        status: finish ? 'tugallangan' : training.status,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{training.title} — davomat belgilash</p>
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">Futbolchilar yo'q</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div key={r.playerId} className="border border-slate-100 rounded-xl p-3">
              <p className="font-medium text-slate-800 mb-2">{r.name}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {attOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update(idx, 'status', opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      r.status === opt.value
                        ? `${opt.color} border-transparent ring-2 ring-offset-1 ring-blue-400`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(r.status === 'keldi' || r.status === 'kech_keldi') && (
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[
                    { field: 'goals', label: 'Gol', min: 0, step: 1, max: undefined },
                    { field: 'assists', label: 'Assist', min: 0, step: 1, max: undefined },
                    { field: 'distance', label: 'km', min: 0, step: 0.1, max: undefined },
                    { field: 'rating', label: 'Baho', min: 1, step: 1, max: 10 },
                  ].map(({ field, label, min, step, max }) => (
                    <div key={field}>
                      <label className="text-xs text-slate-500 block mb-1 text-center">{label}</label>
                      <input
                        type="number" min={min} step={step} max={max}
                        value={r[field]}
                        onChange={(e) => update(idx, field, e.target.value)}
                        className="w-full px-1.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 text-center focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={() => handleSave(false)} disabled={saving}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
        <button
          type="button" onClick={() => handleSave(true)} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Saqlanmoqda...' : 'Tugallash ✓'}
        </button>
      </div>
    </div>
  );
}

function TrainingForm({ editItem, teams, onSave, onCancel }) {
  const isRecurring = editItem ? (editItem.days?.length > 0) : false;
  const [recurring, setRecurring] = useState(isRecurring);
  const now = new Date();
  const [form, setForm] = useState({
    title: editItem?.title || '',
    date: editItem?.date ? editItem.date.split('T')[0] : now.toISOString().split('T')[0],
    days: editItem?.days || [],
    startTime: editItem?.startTime || '10:00',
    endTime: editItem?.endTime || '12:00',
    location: editItem?.location || '',
    notes: editItem?.notes || '',
    team: editItem?.team?._id || editItem?.team || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recurring && form.days.length === 0) {
      setError("Kamida 1 ta kun tanlang.");
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        notes: form.notes,
        team: form.team || null,
        days: recurring ? form.days : [],
        date: recurring ? null : form.date,
      };
      if (editItem) {
        await api.put(`/trainings/${editItem._id}`, {
          ...payload,
          exercises: editItem.exercises || [],
          attendance: editItem.attendance,
          status: editItem.status,
        });
      } else {
        await api.post('/trainings', payload);
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
        <label className="lbl">Mashg'ulot nomi</label>
        <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Misol: Texnik mashq" />
      </div>

      <div>
        <label className="lbl">Jamoa (ixtiyoriy)</label>
        <select className="inp" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
          <option value="">Barcha futbolchilar</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Bir martalik / Doimiy toggle */}
      <div>
        <label className="lbl">Mashg'ulot turi</label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setRecurring(false)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!recurring ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Bir martalik
          </button>
          <button
            type="button"
            onClick={() => setRecurring(true)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${recurring ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Doimiy jadval
          </button>
        </div>
      </div>

      {!recurring ? (
        <div>
          <label className="lbl">Sana</label>
          <input className="inp" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
      ) : (
        <div>
          <label className="lbl">Hafta kunlari</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  form.days.includes(day)
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="lbl">Boshlanish vaqti</label>
          <input className="inp" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Tugash vaqti</label>
          <input className="inp" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="lbl">Joy</label>
        <input className="inp" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Stadion nomi" />
      </div>

      <div>
        <label className="lbl">Izoh</label>
        <textarea className="inp resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Qo'shimcha ma'lumot..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">
          Bekor
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [attendanceTraining, setAttendanceTraining] = useState(null);
  const [teamFilter, setTeamFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = teamFilter ? `?team=${teamFilter}` : '';
    Promise.all([
      api.get(`/trainings${params}`),
      api.get('/teams'),
    ]).then(([tr, tm]) => {
      setTrainings(tr.data.trainings || []);
      setTeams(tm.data.teams || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [teamFilter]);

  const handleSaved = () => {
    setShowAdd(false);
    setEditItem(null);
    load();
  };

  const handleDelete = async () => {
    try { await api.delete(`/trainings/${deleteId}`); } catch {}
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mashg'ulotlar</h1>
          <p className="text-slate-500 text-sm">{trainings.length} ta mashg'ulot</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <Plus size={16} strokeWidth={2} /> Qo'shish
        </button>
      </div>

      {/* Team filter */}
      {teams.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTeamFilter('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              teamFilter === '' ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Hammasi
          </button>
          {teams.map((t) => (
            <button
              key={t._id}
              onClick={() => setTeamFilter(t._id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                teamFilter === t._id ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={teamFilter === t._id ? { backgroundColor: t.color } : {}}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
          Mashg'ulotlar yo'q
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => {
            const isRecurring = t.days && t.days.length > 0;
            return (
              <div key={t._id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isRecurring ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    {isRecurring ? (
                      <Repeat size={18} strokeWidth={1.75} className="text-purple-600" />
                    ) : (
                      <span className="text-xs font-bold text-blue-600 text-center leading-tight">
                        {t.date ? new Date(t.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : '—'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{t.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabel[t.status] || t.status}
                      </span>
                      {isRecurring && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Doimiy</span>
                      )}
                    </div>

                    {t.team && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.team.color }} />
                        <span className="text-xs text-slate-500 font-medium">{t.team.name}</span>
                      </div>
                    )}

                    {/* Kunlar */}
                    {isRecurring && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {DAYS.map((day) => (
                          <span
                            key={day}
                            className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                              t.days.includes(day) ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {DAY_SHORT[day]}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {t.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} strokeWidth={2} />
                          {t.startTime}{t.endTime ? ` – ${t.endTime}` : ''}
                        </span>
                      )}
                      {t.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} strokeWidth={2} />
                          {t.location}
                        </span>
                      )}
                      {t.attendance?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={11} strokeWidth={2} />
                          {t.attendance.filter((a) => a.status === 'keldi' || a.status === 'kech_keldi').length}/{t.attendance.length}
                        </span>
                      )}
                    </div>
                    {t.notes && <p className="text-xs text-slate-400 mt-1 truncate">{t.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {t.status !== 'tugallangan' && (
                    <button
                      onClick={() => setAttendanceTraining(t)}
                      className="flex-1 py-2 text-xs rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 font-medium"
                    >
                      Davomat
                    </button>
                  )}
                  <button onClick={() => setEditItem(t)} className="flex-1 py-2 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                    Tahrirlash
                  </button>
                  <button onClick={() => setDeleteId(t._id)} className="flex-1 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                    O'chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Mashg'ulot qo'shish" onClose={() => setShowAdd(false)}>
          <TrainingForm editItem={null} teams={teams} onSave={handleSaved} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {editItem && (
        <Modal title="Mashg'ulotni tahrirlash" onClose={() => setEditItem(null)}>
          <TrainingForm editItem={editItem} teams={teams} onSave={handleSaved} onCancel={() => setEditItem(null)} />
        </Modal>
      )}
      {attendanceTraining && (
        <Modal title="Davomat belgilash" onClose={() => setAttendanceTraining(null)}>
          <AttendanceModal training={attendanceTraining} onClose={() => setAttendanceTraining(null)} onSaved={load} />
        </Modal>
      )}
      {deleteId && (
        <Modal title="O'chirishni tasdiqlang" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 mb-5">Bu mashg'ulotni o'chirishni istaysizmi?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Bekor</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">O'chirish</button>
          </div>
        </Modal>
      )}

      <style>{`.lbl { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 4px; } .inp { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; color: #1e293b; background: white; box-sizing: border-box; } .inp:focus { border-color: #3b82f6; }`}</style>
    </div>
  );
}
