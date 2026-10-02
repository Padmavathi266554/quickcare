import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Users,
  Calendar,
  Stethoscope,
  RefreshCw,
  CalendarPlus,
  ArrowUpRight,
  Check,
  User as UserIcon,
  Layers,
  Volume2,
  BellRing,
  Eye,
  PhoneCall,
  XCircle,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  CalendarDays,
  DoorOpen,
  Send,
  MessageSquare
} from 'lucide-react';
import { PatientQueueSummary, QueueItem, Appointment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface PatientDashboardProps {
  onBookAppointment: () => void;
  onViewLiveQueue: () => void;
  onOpenNotifications: () => void;
  activeNavTab: 'home' | 'appointments' | 'profile';
  setActiveNavTab: (tab: 'home' | 'appointments' | 'profile') => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onBookAppointment,
  onViewLiveQueue,
  onOpenNotifications,
  activeNavTab,
  setActiveNavTab
}) => {
  const { user, patient } = useAuth();
  const { language, setLanguage, currentLanguage, languages, t } = useLanguage();
  const [summary, setSummary] = useState<PatientQueueSummary | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Settings in Profile
  const [audioChimes, setAudioChimes] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [languageToast, setLanguageToast] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Cancel Appointment Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Delay / Reschedule Time Modal State
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isAdjustingTime, setIsAdjustingTime] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState<number>(30);
  const [selectedFreeSlot, setSelectedFreeSlot] = useState<string>('11:30 AM');
  const [delayReason, setDelayReason] = useState<string>('Traffic delay');

  // Available free slots today for patient rescheduling
  const availableTodaySlots = [
    '11:30 AM',
    '12:15 PM',
    '01:45 PM',
    '02:30 PM',
    '03:45 PM',
    '04:30 PM'
  ];

  const fetchPatientData = async () => {
    try {
      const data = await api.getPatientQueueSummary(patient?._id, undefined);
      setSummary(data);

      if (patient?._id) {
        const apts = await api.getAppointments({ patientId: patient._id });
        setPatientAppointments(apts);
      }
    } catch (err) {
      console.error('Failed to load patient queue summary', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(fetchPatientData, 4000);
    return () => clearInterval(interval);
  }, [patient?._id]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchPatientData();
  };

  // Sound chime preview test
  const playQueueChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);

      setActionNotice({
        type: 'info',
        message: '🔔 Voice announcement chime preview played.'
      });
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e) {
      console.warn('Audio context not permitted or supported', e);
    }
  };

  const handleLanguageChange = (code: string, name: string) => {
    setLanguage(code);
    setLanguageToast(`${name} (${code.toUpperCase()})`);
    setTimeout(() => {
      setLanguageToast(null);
    }, 2500);
  };

  // Cancel booked appointment
  const handleConfirmCancel = async () => {
    const aptId = summary?.appointment?._id;
    if (!aptId) {
      setIsCancelModalOpen(false);
      return;
    }
    setIsCancelling(true);
    try {
      await api.cancelAppointment(aptId);
      setActionNotice({
        type: 'info',
        message: 'Appointment cancelled successfully. Your queue token has been released.'
      });
      setIsCancelModalOpen(false);
      await fetchPatientData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to cancel appointment.'
      });
    } finally {
      setIsCancelling(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Adjust time when patient is delayed
  const handleConfirmTimeAdjustment = async () => {
    const aptId = summary?.appointment?._id;
    if (!aptId) {
      setIsDelayModalOpen(false);
      return;
    }
    setIsAdjustingTime(true);
    try {
      // Reschedule appointment to today's selected slot
      await api.rescheduleAppointment({
        appointmentId: aptId,
        newDate: 'Today',
        newTime: selectedFreeSlot,
        reason: `Patient delayed by ${delayMinutes} mins (${delayReason})`
      });

      // Also notify queue of patient delay if token exists
      if (summary?.patientQueueItem?._id) {
        await api.markPatientDelay(summary.patientQueueItem._id, delayMinutes);
      }

      setActionNotice({
        type: 'success',
        message: `Visit adjusted to ${selectedFreeSlot} today! Your queue spot is preserved.`
      });
      setIsDelayModalOpen(false);
      await fetchPatientData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to adjust appointment time.'
      });
    } finally {
      setIsAdjustingTime(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const displayName = patient?.name || user?.name || 'Ravi Kumar';
  const tokenItem = summary?.patientQueueItem;
  const hasActiveToken = !!tokenItem;
  const currentToken = tokenItem?.tokenNumber || '';
  const deptQueue = summary?.departmentQueue || [];
  const isCompleted = tokenItem?.status === 'completed';
  const isCancelled = summary?.appointment?.status === 'cancelled';

  // Identify where the queue is right now
  const consultingItem = deptQueue.find(q => q.status === 'current');
  const nextInLineItem = deptQueue.find(q => q.status === 'next');

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12 ${highContrastMode ? 'contrast-125' : ''}`}>
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-xs animate-in fade-in slide-in-from-top-2 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : actionNotice.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-teal-50 text-teal-800 border-teal-200'
        }`}>
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Language Switch Toast */}
      {languageToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{t('selectLang', 'Language switched to')}: {languageToast}</span>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {t('patientPortal', 'Patient Portal')}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.native}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            {currentLanguage.greeting}, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t('queueSummary', 'Your Queue Summary')} • {t('hospitalStatus', 'Live hospital admission status')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="patient-refresh-btn"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
            title={t('refresh', 'Refresh')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">{t('refresh', 'Refresh')}</span>
          </button>
          <button
            id="patient-book-btn"
            onClick={onBookAppointment}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>{t('bookNew', 'Book Visit')}</span>
          </button>
        </div>
      </div>

      {activeNavTab === 'home' && (
        <div className="space-y-6">
          {/* 1. BOOKED APPOINTMENT TOKEN TICKET OR BOOKING BANNER */}
          {hasActiveToken ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl p-6 sm:p-8 border border-slate-700">
              {/* Ambient decorative glow */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold font-mono">
                    ACTIVE QUEUE TOKEN TICKET
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : isCancelled
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                    : tokenItem?.status === 'current'
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse'
                    : tokenItem?.status === 'next'
                    ? 'bg-teal-500/40 text-teal-200 border border-teal-400/50'
                    : 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                }`}>
                  {isCompleted ? 'Consultation Completed' : isCancelled ? 'Appointment Cancelled' : tokenItem?.status === 'current' ? 'Consultation Active' : tokenItem?.status === 'next' ? 'Next in Line' : 'In Queue'}
                </span>
              </div>

              {/* Ticket Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Token Number Display */}
                <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-700/80 pb-5 md:pb-0 md:pr-6">
                  <p className="text-xs text-slate-400 font-medium">Your Token</p>
                  <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mt-1">
                    {currentToken}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{tokenItem?.department || 'General Physician'}</span>
                  </div>
                </div>

                {/* Consultation Details & Wait Time */}
                <div className="md:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-bold text-white text-sm">{tokenItem?.doctorName || 'Dr. Ramesh Chandra'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Booked Slot:</span>
                    <span className="font-medium text-slate-200">
                      {summary?.appointment?.date || 'Today'} • {summary?.appointment?.time || '10:00 AM'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium mb-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Estimated Wait</span>
                      </div>
                      <div className="text-xl font-extrabold text-white">
                        {isCompleted ? '0' : summary?.estimatedWaitTime !== undefined ? summary.estimatedWaitTime : 5} <span className="text-xs font-normal text-slate-300">mins</span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-teal-300 font-medium mb-0.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>People Ahead</span>
                      </div>
                      <div className="text-xl font-extrabold text-white">
                        {isCompleted ? '0' : summary?.peopleAhead !== undefined ? summary.peopleAhead : 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Notice If Finished */}
              {isCompleted && (
                <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-200">Consultation Completed</p>
                    <p className="text-slate-300">You have completed your consultation with Dr. Ramesh Chandra. Prescriptions are saved in your profile.</p>
                  </div>
                </div>
              )}

              {/* Cancelled Notice If Cancelled */}
              {isCancelled && (
                <div className="mt-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <span className="text-rose-200">This appointment was cancelled. You can book a new consultation anytime.</span>
                  </div>
                  <button
                    onClick={onBookAppointment}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 shrink-0"
                  >
                    Book New
                  </button>
                </div>
              )}

              {/* Action Buttons: Cancel & Adjust Time If Active */}
              {!isCompleted && !isCancelled && (
                <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Running Late / Adjust Time Button */}
                    <button
                      id="patient-adjust-time-btn"
                      onClick={() => setIsDelayModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-teal-600/40 hover:bg-teal-600/60 text-teal-200 border border-teal-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock3 className="h-3.5 w-3.5 text-teal-300" />
                      <span>Running Late? Adjust Time</span>
                    </button>

                    {/* Cancel Appointment Button */}
                    <button
                      id="patient-cancel-apt-btn"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 text-rose-400" />
                      <span>Cancel Appointment</span>
                    </button>
                  </div>

                  <button
                    id="patient-view-tracker-btn"
                    onClick={onViewLiveQueue}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Open Live Tracker</span>
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>No Consultation Active</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Ready to visit the hospital?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg">
                  Book an appointment with your preferred doctor to receive a digital queue token, track live wait times, and get voice/SMS announcements.
                </p>
              </div>
              <button
                onClick={onBookAppointment}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment Now</span>
              </button>
            </div>
          )}

          {/* 2. LIVE QUEUE STATUS (Clear, easy to understand: where the queue is & time estimation) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Live Hospital Queue Status</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {tokenItem?.department || 'General Physician'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  See where the queue is and estimated time to meet the doctor
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live In-Hospital Queue</span>
              </div>
            </div>

            {/* Where the queue is right now: Active Room & Next Patient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inside Doctor's Room */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                  <DoorOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Now Consulting in Room 101
                  </span>
                  <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
                    Token {consultingItem?.tokenNumber || 'A101'}
                  </p>
                  <span className="text-xs text-slate-600 font-medium">
                    Dr. Ramesh Chandra (Attending)
                  </span>
                </div>
              </div>

              {/* Next in line */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-600/20">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                    Next Called to Room
                  </span>
                  <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
                    Token {nextInLineItem?.tokenNumber || currentToken}
                  </p>
                  <span className="text-xs text-slate-600 font-medium">
                    {nextInLineItem?.tokenNumber === currentToken ? '✨ Your turn next! Please wait near door' : 'Please prepare to enter'}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Estimation Highlight */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Estimated Time to Meet Doctor: <span className="text-emerald-700 font-black">{summary?.estimatedWaitTime !== undefined ? summary.estimatedWaitTime : 5} minutes</span>
                  </p>
                  <p className="text-slate-500">
                    Calculated for {summary?.peopleAhead !== undefined ? summary.peopleAhead : 1} patient(s) ahead in line (~5 mins per consultation).
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-700">
                Lounge Waiting Zone B
              </span>
            </div>

            {/* Queue Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="bg-slate-100/80 px-4 py-2.5 grid grid-cols-12 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <div className="col-span-3">Token</div>
                <div className="col-span-4">Patient</div>
                <div className="col-span-3">Wait Time</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              <div className="divide-y divide-slate-100">
                {deptQueue.length > 0 ? (
                  deptQueue.map((item) => {
                    const isMyToken = item.tokenNumber === currentToken;
                    const isCurrent = item.status === 'current';
                    const isItemCompleted = item.status === 'completed';

                    return (
                      <div
                        key={item._id}
                        className={`px-4 py-3 grid grid-cols-12 items-center text-xs transition-colors ${
                          isCurrent
                            ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500 font-semibold'
                            : isMyToken
                            ? 'bg-teal-50/50 font-semibold'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="col-span-3 flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {item.tokenNumber}
                          </span>
                          {isMyToken && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="col-span-4 truncate text-slate-700 font-medium">
                          {item.patientName}
                        </div>

                        <div className="col-span-3 text-slate-500">
                          {isItemCompleted ? (
                            <span className="text-slate-400">Completed</span>
                          ) : isCurrent ? (
                            <span className="text-emerald-700 font-bold">In Room Now</span>
                          ) : (
                            <span>{item.estimatedWaitTime} mins</span>
                          )}
                        </div>

                        <div className="col-span-2 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isItemCompleted
                                ? 'bg-slate-100 text-slate-500'
                                : isCurrent
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : item.status === 'next'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active patients in queue for this department.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeNavTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
              <p className="text-xs text-slate-500">History and upcoming visits at QuickCare Hospital</p>
            </div>
            <button
              onClick={onBookAppointment}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
            >
              + Book New Visit
            </button>
          </div>

          <div className="space-y-3">
            {summary?.appointment && (
              <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 shadow-xs">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Booked Visit
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {summary.appointment.department} Consultation
                    </h3>
                    <p className="text-xs text-slate-500">With {summary.appointment.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-700">
                      {summary.appointment.tokenNumber}
                    </span>
                    <p className="text-[10px] text-slate-400">Token Number</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Date</span>
                    <span className="font-bold text-slate-800">{summary.appointment.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Time Slot</span>
                    <span className="font-bold text-slate-800">{summary.appointment.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Estimated Wait</span>
                    <span className="font-bold text-emerald-700">{summary.appointment.estimatedWaitTime} mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Status</span>
                    <span className="font-bold uppercase text-emerald-600">{summary.appointment.status}</span>
                  </div>
                </div>

                {/* Reschedule / Cancel actions inside appointment card */}
                {summary.appointment.status !== 'cancelled' && summary.appointment.status !== 'completed' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsDelayModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Running Late? Adjust Time
                    </button>
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Past appointments records */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Past Consultation Records</h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Cardiology Checkup • Dr. Suresh Patel</p>
                    <p className="text-slate-500 mt-0.5">Token B201 • Completed on 15 May 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                    Completed
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">General Medicine Routine • Dr. Priya Sharma</p>
                    <p className="text-slate-500 mt-0.5">Token A092 • Completed on 02 May 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB (With Settings: Language, Queue voice announcements, SMS/WhatsApp live updates) */}
      {activeNavTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'ravi@gmail.com'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Patient ID: {patient?._id || 'PAT-1029'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-0.5 font-medium">Contact Phone</span>
              <span className="font-bold text-slate-900">{patient?.phone || '+1 (555) 482-1920'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-0.5 font-medium">Age & Gender</span>
              <span className="font-bold text-slate-900">{patient?.age || 34} Yrs • {patient?.gender || 'Male'}</span>
            </div>
          </div>

          {/* SETTINGS SECTION (As requested: Language, queue voice announcement, SMS/WhatsApp live updates) */}
          <div className="pt-4 border-t border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Hospital Settings & Notifications</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your language preferences and real-time queue audio alerts
              </p>
            </div>

            {/* Language Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {t('selectLang', 'Select Preferred Language')}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Changes interface across the entire app
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t('chooseLangDesc', 'Choose your language for token tracking, hospital queue status announcements, and consultation alerts:')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      id={`profile-lang-${lang.code}`}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code, lang.name)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{lang.flag}</span>
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {lang.name}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {lang.native}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification & Audio Queue Settings */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Queue Audio & Alert Settings</span>

              <div className="space-y-2.5">
                {/* Audio Turn Announcement */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Volume2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Queue Voice Announcements</span>
                      <span className="text-[10px] text-slate-500">Audio chime when token number moves ahead</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={playQueueChime}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Test Audio Chime"
                    >
                      🔊 Test Chime
                    </button>
                    <input
                      type="checkbox"
                      checked={audioChimes}
                      onChange={(e) => setAudioChimes(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* SMS / WhatsApp alerts */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">SMS / WhatsApp Live Updates</span>
                      <span className="text-[10px] text-slate-500">Receive token arrival reminder when 2 people ahead to {patient?.phone || '+1 (555) 482-1920'}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                </div>

                {/* High Contrast */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Eye className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">High Contrast / Senior Mode</span>
                      <span className="text-[10px] text-slate-500">Enlarged token display for easy hospital corridor visibility</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrastMode}
                    onChange={(e) => setHighContrastMode(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Hospital Emergency Support Contact */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="h-4 w-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-rose-900 block">Hospital Emergency Helpdesk</span>
                  <span className="text-[10px] text-rose-700">Available 24/7 for urgent clinical assistance</span>
                </div>
              </div>
              <span className="font-black text-rose-700 font-mono text-xs bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                Dial 108 / 911
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION (Home, Appointments, Queue Tracker, Profile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 shadow-lg flex items-center justify-around max-w-md mx-auto sm:max-w-lg sm:rounded-t-2xl">
        <button
          id="patient-nav-home"
          onClick={() => setActiveNavTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeNavTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity className="h-5 w-5" />
          <span className="text-[11px]">{t('navHome', 'Home')}</span>
        </button>

        <button
          id="patient-nav-appointments"
          onClick={() => setActiveNavTab('appointments')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeNavTab === 'appointments' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[11px]">{t('navAppointments', 'Appointments')}</span>
        </button>

        <button
          id="patient-nav-tracker"
          onClick={onViewLiveQueue}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <Layers className="h-5 w-5" />
          <span className="text-[11px]">{t('navTracker', 'Queue Tracker')}</span>
        </button>

        <button
          id="patient-nav-profile"
          onClick={() => setActiveNavTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeNavTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[11px]">{t('navProfile', 'Profile')}</span>
        </button>
      </div>

      {/* MODAL: CANCEL APPOINTMENT CONFIRMATION */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel your booked consultation token <span className="font-mono font-bold text-slate-900">{currentToken}</span> with <span className="font-bold text-slate-900">{summary?.appointment?.doctorName || 'Dr. Ramesh Chandra'}</span>?
              </p>
              <p className="text-xs text-rose-600 font-medium mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                This will release your place in the live hospital queue for other waiting patients.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RUNNING LATE? ADJUST TIME (As requested: adjust to time which is free on that day) */}
      {isDelayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Running Late? Adjust Visit Time</h3>
                  <p className="text-xs text-slate-500">Pick an open free slot today to keep your appointment valid</p>
                </div>
              </div>
              <button
                onClick={() => setIsDelayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Quick Delay Offset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Expected Delay Time:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDelayMinutes(mins)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      delayMinutes === mins
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Available Free Slots Today */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select an Open Free Slot Today:</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Available with Dr. Ramesh</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableTodaySlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedFreeSlot(slot)}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold border text-center transition-all ${
                      selectedFreeSlot === slot
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delay Reason (Optional):
              </label>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Traffic delay">Traffic delay / transport issue</option>
                <option value="Work / meeting hold up">Work / meeting hold up</option>
                <option value="Health emergency">Health checkup delay</option>
                <option value="Family obligation">Family / personal commitment</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              Your appointment will be shifted to <strong>{selectedFreeSlot} today</strong>, ensuring you don't lose your consultation slot and patients currently at the hospital can proceed ahead smoothly.
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={isAdjustingTime}
                onClick={() => setIsDelayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Current Slot
              </button>
              <button
                type="button"
                disabled={isAdjustingTime}
                onClick={handleConfirmTimeAdjustment}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {isAdjustingTime ? 'Updating...' : `Confirm Time: ${selectedFreeSlot}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
