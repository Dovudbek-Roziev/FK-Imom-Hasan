import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api';
import { CreditCard, MessageCircle, Banknote, Copy, Check, Clock, AlertCircle } from 'lucide-react';

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
  const { dark, t } = useTheme();
  const toast = useToast();
  const tp = t.playerPayment;

  const [payments, setPayments] = useState([]);
  const [coachInfo, setCoachInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyOk, setNotifyOk] = useState(false);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/payments/my'),
      api.get('/payments/coach-info'),
    ]).then(([p, c]) => {
      setPayments(p.data.payments || []);
      setCoachInfo(c.data.coach || null);
    }).catch((e) => {
      toast(e?.response?.data?.message || tp.notifyError);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentPayment = payments.find(p => p.month === currentMonth && p.year === currentYear);
  const otherPending = payments.filter(p => p.status !== 'tolangan' && !(p.month === currentMonth && p.year === currentYear));
  const paidList = payments.filter(p => p.status === 'tolangan');

  const monthStr = (p) => `${tp.months[p.month] || p.month} ${p.year}`;

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
    const text = encodeURIComponent(tp.waText(name, monthStr(payment), (payment.amount || 0).toLocaleString()));
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  const handleNotifyPaid = async (payment) => {
    setNotifying(true);
    setNotifyMsg('');
    try {
      await api.post('/payments/pay', { paymentId: payment._id });
      setNotifyOk(true);
      setNotifyMsg(tp.notifySuccess);
      const r = await api.get('/payments/my');
      setPayments(r.data.payments || []);
    } catch {
      setNotifyOk(false);
      setNotifyMsg(tp.notifyError);
    } finally {
      setNotifying(false);
    }
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg pb-8">
      <h1 className={`text-xl font-bold ${textMain}`}>{tp.title}</h1>

      {/* Notify message */}
      {notifyMsg && (
        <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2 ${
          notifyOk
            ? dark ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' : 'bg-green-50 text-green-700 border border-green-200'
            : dark ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notifyOk ? <Check size={16} strokeWidth={2.5} /> : <AlertCircle size={16} strokeWidth={2} />}
          {notifyMsg}
        </div>
      )}

      {/* Current month payment */}
      {currentPayment ? (
        <div className={`rounded-2xl p-5 ${
          currentPayment.status === 'tolangan'
            ? dark ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
            : dark ? 'bg-slate-900 ring-1 ring-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {monthStr(currentPayment)} — {tp.currentMonth}
            </p>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              currentPayment.status === 'tolangan'
                ? dark ? 'bg-green-500/20 text-green-400' : 'bg-green-500 text-white'
                : dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500 text-white'
            }`}>
              {currentPayment.status === 'tolangan' ? tp.statusPaid : tp.statusUnpaid}
            </span>
          </div>

          <p className={`text-3xl font-bold ${textMain}`}>
            {(currentPayment.amount || 0).toLocaleString()}
            <span className={`text-base font-normal ml-1.5 ${textSub}`}>{tp.currency}</span>
          </p>

          {/* Waiting for confirmation */}
          {currentPayment.status !== 'tolangan' && currentPayment.notes === 'player_notified' && (
            <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${dark ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <Clock size={16} className={dark ? 'text-amber-400' : 'text-amber-600'} strokeWidth={2} />
              <div>
                <p className={`text-sm font-semibold ${dark ? 'text-amber-300' : 'text-amber-700'}`}>{tp.pending}</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-amber-500' : 'text-amber-600'}`}>{tp.pendingHint}</p>
              </div>
            </div>
          )}

          {/* Payment options */}
          {currentPayment.status !== 'tolangan' && currentPayment.notes !== 'player_notified' && (
            <div className="mt-4 space-y-2.5">
              <p className={`text-xs font-medium ${textSub}`}>{tp.payOptions}</p>

              {/* Card payment */}
              {coachInfo?.cardNumber && (
                <div>
                  <button
                    onClick={() => setShowCard(!showCard)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                      dark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard size={17} strokeWidth={1.75} />
                      {tp.payCard}
                    </span>
                    <span className={`text-xs transition-transform ${showCard ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {showCard && (
                    <div className={`mt-1.5 rounded-xl p-4 space-y-3 ${dark ? 'bg-slate-800 ring-1 ring-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                      <div>
                        <p className={`text-xs mb-1.5 ${textSub}`}>{tp.cardLabel}</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-lg font-mono font-bold flex-1 min-w-0 truncate tracking-wider ${textMain}`}>
                            {coachInfo.cardNumber}
                          </p>
                          <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              copied
                                ? 'bg-green-500 text-white'
                                : dark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {copied ? <><Check size={12} strokeWidth={2.5} /> {tp.copied}</> : <><Copy size={12} strokeWidth={2} /> {tp.copyBtn}</>}
                          </button>
                        </div>
                      </div>
                      <div className={`rounded-lg p-3 ${dark ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                        <p className={`text-xs font-semibold ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                          {tp.amountLabel} {(currentPayment.amount || 0).toLocaleString()} {tp.currency}
                        </p>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-blue-500' : 'text-blue-500'}`}>{tp.amountHint}</p>
                      </div>
                      <button
                        onClick={() => handleNotifyPaid(currentPayment)}
                        disabled={notifying}
                        className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                      >
                        {notifying ? tp.notifying : tp.notifyBtn}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp */}
              {coachInfo?.whatsappNumber && (
                <button
                  onClick={() => handleWhatsApp(currentPayment)}
                  className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-[#25D366] hover:bg-[#20bd5b] text-white rounded-xl font-medium text-sm transition-colors"
                >
                  <MessageCircle size={17} strokeWidth={1.75} />
                  {tp.payWa}
                </button>
              )}

              {/* Cash */}
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${dark ? 'bg-slate-800 ring-1 ring-white/5' : 'bg-slate-100'}`}>
                <Banknote size={17} strokeWidth={1.75} className={`flex-shrink-0 mt-0.5 ${textSub}`} />
                <span className={textSub}>{tp.payCash}</span>
              </div>

              {!coachInfo?.cardNumber && !coachInfo?.whatsappNumber && (
                <div className={`px-4 py-3 rounded-xl text-sm ${dark ? 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                  {tp.noCoachInfo}
                </div>
              )}
            </div>
          )}

          {currentPayment.status === 'tolangan' && (
            <p className={`mt-3 text-sm font-medium flex items-center gap-1.5 ${dark ? 'text-green-400' : 'text-green-700'}`}>
              <Check size={15} strokeWidth={2.5} /> {tp.paidMsg}
            </p>
          )}
        </div>
      ) : (
        <div className={`${card} rounded-2xl p-5 text-center`}>
          <p className={`text-sm ${textSub}`}>{tp.noPayment}</p>
          {coachInfo?.monthlyFee > 0 && (
            <p className={`font-semibold mt-1 ${textMain}`}>
              {tp.monthlyFeeLabel} {coachInfo.monthlyFee.toLocaleString()} {tp.currency}
            </p>
          )}
        </div>
      )}

      {/* Past debts */}
      {otherPending.length > 0 && (
        <div>
          <h2 className={`text-sm font-semibold mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tp.pastDebt}</h2>
          <div className="space-y-2">
            {otherPending.map((p) => (
              <div key={p._id} className={`${card} rounded-2xl p-4 flex items-center justify-between`}>
                <div>
                  <p className={`font-semibold ${textMain}`}>{monthStr(p)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                    {tp.statusUnpaid}
                  </span>
                </div>
                <p className={`font-bold ${textMain}`}>
                  {(p.amount || 0).toLocaleString()} <span className={`text-xs font-normal ${textSub}`}>{tp.currency}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      {paidList.length > 0 && (
        <div>
          <h2 className={`text-sm font-semibold mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tp.paidHistory}</h2>
          <div className="space-y-2">
            {paidList.map((p) => (
              <div key={p._id} className={`${card} rounded-2xl p-4 flex items-center justify-between opacity-70`}>
                <div>
                  <p className={`font-semibold ${textMain}`}>{monthStr(p)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                    {tp.statusPaid}
                  </span>
                </div>
                <p className={`font-bold ${textMain}`}>
                  {(p.amount || 0).toLocaleString()} <span className={`text-xs font-normal ${textSub}`}>{tp.currency}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
