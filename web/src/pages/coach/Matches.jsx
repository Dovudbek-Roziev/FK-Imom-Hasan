import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api';
import { Trophy, Plus, Pencil, Trash2, ClipboardList, Home, Plane, Minus } from 'lucide-react';

const EMPTY_FORM = { opponent: '', date: '', time: '', venue: 'home', location: '', competition: '', team: '', notes: '' };

function Label({ text, dark }) {
  return <p className={`text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{text}</p>;
}

function Input({ value, onChange, placeholder, type = 'text', dark }) {
  const base = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors ${dark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'}`;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />;
}

export default function CoachMatches() {
  const { dark, t } = useTheme();
  const toast = useToast();
  const tm = t.matches;

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  // Add/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Result modal
  const [showResult, setShowResult] = useState(false);
  const [resultMatch, setResultMatch] = useState(null);
  const [resultForm, setResultForm] = useState({ status: 'completed', scoreUs: 0, scoreThem: 0, lineup: [] });
  const [resultSaving, setResultSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/matches'),
      api.get('/players'),
      api.get('/teams'),
    ]).then(([m, p, te]) => {
      setMatches(m.data.matches || []);
      setPlayers(p.data.players || []);
      setTeams(te.data.teams || []);
    }).catch(e => toast(e?.response?.data?.message || tm.error))
      .finally(() => setLoading(false));
  }, []);

  const filtered = matches.filter(m => {
    if (tab === 'upcoming') return m.status === 'upcoming';
    if (tab === 'past') return m.status !== 'upcoming';
    return true;
  });

  const openAdd = () => {
    setEditMatch(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditMatch(m);
    setForm({
      opponent: m.opponent || '',
      date: m.date ? m.date.slice(0, 10) : '',
      time: m.time || '',
      venue: m.venue || 'home',
      location: m.location || '',
      competition: m.competition || '',
      team: m.team?._id || '',
      notes: m.notes || '',
    });
    setShowForm(true);
  };

  const saveMatch = async () => {
    if (!form.opponent.trim() || !form.date) return toast(tm.error);
    setSaving(true);
    try {
      const body = { ...form, team: form.team || null };
      if (editMatch) {
        const r = await api.put(`/matches/${editMatch._id}`, body);
        setMatches(prev => prev.map(m => m._id === editMatch._id ? r.data.match : m));
      } else {
        const r = await api.post('/matches', body);
        setMatches(prev => [r.data.match, ...prev]);
      }
      setShowForm(false);
    } catch (e) {
      toast(e?.response?.data?.message || tm.error);
    } finally {
      setSaving(false);
    }
  };

  const openResult = (m) => {
    setResultMatch(m);
    const existingLineup = m.lineup || [];
    const lineup = players.map(p => {
      const ex = existingLineup.find(l => (l.player?._id || l.player)?.toString() === p._id.toString());
      return { player: p._id, firstName: p.firstName, lastName: p.lastName, position: p.position, played: !!ex, goals: ex?.goals || 0, assists: ex?.assists || 0 };
    });
    setResultForm({ status: m.status === 'cancelled' ? 'cancelled' : 'completed', scoreUs: m.scoreUs || 0, scoreThem: m.scoreThem || 0, lineup });
    setShowResult(true);
  };

  const saveResult = async () => {
    setResultSaving(true);
    try {
      const lineup = resultForm.lineup.filter(l => l.played).map(l => ({ player: l.player, goals: l.goals || 0, assists: l.assists || 0 }));
      const r = await api.put(`/matches/${resultMatch._id}`, {
        status: resultForm.status,
        scoreUs: resultForm.scoreUs,
        scoreThem: resultForm.scoreThem,
        lineup,
      });
      setMatches(prev => prev.map(m => m._id === resultMatch._id ? r.data.match : m));
      setShowResult(false);
    } catch (e) {
      toast(e?.response?.data?.message || tm.error);
    } finally {
      setResultSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(tm.deleteConfirm)) return;
    setDeleting(id);
    try {
      await api.delete(`/matches/${id}`);
      setMatches(prev => prev.filter(m => m._id !== id));
    } catch (e) {
      toast(e?.response?.data?.message || tm.error);
    } finally {
      setDeleting(null);
    }
  };

  const matchResult = (m) => {
    if (m.status !== 'completed') return null;
    if (m.scoreUs > m.scoreThem) return 'win';
    if (m.scoreUs < m.scoreThem) return 'lose';
    return 'draw';
  };

  const resultColor = (r, dark) => {
    if (r === 'win') return dark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-700';
    if (r === 'lose') return dark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700';
    return dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600';
  };

  const venueLabel = (v) => ({ home: tm.home, away: tm.away, neutral: tm.neutral })[v] || v;
  const venueColor = (v) => {
    if (v === 'home') return dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700';
    if (v === 'away') return dark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-700';
    return dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600';
  };

  const statusLabel = (s) => ({ upcoming: tm.statusUpcoming, completed: tm.statusCompleted, cancelled: tm.statusCancelled })[s] || s;
  const statusColor = (s) => {
    if (s === 'upcoming') return dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
    if (s === 'completed') return dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    return dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500';
  };

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800';
  const modalBg = dark ? 'bg-slate-900' : 'bg-white';

  const resultLabels = { win: tm.win, lose: tm.lose, draw: tm.draw };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl pb-8">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-bold ${textMain}`}>{tm.title}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} strokeWidth={2.5} />
          {tm.addBtn}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex rounded-2xl p-1 gap-1 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[{ val: 'all', label: tm.all }, { val: 'upcoming', label: tm.upcoming }, { val: 'past', label: tm.past }].map(({ val, label }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === val
              ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
              : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
            }`}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={`${card} rounded-2xl p-12 text-center`}>
          <Trophy size={32} className={`mx-auto mb-3 ${textSub}`} strokeWidth={1.5} />
          <p className={`text-sm ${textSub}`}>{tm.noMatches}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const res = matchResult(m);
            const dateObj = new Date(m.date);
            return (
              <div key={m._id} className={`${card} rounded-2xl p-4`}>
                <div className="flex items-start gap-3">
                  {/* Date column */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <span className={`text-lg font-bold leading-none ${textMain}`}>{dateObj.getDate()}</span>
                    <span className={`text-xs mt-0.5 ${textSub}`}>{dateObj.toLocaleDateString('default', { month: 'short' })}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-base ${textMain}`}>FK Imom Hasan vs {m.opponent}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${venueColor(m.venue)}`}>{venueLabel(m.venue)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                      {m.competition && <span className={`text-xs ${textSub}`}>{m.competition}</span>}
                      {m.time && <span className={`text-xs ${textSub}`}>{m.time}</span>}
                    </div>
                    {m.location && <p className={`text-xs mt-1 ${textSub}`}>{m.location}</p>}

                    {/* Score for completed */}
                    {m.status === 'completed' && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${res === 'win' ? dark ? 'bg-green-500/15' : 'bg-green-50' : res === 'lose' ? dark ? 'bg-red-500/15' : 'bg-red-50' : dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <span className={`text-xl font-bold ${textMain}`}>{m.scoreUs}</span>
                          <span className={`text-base ${textSub}`}>:</span>
                          <span className={`text-xl font-bold ${textMain}`}>{m.scoreThem}</span>
                        </div>
                        {res && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${resultColor(res, dark)}`}>{resultLabels[res]}</span>}
                      </div>
                    )}

                    {/* Team badge */}
                    {m.team && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.team.color }} />
                        <span className={`text-xs ${textSub}`}>{m.team.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 mt-3 pt-3 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button onClick={() => openEdit(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    <Pencil size={13} strokeWidth={2} /> {tm.editBtn}
                  </button>
                  <button onClick={() => openResult(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                    <ClipboardList size={13} strokeWidth={2} /> {tm.resultBtn}
                  </button>
                  <button onClick={() => handleDelete(m._id)} disabled={deleting === m._id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ml-auto ${dark ? 'text-red-400 hover:bg-red-500/15' : 'text-red-600 hover:bg-red-50'}`}>
                    <Trash2 size={13} strokeWidth={2} /> {tm.deleteBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative z-10 w-full sm:max-w-md ${modalBg} rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-base font-bold mb-5 ${textMain}`}>{editMatch ? tm.editTitle : tm.addTitle}</h2>
            <div className="space-y-3">
              <div>
                <Label text={`${tm.opponent} *`} dark={dark} />
                <Input value={form.opponent} onChange={v => setForm(f => ({ ...f, opponent: v }))} placeholder={tm.opponentPlaceholder} dark={dark} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label text={`${tm.date} *`} dark={dark} />
                  <Input type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} dark={dark} />
                </div>
                <div>
                  <Label text={tm.time} dark={dark} />
                  <Input type="time" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} dark={dark} />
                </div>
              </div>
              <div>
                <Label text={tm.venue} dark={dark} />
                <div className="flex gap-2">
                  {['home', 'away', 'neutral'].map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, venue: v }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors border ${form.venue === v
                        ? 'bg-blue-600 text-white border-blue-600'
                        : dark ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      {v === 'home' ? tm.home : v === 'away' ? tm.away : tm.neutral}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label text={tm.location} dark={dark} />
                <Input value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder={tm.locationPlaceholder} dark={dark} />
              </div>
              <div>
                <Label text={tm.competition} dark={dark} />
                <Input value={form.competition} onChange={v => setForm(f => ({ ...f, competition: v }))} placeholder={tm.competitionPlaceholder} dark={dark} />
              </div>
              {teams.length > 0 && (
                <div>
                  <Label text={tm.team} dark={dark} />
                  <select value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${inputBg}`}>
                    <option value="">—</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <Label text={tm.notes} dark={dark} />
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none ${inputBg}`} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{tm.cancel}</button>
              <button onClick={saveMatch} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors">
                {saving ? tm.saving : tm.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && resultMatch && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResult(false)} />
          <div className={`relative z-10 w-full sm:max-w-md ${modalBg} rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-base font-bold mb-1 ${textMain}`}>{tm.resultTitle}</h2>
            <p className={`text-sm mb-5 ${textSub}`}>FK Imom Hasan vs {resultMatch.opponent}</p>

            {/* Status */}
            <div className="mb-4">
              <Label text={tm.statusLabel} dark={dark} />
              <div className="flex gap-2">
                {['completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setResultForm(f => ({ ...f, status: s }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${resultForm.status === s
                      ? s === 'completed' ? 'bg-green-600 text-white border-green-600' : 'bg-red-500 text-white border-red-500'
                      : dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                    {s === 'completed' ? tm.statusCompleted : tm.statusCancelled}
                  </button>
                ))}
              </div>
            </div>

            {/* Score */}
            {resultForm.status === 'completed' && (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-4 justify-center">
                    <div className="text-center">
                      <p className={`text-xs mb-2 font-medium ${textSub}`}>{tm.ourScore}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setResultForm(f => ({ ...f, scoreUs: Math.max(0, f.scoreUs - 1) }))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}><Minus size={14} /></button>
                        <span className={`text-3xl font-bold w-10 text-center ${textMain}`}>{resultForm.scoreUs}</span>
                        <button onClick={() => setResultForm(f => ({ ...f, scoreUs: f.scoreUs + 1 }))} className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${textSub}`}>:</span>
                    <div className="text-center">
                      <p className={`text-xs mb-2 font-medium ${textSub}`}>{tm.theirScore}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setResultForm(f => ({ ...f, scoreThem: Math.max(0, f.scoreThem - 1) }))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}><Minus size={14} /></button>
                        <span className={`text-3xl font-bold w-10 text-center ${textMain}`}>{resultForm.scoreThem}</span>
                        <button onClick={() => setResultForm(f => ({ ...f, scoreThem: f.scoreThem + 1 }))} className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lineup */}
                {players.length > 0 && (
                  <div>
                    <p className={`text-xs font-semibold mb-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{tm.lineupTitle}</p>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {resultForm.lineup.map((l, i) => (
                        <div key={l.player} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${l.played ? dark ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : 'bg-blue-50 ring-1 ring-blue-200' : dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <input type="checkbox" checked={l.played} onChange={e => setResultForm(f => ({ ...f, lineup: f.lineup.map((x, j) => j === i ? { ...x, played: e.target.checked } : x) }))} className="w-4 h-4 accent-blue-600 flex-shrink-0" />
                          <span className={`flex-1 text-xs font-medium truncate ${textMain}`}>{l.firstName} {l.lastName}</span>
                          {l.played && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs ${textSub}`}>⚽</span>
                                <input type="number" min={0} max={20} value={l.goals}
                                  onChange={e => setResultForm(f => ({ ...f, lineup: f.lineup.map((x, j) => j === i ? { ...x, goals: +e.target.value } : x) }))}
                                  className={`w-10 text-center text-xs rounded-lg py-1 border ${inputBg}`} />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs ${textSub}`}>🎯</span>
                                <input type="number" min={0} max={20} value={l.assists}
                                  onChange={e => setResultForm(f => ({ ...f, lineup: f.lineup.map((x, j) => j === i ? { ...x, assists: +e.target.value } : x) }))}
                                  className={`w-10 text-center text-xs rounded-lg py-1 border ${inputBg}`} />
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowResult(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{tm.cancel}</button>
              <button onClick={saveResult} disabled={resultSaving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors">
                {resultSaving ? tm.saving : tm.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
