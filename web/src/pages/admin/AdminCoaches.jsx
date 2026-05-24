import { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

const PLANS = [
  { value: 'free', label: 'Bepul', color: 'bg-slate-100 text-slate-600' },
  { value: 'premium_5', label: 'Premium 5', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'premium_10', label: 'Premium 10', color: 'bg-orange-100 text-orange-700' },
];

const planLabel = (plan) => PLANS.find((p) => p.value === plan)?.label || plan;
const planColor = (plan) => PLANS.find((p) => p.value === plan)?.color || 'bg-slate-100 text-slate-600';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function CreateCoachForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/coaches', form);
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input className="inp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="trener@email.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Parol</label>
        <input className="inp" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Kamida 6 belgi" minLength={6} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Bekor</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Yaratilmoqda...' : 'Yaratish'}
        </button>
      </div>
    </form>
  );
}

function GrantPremiumForm({ coach, onSave, onCancel }) {
  const [plan, setPlan] = useState('premium_5');
  const [months, setMonths] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/premium/grant', { coachId: coach._id, plan, months });
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
      <p className="text-sm text-slate-600">
        <strong>{coach.firstName} {coach.lastName}</strong> ga premium berish
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Plan tanlang</label>
        <div className="space-y-2">
          {PLANS.filter((p) => p.value !== 'free').map((p) => (
            <label key={p.value} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input type="radio" name="plan" value={p.value} checked={plan === p.value} onChange={() => setPlan(p.value)} />
              <span className="text-sm font-medium text-slate-700">{p.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Muddat (oy)</label>
        <select className="inp" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          {[1, 2, 3, 6, 12].map((m) => (
            <option key={m} value={m}>{m} oy</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Bekor</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white font-medium text-sm hover:bg-yellow-600 disabled:opacity-60">
          {saving ? 'Berilmoqda...' : 'Premium berish'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ coach, onSave, onCancel }) {
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.put(`/admin/coaches/${coach._id}/password`, { newPassword });
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
      <p className="text-sm text-slate-600">
        <strong>{coach.firstName} {coach.lastName}</strong> parolini yangilash
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Yangi parol</label>
        <input className="inp" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Kamida 6 belgi" minLength={6} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Bekor</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [grantCoach, setGrantCoach] = useState(null);
  const [passwordCoach, setPasswordCoach] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [deleteCoach, setDeleteCoach] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.get('/admin/coaches')
      .then((r) => setCoaches(r.data.coaches || []))
      .catch(() => setCoaches([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (coach) => {
    setTogglingId(coach._id);
    try {
      await adminApi.put(`/admin/coaches/${coach._id}/toggle`);
      load();
    } catch {}
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deleteCoach) return;
    setDeletingId(deleteCoach._id);
    try {
      await adminApi.delete(`/admin/coaches/${deleteCoach._id}`);
      setDeleteCoach(null);
      load();
    } catch {}
    setDeletingId(null);
  };

  const handleRevoke = async (coachId) => {
    setRevokingId(coachId);
    try {
      await adminApi.delete(`/admin/premium/${coachId}`);
      load();
    } catch {}
    setRevokingId(null);
  };

  const filtered = coaches.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Trenerlar</h1>
          <p className="text-slate-500 text-sm">{coaches.length} ta trener</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span>+</span> Yangi trener
        </button>
      </div>

      <input
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Qidirish (ism, email)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((coach) => (
            <div key={coach._id} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${coach.isActive ? 'border-green-400' : 'border-red-400'}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                  {coach.firstName?.[0]}{coach.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{coach.firstName} {coach.lastName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColor(coach.subscription?.plan)}`}>
                      {planLabel(coach.subscription?.plan || 'free')}
                    </span>
                    {!coach.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Bloklangan</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{coach.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{coach.playerCount || 0} ta futbolchi</p>

                  {coach.subscription?.plan !== 'free' && coach.subscription?.endDate && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Muddati: {new Date(coach.subscription.endDate).toLocaleDateString('uz-UZ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setGrantCoach(coach)}
                  className="px-3 py-2 text-xs rounded-lg bg-yellow-100 text-yellow-700 font-medium hover:bg-yellow-200 text-center"
                >
                  ⭐ Premium
                </button>
                {coach.subscription?.plan !== 'free' && (
                  <button
                    onClick={() => handleRevoke(coach._id)}
                    disabled={revokingId === coach._id}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 disabled:opacity-60 text-center"
                  >
                    Premium bekor
                  </button>
                )}
                <button
                  onClick={() => setPasswordCoach(coach)}
                  className="px-3 py-2 text-xs rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 text-center"
                >
                  🔑 Parol
                </button>
                <button
                  onClick={() => handleToggle(coach)}
                  disabled={togglingId === coach._id}
                  className={`px-3 py-2 text-xs rounded-lg font-medium disabled:opacity-60 text-center ${
                    coach.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {coach.isActive ? '🚫 Bloklash' : '✅ Faol'}
                </button>
                <button
                  onClick={() => setDeleteCoach(coach)}
                  className="px-3 py-2 text-xs rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 text-center"
                >
                  🗑️ O'chirish
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
              {search ? 'Natija topilmadi' : "Trenerlar yo'q"}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <Modal title="Yangi trener yaratish" onClose={() => setShowCreate(false)}>
          <CreateCoachForm onSave={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {grantCoach && (
        <Modal title="Premium berish" onClose={() => setGrantCoach(null)}>
          <GrantPremiumForm coach={grantCoach} onSave={() => { setGrantCoach(null); load(); }} onCancel={() => setGrantCoach(null)} />
        </Modal>
      )}
      {passwordCoach && (
        <Modal title="Parolni yangilash" onClose={() => setPasswordCoach(null)}>
          <PasswordForm coach={passwordCoach} onSave={() => { setPasswordCoach(null); load(); }} onCancel={() => setPasswordCoach(null)} />
        </Modal>
      )}
      {deleteCoach && (
        <Modal title="Trenerni o'chirish" onClose={() => setDeleteCoach(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <strong>{deleteCoach.firstName} {deleteCoach.lastName}</strong> va uning barcha futbolchilari o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteCoach(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Bekor</button>
              <button onClick={handleDelete} disabled={!!deletingId} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-60">
                {deletingId ? 'O\'chirilmoqda...' : 'O\'chirish'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`.inp { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; color: #1e293b; background: white; box-sizing: border-box; } .inp:focus { border-color: #3b82f6; }`}</style>
    </div>
  );
}
