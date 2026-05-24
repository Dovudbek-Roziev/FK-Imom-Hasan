import { useEffect, useState } from 'react';
import api from '../../api';
import { Smartphone } from 'lucide-react';

const MONTHS_UZ = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [feeModal, setFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');
  const [filter, setFilter] = useState('all');

  const now = new Date();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/payments'),
      api.get('/players'),
    ]).then(([p, pl]) => {
      setPayments(p.data.payments || []);
      setPlayers(pl.data.players || []);
    }).catch(() => {}).finally(() => setLoading(false));
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
      setFeeMsg(`${res.data.count} ta futbolchi uchun to'lov belgilandi!`);
      load();
    } catch (err) {
      setFeeMsg(err.response?.data?.message || 'Xato yuz berdi.');
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

  const monthStr = (p) => p.month ? `${MONTHS_UZ[p.month] || p.month} ${p.year || ''}` : '';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">To'lovlar</h1>
          <p className="text-slate-500 text-sm">{payments.length} ta to'lov</p>
        </div>
        <button onClick={openFeeModal} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          To'lov belgilash
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">To'langan</p>
          <p className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()} so'm</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Qarzdorlik</p>
          <p className="text-xl font-bold text-orange-500">{totalDebt.toLocaleString()} so'm</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['all', 'Hammasi'], ['tolangan', "To'langan"], ['pending', 'Kutilmoqda']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === val ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm">To'lovlar yo'q</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                {p.player?.firstName?.[0]}{p.player?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {p.player ? `${p.player.firstName} ${p.player.lastName}` : "Noma'lum"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'tolangan' ? 'bg-green-100 text-green-700' :
                    p.status === 'kechikkan' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {p.status === 'tolangan' ? "To'langan" : p.status === 'kechikkan' ? 'Kechikkan' : 'Kutilmoqda'}
                  </span>
                  {p.notes === 'player_notified' && p.status !== 'tolangan' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
                      <Smartphone size={11} strokeWidth={2} /> To'ladi
                    </span>
                  )}
                  {p.month && <span className="text-xs text-slate-500">{monthStr(p)}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-800">{(p.amount || 0).toLocaleString()} so'm</p>
                {p.status !== 'tolangan' && (
                  <button
                    onClick={() => setConfirmId(p._id)}
                    className="mt-1 px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
                  >
                    Tasdiqlash
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId && (
        <Modal title="To'lovni tasdiqlash" onClose={() => setConfirmId(null)}>
          <p className="text-slate-600 mb-5">Bu to'lovni to'langan deb belgilaysizmi?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Bekor</button>
            <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Tasdiqlash</button>
          </div>
        </Modal>
      )}

      {feeModal && (
        <Modal title="Oylik to'lov belgilash" onClose={() => setFeeModal(false)}>
          <form onSubmit={handleSetFee} className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              Barcha aktiv futbolchilar uchun bir vaqtda to'lov belgilanadi
            </div>

            {feeMsg && (
              <div className={`p-3 rounded-xl text-sm ${feeMsg.includes('ta futbolchi') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {feeMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Oylik miqdor (so'm)</label>
              <input
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                placeholder="500000"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-lg font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Oy</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                  value={feeForm.month}
                  onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
                >
                  {MONTHS_UZ.slice(1).map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yil</label>
                <input
                  type="number"
                  value={feeForm.year}
                  onChange={(e) => setFeeForm({ ...feeForm, year: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                  min={2020}
                  max={2030}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFeeModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Bekor</button>
              <button type="submit" disabled={feeSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {feeSaving ? 'Belgilanmoqda...' : 'Hammasi uchun belgilash'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
