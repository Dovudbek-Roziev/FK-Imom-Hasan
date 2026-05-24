import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import adminApi from '../api/adminApi';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import { UserCog, Users, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const TABS = [
  { id: 'coach', label: 'Trener', Icon: UserCog },
  { id: 'player', label: 'Futbolchi', Icon: Users },
  { id: 'admin', label: 'Admin', Icon: Lock },
];

export default function Login() {
  const [tab, setTab] = useState('coach');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const switchTab = (t) => { setTab(t); setError(''); };

  const handleCoachLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/coach/login', { email, password });
      login(data.token, 'coach', data.coach);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email yoki parol noto\'g\'ri.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/player/login', { accessCode: code });
      login(data.token, 'player', data.player);
      navigate('/player/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Kod noto\'g\'ri yoki topilmadi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('adminKey', adminKey);
      await adminApi.get('/admin/stats');
      navigate('/admin');
    } catch {
      localStorage.removeItem('adminKey');
      setError('Noto\'g\'ri admin kalit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-4 bg-white/10 rounded-3xl backdrop-blur-sm ring-1 ring-white/20 shadow-2xl">
            <img src={logo} alt="Imom Hasan FK" className="w-20 h-20 object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight"> FK Imom Hasan</h1>
          <p className="text-blue-300 mt-1 text-sm">Futbol klubi boshqaruv tizimi</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/50">
          {/* Tabs */}
          <div className="flex bg-slate-50 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex-1 py-4 text-xs font-semibold transition-all flex flex-col items-center gap-1.5 ${
                  tab === t.id
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <t.Icon size={18} strokeWidth={1.75} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-7">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} strokeWidth={2} className="flex-shrink-0" /> {error}
              </div>
            )}

            {tab === 'coach' && (
              <form onSubmit={handleCoachLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email manzil</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trener@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 bg-slate-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parol</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 bg-slate-50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-blue-600/30 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Kirish...
                    </span>
                  ) : 'Kirish'}
                </button>
              </form>
            )}

            {tab === 'player' && (
              <form onSubmit={handlePlayerLogin} className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={32} strokeWidth={1.5} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Treneringiz bergan 6 xonali kodni kiriting</p>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    required
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-center text-3xl tracking-[0.5em] font-bold bg-slate-50 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Tekshirilmoqda...
                    </span>
                  ) : 'Kirish'}
                </button>
              </form>
            )}

            {tab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} strokeWidth={1.5} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Faqat tizim administratori uchun</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin kaliti</label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Maxfiy kalit..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-800 placeholder-slate-400 bg-slate-50 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !adminKey}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-slate-800/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Tekshirilmoqda...
                    </span>
                  ) : 'Admin kirish'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-blue-300/50 text-xs mt-6">© 2025 Imom Hasan FK</p>
      </div>
    </div>
  );
}
