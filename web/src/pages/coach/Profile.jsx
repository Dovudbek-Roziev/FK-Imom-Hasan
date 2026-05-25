import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api, { photoUrl } from '../../api';
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';

export default function CoachProfile() {
  const { user, logout } = useAuth();
  const { dark, t } = useTheme();
  const navigate = useNavigate();
  const tp = t.profile;

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passOk, setPassOk] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);

  const [payInfo, setPayInfo] = useState({ cardNumber: '', whatsappNumber: '', monthlyFee: '' });
  const [payInfoSaving, setPayInfoSaving] = useState(false);
  const [payInfoMsg, setPayInfoMsg] = useState('');
  const [payOk, setPayOk] = useState(false);
  const [showPayInfo, setShowPayInfo] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      if (r.data?.coach) {
        const c = r.data.coach;
        setPayInfo({ cardNumber: c.cardNumber || '', whatsappNumber: c.whatsappNumber || '', monthlyFee: c.monthlyFee || '' });
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) { setPassOk(false); setPassMsg(tp.passNoMatch); return; }
    if (passForm.next.length < 6) { setPassOk(false); setPassMsg(tp.passShort); return; }
    setPassSaving(true);
    setPassMsg('');
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.current, newPassword: passForm.next });
      setPassOk(true);
      setPassMsg(tp.passChanged);
      setPassForm({ current: '', next: '', confirm: '' });
      setShowPassForm(false);
    } catch (err) {
      setPassOk(false);
      setPassMsg(err.response?.data?.message || tp.error);
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
        monthlyFee: Number(payInfo.monthlyFee) || 0,
      });
      setPayOk(true);
      setPayInfoMsg(tp.saved);
    } catch {
      setPayOk(false);
      setPayInfoMsg(tp.error);
    } finally {
      setPayInfoSaving(false);
    }
  };

  const sub = user?.subscription;
  const isSubActive = sub?.isActive && sub?.endDate && new Date(sub.endDate) > new Date();
  const planLabel = t.subscription.plans[sub?.plan]?.label || t.subscription.plans.free.label;

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`;
  const lbl = `block text-xs font-medium mb-1 ${dark ? 'text-slate-500' : 'text-slate-600'}`;

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className={`text-xl font-bold ${textMain}`}>{tp.title}</h1>

      {/* Profile card */}
      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className={`h-20 ${dark ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-3">
            {user?.photo ? (
              <img src={photoUrl(user.photo)} alt="" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 flex-shrink-0" />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ring-4 flex-shrink-0 ${dark ? 'bg-blue-600 text-white ring-slate-900' : 'bg-blue-600 text-white ring-white'}`}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="pb-1">
              <h2 className={`text-base font-bold ${textMain}`}>{user?.firstName} {user?.lastName}</h2>
              <p className={`text-xs ${textSub}`}>{user?.email}</p>
            </div>
          </div>
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{tp.coach}</span>
        </div>
      </div>

      {/* Subscription */}
      <div className={`${card} rounded-2xl p-5`}>
        <h3 className={`text-sm font-semibold mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{tp.subscription}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-semibold ${textMain}`}>{planLabel}</p>
            {isSubActive && sub?.endDate && (
              <p className={`text-xs mt-0.5 ${textSub}`}>{tp.expires} {new Date(sub.endDate).toLocaleDateString('uz-UZ')}</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${isSubActive ? dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            {isSubActive ? tp.active : tp.inactive}
          </span>
        </div>
      </div>

      {/* Payment info */}
      <div className={`${card} rounded-2xl p-5`}>
        <button
          onClick={() => { setShowPayInfo(!showPayInfo); setPayInfoMsg(''); }}
          className="w-full flex items-center justify-between"
        >
          <h3 className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{tp.payInfo}</h3>
          {showPayInfo
            ? <ChevronUp size={16} className={textSub} />
            : <ChevronDown size={16} className={textSub} />}
        </button>

        <div className={`mt-3 space-y-1 text-xs ${textSub}`}>
          {payInfo.cardNumber
            ? <p>{tp.cardNumber}: <span className={`font-mono font-semibold ${textMain}`}>{payInfo.cardNumber}</span></p>
            : <p className="text-orange-500">{tp.noCard}</p>}
          {payInfo.whatsappNumber
            ? <p>{tp.whatsapp}: <span className={`font-semibold ${textMain}`}>{payInfo.whatsappNumber}</span></p>
            : <p className="text-orange-500">{tp.noWhatsapp}</p>}
          {payInfo.monthlyFee
            ? <p>{tp.monthlyFee}: <span className={`font-semibold ${textMain}`}>{Number(payInfo.monthlyFee).toLocaleString()} {tp.currency}</span></p>
            : <p className="text-orange-500">{tp.noFee}</p>}
        </div>

        {payInfoMsg && (
          <p className={`text-xs mt-3 p-2.5 rounded-xl ${payOk ? dark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700' : dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
            {payInfoMsg}
          </p>
        )}

        {showPayInfo && (
          <form onSubmit={handleSavePayInfo} className="space-y-3 mt-4">
            <div>
              <label className={lbl}>{tp.cardLabel}</label>
              <input type="text" inputMode="numeric" placeholder={tp.cardPlaceholder} value={payInfo.cardNumber} onChange={(e) => setPayInfo({ ...payInfo, cardNumber: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>{tp.waLabel}</label>
              <input type="text" inputMode="tel" placeholder={tp.waPlaceholder} value={payInfo.whatsappNumber} onChange={(e) => setPayInfo({ ...payInfo, whatsappNumber: e.target.value })} className={inp} />
              <p className={`text-xs mt-1 ${textSub}`}>{tp.waHint}</p>
            </div>
            <div>
              <label className={lbl}>{tp.feeLabel}</label>
              <input type="number" placeholder={tp.feePlaceholder} value={payInfo.monthlyFee} onChange={(e) => setPayInfo({ ...payInfo, monthlyFee: e.target.value })} className={inp} />
            </div>
            <button type="submit" disabled={payInfoSaving} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {payInfoSaving ? tp.saving : tp.save}
            </button>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className={`${card} rounded-2xl p-5`}>
        <button
          onClick={() => { setShowPassForm(!showPassForm); setPassMsg(''); }}
          className="w-full flex items-center justify-between"
        >
          <h3 className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{tp.changePass}</h3>
          {showPassForm
            ? <ChevronUp size={16} className={textSub} />
            : <ChevronDown size={16} className={textSub} />}
        </button>

        {passMsg && (
          <p className={`text-xs mt-3 p-2.5 rounded-xl ${passOk ? dark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700' : dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
            {passMsg}
          </p>
        )}

        {showPassForm && (
          <form onSubmit={handleChangePassword} className="space-y-3 mt-4">
            <input type="password" placeholder={tp.currentPass} value={passForm.current} onChange={(e) => setPassForm({ ...passForm, current: e.target.value })} required className={inp} />
            <input type="password" placeholder={tp.newPass} value={passForm.next} onChange={(e) => setPassForm({ ...passForm, next: e.target.value })} required className={inp} />
            <input type="password" placeholder={tp.confirmPass} value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} required className={inp} />
            <button type="submit" disabled={passSaving} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {passSaving ? tp.saving : tp.save}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={`w-full py-3 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${dark ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
      >
        <LogOut size={16} strokeWidth={1.75} /> {tp.logout}
      </button>
    </div>
  );
}
