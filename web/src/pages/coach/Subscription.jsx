import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Check, X } from 'lucide-react';

const PLAN_KEYS = ['free', 'premium_5', 'premium_10'];
const PLAN_PRICES = { free: '$0', premium_5: '$5/oy', premium_10: '$10/oy' };
const PLAN_RECOMMENDED = { premium_5: true };
const PLAN_ACCENT = {
  free: { border: 'border-slate-300', darkBorder: 'border-slate-600', badge: 'bg-slate-100 text-slate-600', darkBadge: 'bg-slate-700 text-slate-300' },
  premium_5: { border: 'border-blue-400', darkBorder: 'border-blue-500', badge: 'bg-blue-100 text-blue-700', darkBadge: 'bg-blue-500/20 text-blue-400' },
  premium_10: { border: 'border-purple-400', darkBorder: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', darkBadge: 'bg-purple-500/20 text-purple-400' },
};

export default function Subscription() {
  const { user } = useAuth();
  const { dark, t } = useTheme();
  const ts = t.subscription;

  const sub = user?.subscription;
  const currentPlan = sub?.plan || 'free';
  const isActive = sub?.isActive && sub?.endDate && new Date(sub.endDate) > new Date();
  const endDate = sub?.endDate ? new Date(sub.endDate).toLocaleDateString('uz-UZ') : null;

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className={`text-xl font-bold ${textMain}`}>{ts.title}</h1>

      {/* Current status */}
      <div className={`${card} rounded-2xl p-5`}>
        <h3 className={`text-sm font-semibold mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{ts.current}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-semibold ${textMain}`}>{ts.plans[currentPlan]?.label}</p>
            {isActive && endDate && (
              <p className={`text-xs mt-0.5 ${textSub}`}>{ts.expires} {endDate}</p>
            )}
            {!isActive && currentPlan !== 'free' && (
              <p className="text-xs text-red-400 mt-0.5">{ts.expired}</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            isActive
              ? dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>
            {isActive ? ts.active : ts.inactive}
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PLAN_KEYS.map((key) => {
          const plan = ts.plans[key];
          const isCurrent = key === currentPlan;
          const accent = PLAN_ACCENT[key];
          const isRec = PLAN_RECOMMENDED[key];

          return (
            <div
              key={key}
              className={`rounded-2xl border-2 p-5 transition-all ${
                dark
                  ? `${accent.darkBorder} ${isCurrent ? 'bg-slate-800/80' : 'bg-slate-900/60'}`
                  : `${accent.border} ${isCurrent ? 'bg-white' : 'bg-white/70'}`
              } ${isCurrent ? 'ring-2 ring-blue-500/40 ring-offset-1' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-bold text-base ${textMain}`}>{plan?.label}</h3>
                  {isRec && (
                    <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-medium">{ts.recommended}</span>
                  )}
                  {isCurrent && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${dark ? accent.darkBadge : accent.badge}`}>{ts.currentBadge}</span>
                  )}
                </div>
                <span className={`font-bold text-base ${textMain}`}>{PLAN_PRICES[key]}</span>
              </div>

              <div className="space-y-2">
                {plan?.features?.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <Check size={11} className={dark ? 'text-green-400' : 'text-green-600'} strokeWidth={2.5} />
                    </div>
                    <span className={dark ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
                  </div>
                ))}
                {plan?.missing?.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <X size={11} className={dark ? 'text-slate-600' : 'text-slate-400'} strokeWidth={2.5} />
                    </div>
                    <span className={textSub}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {currentPlan === 'free' && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-1">{ts.upgradeTo}</h3>
          <p className="text-blue-100 text-sm mb-4">{ts.upgradeDesc}</p>
          <div className="flex gap-3">
            <a
              href="https://t.me/dovud_IT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-white text-blue-600 text-sm font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              {ts.telegram}
            </a>
            <a
              href="tel:+996700000000"
              className="flex-1 py-2.5 rounded-xl border border-white/30 text-white text-sm font-semibold text-center hover:bg-white/10 transition-colors"
            >
              {ts.call}
            </a>
          </div>
        </div>
      )}

      {currentPlan !== 'free' && !isActive && (
        <div className={`rounded-2xl p-5 border ${dark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
          <h3 className={`font-semibold mb-1 ${dark ? 'text-orange-300' : 'text-orange-800'}`}>{ts.renewTitle}</h3>
          <p className={`text-sm mb-3 ${dark ? 'text-orange-400' : 'text-orange-700'}`}>{ts.renewDesc}</p>
          <a
            href="https://t.me/dovud_IT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2.5 px-5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            {ts.renewBtn}
          </a>
        </div>
      )}
    </div>
  );
}
