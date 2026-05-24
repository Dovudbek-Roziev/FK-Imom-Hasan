import { useEffect, useState } from 'react';
import api from '../../api';

const MONTHS_UZ = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function PlayerPayment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmPayment, setConfirmPayment] = useState(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/payments/my').then((r) => setPayments(r.data.payments || [])).catch(() => setPayments([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePay = async () => {
    if (!confirmPayment) return;
    setPaying(true);
    setMessage('');
    try {
      await api.post('/payments/pay', { paymentId: confirmPayment._id });
      setConfirmPayment(null);
      setMessage("To'lov yuborildi! Trener tasdiqlashini kuting.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Xato yuz berdi.');
      setConfirmPayment(null);
    } finally {
      setPaying(false);
    }
  };

  const monthStr = (p) => p.month ? `${MONTHS_UZ[p.month] || p.month} ${p.year || ''}` : "Noma'lum oy";

  const pending = payments.filter((p) => p.status !== 'tolangan');
  const paid = payments.filter((p) => p.status === 'tolangan');
  const totalDebt = pending.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-slate-800">To'lovlar</h1>

      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.includes('Xato') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-medium">Jami qarzdorlik</p>
            <p className="text-xl font-bold text-orange-700">{totalDebt.toLocaleString()} so'm</p>
          </div>
          <span className="text-2xl">⏳</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">
          To'lovlar yo'q
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-600 mb-3">Kutilmoqda</h2>
              <div className="space-y-3">
                {pending.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{monthStr(p)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'kechikkan' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {p.status === 'kechikkan' ? 'Kechikkan' : 'Kutilmoqda'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="font-bold text-slate-800">{(p.amount || 0).toLocaleString()} so'm</p>
                      <button
                        onClick={() => setConfirmPayment(p)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700"
                      >
                        To'lash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paid.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-600 mb-3">To'langan</h2>
              <div className="space-y-3">
                {paid.map((p) => (
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
        </>
      )}

      {confirmPayment && (
        <Modal title="To'lovni tasdiqlash" onClose={() => setConfirmPayment(null)}>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-500 mb-1">{monthStr(confirmPayment)}</p>
              <p className="text-2xl font-bold text-slate-800">{(confirmPayment.amount || 0).toLocaleString()} so'm</p>
            </div>
            <p className="text-sm text-slate-600">Bu to'lovni to'langan deb belgilaysizmi? Trener tasdiqlashi kerak bo'ladi.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPayment(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">
                Bekor
              </button>
              <button onClick={handlePay} disabled={paying} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {paying ? 'Yuborilmoqda...' : 'Tasdiqlash'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
