import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { photoUrl } from '../../api';
import { LogOut } from 'lucide-react';

const planLabels = { free: 'Bepul (30 ta limit)', premium_5: 'Premium $5', premium_10: 'Premium Pro $10' };

export default function CoachProfile() {
  const { user, role, login, logout } = useAuth();
  const navigate = useNavigate();

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [showPassForm, setShowPassForm] = useState(false);

  const [payInfo, setPayInfo] = useState({ cardNumber: '', whatsappNumber: '', monthlyFee: '' });
  const [payInfoSaving, setPayInfoSaving] = useState(false);
  const [payInfoMsg, setPayInfoMsg] = useState('');
  const [showPayInfo, setShowPayInfo] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => {
      if (r.data?.coach) {
        const c = r.data.coach;
        setPayInfo({
          cardNumber: c.cardNumber || '',
          whatsappNumber: c.whatsappNumber || '',
          monthlyFee: c.monthlyFee || ''
        });
      }
    }).catch(() => {});
  }, []);

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

  const handleSavePayInfo = async (e) => {
    e.preventDefault();
    setPayInfoSaving(true);
    setPayInfoMsg('');
    try {
      await api.put('/auth/update-payment-info', {
        cardNumber: payInfo.cardNumber,
        whatsappNumber: payInfo.whatsappNumber,
        monthlyFee: Number(payInfo.monthlyFee) || 0
      });
      setPayInfoMsg('Saqlandi!');
    } catch {
      setPayInfoMsg('Xato yuz berdi.');
    } finally {
      setPayInfoSaving(false);
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

      {/* To'lov ma'lumotlari */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">To'lov ma'lumotlari</h3>
          <button
            onClick={() => { setShowPayInfo(!showPayInfo); setPayInfoMsg(''); }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            {showPayInfo ? 'Yopish' : "Ko'rish / O'zgartirish"}
          </button>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          {payInfo.cardNumber ? (
            <p>Karta: <span className="font-mono font-semibold text-slate-700">{payInfo.cardNumber}</span></p>
          ) : <p className="text-orange-500">Karta raqami kiritilmagan</p>}
          {payInfo.whatsappNumber ? (
            <p>WhatsApp: <span className="font-semibold text-slate-700">{payInfo.whatsappNumber}</span></p>
          ) : <p className="text-orange-500">WhatsApp raqami kiritilmagan</p>}
          {payInfo.monthlyFee ? (
            <p>Oylik to'lov: <span className="font-semibold text-slate-700">{Number(payInfo.monthlyFee).toLocaleString()} so'm</span></p>
          ) : <p className="text-orange-500">Oylik miqdor belgilanmagan</p>}
        </div>

        {payInfoMsg && (
          <p className={`text-xs mt-3 p-2 rounded-lg ${payInfoMsg === 'Saqlandi!' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {payInfoMsg}
          </p>
        )}

        {showPayInfo && (
          <form onSubmit={handleSavePayInfo} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bank karta raqami</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="8600 1234 5678 9012"
                value={payInfo.cardNumber}
                onChange={(e) => setPayInfo({ ...payInfo, cardNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp raqami</label>
              <input
                type="text"
                inputMode="tel"
                placeholder="+998901234567"
                value={payInfo.whatsappNumber}
                onChange={(e) => setPayInfo({ ...payInfo, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
              />
              <p className="text-xs text-slate-400 mt-1">Xalqaro format: +998901234567</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Oylik to'lov miqdori (so'm)</label>
              <input
                type="number"
                placeholder="500000"
                value={payInfo.monthlyFee}
                onChange={(e) => setPayInfo({ ...payInfo, monthlyFee: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={payInfoSaving}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {payInfoSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        )}
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
        className="w-full py-3 rounded-2xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={16} strokeWidth={1.75} /> Chiqish
      </button>
    </div>
  );
}
