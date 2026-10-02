import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Patient, Doctor, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  patient: Patient | null;
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    role?: UserRole;
  }) => Promise<void>;
  loginWithGoogle: (role?: UserRole, googleEmail?: string, googleName?: string) => Promise<void>;
  logout: () => void;
  switchRoleQuick: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('quickcare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial user fetch if token exists
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('quickcare_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        setPatient(data.patient || null);
        setDoctor(data.doctor || null);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('quickcare_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password, role);
      localStorage.setItem('quickcare_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setPatient(data.patient || null);
      setDoctor(data.doctor || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    role?: UserRole;
  }) => {
    setIsLoading(true);
    try {
      const data = await api.register(params);
      localStorage.setItem('quickcare_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setPatient(data.patient || null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role: UserRole = 'patient', googleEmail?: string, googleName?: string) => {
    setIsLoading(true);
    try {
      if (role === 'admin') {
        await login('admin@quickcare.com', 'admin123', 'admin');
      } else if (role === 'doctor') {
        await login('ramesh@quickcare.com', 'doctor123', 'doctor');
      } else {
        // Patient Google Login
        const emailToUse = googleEmail || 'ravi@gmail.com';
        try {
          await login(emailToUse, 'patient123', 'patient');
        } catch {
          // If not registered yet, auto-register Google profile
          await register({
            name: googleName || 'Google User',
            email: emailToUse,
            password: 'google_auth_secure_pass',
            phone: '+1 (555) 019-8822',
            age: 32,
            gender: 'Male',
            role: 'patient'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('quickcare_token');
    setToken(null);
    setUser(null);
    setPatient(null);
    setDoctor(null);
  };

  // Quick switcher for demo convenience
  const switchRoleQuick = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      if (targetRole === 'admin') {
        await login('admin@quickcare.com', 'admin123', 'admin');
      } else if (targetRole === 'doctor') {
        await login('ramesh@quickcare.com', 'doctor123', 'doctor');
      } else {
        await login('ravi@gmail.com', 'patient123', 'patient');
      }
    } catch (e) {
      console.error('Quick switch failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        doctor,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        switchRoleQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
