import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed or stored password
  role: 'patient' | 'doctor' | 'admin';
  phone: string;
  createdAt: string;
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
  averageConsultationTime: number; // in minutes
  avatar?: string;
  status: 'Available' | 'In Consultation' | 'On Break';
}

export interface Department {
  _id: string;
  name: string;
  code: string; // e.g., 'GP', 'CARD', 'ORTH', 'PED'
  prefix: string; // Token prefix e.g., 'A', 'B', 'C', 'D'
  description: string;
  iconName: string;
  averageConsultationTime: number; // in minutes (Admin configurable)
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
  date: string; // YYYY-MM-DD or readable string
  time: string; // e.g. 10:00 AM
  tokenNumber: string; // e.g. A102
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'skipped';
  estimatedWaitTime: number; // minutes
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
  queuePosition: number; // 1 = currently being seen, 2 = next, etc.
  status: 'completed' | 'current' | 'next' | 'waiting' | 'skipped';
  estimatedWaitTime: number; // in minutes
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

export interface DatabaseData {
  users: User[];
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  queue: QueueItem[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic sample data
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

const defaultUsers: User[] = [
  {
    _id: 'user-admin',
    name: 'Dr. Aris Thorne (Admin)',
    email: 'admin@quickcare.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-doc-1',
    name: 'Dr. Ramesh Chandra',
    email: 'ramesh@quickcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 014-9921',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-doc-2',
    name: 'Dr. Priya Sharma',
    email: 'priya@quickcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 014-8842',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-patient-1',
    name: 'Ravi Kumar',
    email: 'ravi@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '+1 (555) 482-1920',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-patient-2',
    name: 'Anita Verma',
    email: 'anita@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '+1 (555) 293-8471',
    createdAt: new Date().toISOString()
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
  },
  {
    _id: 'pat-3',
    userId: 'user-patient-3',
    name: 'Suresh Patel',
    age: 52,
    gender: 'Male',
    phone: '+1 (555) 847-1902',
    bloodGroup: 'A+'
  },
  {
    _id: 'pat-4',
    userId: 'user-patient-4',
    name: 'Meena Singh',
    age: 41,
    gender: 'Female',
    phone: '+1 (555) 392-8172',
    bloodGroup: 'AB+'
  },
  {
    _id: 'pat-5',
    userId: 'user-patient-5',
    name: 'Kavita Iyer',
    age: 29,
    gender: 'Female',
    phone: '+1 (555) 921-7643',
    bloodGroup: 'O-'
  }
];

// Today date string helper
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
  },
  {
    _id: 'apt-104',
    patientId: 'pat-5',
    patientName: 'Kavita Iyer',
    patientPhone: '+1 (555) 921-7643',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    date: todayStr,
    time: '10:30 AM',
    tokenNumber: 'A104',
    status: 'upcoming',
    estimatedWaitTime: 10,
    createdAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    _id: 'apt-201',
    patientId: 'pat-3',
    patientName: 'Suresh Patel',
    patientPhone: '+1 (555) 847-1902',
    doctorId: 'doc-3',
    doctorName: 'Dr. Suresh Patel',
    department: 'Cardiology',
    date: todayStr,
    time: '11:00 AM',
    tokenNumber: 'B201',
    status: 'ongoing',
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 2400000).toISOString()
  },
  {
    _id: 'apt-202',
    patientId: 'pat-4',
    patientName: 'Meena Singh',
    patientPhone: '+1 (555) 392-8172',
    doctorId: 'doc-3',
    doctorName: 'Dr. Suresh Patel',
    department: 'Cardiology',
    date: todayStr,
    time: '11:30 AM',
    tokenNumber: 'B202',
    status: 'upcoming',
    estimatedWaitTime: 15,
    createdAt: new Date(Date.now() - 1500000).toISOString()
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
  },
  {
    _id: 'q-104',
    tokenNumber: 'A104',
    appointmentId: 'apt-104',
    patientId: 'pat-5',
    patientName: 'Kavita Iyer',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ramesh Chandra',
    department: 'General Physician',
    queuePosition: 3,
    status: 'waiting',
    estimatedWaitTime: 10,
    createdAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    _id: 'q-201',
    tokenNumber: 'B201',
    appointmentId: 'apt-201',
    patientId: 'pat-3',
    patientName: 'Suresh Patel',
    doctorId: 'doc-3',
    doctorName: 'Dr. Suresh Patel',
    department: 'Cardiology',
    queuePosition: 1,
    status: 'current',
    estimatedWaitTime: 0,
    calledAt: new Date(Date.now() - 600000).toISOString(),
    createdAt: new Date(Date.now() - 2400000).toISOString()
  },
  {
    _id: 'q-202',
    tokenNumber: 'B202',
    appointmentId: 'apt-202',
    patientId: 'pat-4',
    patientName: 'Meena Singh',
    doctorId: 'doc-3',
    doctorName: 'Dr. Suresh Patel',
    department: 'Cardiology',
    queuePosition: 2,
    status: 'next',
    estimatedWaitTime: 15,
    createdAt: new Date(Date.now() - 1500000).toISOString()
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
  },
  {
    _id: 'notif-3',
    userId: 'user-patient-1',
    patientId: 'pat-1',
    title: 'Appointment Booked',
    message: 'Appointment confirmed for General Physician with Dr. Ramesh Chandra. Token: A102.',
    type: 'booked',
    read: true,
    tokenNumber: 'A102',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

class DatabaseService {
  private data: DatabaseData;
  private resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

  constructor() {
    this.data = this.loadData();
  }

  private hashUsersIfNeeded(users: User[]): boolean {
    let changed = false;
    for (const u of users) {
      if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
        u.password = bcrypt.hashSync(u.password, 10);
        changed = true;
      }
    }
    return changed;
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseData;
        if (this.hashUsersIfNeeded(parsed.users)) {
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing database.json, initializing fresh dataset', e);
    }

    const clonedUsers = JSON.parse(JSON.stringify(defaultUsers)) as User[];
    this.hashUsersIfNeeded(clonedUsers);

    const initial: DatabaseData = {
      users: clonedUsers,
      patients: defaultPatients,
      doctors: defaultDoctors,
      departments: defaultDepartments,
      appointments: defaultAppointments,
      queue: defaultQueue,
      notifications: defaultNotifications
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseData) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data to database.json', e);
    }
  }

  public resetSampleData() {
    const clonedUsers = JSON.parse(JSON.stringify(defaultUsers)) as User[];
    this.hashUsersIfNeeded(clonedUsers);

    this.data = {
      users: clonedUsers,
      patients: defaultPatients,
      doctors: defaultDoctors,
      departments: defaultDepartments,
      appointments: defaultAppointments,
      queue: defaultQueue,
      notifications: defaultNotifications
    };
    this.saveData(this.data);
    return this.data;
  }

  // Collections accessors
  public getUsers(): User[] { return this.data.users; }
  public getPatients(): Patient[] { return this.data.patients; }
  public getDoctors(): Doctor[] { return this.data.doctors; }
  public getDepartments(): Department[] { return this.data.departments; }
  public getAppointments(): Appointment[] { return this.data.appointments; }
  public getQueue(): QueueItem[] { return this.data.queue; }
  public getNotifications(): NotificationItem[] { return this.data.notifications; }

  // Recalculate estimated wait times dynamically across queue for all departments
  // Estimated Wait Time = Number of Patients Ahead × Average Consultation Time
  public recalculateQueueWaitTimes(departmentName?: string) {
    const deps = departmentName
      ? this.data.departments.filter(d => d.name.toLowerCase() === departmentName.toLowerCase())
      : this.data.departments;

    for (const dep of deps) {
      const avgTime = dep.averageConsultationTime || 5;

      // Filter active queue items for this department: current, next, waiting
      const activeQueue = this.data.queue
        .filter(q => q.department.toLowerCase() === dep.name.toLowerCase() && q.status !== 'completed' && q.status !== 'skipped')
        .sort((a, b) => a.queuePosition - b.queuePosition);

      // Re-assign positions and wait times
      activeQueue.forEach((item, index) => {
        // index 0 is Current (queuePosition 1)
        item.queuePosition = index + 1;
        if (index === 0) {
          item.status = 'current';
          item.estimatedWaitTime = 0;
        } else if (index === 1) {
          item.status = 'next';
          item.estimatedWaitTime = avgTime;
        } else {
          item.status = 'waiting';
          // Patients ahead = index (since index patients precede this patient)
          item.estimatedWaitTime = index * avgTime;
        }

        // Also sync with appointment
        const apt = this.data.appointments.find(a => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
        if (apt) {
          apt.status = item.status === 'current' ? 'ongoing' : 'upcoming';
          apt.estimatedWaitTime = item.estimatedWaitTime;
        }

        // Check if patient's turn is approaching (1 patient ahead) or is now (0 ahead)
        if (index === 1) {
          this.maybeCreateApproachingNotification(item);
        } else if (index === 0 && !item.calledAt) {
          item.calledAt = new Date().toISOString();
          this.maybeCreateTurnNowNotification(item);
        }
      });
    }

    this.saveData(this.data);
  }

  private maybeCreateApproachingNotification(item: QueueItem) {
    // Check if notification already exists recently for this item
    const exists = this.data.notifications.some(
      n => n.tokenNumber === item.tokenNumber && n.type === 'turn_approaching'
    );
    if (!exists) {
      const notif: NotificationItem = {
        _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: item.patientId,
        patientId: item.patientId,
        title: 'Your Turn is Approaching!',
        message: `Token ${item.tokenNumber} will be called soon. Only 1 patient ahead in ${item.department}.`,
        type: 'turn_approaching',
        read: false,
        tokenNumber: item.tokenNumber,
        createdAt: new Date().toISOString()
      };
      this.data.notifications.unshift(notif);
    }
  }

  private maybeCreateTurnNowNotification(item: QueueItem) {
    const exists = this.data.notifications.some(
      n => n.tokenNumber === item.tokenNumber && n.type === 'turn_now'
    );
    if (!exists) {
      const notif: NotificationItem = {
        _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: item.patientId,
        patientId: item.patientId,
        title: "Your Turn is Now! 🩺",
        message: `Token ${item.tokenNumber} is now being called for consultation with ${item.doctorName}. Please enter immediately.`,
        type: 'turn_now',
        read: false,
        tokenNumber: item.tokenNumber,
        createdAt: new Date().toISOString()
      };
      this.data.notifications.unshift(notif);
    }
  }

  // Add Appointment & Queue Item
  public createAppointment(params: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    notes?: string;
  }): { appointment: Appointment; queueItem: QueueItem } {
    const dep = this.data.departments.find(d => d.name.toLowerCase() === params.department.toLowerCase()) || this.data.departments[0];
    const prefix = dep.prefix || 'A';

    // Generate unique token number e.g. A105
    const existingTokens = this.data.queue
      .filter(q => q.tokenNumber.startsWith(prefix))
      .map(q => {
        const num = parseInt(q.tokenNumber.substring(prefix.length), 10);
        return isNaN(num) ? 100 : num;
      });

    const nextNumber = existingTokens.length > 0 ? Math.max(...existingTokens) + 1 : 101;
    const tokenNumber = `${prefix}${nextNumber}`;

    // Calculate patients ahead in department
    const activeInDept = this.data.queue.filter(
      q => q.department.toLowerCase() === dep.name.toLowerCase() && q.status !== 'completed' && q.status !== 'skipped'
    );
    const patientsAhead = activeInDept.length;
    const avgConsultTime = dep.averageConsultationTime || 5;
    const estimatedWait = patientsAhead * avgConsultTime;

    const aptId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      _id: aptId,
      patientId: params.patientId,
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

    const newQueueItem: QueueItem = {
      _id: `q-${Date.now()}`,
      tokenNumber,
      appointmentId: aptId,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      department: dep.name,
      queuePosition: patientsAhead + 1,
      status: patientsAhead === 0 ? 'current' : patientsAhead === 1 ? 'next' : 'waiting',
      estimatedWaitTime: estimatedWait,
      calledAt: patientsAhead === 0 ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    this.data.appointments.push(newAppointment);
    this.data.queue.push(newQueueItem);

    // Create booking notification
    const bookingNotif: NotificationItem = {
      _id: `notif-${Date.now()}`,
      userId: params.patientId,
      patientId: params.patientId,
      title: 'Appointment Booked Successfully',
      message: `Your appointment is confirmed for ${dep.name} with ${params.doctorName}. Your Token is ${tokenNumber}. Estimated wait: ${estimatedWait} mins.`,
      type: 'booked',
      read: false,
      tokenNumber,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(bookingNotif);

    this.recalculateQueueWaitTimes(dep.name);
    this.saveData(this.data);

    return { appointment: newAppointment, queueItem: newQueueItem };
  }

  // Advance queue: Mark completed, call next, or skip
  public updateQueueStatus(queueIdOrToken: string, newStatus: 'completed' | 'current' | 'next' | 'waiting' | 'skipped') {
    const item = this.data.queue.find(q => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;

    item.status = newStatus;
    if (newStatus === 'completed') {
      item.completedAt = new Date().toISOString();
      item.queuePosition = 0;
      item.estimatedWaitTime = 0;
    } else if (newStatus === 'current') {
      item.calledAt = new Date().toISOString();
      item.queuePosition = 1;
      item.estimatedWaitTime = 0;
    } else if (newStatus === 'skipped') {
      item.queuePosition = 999;
    }

    // Sync appointment status
    const apt = this.data.appointments.find(a => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
    if (apt) {
      if (newStatus === 'completed') apt.status = 'completed';
      else if (newStatus === 'current') apt.status = 'ongoing';
      else if (newStatus === 'skipped') apt.status = 'skipped';
    }

    // Recalculate remaining wait times in this department
    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }

  // Call next patient directly for department or doctor
  public callNextPatient(departmentName: string, doctorId?: string): QueueItem | null {
    const activeInDept = this.data.queue
      .filter(q => q.department.toLowerCase() === departmentName.toLowerCase() && q.status !== 'completed' && q.status !== 'skipped')
      .sort((a, b) => a.queuePosition - b.queuePosition);

    if (activeInDept.length === 0) return null;

    // Mark current active patient as completed if doctor is advancing
    const current = activeInDept.find(q => q.status === 'current');
    if (current) {
      current.status = 'completed';
      current.completedAt = new Date().toISOString();
      current.queuePosition = 0;
      current.estimatedWaitTime = 0;

      const apt = this.data.appointments.find(a => a._id === current.appointmentId || a.tokenNumber === current.tokenNumber);
      if (apt) apt.status = 'completed';
    }

    // Next patient in line becomes current
    const nextCandidates = this.data.queue
      .filter(q => q.department.toLowerCase() === departmentName.toLowerCase() && (q.status === 'next' || q.status === 'waiting'))
      .sort((a, b) => a.queuePosition - b.queuePosition);

    if (nextCandidates.length > 0) {
      const nextPatient = nextCandidates[0];
      nextPatient.status = 'current';
      nextPatient.calledAt = new Date().toISOString();
      nextPatient.queuePosition = 1;
      nextPatient.estimatedWaitTime = 0;

      const apt = this.data.appointments.find(a => a._id === nextPatient.appointmentId || a.tokenNumber === nextPatient.tokenNumber);
      if (apt) apt.status = 'ongoing';

      this.maybeCreateTurnNowNotification(nextPatient);
    }

    this.recalculateQueueWaitTimes(departmentName);
    this.saveData(this.data);

    return this.data.queue.find(q => q.department.toLowerCase() === departmentName.toLowerCase() && q.status === 'current') || null;
  }

  // Update department average consultation time (Admin configuration)
  public updateDepartmentConsultationTime(departmentId: string, newTimeInMinutes: number): Department | null {
    const dep = this.data.departments.find(d => d._id === departmentId || d.name.toLowerCase() === departmentId.toLowerCase());
    if (!dep) return null;

    dep.averageConsultationTime = Math.max(1, Math.round(newTimeInMinutes));
    // Recalculate wait times for all waiting patients in this department
    this.recalculateQueueWaitTimes(dep.name);
    this.saveData(this.data);
    return dep;
  }

  // Update doctor availability status
  public updateDoctorStatus(doctorId: string, status: 'Available' | 'In Consultation' | 'On Break'): Doctor | null {
    const doc = this.data.doctors.find(d => d._id === doctorId || d.name.toLowerCase() === doctorId.toLowerCase());
    if (!doc) return null;
    doc.status = status;
    this.saveData(this.data);
    return doc;
  }

  // Reschedule or adjust delayed appointment time
  public rescheduleAppointment(appointmentId: string, newTime: string, newDate?: string, reason?: string): { appointment: Appointment; queueItem?: QueueItem } | null {
    const apt = this.data.appointments.find(a => a._id === appointmentId || a.tokenNumber === appointmentId);
    if (!apt) return null;

    apt.time = newTime;
    if (newDate) apt.date = newDate;
    if (apt.status === 'cancelled') apt.status = 'upcoming';

    // Find corresponding queue item if any
    const queueItem = this.data.queue.find(q => q.appointmentId === apt._id || q.tokenNumber === apt.tokenNumber);
    if (queueItem) {
      if (queueItem.status === 'skipped') queueItem.status = 'waiting';
      // Recalculate wait time based on delay
      this.recalculateQueueWaitTimes(queueItem.department);
    }

    this.addNotification({
      userId: apt.patientId,
      patientId: apt.patientId,
      title: 'Appointment Time Adjusted',
      message: `Your appointment for ${apt.department} with ${apt.doctorName} (Token ${apt.tokenNumber}) has been adjusted to ${newTime}${reason ? ` (${reason})` : ''}.`,
      type: 'delay',
      tokenNumber: apt.tokenNumber
    });

    this.saveData(this.data);
    return { appointment: apt, queueItem };
  }

  // Admin marks patient delayed (adjusts priority in queue without cancelling)
  public markPatientDelayed(queueIdOrToken: string, delayMinutes: number = 30): QueueItem | null {
    const item = this.data.queue.find(q => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;

    // Shift queue position down by 2 or to end of waiting queue
    const deptItems = this.data.queue.filter(q => q.department.toLowerCase() === item.department.toLowerCase() && (q.status === 'waiting' || q.status === 'next'));
    const maxPos = Math.max(...deptItems.map(d => d.queuePosition), item.queuePosition);
    item.queuePosition = maxPos + 1;
    item.status = 'waiting';
    item.estimatedWaitTime = Math.max(item.estimatedWaitTime + delayMinutes, delayMinutes);

    this.addNotification({
      userId: item.patientId,
      patientId: item.patientId,
      title: 'Queue Position Adjusted',
      message: `You reported a delay. Your token ${item.tokenNumber} has been rescheduled behind active waiting patients for ~${delayMinutes} mins.`,
      type: 'delay',
      tokenNumber: item.tokenNumber
    });

    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }

  // Admin marks patient as No-Show / Not Come
  public markPatientNoShow(queueIdOrToken: string): QueueItem | null {
    const item = this.data.queue.find(q => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;

    item.status = 'skipped';
    item.queuePosition = 0;
    item.estimatedWaitTime = 0;

    const apt = this.data.appointments.find(a => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
    if (apt) {
      apt.status = 'skipped';
    }

    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }

  // Notification management
  public markNotificationAsRead(notifId: string): boolean {
    const notif = this.data.notifications.find(n => n._id === notifId);
    if (notif) {
      notif.read = true;
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId?: string): void {
    this.data.notifications.forEach(n => {
      if (!userId || n.userId === userId) {
        n.read = true;
      }
    });
    this.saveData(this.data);
  }

  public addNotification(notif: Omit<NotificationItem, '_id' | 'createdAt' | 'read'>): NotificationItem {
    const newItem: NotificationItem = {
      ...notif,
      _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(newItem);
    this.saveData(this.data);
    return newItem;
  }

  // User & patient operations
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u._id === id);
  }

  public toSafeUser(user: User): Omit<User, 'password'> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  public verifyPassword(user: User, candidatePassword: string): boolean {
    if (!user || !candidatePassword) return false;
    try {
      if (bcrypt.compareSync(candidatePassword, user.password)) {
        return true;
      }
    } catch {
      // not a standard bcrypt string
    }
    // Upgrade legacy plaintext if matched
    if (user.password === candidatePassword) {
      user.password = bcrypt.hashSync(candidatePassword, 10);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public createPasswordResetToken(email: string): string {
    const token = 'rst-' + crypto.randomBytes(16).toString('hex');
    this.resetTokens.set(token, {
      email: email.toLowerCase(),
      expiresAt: Date.now() + 3600000 // 1 hour
    });
    return token;
  }

  public verifyResetToken(token: string): string | null {
    const record = this.resetTokens.get(token);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.resetTokens.delete(token);
      return null;
    }
    return record.email;
  }

  public resetPasswordWithToken(token: string, newPlainPassword: string): boolean {
    const email = this.verifyResetToken(token);
    if (!email) return false;
    const user = this.findUserByEmail(email);
    if (!user) return false;

    user.password = bcrypt.hashSync(newPlainPassword, 10);
    this.resetTokens.delete(token);
    this.saveData(this.data);
    return true;
  }

  public updateUserPassword(email: string, newPlainPassword: string): boolean {
    const user = this.findUserByEmail(email);
    if (!user) return false;
    user.password = bcrypt.hashSync(newPlainPassword, 10);
    this.saveData(this.data);
    return true;
  }

  public createUser(user: Omit<User, '_id' | 'createdAt'>, patientDetails?: { age: number; gender: 'Male' | 'Female' | 'Other' }): { user: User; patient?: Patient } {
    const userId = `user-${Date.now()}`;
    const hashedPassword = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
      ? user.password
      : bcrypt.hashSync(user.password, 10);

    const newUser: User = {
      ...user,
      password: hashedPassword,
      _id: userId,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);

    let newPatient: Patient | undefined;
    if (user.role === 'patient') {
      newPatient = {
        _id: `pat-${Date.now()}`,
        userId: userId,
        name: user.name,
        age: patientDetails?.age || 30,
        gender: patientDetails?.gender || 'Other',
        phone: user.phone
      };
      this.data.patients.push(newPatient);
    }

    this.saveData(this.data);
    return { user: newUser, patient: newPatient };
  }

  public getPatientByUserId(userId: string): Patient | undefined {
    return this.data.patients.find(p => p.userId === userId);
  }
}

export const db = new DatabaseService();
