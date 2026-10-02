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

export const api = {
  // Auth
  async login(email: string, password: string, role?: string): Promise<{ token: string; user: User; patient?: Patient; doctor?: Doctor }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
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
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async getMe(): Promise<{ user: User; patient?: Patient; doctor?: Doctor }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async getDemoUsers(): Promise<{ users: Array<Omit<User, 'password'>> }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string; userEmail?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
    return data;
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    const data = await res.json();
    return data.departments || [];
  },

  async updateDepartmentConsultationTime(departmentId: string, averageConsultationTime: number): Promise<{ message: string; department: Department }> {
    const res = await fetch(`${API_BASE}/departments/${departmentId}/config-wait-time`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ averageConsultationTime }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update consultation time');
    return data;
  },

  // Doctors
  async getDoctors(department?: string): Promise<Doctor[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    const res = await fetch(`${API_BASE}/doctors${query}`);
    const data = await res.json();
    return data.doctors || [];
  },

  // Appointments
  async getAppointments(filters?: { patientId?: string; doctorId?: string; department?: string; date?: string; status?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_BASE}/appointments?${params.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.appointments || [];
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
    const res = await fetch(`${API_BASE}/appointments/book`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to book appointment');
    return data;
  },

  async cancelAppointment(appointmentId: string): Promise<{ message: string; appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');
    return data;
  },

  async rescheduleAppointment(params: {
    appointmentId: string;
    newTime: string;
    newDate?: string;
    reason?: string;
  }): Promise<{ message: string; appointment: Appointment; queueItem?: QueueItem }> {
    const res = await fetch(`${API_BASE}/appointments/${params.appointmentId}/reschedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        newTime: params.newTime,
        newDate: params.newDate,
        reason: params.reason
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reschedule appointment');
    return data;
  },

  async getAvailableSlots(department?: string, doctorId?: string): Promise<{ availableSlots: string[]; allSlots: string[] }> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (doctorId) params.append('doctorId', doctorId);

    const res = await fetch(`${API_BASE}/appointments/available-slots?${params.toString()}`);
    return res.json();
  },

  async updateDoctorStatus(doctorId: string, status: 'Available' | 'In Consultation' | 'On Break'): Promise<{ message: string; doctor: Doctor }> {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update doctor availability');
    return data;
  },

  async markPatientDelay(queueIdOrToken: string, delayMinutes: number = 30): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    const res = await fetch(`${API_BASE}/queue/${queueIdOrToken}/delay`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ delayMinutes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record delay');
    return data;
  },

  async markPatientNoShow(queueIdOrToken: string): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    const res = await fetch(`${API_BASE}/queue/${queueIdOrToken}/no-show`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark patient no-show');
    return data;
  },

  // Live Queue
  async getQueue(department?: string, activeOnly?: boolean): Promise<QueueItem[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (activeOnly) params.append('activeOnly', 'true');

    const res = await fetch(`${API_BASE}/queue?${params.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.queue || [];
  },

  async getPatientQueueSummary(patientId?: string, tokenNumber?: string): Promise<PatientQueueSummary> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (tokenNumber) params.append('tokenNumber', tokenNumber);

    const res = await fetch(`${API_BASE}/queue/patient-summary?${params.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch queue summary');
    return data;
  },

  async callNextPatient(department: string, doctorId?: string): Promise<{ message: string; currentPatient: QueueItem | null; queue: QueueItem[] }> {
    const res = await fetch(`${API_BASE}/queue/call-next`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ department, doctorId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to advance queue');
    return data;
  },

  async updateQueueItemStatus(queueIdOrToken: string, status: 'completed' | 'current' | 'next' | 'waiting' | 'skipped'): Promise<{ message: string; item: QueueItem; queue: QueueItem[] }> {
    const res = await fetch(`${API_BASE}/queue/${queueIdOrToken}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update queue status');
    return data;
  },

  // Notifications
  async getNotifications(userId?: string, patientId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (patientId) params.append('patientId', patientId);

    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
  },

  async markAllNotificationsRead(userId?: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId }),
    });
  },

  // Admin Stats
  async getAdminStats(): Promise<{
    stats: AdminStats;
    chartData: ChartDataItem[];
    departmentsCount: number;
    activeDoctorsCount: number;
  }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Reset sample data
  async resetSampleData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/reset-sample-data`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  }
};
