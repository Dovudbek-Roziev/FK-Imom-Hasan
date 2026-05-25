import { useEffect, useState } from 'react';
import api from '../../api';
import { Smartphone, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function Modal({ title, onClose, children }) {
  const { dark } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <h3 className={`font-semibold ${dark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`p-1.5 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Payments() {
  const { dark, t } = useTheme();
  const tp = t.payments;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [feeModal, setFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');
  const [feeSuccess, setFeeSuccess] = useState(false);
  const [filter, setFilter] = useState('all');

  const now = new Date();

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/payments'), api.get('/players')])
      .then(([p]) => setPayments(p.data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    try { await api.put(`/payments/${confirmId}/confirm`); } catch {}
    setConfirmId(null);
    load();
  };

  const openFeeModal = () => {
    setFeeForm({ amount: '', month: now.getMonth() + 1, year: now.getFullYear() });
    setFeeMsg('');
    setFeeSuccess(false);
    setFeeModal(true);
  };

  const handleSetFee = async (e) => {
    e.preventDefault();
    setFeeSaving(true);
    setFeeMsg('');
    try {
      const res = await api.post('/payments/set-fee-all', {
        amount: Number(feeForm.amount),
        month: Number(feeForm.month),
        year: Number(feeForm.year),
      });
      setFeeSuccess(true);
      setFeeMsg(tp.feeSuccess(res.data.count));
      load();
    } catch {
      setFeeSuccess(false);
      setFeeMsg(tp.feeInfo);
    }
    setFeeSaving(false);
  };

  const filtered = payments.filter((p) => {
    if (filter === 'tolangan') return p.status === 'tolangan';
    if (filter === 'pending') return p.status === 'tolmagan' || p.status === 'kechikkan';
    return true;
  });

  const totalPaid = payments.filter((p) => p.status === 'tolangan').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter((p) => p.status !== 'tolangan').reduce((s, p) => s + (p.amount || 0), 0);

  const monthStr = (p) => p.month ? `${tp.months[p.month] || p.month} ${p.year || ''}` : '';

  const getStatusStyle = (status) => {
    if (status === 'tolangan') return dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    if (status === 'kechikkan') return dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
    return dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
  };
  const getStatusLabel = (status) => {
    if (status === 'tolangan') return tp.statusPaid;
    if (status === 'kechikkan') return tp.statusLate;
    return tp.statusPending;
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const inp = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`;
  const lbl = `block text-sm font-medium mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textMain}`}>{tp.title}</h1>
          <p className={`text-sm ${textSub}`}>{tp.count(payments.length)}</p>
        </div>
        <button
          onClick={openFeeModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {tp.setFeeBtn}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl p-4 ${dark ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <TrendingUp size={14} className={dark ? 'text-green-400' : 'text-green-600'} />
            </div>
            <p className={`text-xs font-medium ${dark ? 'text-green-400' : 'text-green-600'}`}>{tp.paid}</p>
          </div>
          <p className={`text-xl font-bold ${dark ? 'text-green-300' : 'text-green-700'}`}>{totalPaid.toLocaleString()}</p>
          <p className={`text-xs ${dark ? 'text-green-500' : 'text-green-500'}`}>{tp.currency}</p>
        </div>
        <div className={`rounded-2xl p-4 ${dark ? 'bg-orange-500/10 ring-1 ring-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <TrendingDown size={14} className={dark ? 'text-orange-400' : 'text-orange-600'} />
            </div>
            <p className={`text-xs font-medium ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{tp.debt}</p>
          </div>
          <p className={`text-xl font-bold ${dark ? 'text-orange-300' : 'text-orange-700'}`}>{totalDebt.toLocaleString()}</p>
          <p className={`text-xs ${dark ? 'text-orange-500' : 'text-orange-500'}`}>{tp.currency}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[['all', tp.all], ['tolangan', tp.statusPaid], ['pending', tp.pending]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === val
                ? 'bg-blue-600 text-white'
                : dark ? 'border border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} rounded-2xl p-10 text-center ${textSub}`}>{tp.noPayments}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p._id} className={`${card} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                {p.player?.firstName?.[0]}{p.player?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${textMain}`}>
                  {p.player ? `${p.player.firstName} ${p.player.lastName}` : tp.unknown}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                  {p.notes === 'player_notified' && p.status !== 'tolangan' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                      <Smartphone size={10} strokeWidth={2} /> {tp.notified}
                    </span>
                  )}
                  {p.month && <span className={`text-xs ${textSub}`}>{monthStr(p)}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold ${textMain}`}>{(p.amount || 0).toLocaleString()}</p>
                <p className={`text-xs ${textSub}`}>{tp.currency}</p>
                {p.status !== 'tolangan' && (
                  <button
                    onClick={() => setConfirmId(p._id)}
                    className="mt-1.5 px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                  >
                    {tp.confirmBtn}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId && (
        <Modal title={tp.confirmTitle} onClose={() => setConfirmId(null)}>
          <p className={`mb-5 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{tp.confirmMsg}</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmId(null)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>{tp.cancel}</button>
            <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">{tp.confirmBtn}</button>
          </div>
        </Modal>
      )}

      {feeModal && (
        <Modal title={tp.feeTitle} onClose={() => setFeeModal(false)}>
          <form onSubmit={handleSetFee} className="space-y-4">
            <div className={`rounded-xl p-3 text-sm ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              {tp.feeInfo}
            </div>

            {feeMsg && (
              <div className={`p-3 rounded-xl text-sm ${feeSuccess ? dark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700' : dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'}`}>
                {feeMsg}
              </div>
            )}

            <div>
              <label className={lbl}>{tp.feeAmount}</label>
              <input
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                placeholder={tp.feeAmountPlaceholder}
                required
                className={`${inp} text-lg font-semibold`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>{tp.feeMonth}</label>
                <select className={inp} value={feeForm.month} onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}>
                  {tp.months.slice(1).map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>{tp.feeYear}</label>
                <input
                  type="number"
                  value={feeForm.year}
                  onChange={(e) => setFeeForm({ ...feeForm, year: e.target.value })}
                  className={inp}
                  min={2020}
                  max={2035}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFeeModal(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>{tp.cancel}</button>
              <button type="submit" disabled={feeSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {feeSaving ? tp.feeSaving : tp.feeSaveBtn}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
