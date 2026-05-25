import { useEffect, useState } from 'react';
import api from '../../api';
import { X, Plus, Clock, MapPin, Users, Repeat } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const UZ_DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const ATT_VALUES = ['keldi', 'kech_keldi', 'kelmadi', 'sababli'];
const ATT_ACTIVE = {
  keldi:      { dark: 'bg-green-500/20 text-green-400 border-green-500/40 ring-green-500/40',   light: 'bg-green-100 text-green-700 border-green-300 ring-green-400/40' },
  kech_keldi: { dark: 'bg-orange-500/20 text-orange-400 border-orange-500/40 ring-orange-500/40', light: 'bg-orange-100 text-orange-700 border-orange-300 ring-orange-400/40' },
  kelmadi:    { dark: 'bg-red-500/20 text-red-400 border-red-500/40 ring-red-500/40',          light: 'bg-red-100 text-red-700 border-red-300 ring-red-400/40' },
  sababli:    { dark: 'bg-slate-500/20 text-slate-300 border-slate-500/40 ring-slate-500/40',  light: 'bg-slate-100 text-slate-600 border-slate-300 ring-slate-400/40' },
};

function Modal({ title, onClose, children }) {
  const { dark } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <h3 className={`font-semibold ${dark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`p-1.5 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function AttendanceModal({ training, onClose, onSaved }) {
  const { dark, t } = useTheme();
  const tt = t.trainings;
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
    } catch {
      setError(tt.error);
    } finally {
      setSaving(false);
    }
  };

  const numInp = `w-full px-2 py-2 rounded-xl border text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 ${
    dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  }`;

  return (
    <div className="space-y-4">
      <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{tt.attenDesc(training.title)}</p>
      {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-xl">{error}</p>}

      {rows.length === 0 ? (
        <p className={`text-sm text-center py-10 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{tt.noPlayers}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div key={r.playerId} className={`rounded-2xl p-4 ${dark ? 'bg-slate-800 ring-1 ring-white/5' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-slate-800'}`}>{r.name}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {ATT_VALUES.map((val) => {
                  const isActive = r.status === val;
                  const c = ATT_ACTIVE[val];
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update(idx, 'status', val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isActive
                          ? `${dark ? c.dark : c.light} ring-2`
                          : dark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {tt.attOptions[val]}
                    </button>
                  );
                })}
              </div>
              {(r.status === 'keldi' || r.status === 'kech_keldi') && (
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(tt.attFields).map(([field, label]) => (
                    <div key={field}>
                      <label className={`text-xs block mb-1 text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
                      <input
                        type="number"
                        min={field === 'rating' ? 1 : 0}
                        step={field === 'distance' ? 0.1 : 1}
                        max={field === 'rating' ? 10 : undefined}
                        value={r[field]}
                        onChange={(e) => update(idx, field, e.target.value)}
                        className={numInp}
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
          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-60 transition-colors ${
            dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {saving ? tt.saving : tt.save}
        </button>
        <button
          type="button" onClick={() => handleSave(true)} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {saving ? tt.saving : tt.finish}
        </button>
      </div>
    </div>
  );
}

function TrainingForm({ editItem, teams, onSave, onCancel }) {
  const { dark, t } = useTheme();
  const tt = t.trainings;
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

  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
    dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
  }`;
  const lbl = `block text-sm font-medium mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`;

  const toggleDay = (day) =>
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recurring && form.days.length === 0) { setError(tt.selectDay); return; }
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
        <label className={lbl}>{tt.trainingName}</label>
        <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder={tt.trainingNamePlaceholder} />
      </div>

      <div>
        <label className={lbl}>{tt.team}</label>
        <select className={inp} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
          <option value="">{tt.allPlayers}</option>
          {teams.map((tm) => <option key={tm._id} value={tm._id}>{tm.name}</option>)}
        </select>
      </div>

      <div>
        <label className={lbl}>{tt.trainingType}</label>
        <div className={`flex rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          {[false, true].map((isRec) => (
            <button
              key={String(isRec)}
              type="button"
              onClick={() => setRecurring(isRec)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                recurring === isRec
                  ? 'bg-blue-600 text-white'
                  : dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRec ? tt.recurring : tt.oneTime}
            </button>
          ))}
        </div>
      </div>

      {!recurring ? (
        <div>
          <label className={lbl}>{tt.date}</label>
          <input className={inp} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
      ) : (
        <div>
          <label className={lbl}>{tt.weekDays}</label>
          <div className="flex flex-wrap gap-2">
            {UZ_DAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  form.days.includes(day)
                    ? 'bg-blue-600 text-white border-transparent'
                    : dark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {tt.days[i]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>{tt.startTime}</label>
          <input className={inp} type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>{tt.endTime}</label>
          <input className={inp} type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={lbl}>{tt.location}</label>
        <input className={inp} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={tt.locationPlaceholder} />
      </div>

      <div>
        <label className={lbl}>{tt.notes}</label>
        <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={tt.notesPlaceholder} />
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

export default function Trainings() {
  const { dark, t } = useTheme();
  const tt = t.trainings;

  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [attendanceTraining, setAttendanceTraining] = useState(null);
  const [teamFilter, setTeamFilter] = useState('');

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  const getStatusColor = (s) => {
    if (s === 'rejalashtirilgan') return dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
    if (s === 'tugallangan') return dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    if (s === 'bekor_qilindi') return dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
    return dark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600';
  };
  const getStatusLabel = (s) => {
    if (s === 'rejalashtirilgan') return tt.statusPlanned;
    if (s === 'tugallangan') return tt.statusDone;
    if (s === 'bekor_qilindi') return tt.statusCancelled;
    return s;
  };

  const load = () => {
    setLoading(true);
    const params = teamFilter ? `?team=${teamFilter}` : '';
    Promise.all([api.get(`/trainings${params}`), api.get('/teams')])
      .then(([tr, tm]) => {
        setTrainings(tr.data.trainings || []);
        setTeams(tm.data.teams || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [teamFilter]);

  const handleSaved = () => { setShowAdd(false); setEditItem(null); load(); };
  const handleDelete = async () => {
    try { await api.delete(`/trainings/${deleteId}`); } catch {}
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textMain}`}>{tt.title}</h1>
          <p className={`text-sm ${textSub}`}>{tt.count(trainings.length)}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2} /> {tt.addBtn}
        </button>
      </div>

      {teams.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTeamFilter('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              teamFilter === ''
                ? 'bg-blue-600 text-white border-transparent'
                : dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {tt.all}
          </button>
          {teams.map((tm) => (
            <button
              key={tm._id}
              onClick={() => setTeamFilter(tm._id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                teamFilter === tm._id ? 'text-white border-transparent' : dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={teamFilter === tm._id ? { backgroundColor: tm.color } : {}}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tm.color }} />
              {tm.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trainings.length === 0 ? (
        <div className={`${card} rounded-2xl p-10 text-center ${textSub}`}>{tt.noTrainings}</div>
      ) : (
        <div className="space-y-3">
          {trainings.map((tr) => {
            const isRec = tr.days && tr.days.length > 0;
            return (
              <div key={tr._id} className={`${card} rounded-2xl p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isRec ? dark ? 'bg-purple-500/20' : 'bg-purple-50' : dark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    {isRec ? (
                      <Repeat size={20} strokeWidth={1.75} className={dark ? 'text-purple-400' : 'text-purple-600'} />
                    ) : (
                      <span className={`text-xs font-bold text-center leading-tight ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {tr.date ? new Date(tr.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : '—'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${textMain}`}>{tr.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(tr.status)}`}>
                        {getStatusLabel(tr.status)}
                      </span>
                      {isRec && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                          {tt.recurringBadge}
                        </span>
                      )}
                    </div>

                    {tr.team && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tr.team.color }} />
                        <span className={`text-xs font-medium ${textSub}`}>{tr.team.name}</span>
                      </div>
                    )}

                    {isRec && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {UZ_DAYS.map((day) => (
                          <span
                            key={day}
                            className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                              tr.days.includes(day)
                                ? 'bg-purple-600 text-white'
                                : dark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {tt.dayShort[day]}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`flex items-center gap-3 mt-1.5 text-xs flex-wrap ${textSub}`}>
                      {tr.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} strokeWidth={2} />
                          {tr.startTime}{tr.endTime ? ` – ${tr.endTime}` : ''}
                        </span>
                      )}
                      {tr.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} strokeWidth={2} />
                          {tr.location}
                        </span>
                      )}
                      {tr.attendance?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={11} strokeWidth={2} />
                          {tr.attendance.filter((a) => a.status === 'keldi' || a.status === 'kech_keldi').length}/{tr.attendance.length}
                        </span>
                      )}
                    </div>
                    {tr.notes && <p className={`text-xs mt-1 truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{tr.notes}</p>}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {tr.status !== 'tugallangan' && (
                    <button
                      onClick={() => setAttendanceTraining(tr)}
                      className={`flex-1 py-2 text-xs rounded-xl font-medium border transition-colors ${dark ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}
                    >
                      {tt.attendanceBtn}
                    </button>
                  )}
                  <button
                    onClick={() => setEditItem(tr)}
                    className={`flex-1 py-2 text-xs rounded-xl border font-medium transition-colors ${dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {tt.editBtn}
                  </button>
                  <button
                    onClick={() => setDeleteId(tr._id)}
                    className={`flex-1 py-2 text-xs rounded-xl border font-medium transition-colors ${dark ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                  >
                    {tt.deleteBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title={tt.addTitle} onClose={() => setShowAdd(false)}>
          <TrainingForm editItem={null} teams={teams} onSave={handleSaved} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {editItem && (
        <Modal title={tt.editTitle} onClose={() => setEditItem(null)}>
          <TrainingForm editItem={editItem} teams={teams} onSave={handleSaved} onCancel={() => setEditItem(null)} />
        </Modal>
      )}
      {attendanceTraining && (
        <Modal title={tt.attendanceTitle} onClose={() => setAttendanceTraining(null)}>
          <AttendanceModal training={attendanceTraining} onClose={() => setAttendanceTraining(null)} onSaved={load} />
        </Modal>
      )}
      {deleteId && (
        <Modal title={tt.deleteTitle} onClose={() => setDeleteId(null)}>
          <p className={`mb-5 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tt.deleteConfirm}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>{tt.cancel}</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">{tt.deleteBtn}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
