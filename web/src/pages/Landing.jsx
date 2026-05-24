import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import { Users, Dumbbell, CreditCard, Trophy } from 'lucide-react';

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      let current = 0;
      const steps = 60;
      const inc = target / steps;
      const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 28);
      return () => clearInterval(timer);
    }, 900);
    return () => clearTimeout(delay);
  }, [target]);

  return <>{count}{suffix}</>;
}

const features = [
  {
    Icon: Users,
    title: 'Futbolchilar',
    desc: "Barcha futbolchilarni bir joyda boshqaring, statistika va rivojlanishni kuzating",
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/30',
  },
  {
    Icon: Dumbbell,
    title: "Mashg'ulotlar",
    desc: "Mashg'ulot jadvalini tuzing, davomat va ko'rsatkichlarni real vaqtda hisoblab boring",
    gradient: 'from-emerald-500 to-green-500',
    glow: 'shadow-emerald-500/30',
  },
  {
    Icon: CreditCard,
    title: "To'lovlar",
    desc: "Oylik to'lovlarni kuzating, qarzdorlikni nazorat qiling va hisobotlar oling",
    gradient: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/30',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [v, setV] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setV(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px 0px rgba(59,130,246,0.35), 0 0 0 0 rgba(59,130,246,0.15); }
          50% { box-shadow: 0 0 50px 8px rgba(59,130,246,0.55), 0 0 0 8px rgba(59,130,246,0.08); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #fff 40%, #93c5fd 50%, #fff 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-hover {
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 relative overflow-hidden">

        {/* ── Background: pitch lines ── */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-[0.045]">
          <svg className="w-full h-full" viewBox="0 0 900 650" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="50" width="800" height="550" fill="none" stroke="white" strokeWidth="3" rx="4"/>
            <line x1="450" y1="50" x2="450" y2="600" stroke="white" strokeWidth="2"/>
            <circle cx="450" cy="325" r="80" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="450" cy="325" r="6" fill="white"/>
            <rect x="50" y="195" width="145" height="260" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="705" y="195" width="145" height="260" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="50" y="248" width="60" height="154" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="790" y="248" width="60" height="154" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 195 235 A 78 78 0 0 1 195 415" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 705 235 A 78 78 0 0 0 705 415" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 50 72 A 22 22 0 0 1 72 50" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 828 50 A 22 22 0 0 1 850 72" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 50 578 A 22 22 0 0 0 72 600" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M 828 600 A 22 22 0 0 0 850 578" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        {/* ── Radial glow center ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(29,78,216,0.12) 0%, transparent 70%)' }} />

        {/* ── Decorative blobs ── */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-violet-700/15 rounded-full blur-3xl pointer-events-none" />

        {/* ── Top nav bar ── */}
        <div className={`relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="logo" className="w-9 h-9 object-contain" />
            <span className="text-white font-bold text-sm tracking-tight">FK Imom Hasan</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-blue-200/30 hover:-translate-y-0.5"
          >
            Kirish →
          </button>
        </div>

        {/* ── Hero ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-14">

          {/* Logo floating */}
          <div
            className={`transition-all duration-700 delay-100 ${v ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
            style={{ animation: v ? 'float 3.5s ease-in-out infinite' : 'none' }}
          >
            <div
              className="w-32 h-32 rounded-3xl bg-white overflow-hidden p-2"
              style={{ animation: v ? 'glow-pulse 3s ease-in-out infinite' : 'none' }}
            >
              <img src={logo} alt="logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Club name */}
          <h1 className={`mt-7 text-4xl sm:text-6xl font-black tracking-tight transition-all duration-700 delay-200 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="shimmer-text">FK Imom Hasan</span>
          </h1>

          {/* Tagline */}
          <p className={`mt-4 text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed transition-all duration-700 delay-300 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Professional futbol klub boshqaruv tizimi — trenerlar, futbolchilar va to'lovlarni bir joyda boshqaring
          </p>

          {/* CTA buttons */}
          <div className={`mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 delay-[450ms] ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/50 hover:shadow-blue-700/60 hover:-translate-y-1 active:scale-95"
            >
              Tizimga kirish
            </button>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Trophy size={14} className="text-yellow-500" />
              Professional boshqaruv
            </div>
          </div>

          {/* Stats */}
          <div className={`mt-16 grid grid-cols-3 gap-8 sm:gap-20 transition-all duration-700 delay-[600ms] ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { label: 'Futbolchi', target: 50, suffix: '+' },
              { label: "Mashg'ulot", target: 200, suffix: '+' },
              { label: 'Trener', target: 10, suffix: '+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-5xl font-black text-white tabular-nums">
                  <Counter target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        {/* ── Features ── */}
        <div className={`relative z-10 px-6 pb-16 max-w-4xl mx-auto transition-all duration-700 delay-[750ms] ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-center text-xs text-slate-600 font-semibold uppercase tracking-widest mb-6">Imkoniyatlar</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(({ Icon, title, desc, gradient, glow }) => (
              <div
                key={title}
                className={`card-hover bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 cursor-default`}
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg ${glow}`}>
                  <Icon size={20} strokeWidth={1.75} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 text-center pb-8">
          <p className="text-slate-700 text-xs">© 2026 FK Imom Hasan</p>
        </div>

      </div>
    </>
  );
}
