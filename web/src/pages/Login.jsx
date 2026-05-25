import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import adminApi from '../api/adminApi';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import { UserCog, Users, Lock, Eye, EyeOff, AlertCircle, Sun, Moon } from 'lucide-react';

const translations = {
  uz: {
    subtitle: "Futbol klubi boshqaruv tizimi",
    back: '← Bosh sahifa',
    tabs: ['Trener', 'Futbolchi', 'Admin'],
    coachEmail: 'Email manzil',
    coachEmailPlaceholder: 'trener@email.com',
    coachPassword: 'Parol',
    coachPasswordPlaceholder: '••••••••',
    loginBtn: 'Kirish',
    loggingIn: 'Kirish...',
    checking: 'Tekshirilmoqda...',
    playerDesc: "Treneringiz bergan 6 xonali kodni kiriting",
    playerPlaceholder: '• • • • • •',
    adminDesc: 'Faqat tizim administratori uchun',
    adminKey: 'Admin kaliti',
    adminKeyPlaceholder: 'Maxfiy kalit...',
    adminBtn: 'Admin kirish',
    errorCoach: "Email yoki parol noto'g'ri.",
    errorPlayer: "Kod noto'g'ri yoki topilmadi.",
    errorAdmin: "Noto'g'ri admin kalit.",
    copy: '© 2026 Imom Hasan FK',
    dev: 'Dasturchi: Dovudbek Roziev',
    helpCoach: "Parolni unutdingizmi?",
    helpCoachSub: "Administrator bilan bog'laning",
    helpPlayer: "Kodni yo'qotdingizmi?",
    helpPlayerSub: "Treneringizga murojaat qiling",
    helpPhone: "Telefon:",
  },
  ru: {
    subtitle: 'Система управления футбольным клубом',
    back: '← Главная',
    tabs: ['Тренер', 'Игрок', 'Админ'],
    coachEmail: 'Email адрес',
    coachEmailPlaceholder: 'trener@email.com',
    coachPassword: 'Пароль',
    coachPasswordPlaceholder: '••••••••',
    loginBtn: 'Войти',
    loggingIn: 'Вход...',
    checking: 'Проверяется...',
    playerDesc: 'Введите 6-значный код от тренера',
    playerPlaceholder: '• • • • • •',
    adminDesc: 'Только для системного администратора',
    adminKey: 'Ключ администратора',
    adminKeyPlaceholder: 'Секретный ключ...',
    adminBtn: 'Войти как Админ',
    errorCoach: 'Неверный email или пароль.',
    errorPlayer: 'Неверный или несуществующий код.',
    errorAdmin: 'Неверный ключ администратора.',
    copy: '© 2026 Имом Хасан ФК',
    dev: 'Разработчик: Довудбек Розиев',
    helpCoach: "Забыли пароль?",
    helpCoachSub: "Свяжитесь с администратором",
    helpPlayer: "Потеряли код?",
    helpPlayerSub: "Обратитесь к тренеру",
    helpPhone: "Телефон:",
  },
};

export default function Login() {
  const [tab, setTab] = useState('coach');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState('uz');

  const { login } = useAuth();
  const navigate = useNavigate();
  const t = translations[lang];

  const switchTab = (newTab) => { setTab(newTab); setError(''); };

  const handleCoachLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/coach/login', { email, password });
      login(data.token, 'coach', data.coach);
      navigate('/dashboard');
    } catch {
      setError(t.errorCoach);
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
    } catch {
      setError(t.errorPlayer);
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
      setError(t.errorAdmin);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'coach', label: t.tabs[0], Icon: UserCog },
    { id: 'player', label: t.tabs[1], Icon: Users },
    { id: 'admin', label: t.tabs[2], Icon: Lock },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 transition-colors duration-500 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes logo-glow {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(59,130,246,0.55)) drop-shadow(0 0 28px rgba(99,102,241,0.3)); }
          50% { filter: drop-shadow(0 0 28px rgba(59,130,246,0.9)) drop-shadow(0 0 52px rgba(139,92,246,0.45)); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ animation: 'orb-float 12s ease-in-out infinite' }}
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${dark ? 'bg-blue-600/25' : 'bg-blue-400/15'}`} />
        <div style={{ animation: 'orb-float 18s ease-in-out infinite reverse' }}
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl ${dark ? 'bg-indigo-600/25' : 'bg-indigo-400/15'}`} />
        <div style={{ animation: 'orb-float 22s ease-in-out infinite' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl ${dark ? 'bg-cyan-500/10' : 'bg-cyan-400/10'}`} />
        {/* Grid pattern */}
        <div
          className={`absolute inset-0 ${dark ? 'opacity-[0.04]' : 'opacity-[0.06]'}`}
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50" style={{ animation: 'fade-in 0.5s ease both' }}>
        <button
          onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            dark
              ? 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {lang === 'uz' ? 'РУС' : 'UZB'}
        </button>
        <button
          onClick={() => setDark(!dark)}
          className={`p-2 rounded-xl transition-all border ${
            dark
              ? 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Top-left back button */}
      <div className="fixed top-4 left-4 z-50" style={{ animation: 'fade-in 0.5s ease both' }}>
        <button
          onClick={() => navigate('/')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
            dark
              ? 'bg-white/10 border-white/15 text-white/70 hover:text-white hover:bg-white/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {t.back}
        </button>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10" style={{ animation: 'card-in 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img
              src={logo}
              alt="FK Imom Hasan"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              style={{ animation: 'logo-glow 3s ease-in-out infinite' }}
            />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors duration-300 ${dark ? 'text-white' : 'text-slate-900'}`}>
            FK Imom Hasan
          </h1>
          <p className={`mt-1.5 text-sm transition-colors duration-300 ${dark ? 'text-blue-300/80' : 'text-slate-500'}`}>
            {t.subtitle}
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ring-1 transition-colors duration-300 ${
          dark ? 'bg-slate-900/80 ring-white/10 backdrop-blur-xl' : 'bg-white ring-slate-200'
        }`}>
          {/* Tabs */}
          <div className={`flex border-b transition-colors duration-300 ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => switchTab(tabItem.id)}
                className={`flex-1 py-4 text-xs font-semibold transition-all flex flex-col items-center gap-1.5 ${
                  tab === tabItem.id
                    ? dark
                      ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                      : 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : dark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <tabItem.Icon size={18} strokeWidth={1.75} />
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} strokeWidth={2} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Coach form */}
            {tab === 'coach' && (
              <form onSubmit={handleCoachLogin} className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t.coachEmail}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.coachEmailPlaceholder}
                    required
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm ${
                      dark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t.coachPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.coachPasswordPlaceholder}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm ${
                        dark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                        dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-blue-600/30 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.loggingIn}
                    </span>
                  ) : t.loginBtn}
                </button>
              </form>
            )}

            {/* Player form */}
            {tab === 'player' && (
              <form onSubmit={handlePlayerLogin} className="space-y-4">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                    <Users size={32} strokeWidth={1.5} className="text-blue-500" />
                  </div>
                  <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t.playerDesc}</p>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t.playerPlaceholder}
                  maxLength={6}
                  required
                  className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:border-blue-500 text-center text-3xl tracking-[0.5em] font-bold transition ${
                    dark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.checking}
                    </span>
                  ) : t.loginBtn}
                </button>
              </form>
            )}

            {/* Admin form */}
            {tab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-slate-700/80' : 'bg-slate-100'}`}>
                    <Lock size={32} strokeWidth={1.5} className={dark ? 'text-slate-300' : 'text-slate-600'} />
                  </div>
                  <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t.adminDesc}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t.adminKey}
                  </label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder={t.adminKeyPlaceholder}
                    required
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition text-sm ${
                      dark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !adminKey}
                  className={`w-full py-3.5 font-bold rounded-xl transition-all disabled:opacity-60 shadow-lg ${
                    dark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/50'
                      : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/30'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.checking}
                    </span>
                  ) : t.adminBtn}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Help block */}
        {tab !== 'admin' && (
          <div className={`mt-4 rounded-2xl px-5 py-4 flex items-start gap-3 ring-1 transition-colors duration-300 ${
            dark ? 'bg-slate-900/60 ring-white/8 backdrop-blur-md' : 'bg-white ring-slate-200'
          }`}>
            <div className={`mt-0.5 w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-base ${
              dark ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              {tab === 'player' ? '🔑' : '🔒'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                {tab === 'player' ? t.helpPlayer : t.helpCoach}
              </p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {tab === 'player' ? t.helpPlayerSub : t.helpCoachSub}
              </p>
              <a
                href="tel:+996554454653"
                className={`inline-flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${
                  dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                📞 {t.helpPhone} +996 554 454 653
              </a>
            </div>
          </div>
        )}

        <div className={`text-center text-xs mt-4 space-y-1 transition-colors duration-300 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          <p>{t.dev}</p>
          <p>{t.copy}</p>
        </div>
      </div>
    </div>
  );
}
