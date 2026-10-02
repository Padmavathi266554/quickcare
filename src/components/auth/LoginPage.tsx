import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  User,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Activity,
  Globe,
  ChevronDown,
  Clock,
  Users,
  CheckCircle2,
  CalendarCheck,
  Building2,
  Volume2,
  PhoneCall,
  Sliders,
  ArrowUpRight
} from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onGoToSignUp?: () => void;
  onGoToForgotPassword?: () => void;
  onBackToRoleSelect?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
  initialRole?: UserRole;
  defaultRole?: UserRole;
  onSkipForNow?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onGoToSignUp,
  onGoToForgotPassword,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  initialRole,
  defaultRole = 'patient',
  onSkipForNow
}) => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { language, setLanguage, currentLanguage, languages, t } = useLanguage();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole || defaultRole || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleSignUpClick = onGoToSignUp || onNavigateToSignUp;
  const handleForgotClick = onGoToForgotPassword || onNavigateToForgotPassword;

  // Pre-fill realistic defaults depending on role
  useEffect(() => {
    if (activeRole === 'patient') {
      setEmail('ravi@gmail.com');
      setPassword('patient123');
    } else if (activeRole === 'doctor') {
      setEmail('ramesh@quickcare.com');
      setPassword('doctor123');
    } else {
      setEmail('admin@quickcare.com');
      setPassword('admin123');
    }
    setError(null);
  }, [activeRole]);

  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await login(email, password, activeRole);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle(activeRole);
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please try standard login.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    if (activeRole === 'patient') {
      setEmail('ravi@gmail.com');
      setPassword('patient123');
    } else if (activeRole === 'doctor') {
      setEmail('ramesh@quickcare.com');
      setPassword('doctor123');
    } else {
      setEmail('admin@quickcare.com');
      setPassword('admin123');
    }
    setError(null);
  };

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'doctor':
        return {
          title: t('doctor', 'Doctor Portal'),
          subtitle: 'Doctor Consultation, OPD Patient Queue & Call Controls',
          icon: Stethoscope,
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          btnColor: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25',
          glowColor: 'from-teal-900 via-slate-900 to-slate-950',
          accentColor: 'text-teal-400',
          demoLabel: 'Dr. Ramesh Chandra (OPD Room 101)'
        };
      case 'admin':
        return {
          title: t('admin', 'Hospital Admin Portal'),
          subtitle: 'OPD Flow Analytics, Department Wait-Times & Staff Allocation',
          icon: Shield,
          badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          btnColor: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25',
          glowColor: 'from-indigo-950 via-slate-900 to-slate-950',
          accentColor: 'text-indigo-400',
          demoLabel: 'Dr. Aris Thorne (Operations Head)'
        };
      default:
        return {
          title: t('patient', 'Patient Portal'),
          subtitle: 'Digital Token Tickets, Live Queue Tracker & Appointment Management',
          icon: User,
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
          glowColor: 'from-slate-900 via-slate-800 to-emerald-950',
          accentColor: 'text-emerald-400',
          demoLabel: 'Ravi Kumar (Token A102)'
        };
    }
  };

  const roleConfig = getRoleConfig(activeRole);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Header matching application navbar style */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Activity className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Quick<span className="text-emerald-600">Care</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t('appName', 'QuickCare')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                {t('appSubtitle', 'Smart Hospital Queue Management System')}
              </p>
            </div>
          </div>

          {/* Right Controls: Hospital Live Badge + Language Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{t('hospitalStatus', 'Hospital OPD Live')}</span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="login-header-lang-btn"
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                title="Change Language"
              >
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="text-xs font-semibold">{currentLanguage.native}</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-emerald-600" />
                    <span>{t('selectLang', 'Select Language')}</span>
                  </div>
                  <div className="py-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                          language === l.code
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name} ({l.native})</span>
                        </span>
                        {language === l.code && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Split Showcase & Login Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: LIVE PORTAL PREVIEW SHOWCASE */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Live Portal Showcase • Switch tabs to preview</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {roleConfig.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 font-medium max-w-xl">
                {roleConfig.subtitle}
              </p>
            </div>

            {/* DYNAMIC PORTAL PREVIEW CARD */}
            {activeRole === 'patient' && (
              <div className="space-y-4">
                {/* Patient Token Ticket Preview */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl p-6 sm:p-7 border border-slate-700">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold font-mono">
                        LIVE DIGITAL TOKEN TICKET
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse">
                      Consultation Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-slate-700/80 pb-4 sm:pb-0 sm:pr-5">
                      <p className="text-xs text-slate-400 font-medium">Your Live Token</p>
                      <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                        A102
                      </div>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>General Physician • Room 101</span>
                      </div>
                    </div>

                    <div className="sm:col-span-7 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Doctor:</span>
                        <span className="font-bold text-white text-sm">Dr. Ramesh Chandra</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Booked Slot:</span>
                        <span className="font-medium text-slate-200">Today • 10:00 AM</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-700/60">
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                          <div className="flex items-center gap-1 text-xs text-emerald-300 font-medium mb-0.5">
                            <Clock className="h-3 w-3" />
                            <span>Estimated Wait</span>
                          </div>
                          <div className="text-lg font-extrabold text-white">
                            0 <span className="text-xs font-normal text-slate-300">mins (Your Turn!)</span>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                          <div className="flex items-center gap-1 text-xs text-teal-300 font-medium mb-0.5">
                            <Users className="h-3 w-3" />
                            <span>People Ahead</span>
                          </div>
                          <div className="text-lg font-extrabold text-white">
                            0
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Portal Features Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Easy Appointments</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Book or cancel appointments & adjust delayed times</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Live Queue Tracker</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Accurate wait time estimates and queue positions</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                      <Volume2 className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Voice & SMS Chimes</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Instant alerts in your preferred regional language</p>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'doctor' && (
              <div className="space-y-4">
                {/* Doctor Active OPD Consultation Card */}
                <div className="rounded-3xl bg-white border border-teal-200/90 shadow-md p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Dr. Ramesh Chandra</h4>
                        <p className="text-xs text-slate-500">General Physician • Room 101</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      In Consultation
                    </span>
                  </div>

                  {/* Active Patient Box */}
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Currently With Doctor</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black font-mono text-teal-900">A102</span>
                        <span className="text-sm font-bold text-slate-800">Ravi Kumar (34, Male)</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Chief complaint: Mild fever and recurrent headache</p>
                    </div>

                    <div className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Next Patient: Token A103</span>
                    </div>
                  </div>

                  {/* Doctor OPD Queue items */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700">Upcoming OPD Queue (General Physician)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">A103 • Anita Verma</span>
                        <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded text-[11px]">Next (5m)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">A104 • Kavita Iyer</span>
                        <span className="text-slate-500 font-semibold text-[11px]">Waiting (10m)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900">One-Click Patient Call</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Advance queue and ring automatic announcements</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900">Consultation Notes</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Record patient diagnosis & prescriptions securely</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900">Duty Availability</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Toggle Available, In Consultation, or On Break</p>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'admin' && (
              <div className="space-y-4">
                {/* Admin Metrics Dashboard Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Today's Visits</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">158</p>
                    <span className="text-[10px] text-emerald-600 font-bold">100% OPD Capacity</span>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Waiting in Queue</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">42</p>
                    <span className="text-[10px] text-slate-400 font-medium">Across 4 Depts</span>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Avg Wait Time</p>
                    <p className="text-2xl font-black text-teal-600 mt-1">28m</p>
                    <span className="text-[10px] text-teal-600 font-bold">-4m vs yesterday</span>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Completed</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">116</p>
                    <span className="text-[10px] text-indigo-600 font-bold">73% finished</span>
                  </div>
                </div>

                {/* Admin Management Capabilities Preview */}
                <div className="rounded-3xl bg-white border border-indigo-200 shadow-md p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      <span>Live Hospital Department Queue Control</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      5 Doctors On Duty
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">General Physician (GP)</p>
                        <p className="text-[11px] text-slate-500">Tokens: A101-A105 • Avg: 5 mins</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">Normal</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">Cardiology (CARD)</p>
                        <p className="text-[11px] text-slate-500">Tokens: B201-B202 • Avg: 15 mins</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold text-[11px]">Active</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2 font-medium">
                    <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Admins can adjust wait times, manage delayed patient slots (+30m), and mark no-shows.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: REFINED AUTHENTICATION CARD */}
          <div className="lg:col-span-5">
            <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col p-6 sm:p-8 space-y-5">
              
              {/* Card Title & App Branding */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Activity className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                      Quick<span className="text-emerald-600">Care</span> Sign In
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select your role to access your portal
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider text-[10px]">
                  {activeRole}
                </span>
              </div>

              {/* 3 ROLE SELECTOR TABS AT TOP */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
                  <span>Select Access Role:</span>
                  <span className="text-emerald-700 font-extrabold capitalize">{activeRole}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    id="login-tab-patient"
                    onClick={() => handleSelectRole('patient')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeRole === 'patient'
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-500/30 ring-1 ring-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>{t('patient', 'Patient')}</span>
                  </button>

                  <button
                    type="button"
                    id="login-tab-doctor"
                    onClick={() => handleSelectRole('doctor')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeRole === 'doctor'
                        ? 'bg-white text-teal-700 shadow-xs border border-teal-500/30 ring-1 ring-teal-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                    <span>{t('doctor', 'Doctor')}</span>
                  </button>

                  <button
                    type="button"
                    id="login-tab-admin"
                    onClick={() => handleSelectRole('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeRole === 'admin'
                        ? 'bg-white text-indigo-700 shadow-xs border border-indigo-500/30 ring-1 ring-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    <span>{t('admin', 'Admin')}</span>
                  </button>
                </div>
              </div>

              {/* Active Role Persona Notice */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${roleConfig.badgeColor}`}>
                <RoleIcon className="h-4 w-4 shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold block">Logging into {roleConfig.title}</span>
                  <span className="text-[11px] opacity-85">Account: {roleConfig.demoLabel}</span>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-left font-medium">{error}</span>
                </div>
              )}

              {/* Login Form: Email & Password */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    {handleForgotClick && (
                      <button
                        type="button"
                        onClick={handleForgotClick}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Fill Demo button */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Auto-fill 1-Click Demo Credentials</span>
                  </button>
                </div>

                {/* Primary Login Button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading || isGoogleSubmitting}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${roleConfig.btnColor}`}
                >
                  <span>{isLoading ? 'Signing In...' : `Sign In to ${roleConfig.title}`}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">
                  or
                </span>
              </div>

              {/* Google Login Option */}
              <div>
                <button
                  id="login-google-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>{isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue with Google Account'}</span>
                </button>
              </div>

              {/* Bottom Sign-Up Link */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>New to QuickCare?</span>
                <button
                  id="login-go-signup-btn"
                  type="button"
                  onClick={handleSignUpClick}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Sign Up & Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Skip for now / Direct preview mode */}
              {onSkipForNow && (
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={onSkipForNow}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Instant Preview Mode (Skip Login)</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching standard application style */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 QuickCare Smart Hospital Queue Management System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Live Sync v2.4</span>
            <span>•</span>
            <span>OPD Token Engine</span>
            <span>•</span>
            <span>Multi-Role Access Control</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
