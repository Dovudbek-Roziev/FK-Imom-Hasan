import { useEffect, useState } from 'react';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { MapPin, Clock, RotateCcw, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const UZ_DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

export default function PlayerTrainings() {
  const { dark, t } = useTheme();
  const toast = useToast();
  const tt = t.playerTrainings;

  const [history, setHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [rsvping, setRsvping] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/trainings/my/upcoming'),
      api.get('/trainings/my/history'),
    ]).then(([u, h]) => {
      setUpcoming(u.data.trainings || []);
      setHistory(h.data.trainings || []);
    }).catch((e) => {
      toast(e?.response?.data?.message || tt.rsvpError);
    }).finally(() => setLoading(false));
  }, []);

  const handleRsvp = async (trainingId, response) => {
    setRsvping(trainingId + response);
    try {
      await api.post(`/trainings/my/rsvp/${trainingId}`, { response });
      setUpcoming(prev => prev.map(tr =>
        tr._id === trainingId ? { ...tr, myResponse: response } : tr
      ));
    } catch (e) {
      toast(e?.response?.data?.message || tt.rsvpError);
    } finally {
      setRsvping(null);
    }
  };

  const items = tab === 'upcoming' ? upcoming : history;

  const card = dark ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white shadow-sm';
  const textMain = dark ? 'text-white' : 'text-slate-800';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';

  const attStyle = (s) => {
    if (s === 'keldi') return dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    if (s === 'kech_keldi') return dark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
    if (s === 'sababli') return dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
    return dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
  };

  const attLabel = (s) => {
    if (s === 'keldi') return tt.attPresent;
    if (s === 'kech_keldi') return tt.attLate;
    if (s === 'sababli') return tt.attExcused;
    return tt.attAbsent;
  };

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className={`text-xl font-bold ${textMain}`}>{tt.title}</h1>

      {/* Tab switcher */}
      <div className={`flex rounded-2xl p-1 gap-1 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {[
          { val: 'upcoming', label: tt.upcoming },
          { val: 'history', label: tt.history },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === val
                ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${card} rounded-2xl p-12 text-center`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Calendar size={24} className={textSub} strokeWidth={1.5} />
          </div>
          <p className={`text-sm ${textSub}`}>{tab === 'upcoming' ? tt.noUpcoming : tt.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((tr) => {
            const isRecurring = tr.days && tr.days.length > 0;
            const dateObj = tr.date ? new Date(tr.date) : null;
            const myResp = tr.myResponse;

            return (
              <div key={tr._id} className={`${card} rounded-2xl p-4`}>
                <div className="flex items-start gap-3">
                  {/* Date / recurring badge */}
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isRecurring
                      ? dark ? 'bg-purple-500/20' : 'bg-purple-50'
                      : dark ? 'bg-blue-500/20' : 'bg-blue-50'
                  }`}>
                    {isRecurring ? (
                      <RotateCcw size={20} className={dark ? 'text-purple-400' : 'text-purple-600'} strokeWidth={1.75} />
                    ) : dateObj ? (
                      <>
                        <span className={`text-xs font-bold leading-none ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {dateObj.getDate()}
                        </span>
                        <span className={`text-xs leading-none mt-0.5 ${dark ? 'text-blue-500' : 'text-blue-400'}`}>
                          {dateObj.toLocaleDateString('default', { month: 'short' })}
                        </span>
                      </>
                    ) : (
                      <Calendar size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${textMain}`}>{tr.title}</p>
                      {isRecurring && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                          {tt.recurring}
                        </span>
                      )}
                    </div>

                    {/* Day pills for recurring */}
                    {isRecurring && tab === 'upcoming' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {UZ_DAYS.map((day) => (
                          <span
                            key={day}
                            className={`text-xs px-2 py-0.5 rounded-lg font-medium transition-colors ${
                              tr.days.includes(day)
                                ? dark ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                                : dark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {tt.dayShort[day]}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {tr.startTime && (
                        <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                          <Clock size={12} strokeWidth={1.75} />
                          {tr.startTime}{tr.endTime ? ` – ${tr.endTime}` : ''}
                        </span>
                      )}
                      {tr.location && (
                        <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                          <MapPin size={12} strokeWidth={1.75} />
                          {tr.location}
                        </span>
                      )}
                      {tr.team && (
                        <span className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tr.team?.color }} />
                          <span className={textSub}>{tr.team?.name}</span>
                        </span>
                      )}
                    </div>

                    {/* RSVP buttons (upcoming only) */}
                    {tab === 'upcoming' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleRsvp(tr._id, 'kelaman')}
                          disabled={rsvping === tr._id + 'kelaman'}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 ${
                            myResp === 'kelaman'
                              ? 'bg-green-600 text-white'
                              : dark
                                ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          }`}
                        >
                          <CheckCircle2 size={13} strokeWidth={2} />
                          {myResp === 'kelaman' ? tt.rsvpConfirmed : tt.rsvpConfirm}
                        </button>
                        <button
                          onClick={() => handleRsvp(tr._id, 'kelmayman')}
                          disabled={rsvping === tr._id + 'kelmayman'}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 ${
                            myResp === 'kelmayman'
                              ? 'bg-red-500 text-white'
                              : dark
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <XCircle size={13} strokeWidth={2} />
                          {myResp === 'kelmayman' ? tt.rsvpDeclined : tt.rsvpDecline}
                        </button>
                      </div>
                    )}

                    {/* Attendance badge (history only) */}
                    {tab === 'history' && tr.myAttendance && (
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${attStyle(tr.myAttendance.status)}`}>
                          {attLabel(tr.myAttendance.status)}
                        </span>
                        {(tr.myAttendance.goals > 0 || tr.myAttendance.assists > 0) && (
                          <div className="flex gap-1.5">
                            {tr.myAttendance.goals > 0 && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                {tr.myAttendance.goals}⚽
                              </span>
                            )}
                            {tr.myAttendance.assists > 0 && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                {tr.myAttendance.assists}🎯
                              </span>
                            )}
                            {tr.myAttendance.rating > 0 && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                {tr.myAttendance.rating}/10
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
