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
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Activity
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
  onBackToRoleSelect,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  initialRole,
  defaultRole = 'patient',
  onSkipForNow
}) => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { t } = useLanguage();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole || defaultRole || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
          title: 'Doctor Portal',
          icon: Stethoscope,
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          btnColor: 'bg-teal-600 hover:bg-teal-700',
          demoLabel: 'Dr. Ramesh Chandra (OPD Room 101)'
        };
      case 'admin':
        return {
          title: 'Hospital Admin Portal',
          icon: Shield,
          badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          btnColor: 'bg-indigo-600 hover:bg-indigo-700',
          demoLabel: 'Dr. Aris Thorne (Operations Head)'
        };
      default:
        return {
          title: 'Patient Portal',
          icon: User,
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          btnColor: 'bg-emerald-600 hover:bg-emerald-700',
          demoLabel: 'Ravi Kumar (Token A102)'
        };
    }
  };

  const roleConfig = getRoleConfig(activeRole);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col p-6 sm:p-7 space-y-5">
        {/* Back to Role Select Button */}
        {onBackToRoleSelect && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToRoleSelect}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('changeRole', 'Change Role')}</span>
            </button>
            <span className="text-[11px] font-semibold text-slate-400">
              QuickCare Login
            </span>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-2">
            <Activity className="h-6 w-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quick<span className="text-emerald-600">Care</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Smart Hospital Queue Management System
          </p>
        </div>

        {/* 3 Role Selection Pills at Top */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Login Role:</span>
            <span className="text-emerald-700 font-extrabold capitalize">{activeRole}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              id="login-tab-patient"
              onClick={() => handleSelectRole('patient')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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

        {/* Current Role Banner */}
        <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${roleConfig.badgeColor}`}>
          <RoleIcon className="h-4 w-4 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold block">Logging into {roleConfig.title}</span>
            <span className="text-[11px] opacity-80">Demo: {roleConfig.demoLabel}</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-left font-medium">{error}</span>
          </div>
        )}

        {/* Login Form: Email and Password */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
                  className="text-[11px] text-emerald-600 hover:underline font-bold"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
              className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-emerald-600" />
              <span>Fill 1-Click Demo Credentials</span>
            </button>
          </div>

          {/* Primary Login Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading || isGoogleSubmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${roleConfig.btnColor}`}
          >
            <span>{isLoading ? 'Signing In...' : `Log In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}</span>
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
            {/* Google SVG Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            <span>{isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Bottom Sign-Up Link */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          <span>Don't have an account? </span>
          <button
            id="login-go-signup-btn"
            type="button"
            onClick={handleSignUpClick}
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            Sign Up & Fill Details
          </button>
        </div>

        {/* Skip for now */}
        {onSkipForNow && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onSkipForNow}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Skip and preview dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
