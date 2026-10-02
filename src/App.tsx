import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LiveQueueTracker } from './components/queue/LiveQueueTracker';
import { AppointmentBookingModal } from './components/booking/AppointmentBookingModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { UserRole } from './types';

type AuthScreen = 'login' | 'signup' | 'forgot_password';
type PatientView = 'dashboard' | 'live_queue';

function MainApp() {
  const { user, patient, isAuthenticated, switchRoleQuick } = useAuth();

  // App opens directly on the Login page with 3-role selector
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('patient');

  // Patient sub-view
  const [patientView, setPatientView] = useState<PatientView>('dashboard');
  const [patientActiveTab, setPatientActiveTab] = useState<'home' | 'appointments' | 'profile'>('home');
  const [activeTokenForTracker, setActiveTokenForTracker] = useState<string>('A102');

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If user is not authenticated: show Login -> Sign Up flow directly
  if (!isAuthenticated) {
    if (authScreen === 'login') {
      return (
        <LoginPage
          defaultRole={authDefaultRole}
          initialRole={authDefaultRole}
          onGoToSignUp={() => setAuthScreen('signup')}
          onGoToForgotPassword={() => setAuthScreen('forgot_password')}
          onSkipForNow={() => {
            switchRoleQuick(authDefaultRole);
          }}
        />
      );
    }

    if (authScreen === 'signup') {
      return (
        <SignUpPage
          initialRole={authDefaultRole}
          onGoToLogin={() => setAuthScreen('login')}
          onBackToSplash={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'forgot_password') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => setAuthScreen('login')}
        />
      );
    }
  }

  // Current authenticated user's role
  const role = user?.role || 'patient';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={0}
        onBookClick={() => setIsBookingOpen(true)}
      />

      {/* Primary Role Views */}
      <div className="flex-1">
        {role === 'patient' && (
          <>
            {patientView === 'dashboard' ? (
              <PatientDashboard
                onBookAppointment={() => setIsBookingOpen(true)}
                onViewLiveQueue={() => setPatientView('live_queue')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                activeNavTab={patientActiveTab}
                setActiveNavTab={setPatientActiveTab}
              />
            ) : (
              <LiveQueueTracker
                patientToken={activeTokenForTracker}
                onBackToDashboard={() => setPatientView('dashboard')}
                onBookAppointment={() => setIsBookingOpen(true)}
              />
            )}
          </>
        )}

        {role === 'doctor' && <DoctorDashboard />}

        {role === 'admin' && <AdminDashboard />}
      </div>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        patientName={patient?.name || user?.name || 'Ravi Kumar'}
        patientPhone={patient?.phone || '+1 (555) 482-1920'}
        patientId={patient?._id}
        onBookingSuccess={(apt) => {
          setActiveTokenForTracker(apt.tokenNumber);
        }}
      />

      {/* Notifications Drawer / Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        userId={user?._id}
        patientId={patient?._id}
        onSelectToken={(tok) => {
          setActiveTokenForTracker(tok);
          setPatientView('live_queue');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
