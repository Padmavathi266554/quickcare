import React, { useState } from 'react';
import { User, Stethoscope, Shield, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface SplashScreenProps {
  onEnter?: (role?: UserRole) => void;
  onGetStarted?: (role?: UserRole) => void;
  onGoToLogin?: () => void;
  onGoToSignUp?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnter,
  onGetStarted,
  onGoToLogin,
  onGoToSignUp
}) => {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLoginClick = async () => {
    if (onEnter) {
      onEnter(selectedRole);
    } else if (onGetStarted) {
      onGetStarted(selectedRole);
    } else if (onGoToLogin) {
      onGoToLogin();
    } else {
      // Fallback: direct demo login
      const creds = {
        patient: { email: 'ravi@gmail.com', pass: 'patient123' },
        doctor: { email: 'ramesh@quickcare.com', pass: 'doctor123' },
        admin: { email: 'admin@quickcare.com', pass: 'admin123' },
      }[selectedRole];
      await login(creds.email, creds.pass, selectedRole);
    }
  };

  const handleSignUpClick = () => {
    if (onGoToSignUp) {
      onGoToSignUp();
    } else if (onGoToLogin) {
      onGoToLogin();
    }
  };

  const handleSkip = async () => {
    try {
      await login('ravi@gmail.com', 'patient123', 'patient');
    } catch (err) {
      console.error('Skip error', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-3 sm:p-6 font-sans">
      {/* Mobile Phone Mockup Container matching Image Panel 1: SPLASH / LOGIN */}
      <div className="w-full max-w-[380px] bg-white rounded-[36px] shadow-2xl border-2 border-slate-800/80 overflow-hidden flex flex-col justify-between min-h-[640px] p-6 relative">
        {/* Top Speaker / Camera Notch */}
        <div className="flex items-center justify-center pt-1 pb-4">
          <div className="w-14 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center text-center justify-center space-y-4 my-auto">
          {/* App Title */}
          <h1 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            QuickCare
          </h1>

          {/* Circular Illustration: Green Cross + 3 Queueing People Figures */}
          <div className="w-32 h-32 rounded-full border-[2.5px] border-slate-800 bg-white flex flex-col items-center justify-center relative shadow-sm my-2">
            {/* Green Medical Cross */}
            <div className="mb-1">
              <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none">
                <path
                  d="M19 6H29V19H42V29H29V42H19V29H6V19H19V6Z"
                  fill="#10B981"
                  stroke="#059669"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 3 People Figures */}
            <div className="flex items-end justify-center -space-x-1 mt-0.5">
              {/* Left Person */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white"></div>
                <div className="w-6 h-3.5 rounded-t-full bg-slate-900"></div>
              </div>
              {/* Center Person (Prominent) */}
              <div className="flex flex-col items-center z-10">
                <div className="w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-white"></div>
                <div className="w-8 h-4.5 rounded-t-full bg-slate-900"></div>
              </div>
              {/* Right Person */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white"></div>
                <div className="w-6 h-3.5 rounded-t-full bg-slate-900"></div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-slate-800 font-bold text-sm leading-snug px-4">
            <p>Smart Hospital</p>
            <p>Queue Management System</p>
          </div>

          {/* 3 LOGINS SELECTOR (Patient, Doctor, Admin) */}
          <div className="w-full pt-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between px-1">
              <span>Select Login Role:</span>
              <span className="text-emerald-700 font-extrabold capitalize">{selectedRole}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                id="splash-role-patient"
                onClick={() => handleRoleSelect('patient')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                id="splash-role-doctor"
                onClick={() => handleRoleSelect('doctor')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'doctor'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                id="splash-role-admin"
                onClick={() => handleRoleSelect('admin')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons Section matching Wireframe */}
        <div className="w-full space-y-2.5 pt-4">
          {/* LOGIN BUTTON */}
          <button
            id="splash-login-btn"
            type="button"
            onClick={handleLoginClick}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/60 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-sm tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}</span>
          </button>

          {/* SIGN UP BUTTON */}
          <button
            id="splash-signup-btn"
            type="button"
            onClick={handleSignUpClick}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-400 hover:border-slate-600 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm tracking-wide transition-all cursor-pointer"
          >
            Sign Up
          </button>

          {/* SKIP FOR NOW LINK */}
          <div className="text-center pt-1 pb-1">
            <button
              id="splash-skip-btn"
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer underline underline-offset-2 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
