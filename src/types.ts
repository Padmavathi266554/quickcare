export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}

export interface Patient {
  _id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface Doctor {
  _id: string;
  userId?: string;
  name: string;
  department: string;
  specialization: string;
  roomNumber: string;
  availability: string[];
  averageConsultationTime: number;
  status: 'Available' | 'In Consultation' | 'On Break';
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  prefix: string;
  description: string;
  iconName: string;
  averageConsultationTime: number;
  headDoctor: string;
  roomNumbers: string[];
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  tokenNumber: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'skipped';
  estimatedWaitTime: number;
  createdAt: string;
  notes?: string;
}

export interface QueueItem {
  _id: string;
  tokenNumber: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  queuePosition: number;
  status: 'completed' | 'current' | 'next' | 'waiting' | 'skipped';
  estimatedWaitTime: number;
  calledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  patientId?: string;
  title: string;
  message: string;
  type: 'booked' | 'turn_approaching' | 'turn_now' | 'cancelled' | 'delay' | 'reminder';
  read: boolean;
  tokenNumber?: string;
  createdAt: string;
}

export interface AdminStats {
  todaysAppointments: number;
  patientsInQueue: number;
  averageWaitTime: number;
  completedToday: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface PatientQueueSummary {
  patientQueueItem: QueueItem;
  appointment?: Appointment;
  currentActiveToken: string;
  peopleAhead: number;
  estimatedWaitTime: number;
  departmentQueue: QueueItem[];
}
