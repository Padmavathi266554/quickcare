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

interface StoredData {
  users: Array<User & { password: string }>;
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  queue: QueueItem[];
  notifications: NotificationItem[];
}

const STORAGE_KEY = 'quickcare_static_store_v1';

const defaultDepartments: Department[] = [
  {
    _id: 'dep-1',
    name: 'General Physician',
    code: 'GP',
    prefix: 'A',
    description: 'Routine checkups, seasonal illness, acute diagnosis & adult medicine',
    iconName: 'Stethoscope',
    averageConsultationTime: 5,
    headDoctor: 'Dr. Ramesh Chandra',
    roomNumbers: ['Room 101', 'Room 102']
  },
  {
    _id: 'dep-2',
    name: 'Cardiology',
    code: 'CARD',
    prefix: 'B',
    description: 'Heart disease diagnosis, hypertension care, ECG & cardiovascular health',
    iconName: 'HeartPulse',
    averageConsultationTime: 15,
    headDoctor: 'Dr. Anita Desai',
    roomNumbers: ['Room 205', 'Room 206']
  },
  {
    _id: 'dep-3',
    name: 'Orthopedics',
    code: 'ORTH',
    prefix: 'C',
    description: 'Bone, joint, spine, sports injuries, fractures & rehabilitation',
    iconName: 'Activity',
    averageConsultationTime: 10,
    headDoctor: 'Dr. Vikram Seth',
    roomNumbers: ['Room 304']
  },
  {
    _id: 'dep-4',
    name: 'Pediatrics',
    code: 'PED',
    prefix: 'D',
    description: 'Comprehensive infant, child, and adolescent healthcare & immunizations',
    iconName: 'Baby',
    averageConsultationTime: 8,
    headDoctor: 'Dr. Sunita Rao',
    roomNumbers: ['Room 110']
  }
];

const defaultDoctors: Doctor[] = [
  {
    _id: 'doc-1',
    name: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    specialization: 'Internal Medicine & Chronic Disease',
    roomNumber: 'Room 101',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    averageConsultationTime: 5,
    status: 'In Consultation'
  },
  {
    _id: 'doc-2',
    name: 'Dr. Priya Sharma',
    department: 'General Physician',
    specialization: 'Family Medicine & Preventive Care',
    roomNumber: 'Room 102',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    averageConsultationTime: 6,
    status: 'Available'
  },
  {
    _id: 'doc-3',
    name: 'Dr. Suresh Patel',
    department: 'Cardiology',
    specialization: 'Interventional Cardiologist',
    roomNumber: 'Room 205',
    availability: ['Mon', 'Wed', 'Fri'],
    averageConsultationTime: 15,
    status: 'In Consultation'
  },
  {
    _id: 'doc-4',
    name: 'Dr. Vikram Seth',
    department: 'Orthopedics',
    specialization: 'Joint Replacement & Spine Specialist',
    roomNumber: 'Room 304',
    availability: ['Tue', 'Thu', 'Sat'],
    averageConsultationTime: 10,
    status: 'Available'
  },
  {
    _id: 'doc-5',
    name: 'Dr. Sunita Rao',
    department: 'Pediatrics',
    specialization: 'Neonatal & Child Health',
    roomNumber: 'Room 110',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    averageConsultationTime: 8,
    status: 'Available'
  }
];

const defaultUsers: Array<User & { password: string }> = [
  {
    _id: 'user-admin',
    name: 'Dr. Aris Thorne (Admin)',
    email: 'admin@quickcare.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 019-2834'
  },
  {
    _id: 'user-doc-1',
    name: 'Dr. Ramesh Chandra',
    email: 'ramesh@quickcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 014-9921'
  },
  {
    _id: 'user-doc-2',
    name: 'Dr. Priya Sharma',
    email: 'priya@quickcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 014-8842'
  },
  {
    _id: 'user-patient-1',
    name: 'Ravi Kumar',
    email: 'ravi@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '+1 (555) 482-1920'
  },
  {
    _id: 'user-patient-2',
    name: 'Anita Verma',
    email: 'anita@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '+1 (555) 293-8471'
  }
];

const defaultPatients: Patient[] = [
  {
    _id: 'pat-1',
    userId: 'user-patient-1',
    name: 'Ravi Kumar',
    age: 34,
    gender: 'Male',
    phone: '+1 (555) 482-1920',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 482-1921'
  },
  {
    _id: 'pat-2',
    userId: 'user-patient-2',
    name: 'Anita Verma',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 293-8471',
    bloodGroup: 'B+',
    emergencyContact: '+1 (555) 293-8472'
  }
];

const todayStr = new Date().toISOString().split('T')[0];

const defaultAppointments: Appointment[] = [
  {
    _id: 'apt-100',
    patientId: 'pat-mock-1',
    patientName: 'Kishore Dave',
    patientPhone: '+1 (555) 100-2918',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    date: todayStr,
    time: '09:00 AM',
    tokenNumber: 'A100',
    status: 'completed',
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'apt-101',
    patientId: 'pat-mock-2',
    patientName: 'Devika Menon',
    patientPhone: '+1 (555) 101-4491',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    date: todayStr,
    time: '09:30 AM',
    tokenNumber: 'A101',
    status: 'completed',
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'apt-102',
    patientId: 'pat-1',
    patientName: 'Ravi Kumar',
    patientPhone: '+1 (555) 482-1920',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    date: todayStr,
    time: '10:00 AM',
    tokenNumber: 'A102',
    status: 'ongoing',
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Mild fever and recurrent headache since past 2 days.'
  },
  {
    _id: 'apt-103',
    patientId: 'pat-2',
    patientName: 'Anita Verma',
    patientPhone: '+1 (555) 293-8471',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    date: todayStr,
    time: '10:15 AM',
    tokenNumber: 'A103',
    status: 'upcoming',
    estimatedWaitTime: 5,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const defaultQueue: QueueItem[] = [
  {
    _id: 'q-100',
    tokenNumber: 'A100',
    appointmentId: 'apt-100',
    patientId: 'pat-mock-1',
    patientName: 'Kishore Dave',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    queuePosition: 0,
    status: 'completed',
    estimatedWaitTime: 0,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'q-101',
    tokenNumber: 'A101',
    appointmentId: 'apt-101',
    patientId: 'pat-mock-2',
    patientName: 'Devika Menon',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    queuePosition: 0,
    status: 'completed',
    estimatedWaitTime: 0,
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'q-102',
    tokenNumber: 'A102',
    appointmentId: 'apt-102',
    patientId: 'pat-1',
    patientName: 'Ravi Kumar',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    queuePosition: 1,
    status: 'current',
    estimatedWaitTime: 0,
    calledAt: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'q-103',
    tokenNumber: 'A103',
    appointmentId: 'apt-103',
    patientId: 'pat-2',
    patientName: 'Anita Verma',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    queuePosition: 2,
    status: 'next',
    estimatedWaitTime: 5,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const defaultNotifications: NotificationItem[] = [
  {
    _id: 'notif-1',
    userId: 'user-patient-1',
    patientId: 'pat-1',
    title: 'Consultation In Progress',
    message: 'Your token A102 is currently active in Room 101 with Dr. Ramesh Chandra.',
    type: 'turn_now',
    read: false,
    tokenNumber: 'A102',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    _id: 'notif-2',
    userId: 'user-patient-2',
    patientId: 'pat-2',
    title: 'Your Turn is Approaching',
    message: 'Token A103: There is only 1 patient ahead of you. Please proceed near Room 101.',
    type: 'turn_approaching',
    read: false,
    tokenNumber: 'A103',
    createdAt: new Date(Date.now() - 240000).toISOString()
  }
];

class MockStore {
  private data: StoredData;

  constructor() {
    this.data = this.load();
  }

  private load(): StoredData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    const initial: StoredData = {
      users: defaultUsers,
      patients: defaultPatients,
      doctors: defaultDoctors,
      departments: defaultDepartments,
      appointments: defaultAppointments,
      queue: defaultQueue,
      notifications: defaultNotifications
    };
    this.save(initial);
    return initial;
  }

  private save(data: StoredData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }

  public reset() {
    this.data = {
      users: defaultUsers,
      patients: defaultPatients,
      doctors: defaultDoctors,
      departments: defaultDepartments,
      appointments: defaultAppointments,
      queue: defaultQueue,
      notifications: defaultNotifications
    };
    this.save(this.data);
    return this.data;
  }

  public login(email: string, password?: string, role?: string) {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found. Please register or check email.');
    }
    if (password && user.password && user.password !== password) {
      throw new Error('Invalid password. Please check your credentials.');
    }
    const patient = user.role === 'patient' ? this.data.patients.find(p => p.userId === user._id) : undefined;
    const doctor = user.role === 'doctor' ? this.data.doctors.find(d => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id) : undefined;

    const token = 'static-token-' + btoa(user.email);
    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      patient,
      doctor
    };
  }

  public register(params: { name: string; email: string; password: string; phone: string; age?: number; gender?: 'Male' | 'Female' | 'Other'; role?: 'patient' | 'doctor' | 'admin' }) {
    const userId = `user-${Date.now()}`;
    const newUser: User & { password: string } = {
      _id: userId,
      name: params.name,
      email: params.email.toLowerCase(),
      password: params.password,
      role: params.role || 'patient',
      phone: params.phone
    };
    this.data.users.push(newUser);

    let patient: Patient | undefined;
    if (newUser.role === 'patient') {
      patient = {
        _id: `pat-${Date.now()}`,
        userId: userId,
        name: params.name,
        age: params.age || 30,
        gender: params.gender || 'Other',
        phone: params.phone
      };
      this.data.patients.push(patient);
    }

    this.save(this.data);
    const token = 'static-token-' + btoa(newUser.email);
    return {
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      },
      patient
    };
  }

  public getMe() {
    const rawToken = localStorage.getItem('quickcare_token') || '';
    let email = 'ravi@gmail.com';
    if (rawToken.startsWith('static-token-')) {
      try {
        email = atob(rawToken.replace('static-token-', ''));
      } catch {
        // fallback
      }
    }
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || this.data.users[3];
    const patient = user.role === 'patient' ? this.data.patients.find(p => p.userId === user._id) : undefined;
    const doctor = user.role === 'doctor' ? this.data.doctors.find(d => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id) : undefined;

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      patient,
      doctor
    };
  }

  public getDepartments() {
    return this.data.departments;
  }

  public updateDepartmentConsultationTime(id: string, time: number) {
    const dep = this.data.departments.find(d => d._id === id || d.name.toLowerCase() === id.toLowerCase());
    if (dep) {
      dep.averageConsultationTime = time;
      this.save(this.data);
    }
    return dep || this.data.departments[0];
  }

  public getDoctors(dept?: string) {
    if (!dept) return this.data.doctors;
    return this.data.doctors.filter(d => d.department.toLowerCase() === dept.toLowerCase());
  }

  public updateDoctorStatus(id: string, status: 'Available' | 'In Consultation' | 'On Break') {
    const doc = this.data.doctors.find(d => d._id === id || d.name.toLowerCase() === id.toLowerCase());
    if (doc) {
      doc.status = status;
      this.save(this.data);
    }
    return doc || this.data.doctors[0];
  }

  public getAppointments(filters?: { patientId?: string; doctorId?: string; department?: string; date?: string; status?: string }) {
    let list = this.data.appointments;
    if (filters?.patientId) list = list.filter(a => a.patientId === filters.patientId);
    if (filters?.doctorId) list = list.filter(a => a.doctorId === filters.doctorId);
    if (filters?.department) list = list.filter(a => a.department === filters.department);
    if (filters?.date) list = list.filter(a => a.date === filters.date);
    if (filters?.status) list = list.filter(a => a.status === filters.status);
    return list;
  }

  public bookAppointment(params: { patientId?: string; patientName: string; patientPhone: string; doctorId: string; doctorName: string; department: string; date: string; time: string; notes?: string }) {
    const dep = this.data.departments.find(d => d.name.toLowerCase() === params.department.toLowerCase()) || this.data.departments[0];
    const prefix = dep.prefix || 'A';

    const existingNums = this.data.queue
      .filter(q => q.tokenNumber.startsWith(prefix))
      .map(q => parseInt(q.tokenNumber.substring(prefix.length), 10))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
    const tokenNumber = `${prefix}${nextNum}`;

    const activeInDept = this.data.queue.filter(q => q.department.toLowerCase() === dep.name.toLowerCase() && q.status !== 'completed' && q.status !== 'skipped');
    const patientsAhead = activeInDept.length;
    const estimatedWait = patientsAhead * (dep.averageConsultationTime || 5);

    const aptId = `apt-${Date.now()}`;
    const apt: Appointment = {
      _id: aptId,
      patientId: params.patientId || 'pat-1',
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      department: dep.name,
      date: params.date,
      time: params.time,
      tokenNumber,
      status: patientsAhead === 0 ? 'ongoing' : 'upcoming',
      estimatedWaitTime: estimatedWait,
      createdAt: new Date().toISOString(),
      notes: params.notes
    };

    const queueItem: QueueItem = {
      _id: `q-${Date.now()}`,
      tokenNumber,
      appointmentId: aptId,
      patientId: params.patientId || 'pat-1',
      patientName: params.patientName,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      department: dep.name,
      queuePosition: patientsAhead + 1,
      status: patientsAhead === 0 ? 'current' : patientsAhead === 1 ? 'next' : 'waiting',
      estimatedWaitTime: estimatedWait,
      createdAt: new Date().toISOString()
    };

    this.data.appointments.push(apt);
    this.data.queue.push(queueItem);
    this.save(this.data);

    return { appointment: apt, queueItem };
  }

  public cancelAppointment(id: string) {
    const apt = this.data.appointments.find(a => a._id === id || a.tokenNumber === id);
    if (apt) {
      apt.status = 'cancelled';
      const q = this.data.queue.find(item => item.tokenNumber === apt.tokenNumber);
      if (q) q.status = 'skipped';
      this.save(this.data);
    }
    return apt;
  }

  public rescheduleAppointment(params: { appointmentId: string; newTime: string; newDate?: string; reason?: string }) {
    const apt = this.data.appointments.find(a => a._id === params.appointmentId || a.tokenNumber === params.appointmentId);
    if (apt) {
      apt.time = params.newTime;
      if (params.newDate) apt.date = params.newDate;
      if (apt.status === 'cancelled') apt.status = 'upcoming';
      this.save(this.data);
    }
    const queueItem = this.data.queue.find(q => q.tokenNumber === apt?.tokenNumber);
    return { appointment: apt, queueItem };
  }

  public getQueue(dept?: string, activeOnly?: boolean) {
    let list = this.data.queue;
    if (dept) list = list.filter(q => q.department.toLowerCase() === dept.toLowerCase());
    if (activeOnly) list = list.filter(q => q.status !== 'completed' && q.status !== 'skipped');
    return list;
  }

  public getPatientQueueSummary(patientId?: string, tokenNumber?: string): PatientQueueSummary {
    let item = this.data.queue.find(q =>
      (tokenNumber && q.tokenNumber === tokenNumber) ||
      (patientId && q.patientId === patientId && q.status !== 'completed' && q.status !== 'skipped')
    );
    if (!item && patientId) {
      item = this.data.queue.filter(q => q.patientId === patientId).pop();
    }
    if (!item) {
      item = this.data.queue.find(q => q.tokenNumber === 'A102') || this.data.queue[0];
    }

    const deptQueue = this.data.queue.filter(q => q.department.toLowerCase() === item!.department.toLowerCase());
    const current = deptQueue.find(q => q.status === 'current');
    const ahead = deptQueue.filter(q => q.status !== 'completed' && q.status !== 'skipped' && q.queuePosition < item!.queuePosition).length;
    const apt = this.data.appointments.find(a => a.tokenNumber === item!.tokenNumber);

    return {
      patientQueueItem: item!,
      appointment: apt,
      currentActiveToken: current?.tokenNumber || 'None',
      peopleAhead: ahead,
      estimatedWaitTime: item?.estimatedWaitTime || 0,
      departmentQueue: deptQueue
    };
  }

  public callNextPatient(department: string) {
    const active = this.data.queue.filter(q => q.department.toLowerCase() === department.toLowerCase() && (q.status === 'next' || q.status === 'waiting'))
      .sort((a, b) => a.queuePosition - b.queuePosition);
    const curr = this.data.queue.find(q => q.department.toLowerCase() === department.toLowerCase() && q.status === 'current');
    if (curr) {
      curr.status = 'completed';
      curr.queuePosition = 0;
    }
    let nextPatient: QueueItem | null = null;
    if (active.length > 0) {
      nextPatient = active[0];
      nextPatient.status = 'current';
      nextPatient.queuePosition = 1;
    }
    this.save(this.data);
    return {
      currentPatient: nextPatient,
      queue: this.data.queue.filter(q => q.department.toLowerCase() === department.toLowerCase())
    };
  }

  public updateQueueStatus(id: string, status: 'completed' | 'current' | 'next' | 'waiting' | 'skipped') {
    const item = this.data.queue.find(q => q._id === id || q.tokenNumber === id);
    if (item) {
      item.status = status;
      this.save(this.data);
    }
    return item;
  }

  public markPatientDelay(id: string, mins: number) {
    const item = this.data.queue.find(q => q._id === id || q.tokenNumber === id);
    if (item) {
      item.estimatedWaitTime += mins;
      this.save(this.data);
    }
    return item;
  }

  public markPatientNoShow(id: string) {
    const item = this.data.queue.find(q => q._id === id || q.tokenNumber === id);
    if (item) {
      item.status = 'skipped';
      this.save(this.data);
    }
    return item;
  }

  public getNotifications(userId?: string, patientId?: string) {
    let list = this.data.notifications;
    if (userId) list = list.filter(n => n.userId === userId || !n.userId);
    else if (patientId) list = list.filter(n => n.patientId === patientId);
    return {
      notifications: list,
      unreadCount: list.filter(n => !n.read).length
    };
  }

  public markNotificationRead(id: string) {
    const notif = this.data.notifications.find(n => n._id === id);
    if (notif) {
      notif.read = true;
      this.save(this.data);
    }
  }

  public markAllNotificationsRead() {
    this.data.notifications.forEach(n => { n.read = true; });
    this.save(this.data);
  }

  public getAdminStats() {
    const appointments = this.data.appointments;
    const queue = this.data.queue;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const ongoing = appointments.filter(a => a.status === 'ongoing').length;
    const upcoming = appointments.filter(a => a.status === 'upcoming').length;
    const total = appointments.length || 1;

    return {
      stats: {
        todaysAppointments: total,
        patientsInQueue: queue.filter(q => q.status === 'waiting' || q.status === 'next' || q.status === 'current').length,
        averageWaitTime: 15,
        completedToday: completed
      },
      chartData: [
        { name: 'Completed', value: completed, color: '#10B981', percentage: Math.round((completed / total) * 100) },
        { name: 'Ongoing', value: ongoing, color: '#0EA5E9', percentage: Math.round((ongoing / total) * 100) },
        { name: 'Upcoming', value: upcoming, color: '#F59E0B', percentage: Math.round((upcoming / total) * 100) }
      ],
      departmentsCount: this.data.departments.length,
      activeDoctorsCount: this.data.doctors.length
    };
  }
}

export const mockStore = new MockStore();
