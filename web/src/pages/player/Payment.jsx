import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const MONTHS_UZ = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

export default function PlayerPayment() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [coachInfo, setCoachInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/payments/my'),
      api.get('/payments/coach-info'),
    ]).then(([p, c]) => {
      setPayments(p.data.payments || []);
      setCoachInfo(c.data.coach || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentPayment = payments.find(p => p.month === currentMonth && p.year === currentYear);
  const otherPending = payments.filter(p => p.status !== 'tolangan' && !(p.month === currentMonth && p.year === currentYear));
  const paidList = payments.filter(p => p.status === 'tolangan');

  const monthStr = (p) => `${MONTHS_UZ[p.month] || p.month} ${p.year}`;

  const handleCopy = () => {
    if (!coachInfo?.cardNumber) return;
    copyToClipboard(coachInfo.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (payment) => {
    if (!coachInfo?.whatsappNumber) return;
    const num = coachInfo.whatsappNumber.replace(/\D/g, '');
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const text = encodeURIComponent(
      `Assalomu alaykum! Men ${name}, ${monthStr(payment)} oylik ${(payment.amount || 0).toLocaleString()} so'm to'lovni amalga oshirdim. Tasdiqlaysizmi?`
    );
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  const handleNotifyPaid = async (payment) => {
    setNotifying(true);
    setNotifyMsg('');
    try {
      await api.post('/payments/pay', { paymentId: payment._id });
      setNotifyMsg("Trenerga xabar yuborildi! Tasdiqlashini kuting.");
      const r = await api.get('/payments/my');
      setPayments(r.data.payments || []);
    } catch (err) {
      setNotifyMsg(err.response?.data?.message || 'Xato yuz berdi.');
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-xl font-bold text-slate-800">To'lovlar</h1>

      {notifyMsg && (
        <div className={`p-3 rounded-xl text-sm ${notifyMsg.includes('Xato') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {notifyMsg}
        </div>
      )}

      {/* Joriy oy */}
      {currentPayment ? (
        <div className={`rounded-2xl p-5 shadow-sm ${currentPayment.status === 'tolangan' ? 'bg-green-50 border border-green-200' : 'bg-white border border-orange-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">{monthStr(currentPayment)} — Joriy oy</p>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              currentPayment.status === 'tolangan' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            }`}>
              {currentPayment.status === 'tolangan' ? "To'langan" : "To'lanmagan"}
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{(currentPayment.amount || 0).toLocaleString()} so'm</p>

          {currentPayment.status !== 'tolangan' && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">To'lash usulini tanlang:</p>

              {/* Karta orqali */}
              {coachInfo?.cardNumber && (
                <div>
                  <button
                    onClick={() => setShowCard(!showCard)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    <span>Karta orqali to'lash</span>
                    <span className="text-lg">💳</span>
                  </button>

                  {showCard && (
                    <div className="mt-2 bg-slate-50 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Bank karta raqami:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-mono font-bold text-slate-800 tracking-wider flex-1">{coachInfo.cardNumber}</p>
                          <button
                            onClick={handleCopy}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                          >
                            {copied ? 'Nusxa olindi!' : 'Nusxa olish'}
                          </button>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Miqdor: {(currentPayment.amount || 0).toLocaleString()} so'm</p>
                        <p className="text-xs text-slate-500 mt-1">Ushbu raqamga pul o'tkazing, keyin quyidagi tugmani bosing</p>
                      </div>
                      <button
                        onClick={() => handleNotifyPaid(currentPayment)}
                        disabled={notifying}
                        className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                      >
                        {notifying ? 'Yuborilmoqda...' : "To'ladim — Trenerga xabar berish"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp */}
              {coachInfo?.whatsappNumber && (
                <button
                  onClick={() => handleWhatsApp(currentPayment)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
                >
                  <span>WhatsApp orqali xabar berish</span>
                  <span className="text-lg">💬</span>
                </button>
              )}

              {/* Naqt */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-600">
                <span className="text-lg">💵</span>
                <span>Naqt to'lash uchun treneringiz bilan to'g'ridan-to'g'ri bog'laning</span>
              </div>

              {!coachInfo?.cardNumber && !coachInfo?.whatsappNumber && (
                <div className="px-4 py-3 bg-orange-50 rounded-xl text-sm text-orange-700">
                  Trener hali to'lov ma'lumotlarini kiritmagan. Naqt to'lang yoki trener bilan bog'laning.
                </div>
              )}
            </div>
          )}

          {currentPayment.status === 'tolangan' && (
            <p className="mt-3 text-sm text-green-700 font-medium">Bu oy to'lovingiz qabul qilindi!</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-slate-400 text-sm">Joriy oy uchun to'lov hali belgilanmagan</p>
          {coachInfo?.monthlyFee > 0 && (
            <p className="text-slate-600 font-semibold mt-1">Oylik to'lov: {coachInfo.monthlyFee.toLocaleString()} so'm</p>
          )}
        </div>
      )}

      {/* Oldingi qarzdorliklar */}
      {otherPending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 mb-2">Oldingi to'lanmagan</h2>
          <div className="space-y-2">
            {otherPending.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{monthStr(p)}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">To'lanmagan</span>
                </div>
                <p className="font-bold text-slate-800">{(p.amount || 0).toLocaleString()} so'm</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* To'langan tarix */}
      {paidList.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 mb-2">To'langan tarix</h2>
          <div className="space-y-2">
            {paidList.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between opacity-70">
                <div>
                  <p className="font-semibold text-slate-800">{monthStr(p)}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">To'langan</span>
                </div>
                <p className="font-bold text-slate-800">{(p.amount || 0).toLocaleString()} so'm</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
