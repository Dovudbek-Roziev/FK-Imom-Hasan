import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/photo_2026-05-24_11-50-47-removebg-preview.png';
import { Users, Dumbbell, CreditCard, Trophy, LogIn, Settings, TrendingUp, Phone, MapPin, ChevronRight, Send, Code2, Globe, Bot, Smartphone, Star, ExternalLink, X } from 'lucide-react';

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

function AnnouncementStrip() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const msg = '⚡ FK Imom Hasan 2026 — Yangi mavsum boshlandi! · Trenerlar va futbolchilar uchun professional boshqaruv tizimi · ';
  return (
    <div className="relative z-20 bg-gradient-to-r from-blue-700 via-violet-700 to-blue-700 overflow-hidden">
      <div className="flex overflow-hidden py-2 px-0">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-white text-xs font-medium px-6 opacity-90">{msg}</span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

const projects = [
  { name: 'FK-Imom-Hasan', desc: 'Futbol klub tizimi', lang: 'JS', color: 'from-blue-500 to-cyan-500', stars: 3 },
  { name: 'CVcraft', desc: 'CV yaratuvchi platforma', lang: 'JS', color: 'from-violet-500 to-purple-500', stars: 5 },
  { name: 'Online-Kurs-KursHub', desc: 'Online ta\'lim platformasi', lang: 'JS', color: 'from-emerald-500 to-green-500', stars: 4 },
  { name: 'Vibe', desc: 'Ijtimoiy tarmoq loyihasi', lang: 'JS', color: 'from-rose-500 to-pink-500', stars: 4 },
];

const services = [
  { Icon: Globe, label: 'Web ilovalar', color: 'text-blue-400' },
  { Icon: Bot, label: 'Telegram botlar', color: 'text-sky-400' },
  { Icon: Smartphone, label: 'Mobil dizayn', color: 'text-violet-400' },
  { Icon: Code2, label: 'Full-stack', color: 'text-emerald-400' },
];

function DeveloperPromo({ navigate }) {
  return (
    <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
      <div className="relative p-px rounded-3xl dev-card-border">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-10 overflow-hidden relative">

          {/* bg decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-8 sm:gap-10">

            {/* Left: profile */}
            <div className="flex flex-col items-center sm:items-start gap-5 sm:w-56 flex-shrink-0">
              {/* Avatar */}
              <div className="avatar-glow w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl flex-shrink-0">
                <span className="text-white font-black text-3xl tracking-tight">DR</span>
              </div>

              <div className="text-center sm:text-left">
                <p className="text-white font-black text-xl leading-tight">Dovudbek</p>
                <p className="text-white font-black text-xl leading-tight">Roziev</p>
                <p className="text-blue-400 text-xs font-semibold mt-1.5 tracking-wide">Full-stack Developer</p>
                <p className="text-slate-500 text-xs mt-1">Osh, Qirg'iziston 🇰🇬</p>
              </div>

              {/* Services */}
              <div className="flex flex-col gap-2 w-full">
                {services.map(({ Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Icon size={13} className={color} />
                    <span className="text-slate-400 text-xs">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                <a
                  href="https://instagram.com/roz1ev.db"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-pink-900/40"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                  Instagram
                </a>
                <a
                  href="https://t.me/dovud_IT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-sky-900/40"
                >
                  <Send size={11} />
                  Telegram
                </a>
              </div>
            </div>

            {/* Right: projects */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1">Portfolio</p>
                <h3 className="text-white font-black text-lg sm:text-2xl leading-tight">
                  Sizga ham shunday<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">tizim kerakmi?</span>
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm">
                  Web ilovalar, Telegram botlar va mobil dizayn bo'yicha professional yechimlar taklif etaman.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {projects.map(({ name, desc, lang, color, stars }) => (
                  <a
                    key={name}
                    href={`https://github.com/Dovudbek-Roziev/${name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proj-card bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 group"
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                      <Code2 size={13} className="text-white" />
                    </div>
                    <p className="text-white text-xs font-semibold truncate group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      {name.length > 14 ? name.slice(0, 14) + '…' : name}
                      <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </p>
                    <p className="text-slate-600 text-[10px] mt-0.5 truncate">{desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Star size={9} className="text-yellow-500" fill="currentColor" /> {stars}
                      </span>
                      <span className="text-[10px] text-yellow-400/70">{lang}</span>
                    </div>
                  </a>
                ))}
              </div>

              <a
                href="https://github.com/Dovudbek-Roziev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 text-xs hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Barcha loyihalarni ko'rish →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  { q: "Tizimga qanday kirish mumkin?", a: "Trener yoki futbolchi sifatida login va parolingiz bilan tizimga kirishingiz mumkin. Hisob yo'q bo'lsa, klub administratoriga murojaat qiling." },
  { q: "Futbolchi o'z ma'lumotlarini ko'ra oladimi?", a: "Ha. Futbolchi o'z profilida davomat, mashg'ulotlar jadvalini va to'lov holatini real vaqtda ko'ra oladi." },
  { q: "To'lovlar qanday nazorat qilinadi?", a: "Trener har bir futbolchining oylik to'lov holatini belgilaydi. Tizim avtomatik hisobot va qarzdorlik ro'yxatini ko'rsatadi." },
  { q: "Bir nechta jamoa boshqarish mumkinmi?", a: "Ha. Trener bir nechta jamoani alohida boshqarishi, har bir jamoa uchun mashg'ulot va to'lovlarni sozlashi mumkin." },
  { q: "Tizim mobil telefonda ishlaydi ham?", a: "Ha, tizim to'liq mobil qurilmalar uchun moslashtirilgan — telefon yoki planshetdan bemalol foydalanish mumkin." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="relative z-10 px-6 pb-16 max-w-3xl mx-auto">
      <p className="text-center text-xs text-slate-600 font-semibold uppercase tracking-widest mb-3">FAQ</p>
      <h2 className="text-center text-white font-black text-2xl sm:text-3xl mb-8">
        Tez-tez so'raladigan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">savollar</span>
      </h2>
      <div className="flex flex-col gap-3">
        {faqs.map((item, i) => (
          <div
            key={i}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open === i ? 'border-blue-500/40 bg-blue-950/30' : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]'}`}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
            >
              <span className={`text-sm font-semibold transition-colors ${open === i ? 'text-blue-300' : 'text-slate-200'}`}>{item.q}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${open === i ? 'bg-blue-600 border-blue-500 rotate-45' : 'border-white/[0.15] bg-white/[0.05]'}`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <line x1="5" y1="1" x2="5" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="1" y1="5" x2="9" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
            <div className={`transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          0%, 100% { filter: drop-shadow(0 0 14px rgba(59,130,246,0.5)) drop-shadow(0 0 30px rgba(99,102,241,0.25)); }
          50% { filter: drop-shadow(0 0 28px rgba(59,130,246,0.85)) drop-shadow(0 0 55px rgba(139,92,246,0.45)); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes step-pop {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
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
        .step-card {
          transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 40px -10px rgba(59,130,246,0.25);
        }
        .step-num {
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .step-card:hover .step-num {
          transform: scale(1.15);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 18s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .dev-card-border {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
          background-size: 300% 300%;
          animation: border-spin 4s ease infinite;
        }
        @keyframes avatar-glow {
          0%, 100% { box-shadow: 0 0 20px 4px rgba(139,92,246,0.4); }
          50% { box-shadow: 0 0 40px 10px rgba(59,130,246,0.5); }
        }
        .avatar-glow {
          animation: avatar-glow 3s ease-in-out infinite;
        }
        .proj-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .proj-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -8px rgba(99,102,241,0.3);
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

        {/* ── Announcement strip ── */}
        <AnnouncementStrip />

        {/* ── Top nav bar ── */}
        <div className={`relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
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
            <img
              src={logo}
              alt="logo"
              className="w-44 h-44 object-contain"
              style={{ animation: v ? 'glow-pulse 3s ease-in-out infinite' : 'none' }}
            />
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

        {/* ── Divider ── */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        {/* ── Qo'llanma ── */}
        <div className={`relative z-10 px-6 pb-20 max-w-4xl mx-auto transition-all duration-700 delay-[900ms] ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-center text-xs text-slate-600 font-semibold uppercase tracking-widest mb-10">Qo'llanma</p>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-0">
            {/* connecting line — desktop only */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%)] right-[calc(16.67%)] h-px bg-gradient-to-r from-blue-600/40 via-violet-500/40 to-emerald-500/40 z-0" />

            {[
              {
                num: '01',
                Icon: LogIn,
                title: 'Kiring',
                desc: 'Trener yoki futbolchi sifatida tizimga kiring',
                grad: 'from-blue-500 to-blue-700',
                delay: '100ms',
              },
              {
                num: '02',
                Icon: Settings,
                title: 'Sozlang',
                desc: 'Jamoangizni tuzing, mashg\'ulotlar va to\'lovlarni belgilang',
                grad: 'from-violet-500 to-purple-700',
                delay: '250ms',
              },
              {
                num: '03',
                Icon: TrendingUp,
                title: 'Kuzating',
                desc: 'Statistika, davomat va moliyani real vaqtda nazorat qiling',
                grad: 'from-emerald-500 to-green-700',
                delay: '400ms',
              },
            ].map(({ num, Icon, title, desc, grad, delay }) => (
              <div key={num} className="relative z-10 flex-1 w-full sm:w-auto flex flex-col items-center text-center px-4">
                <div
                  className={`step-card bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 w-full cursor-default`}
                  style={{ animationDelay: delay }}
                >
                  <div className={`step-num w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon size={24} strokeWidth={1.75} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 tracking-[0.2em] mb-1 block">{num}</span>
                  <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
                {/* mobile arrow */}
                <div className="sm:hidden mt-3 mb-1 text-slate-700">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
        <FAQ />

        {/* ── Developer promo ── */}
        <DeveloperPromo navigate={navigate} />

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/10 flex-shrink-0">
                  <img src={logo} alt="logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-white font-bold text-sm">FK Imom Hasan</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Professional futbol klub boshqaruv tizimi. Trenerlar va futbolchilar uchun qulay platforma.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500 text-xs font-medium">Tizim faol</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Sahifalar</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Trener paneli', path: '/dashboard' },
                  { label: 'Futbolchi paneli', path: '/player/home' },
                  { label: 'Mashg\'ulotlar', path: '/trainings' },
                  { label: 'To\'lovlar', path: '/payments' },
                ].map(({ label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-slate-500 text-xs hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                    >
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0 text-blue-400" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Aloqa</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <Phone size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">+996 755 507 111</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">Osh, Qirg'iziston</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Developer section */}
          <div className="border-t border-white/[0.05]">
            <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-700 text-xs">© 2026 FK Imom Hasan. Barcha huquqlar himoyalangan.</p>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-xs">Dasturchi: <span className="text-slate-400 font-medium">Dovudbek Roziev</span></span>
                <div className="flex items-center gap-2">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/roz1ev.db"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] hover:bg-pink-500/20 border border-white/[0.08] hover:border-pink-500/40 transition-all group"
                    title="Instagram"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-pink-400 transition-colors">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                    </svg>
                  </a>
                  {/* Telegram */}
                  <a
                    href="https://t.me/dovud_IT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] hover:bg-sky-500/20 border border-white/[0.08] hover:border-sky-500/40 transition-all group"
                    title="Telegram"
                  >
                    <Send size={12} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </a>
                  {/* GitHub */}
                  <a
                    href="https://github.com/Dovudbek-Roziev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] hover:bg-slate-400/20 border border-white/[0.08] hover:border-slate-400/40 transition-all group"
                    title="GitHub"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 group-hover:text-slate-300 transition-colors">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
