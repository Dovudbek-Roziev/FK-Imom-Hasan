import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import {
  LayoutDashboard, Users, Shield, Dumbbell, CreditCard,
  BarChart2, Star, Settings, User, Calendar, Wallet, LogOut
} from 'lucide-react';

const coachNav = [
  { to: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { to: '/players', label: 'Futbolchilar', icon: Users },
  { to: '/teams', label: 'Jamoalar', icon: Shield },
  { to: '/trainings', label: 'Mashg\'ulotlar', icon: Dumbbell },
  { to: '/payments', label: 'To\'lovlar', icon: CreditCard },
  { to: '/stats', label: 'Statistika', icon: BarChart2 },
  { to: '/subscription', label: 'Obuna', icon: Star },
  { to: '/profile', label: 'Profil', icon: Settings },
];

const playerNav = [
  { to: '/player/home', label: 'Profilim', icon: User },
  { to: '/player/trainings', label: 'Mashg\'ulotlar', icon: Calendar },
  { to: '/player/payment', label: 'To\'lovlar', icon: Wallet },
];

export default function Layout({ children }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'coach' ? coachNav : playerNav;
  const displayName = user ? `${user.firstName} ${user.lastName}` : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-lg ring-2 ring-blue-100 bg-white">
          <img src={logo} alt="logo" className="w-full h-full object-contain" />
        </div>
        <p className="font-bold text-slate-800 text-sm leading-tight">FK Imom Hasan</p>
        <p className="text-xs text-slate-500 mt-0.5">{role === 'coach' ? 'Trener paneli' : 'Futbolchi paneli'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <item.icon size={18} strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {user?.firstName?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 capitalize">{role === 'coach' ? 'Trener' : 'Futbolchi'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Chiqish
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-slate-800">Imom Hasan FK</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
