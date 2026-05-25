import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import {
  LayoutDashboard, Users, Shield, Dumbbell, CreditCard,
  BarChart2, Star, Settings, User, Calendar, Wallet, LogOut, Sun, Moon, Trophy,
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, role, logout } = useAuth();
  const { dark, setDark, lang, setLang, t } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const coachNav = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/players', label: t.nav.players, icon: Users },
    { to: '/teams', label: t.nav.teams, icon: Shield },
    { to: '/trainings', label: t.nav.trainings, icon: Dumbbell },
    { to: '/matches', label: t.nav.matches, icon: Trophy },
    { to: '/payments', label: t.nav.payments, icon: CreditCard },
    { to: '/stats', label: t.nav.stats, icon: BarChart2 },
    { to: '/subscription', label: t.nav.subscription, icon: Star },
    { to: '/profile', label: t.nav.profile, icon: Settings },
  ];

  const playerNav = [
    { to: '/player/home', label: t.nav.playerHome, icon: User },
    { to: '/player/trainings', label: t.nav.playerTrainings, icon: Calendar },
    { to: '/player/matches', label: t.nav.playerMatches, icon: Trophy },
    { to: '/player/payment', label: t.nav.playerPayment, icon: Wallet },
  ];

  const navItems = role === 'coach' ? coachNav : playerNav;
  const displayName = user ? `${user.firstName} ${user.lastName}` : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  const bg = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const activeLink = dark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white';
  const inactiveLink = dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100';
  const userBg = dark ? 'bg-slate-800' : 'bg-slate-50';

  const Sidebar = () => (
    <aside className={`flex flex-col h-full w-64 border-r ${bg} transition-colors duration-300`}>
      {/* Logo */}
      <div className={`px-5 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 flex-shrink-0 rounded-2xl overflow-hidden ring-2 ${dark ? 'ring-white/10' : 'ring-blue-100'}`}>
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className={`font-bold text-sm leading-tight ${textMain}`}>FK Imom Hasan</p>
            <p className={`text-xs mt-0.5 ${textSub}`}>{role === 'coach' ? t.nav.coachPanel : t.nav.playerPanel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? activeLink : inactiveLink}`
            }
          >
            <item.icon size={18} strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme + Lang controls */}
      <div className={`px-3 py-3 border-t ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
              dark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {lang === 'uz' ? 'РУС' : 'UZB'}
          </button>
          <button
            onClick={() => setDark(!dark)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border flex items-center justify-center gap-1.5 ${
              dark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {dark ? <><Sun size={14} /> Yorug'</> : <><Moon size={14} /> Qorong'u</>}
          </button>
        </div>

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 ${userBg}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${dark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
            {user?.firstName?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${textMain}`}>{displayName}</p>
            <p className={`text-xs ${textSub}`}>{role === 'coach' ? t.nav.trainer : t.nav.player}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-500 ${dark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
        >
          <LogOut size={18} strokeWidth={1.75} />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );

  const mainBg = dark ? 'bg-slate-950' : 'bg-slate-100';
  const topbarBg = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${mainBg}`}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className={`md:hidden flex items-center gap-3 px-4 py-3 border-b ${topbarBg} transition-colors duration-300`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className={`font-bold flex-1 ${textMain}`}>FK Imom Hasan</span>
          <button
            onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className={`px-2 py-1 rounded-lg text-xs font-bold border ${dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            {lang === 'uz' ? 'РУС' : 'UZB'}
          </button>
          <button
            onClick={() => setDark(!dark)}
            className={`p-1.5 rounded-lg ${dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
