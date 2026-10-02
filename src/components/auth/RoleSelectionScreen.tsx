import React from 'react';
import { UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  Shield,
  ArrowRight,
  Ticket,
  Clock,
  Users,
  CheckCircle2
} from 'lucide-react';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  onGoToSignUp?: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  onGoToSignUp
}) => {
  const { t } = useLanguage();

  const roleOptions: Array<{
    role: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    accentColor: string;
    borderHover: string;
    bgAccent: string;
    btnColor: string;
    features: string[];
  }> = [
    {
      role: 'patient',
      title: t('patient', 'Patient Portal'),
      subtitle: t('patientRoleSubtitle', 'For visiting patients & families'),
      description: t('patientRoleDesc', 'Check live queue tokens, see estimated time to meet the doctor, and manage your booked appointments.'),
      icon: HeartPulse,
      badge: t('patientRoleBadge', 'Token Tickets & Wait Time'),
      accentColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      bgAccent: 'bg-emerald-50 text-emerald-700',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      features: [
        t('featTicket', 'Digital token ticket & position'),
        t('featWait', 'Live estimated wait time tracker'),
        t('featDelay', 'Cancel or delay arrival adjustment')
      ]
    },
    {
      role: 'doctor',
      title: t('doctor', 'Doctor OPD Portal'),
      subtitle: t('doctorRoleSubtitle', 'For consulting physicians & specialists'),
      description: t('doctorRoleDesc', 'Consult patients, mark consultations completed, and immediately advance to the next waiting patient in line.'),
      icon: Stethoscope,
      badge: t('doctorRoleBadge', 'Consultations & Next Patient'),
      accentColor: 'text-teal-600',
      borderHover: 'hover:border-teal-500 hover:shadow-teal-500/10',
      bgAccent: 'bg-teal-50 text-teal-700',
      btnColor: 'bg-teal-600 hover:bg-teal-700 text-white',
      features: [
        t('featOpd', 'Live OPD waiting queue by department'),
        t('featCallNext', 'Instant "Completed" next patient call'),
        t('featNotes', 'Patient consultation notes & history')
      ]
    },
    {
      role: 'admin',
      title: t('hospitalAdmin', 'Hospital Admin Portal'),
      subtitle: t('adminRoleSubtitle', 'For hospital operations & supervisors'),
      description: t('adminRoleDesc', 'Manage department queues, adjust delayed patient slots, and update doctor duty availability in real-time.'),
      icon: Shield,
      badge: t('adminRoleBadge', 'Operations & Doctor Status'),
      accentColor: 'text-indigo-600',
      borderHover: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
      bgAccent: 'bg-indigo-50 text-indigo-700',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      features: [
        t('featDepts', 'Department queues & appointment volume'),
        t('featDocAvail', 'Real-time doctor duty & availability toggle'),
        t('featDelayMgr', 'Delayed patients & no-show management')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Quick<span className="text-emerald-600">Care</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium">Smart Hospital Queue Management System</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
          {t('roleSelection', 'Select Role to Login')}
        </span>
      </header>

      {/* Main Role Selection Area */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {t('welcomeHospital', 'Welcome to QuickCare Hospital')}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t('selectYourRole', 'Which role would you like to log in as?')}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t('selectRoleDesc', 'Please select your role below to access your dedicated login page, booked appointment token tickets, live queue status, or clinical operations.')}
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.role}
                id={`role-card-${opt.role}`}
                onClick={() => onSelectRole(opt.role)}
                className={`bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${opt.borderHover} group hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl ${opt.bgAccent} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${opt.bgAccent} border border-current/20`}>
                      {opt.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {opt.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {opt.description}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {opt.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${opt.accentColor}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${opt.btnColor}`}
                  >
                    <span>{t('loginAsRole', `Login as ${opt.role.charAt(0).toUpperCase() + opt.role.slice(1)}`)}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-5xl mx-auto w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
        <p>
          QuickCare Hospital Management System • Real-Time OPD Queue Dispatch & Wait-Time Forecast
        </p>
      </footer>
    </div>
  );
};
