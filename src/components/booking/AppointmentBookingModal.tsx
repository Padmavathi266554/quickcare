import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  HeartPulse,
  Activity,
  Baby,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Department, Doctor, Appointment, QueueItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone: string;
  patientId?: string;
  onBookingSuccess: (appointment: Appointment, queueItem: QueueItem) => void;
}

export const AppointmentBookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientPhone,
  patientId,
  onBookingSuccess
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    appointment: Appointment;
    queueItem: QueueItem;
  } | null>(null);

  // Available dates to pick from (Mon 20 May, Tue 21 May, etc.)
  const availableDates = [
    { label: 'Today (Mon 20 May)', value: new Date().toISOString().split('T')[0], day: 'Mon', date: '20 May' },
    { label: 'Tue 21 May', value: '2026-05-21', day: 'Tue', date: '21 May' },
    { label: 'Wed 22 May', value: '2026-05-22', day: 'Wed', date: '22 May' },
    { label: 'Thu 23 May', value: '2026-05-23', day: 'Thu', date: '23 May' },
  ];

  // Available time slots with some simulated as occupied
  const timeSlots = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false }, // disabled slot
    { time: '04:00 PM', available: true },
    { time: '05:00 PM', available: true },
    { time: '06:00 PM', available: false }, // disabled slot
  ];

  // Load departments
  useEffect(() => {
    async function loadDepts() {
      try {
        const list = await api.getDepartments();
        setDepartments(list);
        if (list.length > 0 && !selectedDepartment) {
          setSelectedDepartment(list[0]);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    }
    if (isOpen) {
      loadDepts();
      // Set default date
      if (!selectedDate && availableDates.length > 0) {
        setSelectedDate(availableDates[0].value);
      }
    }
  }, [isOpen]);

  // Load doctors dynamically when department changes
  useEffect(() => {
    async function loadDocs() {
      if (!selectedDepartment) return;
      try {
        const docList = await api.getDoctors(selectedDepartment.name);
        setDoctors(docList);
        if (docList.length > 0) {
          setSelectedDoctor(docList[0]);
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
      }
    }
    loadDocs();
  }, [selectedDepartment]);

  if (!isOpen) return null;

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="h-6 w-6 text-rose-500" />;
      case 'Activity':
        return <Activity className="h-6 w-6 text-indigo-500" />;
      case 'Baby':
        return <Baby className="h-6 w-6 text-amber-500" />;
      case 'Stethoscope':
      default:
        return <Stethoscope className="h-6 w-6 text-emerald-600" />;
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedDepartment) return;
    if (step === 2 && !selectedDoctor) return;
    if (step === 3 && !selectedDate) return;
    if (step === 4 && !selectedTime) return;

    if (step === 4) {
      handleConfirmBooking();
      return;
    }
    setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDepartment || !selectedDoctor || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const result = await api.bookAppointment({
        patientId,
        patientName: patientName || 'Ravi Kumar',
        patientPhone: patientPhone || '+1 (555) 482-1920',
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        department: selectedDepartment.name,
        date: selectedDate,
        time: selectedTime,
        notes: notes || 'Consultation request via QuickCare Smart Queue'
      });

      setConfirmedBooking({
        appointment: result.appointment,
        queueItem: result.queueItem
      });
      setStep(5);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      onBookingSuccess(result.appointment, result.queueItem);
    } catch (err) {
      console.error('Failed to book appointment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedTime('');
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>{t('bookAppointment', 'Book Doctor Appointment')}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Step {step} of 5
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Instant digital token generation and automated queue assignment
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multi-step Breadcrumb Tracker */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          {[
            t('stepDept', 'Department'),
            t('stepDoctor', 'Doctor'),
            t('stepDate', 'Date'),
            t('stepTime', 'Time'),
            t('stepConfirm', 'Confirm')
          ].map((label, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-1.5 font-medium">
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-emerald-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`hidden sm:inline ${isCurrent ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>
                  {label}
                </span>
                {idx < 4 && <span className="text-slate-300 mx-1">›</span>}
              </div>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Step 1: Select Department</h4>
                <p className="text-xs text-slate-500">Choose the medical department for your visit</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dep) => {
                  const isSelected = selectedDepartment?._id === dep._id;
                  return (
                    <button
                      key={dep._id}
                      type="button"
                      onClick={() => setSelectedDepartment(dep)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                          {getDepartmentIcon(dep.iconName)}
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {dep.averageConsultationTime}m avg/patient
                        </span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{dep.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {dep.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Step 2: Select Doctor for {selectedDepartment?.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Available specialists on duty in this department
                </p>
              </div>

              <div className="space-y-2.5">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  return (
                    <button
                      key={doc._id}
                      type="button"
                      onClick={() => setSelectedDoctor(doc)}
                      className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                          <p className="text-xs text-slate-500">{doc.specialization}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="font-medium text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                              {doc.roomNumber}
                            </span>
                            <span>•</span>
                            <span>Avg {doc.averageConsultationTime} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Select Date */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Step 3: Select Appointment Date</h4>
                <p className="text-xs text-slate-500">Pick an available day for your consultation</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSelectedDate(item.value)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-xs font-semibold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {item.day}
                      </div>
                      <div className="text-base font-extrabold mt-1">{item.date}</div>
                      <div className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                        Slots Available
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Select Time Slot */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Step 4: Select Time Slot</h4>
                <p className="text-xs text-slate-500">
                  Select an open time slot for {selectedDoctor?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                        !slot.available
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{slot.time}</span>
                      </div>
                      <span className="text-[10px] font-normal">
                        {slot.available ? 'Open' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for visit or symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild fever, chest discomfort, routine checkup..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Confirmation & Generated Token */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-5 text-center">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 stroke-[2.2]" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {t('appointmentConfirmed', 'Appointment Confirmed!')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your electronic queue ticket has been issued in the hospital system
                </p>
              </div>

              {/* Digital Token Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20 text-center relative overflow-hidden">
                <div className="absolute top-2 right-3 text-[10px] font-mono tracking-wider opacity-60">
                  QUICKCARE DIGITAL PASS
                </div>
                <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1">
                  {t('yourToken', 'Your Digital Token')}
                </div>
                <div className="text-5xl font-mono font-extrabold tracking-tight my-2 drop-shadow-xs">
                  {confirmedBooking.appointment.tokenNumber}
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-4">
                  {confirmedBooking.appointment.department}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20 text-xs text-left">
                  <div>
                    <span className="text-emerald-200 text-[10px] uppercase font-bold block">{t('patientName', 'Patient')}</span>
                    <span className="font-bold">{confirmedBooking.appointment.patientName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200 text-[10px] uppercase font-bold block">{t('doctorLabel', 'Doctor')}</span>
                    <span className="font-bold">{confirmedBooking.appointment.doctorName}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-emerald-200 text-[10px] uppercase font-bold block">{t('appointmentDate', 'Date & Time')}</span>
                    <span className="font-semibold">{confirmedBooking.appointment.date} • {confirmedBooking.appointment.time}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-emerald-200 text-[10px] uppercase font-bold block">{t('estimatedWait', 'Estimated Wait')}</span>
                    <span className="font-bold text-amber-200">{confirmedBooking.appointment.estimatedWaitTime} {t('mins', 'mins')}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You will receive real-time notifications as your turn approaches. Please monitor the Live Queue tracker.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step < 5 ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t('back', 'Back')}</span>
              </button>

              <button
                id="booking-next-btn"
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && !selectedDepartment) ||
                  (step === 2 && !selectedDoctor) ||
                  (step === 3 && !selectedDate) ||
                  (step === 4 && !selectedTime) ||
                  isSubmitting
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {step === 4
                    ? (isSubmitting ? t('confirmAppointment', 'Confirming...') : t('confirmAppointment', 'Confirm Appointment'))
                    : t('continue', 'Continue')}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              id="booking-done-btn"
              type="button"
              onClick={resetAndClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {t('viewInQueueTracker', 'View in Queue Tracker')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
