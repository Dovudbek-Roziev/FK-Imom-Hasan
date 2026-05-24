import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { photoUrl } from '../../api';

const planLabels = { free: 'Bepul (30 ta limit)', premium_5: 'Premium $5', premium_10: 'Premium Pro $10' };

export default function CoachProfile() {
  const { user, role, login, logout } = useAuth();
  const navigate = useNavigate();

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [showPassForm, setShowPassForm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      setPassMsg('Yangi parollar mos kelmayapdi.');
      return;
    }
    if (passForm.next.length < 6) {
      setPassMsg("Parol kamida 6 ta belgi bo'lishi kerak.");
      return;
    }
    setPassSaving(true);
    setPassMsg('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.current,
        newPassword: passForm.next,
      });
      setPassMsg('Parol muvaffaqiyatli o\'zgartirildi!');
      setPassForm({ current: '', next: '', confirm: '' });
      setShowPassForm(false);
    } catch (err) {
      setPassMsg(err.response?.data?.message || 'Xato yuz berdi.');
    } finally {
      setPassSaving(false);
    }
  };

  const sub = user?.subscription;
  const isSubActive = sub?.isActive && sub?.endDate && new Date(sub.endDate) > new Date();

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-slate-800">Profil</h1>

      {/* Coach card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.photo ? (
            <img src={photoUrl(user.photo)} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Trener</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Obuna</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800">{planLabels[sub?.plan] || "Bepul"}</p>
            {isSubActive && sub?.endDate && (
              <p className="text-xs text-slate-500 mt-0.5">
                Amal qilish muddati: {new Date(sub.endDate).toLocaleDateString('uz-UZ')}
              </p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isSubActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {isSubActive ? 'Faol' : 'Faol emas'}
          </span>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Parolni o'zgartirish</h3>
          <button
            onClick={() => { setShowPassForm(!showPassForm); setPassMsg(''); }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            {showPassForm ? 'Yopish' : "O'zgartirish"}
          </button>
        </div>

        {passMsg && (
          <p className={`text-xs mb-3 p-2 rounded-lg ${passMsg.includes('muvaffaqiyatli') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {passMsg}
          </p>
        )}

        {showPassForm && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Joriy parol"
              value={passForm.current}
              onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              placeholder="Yangi parol"
              value={passForm.next}
              onChange={(e) => setPassForm({ ...passForm, next: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              placeholder="Yangi parolni tasdiqlang"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={passSaving}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {passSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
      >
        🚪 Chiqish
      </button>
    </div>
  );
}
