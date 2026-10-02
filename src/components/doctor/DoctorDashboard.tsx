import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
  RefreshCw,
  Phone,
  Tag,
  SkipForward,
  Activity
} from 'lucide-react';
import { QueueItem, Appointment, Doctor } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const DoctorDashboard: React.FC = () => {
  const { user, doctor: contextDoctor } = useAuth();
  const { t } = useLanguage();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const doctorDepartment = contextDoctor?.department || 'General Physician';
  const doctorName = contextDoctor?.name || user?.name || 'Dr. Ramesh Chandra';

  const loadDoctorQueue = async () => {
    try {
      const [queueData, apts] = await Promise.all([
        api.getQueue(doctorDepartment),
        api.getAppointments({ department: doctorDepartment })
      ]);
      setQueue(queueData);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load doctor queue', err);
    }
  };

  useEffect(() => {
    loadDoctorQueue();
    const interval = setInterval(loadDoctorQueue, 4000);
    return () => clearInterval(interval);
  }, [doctorDepartment]);

  // Current Patient
  const currentPatient = queue.find(q => q.status === 'current');

  // Upcoming Patients
  const upcomingPatients = queue.filter(q => q.status === 'next' || q.status === 'waiting')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  // Completed today
  const completedToday = queue.filter(q => q.status === 'completed');

  // Complete consultation action & automatically advance to next patient
  const handleCompleteConsultation = async () => {
    if (!currentPatient) return;
    setIsProcessing(true);
    const completedName = currentPatient.patientName;
    const completedToken = currentPatient.tokenNumber;

    try {
      // 1. Advance queue and call next patient in line
      const result = await api.callNextPatient(doctorDepartment, contextDoctor?._id);
      
      if (result.currentPatient) {
        setFeedbackMessage(`✅ Consultation for ${completedName} (${completedToken}) completed! Now attending: ${result.currentPatient.patientName} (${result.currentPatient.tokenNumber}).`);
      } else {
        setFeedbackMessage(`✅ Consultation for ${completedName} (${completedToken}) completed! All patients in queue have been attended.`);
      }
      setConsultationNotes('');
      await loadDoctorQueue();
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Error completing consultation');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  // Call next patient action
  const handleCallNextPatient = async () => {
    setIsProcessing(true);
    try {
      const result = await api.callNextPatient(doctorDepartment, contextDoctor?._id);
      setFeedbackMessage(result.message);
      await loadDoctorQueue();
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Error calling next patient');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Skip current patient
  const handleSkipPatient = async () => {
    if (!currentPatient) return;
    setIsProcessing(true);
    try {
      await api.updateQueueItemStatus(currentPatient._id, 'skipped');
      setFeedbackMessage(`Patient ${currentPatient.patientName} (${currentPatient.tokenNumber}) skipped.`);
      await loadDoctorQueue();
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Error skipping patient');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner with Doctor Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Stethoscope className="h-7 w-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {doctorName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                On Duty • {contextDoctor?.roomNumber || 'Room 101'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Department of {doctorDepartment} • QuickCare Consultation Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDoctorQueue}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('inQueue', "Today's In-Queue")}</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{upcomingPatients.length + (currentPatient ? 1 : 0)}</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('completed', 'Completed Consultations')}</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{completedToday.length}</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('estimatedWait', 'Avg Consultation')}</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{contextDoctor?.averageConsultationTime || 5} <span className="text-xs font-normal text-slate-500">{t('mins', 'mins')}</span></div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Feedback message banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Activity className="h-4 w-4 text-emerald-600 animate-spin" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid: Current Patient & Consultation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CURRENT PATIENT CARD (As requested in prompt) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Current Patient in Consultation
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Active in {contextDoctor?.roomNumber || 'Room 101'}
              </span>
            </div>

            {currentPatient ? (
              <div className="py-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400">Token Number</span>
                    <div className="text-4xl font-black font-mono text-emerald-600 mt-0.5">
                      {currentPatient.tokenNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-400">Status</span>
                    <div className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-0.5">
                      In Consultation
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Patient Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{currentPatient.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-semibold text-slate-800">{currentPatient.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Consulting Doctor:</span>
                    <span className="font-semibold text-slate-800">{currentPatient.doctorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Joined Queue:</span>
                    <span className="text-slate-600">
                      {new Date(currentPatient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Consultation Notes / Rx Diagnosis
                  </label>
                  <textarea
                    rows={3}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Enter diagnostic observations, vitals, prescriptions, or follow-up recommendations..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Patient Currently Active</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Click "Call Next Patient" to advance the queue and notify the next patient in line.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Consultation Management Action Buttons (As requested: [Complete Consultation], [Call Next Patient]) */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              id="doc-complete-consultation-btn"
              onClick={handleCompleteConsultation}
              disabled={!currentPatient || isProcessing}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{t('completed', 'Complete Consultation')}</span>
            </button>

            <button
              id="doc-call-next-btn"
              onClick={handleCallNextPatient}
              disabled={upcomingPatients.length === 0 || isProcessing}
              className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserCheck className="h-4 w-4" />
              <span>{t('yourTurn', 'Call Next Patient')}</span>
            </button>

            {currentPatient && (
              <button
                id="doc-skip-btn"
                onClick={handleSkipPatient}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors"
                title="Skip Patient"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* UPCOMING PATIENTS IN QUEUE */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Patients</h3>
              <p className="text-xs text-slate-500">In waiting lounge for {doctorDepartment}</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {upcomingPatients.length} Waiting
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {upcomingPatients.length > 0 ? (
              upcomingPatients.map((item, idx) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-bold text-emerald-700 text-sm bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {item.tokenNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.patientName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Position #{idx + 1}</span>
                        <span>•</span>
                        <span>Est {item.estimatedWaitTime}m</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'next'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status === 'next' ? 'Next in Line' : 'Waiting'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No upcoming patients in queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
