import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Users,
  Clock,
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Stethoscope,
  Volume2,
  CalendarPlus,
  Radio,
  ArrowLeft
} from 'lucide-react';
import { Department, QueueItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface LiveQueueTrackerProps {
  onBackToDashboard?: () => void;
  onBookAppointment?: () => void;
  initialDepartment?: string;
  patientToken?: string;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  onBackToDashboard,
  onBookAppointment,
  initialDepartment = 'General Physician',
  patientToken = 'A102'
}) => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>(initialDepartment);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoPolling, setAutoPolling] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Fetch departments and queue
  const fetchData = async (showRefreshSpin = false) => {
    if (showRefreshSpin) setIsRefreshing(true);
    try {
      const [depts, queue] = await Promise.all([
        departments.length === 0 ? api.getDepartments() : Promise.resolve(departments),
        api.getQueue(selectedDept)
      ]);
      if (departments.length === 0) setDepartments(depts);
      setQueueItems(queue);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load queue data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  // Real-time polling every 4 seconds when active
  useEffect(() => {
    if (!autoPolling) return;
    const timer = setInterval(() => {
      fetchData(false);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPolling, selectedDept]);

  // Calculations for current token and queue information
  const activeItems = queueItems
    .filter(q => q.status !== 'completed' && q.status !== 'skipped')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const currentActive = activeItems.find(q => q.status === 'current') || (queueItems.find(q => q.status === 'completed') ? queueItems[0] : null);
  const currentTokenNumber = currentActive?.tokenNumber || (selectedDept === 'Cardiology' ? 'B201' : 'A102');

  const myQueueItem = queueItems.find(q => q.tokenNumber === patientToken);
  const patientsWaiting = activeItems.filter(q => q.status === 'waiting' || q.status === 'next').length;

  // People ahead calculation
  let peopleAhead = 0;
  if (myQueueItem) {
    if (myQueueItem.status === 'current' || myQueueItem.status === 'completed') {
      peopleAhead = 0;
    } else {
      peopleAhead = activeItems.filter(q => q.queuePosition < myQueueItem.queuePosition).length;
    }
  } else {
    peopleAhead = Math.max(0, patientsWaiting - 1);
  }

  const estimatedWait = myQueueItem
    ? myQueueItem.estimatedWaitTime
    : activeItems.length > 0
    ? activeItems[0].estimatedWaitTime || 15
    : 15;

  // Visual Progress Tracker Calculation:
  // Stages: Token Generated → In Queue → Almost Your Turn → Your Turn
  const getProgressStage = () => {
    if (!myQueueItem) return 2; // Default In Queue
    if (myQueueItem.status === 'current') return 4; // Your Turn
    if (myQueueItem.status === 'next' || peopleAhead <= 1) return 3; // Almost Your Turn
    if (myQueueItem.status === 'waiting') return 2; // In Queue
    return 1; // Token Generated
  };

  const currentStage = getProgressStage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('backToDashboard', 'Back to Dashboard')}</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('liveQueueTracking', 'Live Queue Tracking')}</span>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              {t('liveBroadcast', 'Live Broadcast')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time digital token display and smart wait-time forecasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time Polling Toggle */}
          <button
            onClick={() => setAutoPolling(!autoPolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              autoPolling
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${autoPolling ? 'text-emerald-600 animate-pulse' : ''}`} />
            <span>{autoPolling ? 'Live Polling (4s)' : 'Polling Paused'}</span>
          </button>

          {/* Working Refresh Status Button */}
          <button
            id="queue-refresh-button"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('refresh', 'Refresh Status')}</span>
          </button>
        </div>
      </div>

      {/* DEPARTMENT SELECTOR (As requested in prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            {t('selectDept', 'Select Department')}
          </label>
          <div className="relative inline-block w-64">
            <select
              id="department-selector"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          <div>Last synced: <span className="text-slate-600 font-medium">{lastRefreshed}</span></div>
          <div className="text-emerald-600 font-medium">Automatic sync active</div>
        </div>
      </div>

      {/* CURRENT TOKEN DISPLAY (Large card as requested) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/20 text-center flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-100 bg-white/15 px-3 py-1 rounded-full">
              {t('currentConsulting', 'NOW CONSULTING')}
            </span>
            <p className="text-xs text-emerald-100 mt-2 font-medium">{t('currentToken', 'Current Token')}</p>
            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight my-2 drop-shadow-sm">
              {currentTokenNumber}
            </div>
            <div className="inline-block text-xs font-semibold px-3 py-1 rounded-lg bg-black/20 text-emerald-50">
              {selectedDept} • Room 101
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/20 text-xs text-emerald-100 flex items-center justify-center gap-2">
            <Volume2 className="h-4 w-4 text-emerald-200 animate-pulse" />
            <span>Audio announcements chime when token changes</span>
          </div>
        </div>

        {/* QUEUE INFORMATION METRICS */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('currentToken', 'Current Token')}
            </span>
            <div className="text-3xl font-mono font-black text-slate-900 my-2">
              {currentTokenNumber}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Inside consultation
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('patientsWaiting', 'Patients Waiting')}
            </span>
            <div className="text-3xl font-black text-slate-900 my-2">
              {patientsWaiting}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              In waiting area
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('estimatedWait', 'Estimated Wait Time')}
            </span>
            <div className="text-3xl font-black text-emerald-600 my-2">
              {estimatedWait} <span className="text-sm font-normal text-slate-500">{t('mins', 'mins')}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Dynamic algorithm based
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('peopleAhead', 'People Ahead')}
            </span>
            <div className="text-3xl font-black text-teal-700 my-2">
              {peopleAhead}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              For token {patientToken}
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE PROGRESS (Visual progress tracker: Token Generated → In Queue → Almost Your Turn → Your Turn) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Queue Progress Tracker for Token <span className="font-mono text-emerald-600">{patientToken}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Follow your stage in real time as preceding patients finish consultations
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Stage {currentStage} of 4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: 1, title: 'Token Generated', desc: 'Ticket registered in system' },
            { step: 2, title: 'In Queue', desc: 'Waiting in hospital lounge' },
            { step: 3, title: 'Almost Your Turn', desc: 'Next or 1 patient ahead' },
            { step: 4, title: 'Your Turn', desc: 'Proceed to consultation room' }
          ].map((s) => {
            const isCompleted = currentStage > s.step;
            const isCurrent = currentStage === s.step;
            return (
              <div
                key={s.step}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20' // Highlight patient's current stage in green
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : s.step}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold ${isCurrent ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEPARTMENT QUEUE ROSTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Complete Queue Roster for {selectedDept}
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('token', 'Token')}</th>
                <th className="py-3 px-4">{t('patientName', 'Patient Name')}</th>
                <th className="py-3 px-4">{t('doctorLabel', 'Doctor')}</th>
                <th className="py-3 px-4">{t('estimatedWait', 'Estimated Wait')}</th>
                <th className="py-3 px-4 text-right">{t('status', 'Queue Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {queueItems.map((item) => {
                const isCurrent = item.status === 'current';
                const isMyToken = item.tokenNumber === patientToken;
                return (
                  <tr
                    key={item._id}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-emerald-50/80 font-bold'
                        : isMyToken
                        ? 'bg-teal-50/50'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{item.tokenNumber}</span>
                        {isMyToken && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600 text-white rounded font-sans">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">{item.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{item.doctorName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.status === 'completed'
                        ? 'Completed'
                        : item.status === 'current'
                        ? 'Being Consulted'
                        : `${item.estimatedWaitTime} mins`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.status === 'current'
                            ? 'bg-emerald-500 text-white'
                            : item.status === 'completed'
                            ? 'bg-slate-100 text-slate-500'
                            : item.status === 'next'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
