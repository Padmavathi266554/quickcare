import {
  User,
  Patient,
  Doctor,
  Department,
  Appointment,
  QueueItem,
  NotificationItem,
  AdminStats,
  ChartDataItem,
  PatientQueueSummary
} from '../types';
import { mockStore } from './mockStore';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('quickcare_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Transparent fallback helper for static hosting (e.g. GitHub Pages without an Express backend)
async function callApiOrFallback<T>(
  apiCall: () => Promise<Response>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await apiCall();
    const contentType = res.headers.get('content-type') || '';
    // If route doesn't exist on server (404) or returned HTML instead of JSON
    if (res.status === 404 || (!contentType.includes('application/json') && res.status !== 200 && res.status !== 201)) {
      return await fallbackFn();
    }
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403 || res.status === 400) {
        throw new Error(data.error || 'Request failed');
      }
      return await fallbackFn();
    }
    return data;
  } catch (err: any) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.name === 'TypeError')) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string, role?: string): Promise<{ token: string; user: User; patient?: Patient; doctor?: Doctor }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      }),
      () => mockStore.login(email, password, role)
    );
  },

  async register(params: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    role?: 'patient' | 'doctor' | 'admin';
  }): Promise<{ token: string; user: User; patient?: Patient }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
      () => mockStore.register(params)
    );
  },

  async getMe(): Promise<{ user: User; patient?: Patient; doctor?: Doctor }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      }),
      () => mockStore.getMe()
    );
  },

  async getDemoUsers(): Promise<{ users: Array<Omit<User, 'password'>> }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/demo-users`),
      () => ({
        users: [
          { _id: 'user-admin', name: 'Dr. Aris Thorne (Admin)', email: 'admin@quickcare.com', role: 'admin', phone: '+1 (555) 019-2834' },
          { _id: 'user-doc-1', name: 'Dr. Ramesh Chandra', email: 'ramesh@quickcare.com', role: 'doctor', phone: '+1 (555) 014-9921' },
          { _id: 'user-doc-2', name: 'Dr. Priya Sharma', email: 'priya@quickcare.com', role: 'doctor', phone: '+1 (555) 014-8842' },
          { _id: 'user-patient-1', name: 'Ravi Kumar', email: 'ravi@gmail.com', role: 'patient', phone: '+1 (555) 482-1920' },
          { _id: 'user-patient-2', name: 'Anita Verma', email: 'anita@gmail.com', role: 'patient', phone: '+1 (555) 293-8471' }
        ]
      })
    );
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string; userEmail?: string }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
      () => ({
        message: `Password reset verification token generated. Instructions sent to ${email}.`,
        resetToken: 'static-rst-' + Math.random().toString(36).substring(2, 10),
        userEmail: email
      })
    );
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      }),
      () => ({
        message: 'Your password has been successfully updated. You may now log in with your new password.'
      })
    );
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    return callApiOrFallback(
      async () => {
        const res = await fetch(`${API_BASE}/departments`);
        return res;
      },
      () => mockStore.getDepartments()
    ).then((res: any) => res.departments || res);
  },

  async updateDepartmentConsultationTime(departmentId: string, averageConsultationTime: number): Promise<{ message: string; department: Department }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/departments/${departmentId}/config-wait-time`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ averageConsultationTime }),
      }),
      () => ({
        message: `Average consultation time updated to ${averageConsultationTime} minutes.`,
        department: mockStore.updateDepartmentConsultationTime(departmentId, averageConsultationTime)
      })
    );
  },

  // Doctors
  async getDoctors(department?: string): Promise<Doctor[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return callApiOrFallback(
      () => fetch(`${API_BASE}/doctors${query}`),
      () => mockStore.getDoctors(department)
    ).then((res: any) => res.doctors || res);
  },

  // Appointments
  async getAppointments(filters?: { patientId?: string; doctorId?: string; department?: string; date?: string; status?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    return callApiOrFallback(
      () => fetch(`${API_BASE}/appointments?${params.toString()}`, {
        headers: getHeaders(),
      }),
      () => mockStore.getAppointments(filters)
    ).then((res: any) => res.appointments || res);
  },

  async bookAppointment(params: {
    patientId?: string;
    patientName: string;
    patientPhone: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<{ message: string; appointment: Appointment; queueItem: QueueItem }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      }),
      () => {
        const res = mockStore.bookAppointment(params);
        return {
          message: 'Appointment booked successfully!',
          appointment: res.appointment,
          queueItem: res.queueItem
        };
      }
    );
  },

  async cancelAppointment(appointmentId: string): Promise<{ message: string; appointment: Appointment }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      }),
      () => {
        const apt = mockStore.cancelAppointment(appointmentId);
        return {
          message: 'Appointment cancelled successfully',
          appointment: apt || ({} as Appointment)
        };
      }
    );
  },

  async rescheduleAppointment(params: {
    appointmentId: string;
    newTime: string;
    newDate?: string;
    reason?: string;
  }): Promise<{ message: string; appointment: Appointment; queueItem?: QueueItem }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/appointments/${params.appointmentId}/reschedule`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          newTime: params.newTime,
          newDate: params.newDate,
          reason: params.reason
        }),
      }),
      () => {
        const res = mockStore.rescheduleAppointment(params);
        return {
          message: `Appointment successfully rescheduled to ${params.newTime}!`,
          appointment: res.appointment!,
          queueItem: res.queueItem
        };
      }
    );
  },

  async getAvailableSlots(department?: string, doctorId?: string): Promise<{ availableSlots: string[]; allSlots: string[] }> {
    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ];
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (doctorId) params.append('doctorId', doctorId);

    return callApiOrFallback(
      () => fetch(`${API_BASE}/appointments/available-slots?${params.toString()}`),
      () => ({
        availableSlots: ['11:30 AM', '12:15 PM', '02:00 PM', '03:30 PM', '04:45 PM'],
        allSlots
      })
    );
  },

  async updateDoctorStatus(doctorId: string, status: 'Available' | 'In Consultation' | 'On Break'): Promise<{ message: string; doctor: Doctor }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }),
      () => ({
        message: `Doctor status updated to ${status}`,
        doctor: mockStore.updateDoctorStatus(doctorId, status)
      })
    );
  },

  async markPatientDelay(queueIdOrToken: string, delayMinutes: number = 30): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue/${queueIdOrToken}/delay`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ delayMinutes }),
      }),
      () => {
        const item = mockStore.markPatientDelay(queueIdOrToken, delayMinutes);
        return {
          message: `Patient delay recorded (+${delayMinutes}m)`,
          item: item!,
          queue: mockStore.getQueue()
        };
      }
    );
  },

  async markPatientNoShow(queueIdOrToken: string): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue/${queueIdOrToken}/no-show`, {
        method: 'PATCH',
        headers: getHeaders(),
      }),
      () => {
        const item = mockStore.markPatientNoShow(queueIdOrToken);
        return {
          message: 'Patient marked as No-Show',
          item: item!,
          queue: mockStore.getQueue()
        };
      }
    );
  },

  // Live Queue
  async getQueue(department?: string, activeOnly?: boolean): Promise<QueueItem[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (activeOnly) params.append('activeOnly', 'true');

    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue?${params.toString()}`, {
        headers: getHeaders(),
      }),
      () => mockStore.getQueue(department, activeOnly)
    ).then((res: any) => res.queue || res);
  },

  async getPatientQueueSummary(patientId?: string, tokenNumber?: string): Promise<PatientQueueSummary> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (tokenNumber) params.append('tokenNumber', tokenNumber);

    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue/patient-summary?${params.toString()}`, {
        headers: getHeaders(),
      }),
      () => mockStore.getPatientQueueSummary(patientId, tokenNumber)
    );
  },

  async callNextPatient(department: string, doctorId?: string): Promise<{ message: string; currentPatient: QueueItem | null; queue: QueueItem[] }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue/call-next`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ department, doctorId }),
      }),
      () => {
        const res = mockStore.callNextPatient(department);
        return {
          message: res.currentPatient ? `Token ${res.currentPatient.tokenNumber} is now active!` : 'No upcoming patients in queue',
          currentPatient: res.currentPatient,
          queue: res.queue
        };
      }
    );
  },

  async updateQueueItemStatus(queueIdOrToken: string, status: 'completed' | 'current' | 'next' | 'waiting' | 'skipped'): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/queue/${queueIdOrToken}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }),
      () => {
        const item = mockStore.updateQueueStatus(queueIdOrToken, status);
        return {
          message: `Queue status updated to ${status}`,
          item: item!,
          queue: mockStore.getQueue()
        };
      }
    );
  },

  // Notifications
  async getNotifications(userId?: string, patientId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (patientId) params.append('patientId', patientId);

    return callApiOrFallback(
      () => fetch(`${API_BASE}/notifications?${params.toString()}`, {
        headers: getHeaders(),
      }),
      () => mockStore.getNotifications(userId, patientId)
    );
  },

  async markNotificationRead(id: string): Promise<void> {
    await callApiOrFallback(
      () => fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      }),
      () => mockStore.markNotificationRead(id)
    );
  },

  async markAllNotificationsRead(userId?: string): Promise<void> {
    await callApiOrFallback(
      () => fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
      }),
      () => mockStore.markAllNotificationsRead()
    );
  },

  // Admin Stats
  async getAdminStats(): Promise<{
    stats: AdminStats;
    chartData: ChartDataItem[];
    departmentsCount: number;
    activeDoctorsCount: number;
  }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      }),
      () => mockStore.getAdminStats()
    );
  },

  // Reset sample data
  async resetSampleData(): Promise<{ message: string }> {
    return callApiOrFallback(
      () => fetch(`${API_BASE}/admin/reset-sample-data`, {
        method: 'POST',
        headers: getHeaders(),
      }),
      () => {
        mockStore.reset();
        return { message: 'Sample data reset to initial benchmark state successfully!' };
      }
    );
  }
};
