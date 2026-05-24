import { useAuth } from '../../context/AuthContext';

const PLANS = [
  {
    key: 'free',
    label: 'Bepul',
    price: '$0',
    color: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-600',
    features: ['30 ta futbolchi', 'Mashg\'ulot jadvali', 'Davomat belgilash', 'To\'lov nazorati'],
    missing: ['Cheksiz futbolchilar', 'PDF hisobot', 'Prioritet qo\'llab-quvvatlash'],
  },
  {
    key: 'premium_5',
    label: 'Premium',
    price: '$5/oy',
    color: 'border-blue-500 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    features: ['Cheksiz futbolchilar', 'Mashg\'ulot jadvali', 'Davomat belgilash', 'To\'lov nazorati', 'Jamoa statistikasi'],
    missing: ['PDF hisobot', 'Prioritet qo\'llab-quvvatlash'],
    recommended: true,
  },
  {
    key: 'premium_10',
    label: 'Premium Pro',
    price: '$10/oy',
    color: 'border-purple-500 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
    features: ['Cheksiz futbolchilar', 'Mashg\'ulot jadvali', 'Davomat belgilash', 'To\'lov nazorati', 'Jamoa statistikasi', 'PDF hisobot', 'Prioritet qo\'llab-quvvatlash'],
    missing: [],
  },
];

export default function Subscription() {
  const { user } = useAuth();
  const sub = user?.subscription;
  const currentPlan = sub?.plan || 'free';
  const isActive = sub?.isActive && sub?.endDate && new Date(sub.endDate) > new Date();
  const endDate = sub?.endDate ? new Date(sub.endDate).toLocaleDateString('uz-UZ') : null;

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-xl font-bold text-slate-800">Obuna</h1>

      {/* Joriy holat */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Joriy obuna</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 text-base">
              {PLANS.find((p) => p.key === currentPlan)?.label || 'Bepul'}
            </p>
            {isActive && endDate && (
              <p className="text-xs text-slate-500 mt-0.5">Amal qilish muddati: {endDate}</p>
            )}
            {!isActive && currentPlan !== 'free' && (
              <p className="text-xs text-red-500 mt-0.5">Obuna muddati tugagan</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {isActive ? 'Faol' : 'Faol emas'}
          </span>
        </div>
      </div>

      {/* Planlar */}
      <div className="space-y-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${plan.color} ${isCurrent ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">{plan.label}</h3>
                  {plan.recommended && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Tavsiya</span>
                  )}
                  {isCurrent && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badge}`}>Joriy</span>
                  )}
                </div>
                <span className="font-bold text-slate-700">{plan.price}</span>
              </div>
              <div className="space-y-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500 font-bold">✓</span>
                    {f}
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="font-bold">✕</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Yuksaltirish */}
      {currentPlan === 'free' && (
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <h3 className="font-bold text-lg mb-1">Premiumga o'ting</h3>
          <p className="text-blue-100 text-sm mb-4">
            Cheksiz futbolchi qo'shish va qo'shimcha imkoniyatlar uchun admin bilan bog'laning.
          </p>
          <div className="flex gap-3">
            <a
              href="https://t.me/dovud_IT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-white text-blue-600 text-sm font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              Telegram orqali
            </a>
            <a
              href="tel:+998901234567"
              className="flex-1 py-2.5 rounded-xl border border-blue-400 text-white text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              Qo'ng'iroq qilish
            </a>
          </div>
        </div>
      )}

      {currentPlan !== 'free' && !isActive && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-orange-800 mb-1">Obuna yangilash kerak</h3>
          <p className="text-orange-700 text-sm mb-3">Obunangiz muddati tugagan. Davom ettirish uchun admin bilan bog'laning.</p>
          <a
            href="https://t.me/dovud_IT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2.5 px-5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Telegram orqali bog'lanish
          </a>
        </div>
      )}
    </div>
  );
}
