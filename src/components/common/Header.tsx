import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Activity,
  Bell,
  LogOut,
  User,
  Shield,
  Stethoscope,
  ChevronDown,
  RefreshCw,
  Sparkles,
  CalendarCheck,
  Globe
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  unreadCount: number;
  onBookClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  unreadCount,
  onBookClick
}) => {
  const { user, logout, switchRoleQuick, isLoading } = useAuth();
  const { language, setLanguage, currentLanguage, languages, t } = useLanguage();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: t('admin', 'Hospital Administrator'),
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Shield
        };
      case 'doctor':
        return {
          label: t('doctor', 'Doctor'),
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Stethoscope
        };
      default:
        return {
          label: t('patient', 'Patient'),
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: User
        };
    }
  };

  const currentRole = user?.role || 'patient';
  const roleInfo = getRoleBadge(currentRole);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Testing Demo Banner - Only visible to admin */}
      {currentRole === 'admin' && (
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">{t('liveMode', 'QuickCare Hospital Operations')}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">{t('switchActiveRole', 'Switch view')}:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="role-switch-patient"
              onClick={() => switchRoleQuick('patient')}
              disabled={isLoading}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                currentRole === 'patient'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('patientRavi', 'Patient (Ravi)')}
            </button>
            <button
              id="role-switch-doctor"
              onClick={() => switchRoleQuick('doctor')}
              disabled={isLoading}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                currentRole === 'doctor'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('doctorRamesh', 'Doctor (Dr. Ramesh)')}
            </button>
            <button
              id="role-switch-admin"
              onClick={() => switchRoleQuick('admin')}
              disabled={isLoading}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('hospitalAdmin', 'Hospital Admin')}
            </button>
          </div>
        </div>
      )}

      {/* Main App Header */}
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
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('appName', 'QuickCare')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              {t('appSubtitle', 'Smart Hospital Queue Management System')}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Language Selector Dropdown in Header */}
          <div className="relative">
            <button
              id="header-language-toggle-btn"
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Change Language"
            >
              <span className="text-sm">{currentLanguage.flag}</span>
              <span className="hidden sm:inline text-xs">{currentLanguage.native}</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-72 overflow-y-auto">
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

          {onBookClick && currentRole === 'patient' && (
            <button
              id="header-book-btn"
              onClick={onBookClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>{t('bookAppointment', 'Book Appointment')}</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('notifications', 'Notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User & Role pill */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'Guest User'}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  <span>{roleInfo.label}</span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.bg}`}>
                    <RoleIcon className="h-3 w-3" />
                    {roleInfo.label}
                  </span>
                </div>

                {/* Only Admin can switch active roles from dropdown */}
                {currentRole === 'admin' && (
                  <div className="py-1 border-b border-slate-100">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('switchActiveRole', 'Switch Active Role')}
                    </div>
                    <button
                      onClick={() => {
                        switchRoleQuick('patient');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                    >
                      <span>{t('patientRavi', 'Patient (Ravi Kumar)')}</span>
                      {currentRole === 'patient' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                    <button
                      onClick={() => {
                        switchRoleQuick('doctor');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                    >
                      <span>{t('doctorRamesh', 'Doctor (Dr. Ramesh)')}</span>
                      {currentRole === 'doctor' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                    <button
                      onClick={() => {
                        switchRoleQuick('admin');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                    >
                      <span>{t('hospitalAdmin', 'Hospital Admin')}</span>
                      {currentRole === 'admin' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-1">
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      logout();
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('signOut', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

