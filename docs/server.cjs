var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/routes.ts
var import_express = require("express");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DATA_DIR = import_path.default.resolve(process.cwd(), "data");
var DATA_FILE = import_path.default.join(DATA_DIR, "database.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var defaultDepartments = [
  {
    _id: "dep-1",
    name: "General Physician",
    code: "GP",
    prefix: "A",
    description: "Routine checkups, seasonal illness, acute diagnosis & adult medicine",
    iconName: "Stethoscope",
    averageConsultationTime: 5,
    headDoctor: "Dr. Ramesh Chandra",
    roomNumbers: ["Room 101", "Room 102"]
  },
  {
    _id: "dep-2",
    name: "Cardiology",
    code: "CARD",
    prefix: "B",
    description: "Heart disease diagnosis, hypertension care, ECG & cardiovascular health",
    iconName: "HeartPulse",
    averageConsultationTime: 15,
    headDoctor: "Dr. Anita Desai",
    roomNumbers: ["Room 205", "Room 206"]
  },
  {
    _id: "dep-3",
    name: "Orthopedics",
    code: "ORTH",
    prefix: "C",
    description: "Bone, joint, spine, sports injuries, fractures & rehabilitation",
    iconName: "Activity",
    averageConsultationTime: 10,
    headDoctor: "Dr. Vikram Seth",
    roomNumbers: ["Room 304"]
  },
  {
    _id: "dep-4",
    name: "Pediatrics",
    code: "PED",
    prefix: "D",
    description: "Comprehensive infant, child, and adolescent healthcare & immunizations",
    iconName: "Baby",
    averageConsultationTime: 8,
    headDoctor: "Dr. Sunita Rao",
    roomNumbers: ["Room 110"]
  }
];
var defaultDoctors = [
  {
    _id: "doc-1",
    name: "Dr. Ramesh Chandra",
    department: "General Physician",
    specialization: "Internal Medicine & Chronic Disease",
    roomNumber: "Room 101",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    averageConsultationTime: 5,
    status: "In Consultation"
  },
  {
    _id: "doc-2",
    name: "Dr. Priya Sharma",
    department: "General Physician",
    specialization: "Family Medicine & Preventive Care",
    roomNumber: "Room 102",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    averageConsultationTime: 6,
    status: "Available"
  },
  {
    _id: "doc-3",
    name: "Dr. Suresh Patel",
    department: "Cardiology",
    specialization: "Interventional Cardiologist",
    roomNumber: "Room 205",
    availability: ["Mon", "Wed", "Fri"],
    averageConsultationTime: 15,
    status: "In Consultation"
  },
  {
    _id: "doc-4",
    name: "Dr. Vikram Seth",
    department: "Orthopedics",
    specialization: "Joint Replacement & Spine Specialist",
    roomNumber: "Room 304",
    availability: ["Tue", "Thu", "Sat"],
    averageConsultationTime: 10,
    status: "Available"
  },
  {
    _id: "doc-5",
    name: "Dr. Sunita Rao",
    department: "Pediatrics",
    specialization: "Neonatal & Child Health",
    roomNumber: "Room 110",
    availability: ["Mon", "Tue", "Wed", "Thu", "Sat"],
    averageConsultationTime: 8,
    status: "Available"
  }
];
var defaultUsers = [
  {
    _id: "user-admin",
    name: "Dr. Aris Thorne (Admin)",
    email: "admin@quickcare.com",
    password: "admin123",
    role: "admin",
    phone: "+1 (555) 019-2834",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    _id: "user-doc-1",
    name: "Dr. Ramesh Chandra",
    email: "ramesh@quickcare.com",
    password: "doctor123",
    role: "doctor",
    phone: "+1 (555) 014-9921",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    _id: "user-doc-2",
    name: "Dr. Priya Sharma",
    email: "priya@quickcare.com",
    password: "doctor123",
    role: "doctor",
    phone: "+1 (555) 014-8842",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    _id: "user-patient-1",
    name: "Ravi Kumar",
    email: "ravi@gmail.com",
    password: "patient123",
    role: "patient",
    phone: "+1 (555) 482-1920",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    _id: "user-patient-2",
    name: "Anita Verma",
    email: "anita@gmail.com",
    password: "patient123",
    role: "patient",
    phone: "+1 (555) 293-8471",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var defaultPatients = [
  {
    _id: "pat-1",
    userId: "user-patient-1",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    phone: "+1 (555) 482-1920",
    bloodGroup: "O+",
    emergencyContact: "+1 (555) 482-1921"
  },
  {
    _id: "pat-2",
    userId: "user-patient-2",
    name: "Anita Verma",
    age: 28,
    gender: "Female",
    phone: "+1 (555) 293-8471",
    bloodGroup: "B+",
    emergencyContact: "+1 (555) 293-8472"
  },
  {
    _id: "pat-3",
    userId: "user-patient-3",
    name: "Suresh Patel",
    age: 52,
    gender: "Male",
    phone: "+1 (555) 847-1902",
    bloodGroup: "A+"
  },
  {
    _id: "pat-4",
    userId: "user-patient-4",
    name: "Meena Singh",
    age: 41,
    gender: "Female",
    phone: "+1 (555) 392-8172",
    bloodGroup: "AB+"
  },
  {
    _id: "pat-5",
    userId: "user-patient-5",
    name: "Kavita Iyer",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 921-7643",
    bloodGroup: "O-"
  }
];
var todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
var defaultAppointments = [
  {
    _id: "apt-100",
    patientId: "pat-mock-1",
    patientName: "Kishore Dave",
    patientPhone: "+1 (555) 100-2918",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    date: todayStr,
    time: "09:00 AM",
    tokenNumber: "A100",
    status: "completed",
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 36e5 * 3).toISOString()
  },
  {
    _id: "apt-101",
    patientId: "pat-mock-2",
    patientName: "Devika Menon",
    patientPhone: "+1 (555) 101-4491",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    date: todayStr,
    time: "09:30 AM",
    tokenNumber: "A101",
    status: "completed",
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString()
  },
  {
    _id: "apt-102",
    patientId: "pat-1",
    patientName: "Ravi Kumar",
    patientPhone: "+1 (555) 482-1920",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    date: todayStr,
    time: "10:00 AM",
    tokenNumber: "A102",
    status: "ongoing",
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 36e5).toISOString(),
    notes: "Mild fever and recurrent headache since past 2 days."
  },
  {
    _id: "apt-103",
    patientId: "pat-2",
    patientName: "Anita Verma",
    patientPhone: "+1 (555) 293-8471",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    date: todayStr,
    time: "10:15 AM",
    tokenNumber: "A103",
    status: "upcoming",
    estimatedWaitTime: 5,
    createdAt: new Date(Date.now() - 18e5).toISOString()
  },
  {
    _id: "apt-104",
    patientId: "pat-5",
    patientName: "Kavita Iyer",
    patientPhone: "+1 (555) 921-7643",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    date: todayStr,
    time: "10:30 AM",
    tokenNumber: "A104",
    status: "upcoming",
    estimatedWaitTime: 10,
    createdAt: new Date(Date.now() - 12e5).toISOString()
  },
  {
    _id: "apt-201",
    patientId: "pat-3",
    patientName: "Suresh Patel",
    patientPhone: "+1 (555) 847-1902",
    doctorId: "doc-3",
    doctorName: "Dr. Suresh Patel",
    department: "Cardiology",
    date: todayStr,
    time: "11:00 AM",
    tokenNumber: "B201",
    status: "ongoing",
    estimatedWaitTime: 0,
    createdAt: new Date(Date.now() - 24e5).toISOString()
  },
  {
    _id: "apt-202",
    patientId: "pat-4",
    patientName: "Meena Singh",
    patientPhone: "+1 (555) 392-8172",
    doctorId: "doc-3",
    doctorName: "Dr. Suresh Patel",
    department: "Cardiology",
    date: todayStr,
    time: "11:30 AM",
    tokenNumber: "B202",
    status: "upcoming",
    estimatedWaitTime: 15,
    createdAt: new Date(Date.now() - 15e5).toISOString()
  }
];
var defaultQueue = [
  {
    _id: "q-100",
    tokenNumber: "A100",
    appointmentId: "apt-100",
    patientId: "pat-mock-1",
    patientName: "Kishore Dave",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    queuePosition: 0,
    status: "completed",
    estimatedWaitTime: 0,
    completedAt: new Date(Date.now() - 36e5 * 2).toISOString(),
    createdAt: new Date(Date.now() - 36e5 * 3).toISOString()
  },
  {
    _id: "q-101",
    tokenNumber: "A101",
    appointmentId: "apt-101",
    patientId: "pat-mock-2",
    patientName: "Devika Menon",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    queuePosition: 0,
    status: "completed",
    estimatedWaitTime: 0,
    completedAt: new Date(Date.now() - 36e5).toISOString(),
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString()
  },
  {
    _id: "q-102",
    tokenNumber: "A102",
    appointmentId: "apt-102",
    patientId: "pat-1",
    patientName: "Ravi Kumar",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    queuePosition: 1,
    status: "current",
    estimatedWaitTime: 0,
    calledAt: new Date(Date.now() - 3e5).toISOString(),
    createdAt: new Date(Date.now() - 36e5).toISOString()
  },
  {
    _id: "q-103",
    tokenNumber: "A103",
    appointmentId: "apt-103",
    patientId: "pat-2",
    patientName: "Anita Verma",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    queuePosition: 2,
    status: "next",
    estimatedWaitTime: 5,
    createdAt: new Date(Date.now() - 18e5).toISOString()
  },
  {
    _id: "q-104",
    tokenNumber: "A104",
    appointmentId: "apt-104",
    patientId: "pat-5",
    patientName: "Kavita Iyer",
    doctorId: "doc-1",
    doctorName: "Dr. Ramesh Chandra",
    department: "General Physician",
    queuePosition: 3,
    status: "waiting",
    estimatedWaitTime: 10,
    createdAt: new Date(Date.now() - 12e5).toISOString()
  },
  {
    _id: "q-201",
    tokenNumber: "B201",
    appointmentId: "apt-201",
    patientId: "pat-3",
    patientName: "Suresh Patel",
    doctorId: "doc-3",
    doctorName: "Dr. Suresh Patel",
    department: "Cardiology",
    queuePosition: 1,
    status: "current",
    estimatedWaitTime: 0,
    calledAt: new Date(Date.now() - 6e5).toISOString(),
    createdAt: new Date(Date.now() - 24e5).toISOString()
  },
  {
    _id: "q-202",
    tokenNumber: "B202",
    appointmentId: "apt-202",
    patientId: "pat-4",
    patientName: "Meena Singh",
    doctorId: "doc-3",
    doctorName: "Dr. Suresh Patel",
    department: "Cardiology",
    queuePosition: 2,
    status: "next",
    estimatedWaitTime: 15,
    createdAt: new Date(Date.now() - 15e5).toISOString()
  }
];
var defaultNotifications = [
  {
    _id: "notif-1",
    userId: "user-patient-1",
    patientId: "pat-1",
    title: "Consultation In Progress",
    message: "Your token A102 is currently active in Room 101 with Dr. Ramesh Chandra.",
    type: "turn_now",
    read: false,
    tokenNumber: "A102",
    createdAt: new Date(Date.now() - 3e5).toISOString()
  },
  {
    _id: "notif-2",
    userId: "user-patient-2",
    patientId: "pat-2",
    title: "Your Turn is Approaching",
    message: "Token A103: There is only 1 patient ahead of you. Please proceed near Room 101.",
    type: "turn_approaching",
    read: false,
    tokenNumber: "A103",
    createdAt: new Date(Date.now() - 24e4).toISOString()
  },
  {
    _id: "notif-3",
    userId: "user-patient-1",
    patientId: "pat-1",
    title: "Appointment Booked",
    message: "Appointment confirmed for General Physician with Dr. Ramesh Chandra. Token: A102.",
    type: "booked",
    read: true,
    tokenNumber: "A102",
    createdAt: new Date(Date.now() - 36e5).toISOString()
  }
];
var DatabaseService = class {
  constructor() {
    this.resetTokens = /* @__PURE__ */ new Map();
    this.data = this.loadData();
  }
  hashUsersIfNeeded(users) {
    let changed = false;
    for (const u of users) {
      if (!u.password.startsWith("$2a$") && !u.password.startsWith("$2b$")) {
        u.password = import_bcryptjs.default.hashSync(u.password, 10);
        changed = true;
      }
    }
    return changed;
  }
  loadData() {
    try {
      if (import_fs.default.existsSync(DATA_FILE)) {
        const fileContent = import_fs.default.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (this.hashUsersIfNeeded(parsed.users)) {
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not read existing database.json, initializing fresh dataset", e);
    }
    const clonedUsers = JSON.parse(JSON.stringify(defaultUsers));
    this.hashUsersIfNeeded(clonedUsers);
    const initial = {
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
  saveData(data) {
    try {
      import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving data to database.json", e);
    }
  }
  resetSampleData() {
    const clonedUsers = JSON.parse(JSON.stringify(defaultUsers));
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
  getUsers() {
    return this.data.users;
  }
  getPatients() {
    return this.data.patients;
  }
  getDoctors() {
    return this.data.doctors;
  }
  getDepartments() {
    return this.data.departments;
  }
  getAppointments() {
    return this.data.appointments;
  }
  getQueue() {
    return this.data.queue;
  }
  getNotifications() {
    return this.data.notifications;
  }
  // Recalculate estimated wait times dynamically across queue for all departments
  // Estimated Wait Time = Number of Patients Ahead × Average Consultation Time
  recalculateQueueWaitTimes(departmentName) {
    const deps = departmentName ? this.data.departments.filter((d) => d.name.toLowerCase() === departmentName.toLowerCase()) : this.data.departments;
    for (const dep of deps) {
      const avgTime = dep.averageConsultationTime || 5;
      const activeQueue = this.data.queue.filter((q) => q.department.toLowerCase() === dep.name.toLowerCase() && q.status !== "completed" && q.status !== "skipped").sort((a, b) => a.queuePosition - b.queuePosition);
      activeQueue.forEach((item, index) => {
        item.queuePosition = index + 1;
        if (index === 0) {
          item.status = "current";
          item.estimatedWaitTime = 0;
        } else if (index === 1) {
          item.status = "next";
          item.estimatedWaitTime = avgTime;
        } else {
          item.status = "waiting";
          item.estimatedWaitTime = index * avgTime;
        }
        const apt = this.data.appointments.find((a) => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
        if (apt) {
          apt.status = item.status === "current" ? "ongoing" : "upcoming";
          apt.estimatedWaitTime = item.estimatedWaitTime;
        }
        if (index === 1) {
          this.maybeCreateApproachingNotification(item);
        } else if (index === 0 && !item.calledAt) {
          item.calledAt = (/* @__PURE__ */ new Date()).toISOString();
          this.maybeCreateTurnNowNotification(item);
        }
      });
    }
    this.saveData(this.data);
  }
  maybeCreateApproachingNotification(item) {
    const exists = this.data.notifications.some(
      (n) => n.tokenNumber === item.tokenNumber && n.type === "turn_approaching"
    );
    if (!exists) {
      const notif = {
        _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: item.patientId,
        patientId: item.patientId,
        title: "Your Turn is Approaching!",
        message: `Token ${item.tokenNumber} will be called soon. Only 1 patient ahead in ${item.department}.`,
        type: "turn_approaching",
        read: false,
        tokenNumber: item.tokenNumber,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.notifications.unshift(notif);
    }
  }
  maybeCreateTurnNowNotification(item) {
    const exists = this.data.notifications.some(
      (n) => n.tokenNumber === item.tokenNumber && n.type === "turn_now"
    );
    if (!exists) {
      const notif = {
        _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: item.patientId,
        patientId: item.patientId,
        title: "Your Turn is Now! \u{1FA7A}",
        message: `Token ${item.tokenNumber} is now being called for consultation with ${item.doctorName}. Please enter immediately.`,
        type: "turn_now",
        read: false,
        tokenNumber: item.tokenNumber,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.notifications.unshift(notif);
    }
  }
  // Add Appointment & Queue Item
  createAppointment(params) {
    const dep = this.data.departments.find((d) => d.name.toLowerCase() === params.department.toLowerCase()) || this.data.departments[0];
    const prefix = dep.prefix || "A";
    const existingTokens = this.data.queue.filter((q) => q.tokenNumber.startsWith(prefix)).map((q) => {
      const num = parseInt(q.tokenNumber.substring(prefix.length), 10);
      return isNaN(num) ? 100 : num;
    });
    const nextNumber = existingTokens.length > 0 ? Math.max(...existingTokens) + 1 : 101;
    const tokenNumber = `${prefix}${nextNumber}`;
    const activeInDept = this.data.queue.filter(
      (q) => q.department.toLowerCase() === dep.name.toLowerCase() && q.status !== "completed" && q.status !== "skipped"
    );
    const patientsAhead = activeInDept.length;
    const avgConsultTime = dep.averageConsultationTime || 5;
    const estimatedWait = patientsAhead * avgConsultTime;
    const aptId = `apt-${Date.now()}`;
    const newAppointment = {
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
      status: patientsAhead === 0 ? "ongoing" : "upcoming",
      estimatedWaitTime: estimatedWait,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      notes: params.notes
    };
    const newQueueItem = {
      _id: `q-${Date.now()}`,
      tokenNumber,
      appointmentId: aptId,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      department: dep.name,
      queuePosition: patientsAhead + 1,
      status: patientsAhead === 0 ? "current" : patientsAhead === 1 ? "next" : "waiting",
      estimatedWaitTime: estimatedWait,
      calledAt: patientsAhead === 0 ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.appointments.push(newAppointment);
    this.data.queue.push(newQueueItem);
    const bookingNotif = {
      _id: `notif-${Date.now()}`,
      userId: params.patientId,
      patientId: params.patientId,
      title: "Appointment Booked Successfully",
      message: `Your appointment is confirmed for ${dep.name} with ${params.doctorName}. Your Token is ${tokenNumber}. Estimated wait: ${estimatedWait} mins.`,
      type: "booked",
      read: false,
      tokenNumber,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.notifications.unshift(bookingNotif);
    this.recalculateQueueWaitTimes(dep.name);
    this.saveData(this.data);
    return { appointment: newAppointment, queueItem: newQueueItem };
  }
  // Advance queue: Mark completed, call next, or skip
  updateQueueStatus(queueIdOrToken, newStatus) {
    const item = this.data.queue.find((q) => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;
    item.status = newStatus;
    if (newStatus === "completed") {
      item.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      item.queuePosition = 0;
      item.estimatedWaitTime = 0;
    } else if (newStatus === "current") {
      item.calledAt = (/* @__PURE__ */ new Date()).toISOString();
      item.queuePosition = 1;
      item.estimatedWaitTime = 0;
    } else if (newStatus === "skipped") {
      item.queuePosition = 999;
    }
    const apt = this.data.appointments.find((a) => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
    if (apt) {
      if (newStatus === "completed") apt.status = "completed";
      else if (newStatus === "current") apt.status = "ongoing";
      else if (newStatus === "skipped") apt.status = "skipped";
    }
    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }
  // Call next patient directly for department or doctor
  callNextPatient(departmentName, doctorId) {
    const activeInDept = this.data.queue.filter((q) => q.department.toLowerCase() === departmentName.toLowerCase() && q.status !== "completed" && q.status !== "skipped").sort((a, b) => a.queuePosition - b.queuePosition);
    if (activeInDept.length === 0) return null;
    const current = activeInDept.find((q) => q.status === "current");
    if (current) {
      current.status = "completed";
      current.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      current.queuePosition = 0;
      current.estimatedWaitTime = 0;
      const apt = this.data.appointments.find((a) => a._id === current.appointmentId || a.tokenNumber === current.tokenNumber);
      if (apt) apt.status = "completed";
    }
    const nextCandidates = this.data.queue.filter((q) => q.department.toLowerCase() === departmentName.toLowerCase() && (q.status === "next" || q.status === "waiting")).sort((a, b) => a.queuePosition - b.queuePosition);
    if (nextCandidates.length > 0) {
      const nextPatient = nextCandidates[0];
      nextPatient.status = "current";
      nextPatient.calledAt = (/* @__PURE__ */ new Date()).toISOString();
      nextPatient.queuePosition = 1;
      nextPatient.estimatedWaitTime = 0;
      const apt = this.data.appointments.find((a) => a._id === nextPatient.appointmentId || a.tokenNumber === nextPatient.tokenNumber);
      if (apt) apt.status = "ongoing";
      this.maybeCreateTurnNowNotification(nextPatient);
    }
    this.recalculateQueueWaitTimes(departmentName);
    this.saveData(this.data);
    return this.data.queue.find((q) => q.department.toLowerCase() === departmentName.toLowerCase() && q.status === "current") || null;
  }
  // Update department average consultation time (Admin configuration)
  updateDepartmentConsultationTime(departmentId, newTimeInMinutes) {
    const dep = this.data.departments.find((d) => d._id === departmentId || d.name.toLowerCase() === departmentId.toLowerCase());
    if (!dep) return null;
    dep.averageConsultationTime = Math.max(1, Math.round(newTimeInMinutes));
    this.recalculateQueueWaitTimes(dep.name);
    this.saveData(this.data);
    return dep;
  }
  // Update doctor availability status
  updateDoctorStatus(doctorId, status) {
    const doc = this.data.doctors.find((d) => d._id === doctorId || d.name.toLowerCase() === doctorId.toLowerCase());
    if (!doc) return null;
    doc.status = status;
    this.saveData(this.data);
    return doc;
  }
  // Reschedule or adjust delayed appointment time
  rescheduleAppointment(appointmentId, newTime, newDate, reason) {
    const apt = this.data.appointments.find((a) => a._id === appointmentId || a.tokenNumber === appointmentId);
    if (!apt) return null;
    apt.time = newTime;
    if (newDate) apt.date = newDate;
    if (apt.status === "cancelled") apt.status = "upcoming";
    const queueItem = this.data.queue.find((q) => q.appointmentId === apt._id || q.tokenNumber === apt.tokenNumber);
    if (queueItem) {
      if (queueItem.status === "skipped") queueItem.status = "waiting";
      this.recalculateQueueWaitTimes(queueItem.department);
    }
    this.addNotification({
      userId: apt.patientId,
      patientId: apt.patientId,
      title: "Appointment Time Adjusted",
      message: `Your appointment for ${apt.department} with ${apt.doctorName} (Token ${apt.tokenNumber}) has been adjusted to ${newTime}${reason ? ` (${reason})` : ""}.`,
      type: "delay",
      tokenNumber: apt.tokenNumber
    });
    this.saveData(this.data);
    return { appointment: apt, queueItem };
  }
  // Admin marks patient delayed (adjusts priority in queue without cancelling)
  markPatientDelayed(queueIdOrToken, delayMinutes = 30) {
    const item = this.data.queue.find((q) => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;
    const deptItems = this.data.queue.filter((q) => q.department.toLowerCase() === item.department.toLowerCase() && (q.status === "waiting" || q.status === "next"));
    const maxPos = Math.max(...deptItems.map((d) => d.queuePosition), item.queuePosition);
    item.queuePosition = maxPos + 1;
    item.status = "waiting";
    item.estimatedWaitTime = Math.max(item.estimatedWaitTime + delayMinutes, delayMinutes);
    this.addNotification({
      userId: item.patientId,
      patientId: item.patientId,
      title: "Queue Position Adjusted",
      message: `You reported a delay. Your token ${item.tokenNumber} has been rescheduled behind active waiting patients for ~${delayMinutes} mins.`,
      type: "delay",
      tokenNumber: item.tokenNumber
    });
    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }
  // Admin marks patient as No-Show / Not Come
  markPatientNoShow(queueIdOrToken) {
    const item = this.data.queue.find((q) => q._id === queueIdOrToken || q.tokenNumber === queueIdOrToken);
    if (!item) return null;
    item.status = "skipped";
    item.queuePosition = 0;
    item.estimatedWaitTime = 0;
    const apt = this.data.appointments.find((a) => a._id === item.appointmentId || a.tokenNumber === item.tokenNumber);
    if (apt) {
      apt.status = "skipped";
    }
    this.recalculateQueueWaitTimes(item.department);
    this.saveData(this.data);
    return item;
  }
  // Notification management
  markNotificationAsRead(notifId) {
    const notif = this.data.notifications.find((n) => n._id === notifId);
    if (notif) {
      notif.read = true;
      this.saveData(this.data);
      return true;
    }
    return false;
  }
  markAllNotificationsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (!userId || n.userId === userId) {
        n.read = true;
      }
    });
    this.saveData(this.data);
  }
  addNotification(notif) {
    const newItem = {
      ...notif,
      _id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.notifications.unshift(newItem);
    this.saveData(this.data);
    return newItem;
  }
  // User & patient operations
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.data.users.find((u) => u._id === id);
  }
  toSafeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  verifyPassword(user, candidatePassword) {
    if (!user || !candidatePassword) return false;
    try {
      if (import_bcryptjs.default.compareSync(candidatePassword, user.password)) {
        return true;
      }
    } catch {
    }
    if (user.password === candidatePassword) {
      user.password = import_bcryptjs.default.hashSync(candidatePassword, 10);
      this.saveData(this.data);
      return true;
    }
    return false;
  }
  createPasswordResetToken(email) {
    const token = "rst-" + import_crypto.default.randomBytes(16).toString("hex");
    this.resetTokens.set(token, {
      email: email.toLowerCase(),
      expiresAt: Date.now() + 36e5
      // 1 hour
    });
    return token;
  }
  verifyResetToken(token) {
    const record = this.resetTokens.get(token);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.resetTokens.delete(token);
      return null;
    }
    return record.email;
  }
  resetPasswordWithToken(token, newPlainPassword) {
    const email = this.verifyResetToken(token);
    if (!email) return false;
    const user = this.findUserByEmail(email);
    if (!user) return false;
    user.password = import_bcryptjs.default.hashSync(newPlainPassword, 10);
    this.resetTokens.delete(token);
    this.saveData(this.data);
    return true;
  }
  updateUserPassword(email, newPlainPassword) {
    const user = this.findUserByEmail(email);
    if (!user) return false;
    user.password = import_bcryptjs.default.hashSync(newPlainPassword, 10);
    this.saveData(this.data);
    return true;
  }
  createUser(user, patientDetails) {
    const userId = `user-${Date.now()}`;
    const hashedPassword = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") ? user.password : import_bcryptjs.default.hashSync(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
      _id: userId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users.push(newUser);
    let newPatient;
    if (user.role === "patient") {
      newPatient = {
        _id: `pat-${Date.now()}`,
        userId,
        name: user.name,
        age: patientDetails?.age || 30,
        gender: patientDetails?.gender || "Other",
        phone: user.phone
      };
      this.data.patients.push(newPatient);
    }
    this.saveData(this.data);
    return { user: newUser, patient: newPatient };
  }
  getPatientByUserId(userId) {
    return this.data.patients.find((p) => p.userId === userId);
  }
};
var db = new DatabaseService();

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "quickcare-jwt-secret-token-key-2026";
function generateToken(user) {
  return import_jsonwebtoken.default.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access token required. Please sign in." });
    return;
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: "User not found or session invalid." });
      return;
    }
    req.user = user;
    if (user.role === "patient") {
      req.patient = db.getPatientByUserId(user._id);
    } else if (user.role === "doctor") {
      req.doctor = db.getDoctors().find(
        (d) => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id
      );
    }
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired access token." });
  }
}
function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    next();
    return;
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (user) {
      req.user = user;
      if (user.role === "patient") {
        req.patient = db.getPatientByUserId(user._id);
      } else if (user.role === "doctor") {
        req.doctor = db.getDoctors().find(
          (d) => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id
        );
      }
    }
  } catch {
  }
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires [${roles.join(", ")}] permissions.` });
      return;
    }
    next();
  };
}

// server/routes.ts
var router = (0, import_express.Router)();
router.get("/auth/demo-users", (_req, res) => {
  const users = db.getUsers().map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json({ users });
});
router.post("/auth/register", (req, res) => {
  try {
    const { name, email, password, role = "patient", phone, age, gender } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }
    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      res.status(400).json({ error: "Email already registered. Please sign in." });
      return;
    }
    const { user, patient } = db.createUser(
      {
        name: name.trim(),
        email: cleanEmail,
        password,
        // Hashed inside db.createUser using bcrypt
        role: ["patient", "doctor", "admin"].includes(role) ? role : "patient",
        phone: phone || "+1 (555) 000-0000"
      },
      {
        age: Number(age) || 30,
        gender: gender || "Other"
      }
    );
    const token = generateToken(user);
    res.status(201).json({
      message: "Registration successful",
      token,
      user: db.toSafeUser(user),
      patient
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});
router.post("/auth/login", (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials. User not found." });
      return;
    }
    const isValid = db.verifyPassword(user, password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid password. Please try again." });
      return;
    }
    if (role && user.role !== role) {
      res.status(403).json({ error: `User account is registered as ${user.role}, not ${role}.` });
      return;
    }
    const token = generateToken(user);
    const patient = user.role === "patient" ? db.getPatientByUserId(user._id) : void 0;
    const doctor = user.role === "doctor" ? db.getDoctors().find((d) => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id) : void 0;
    res.json({
      message: "Login successful",
      token,
      user: db.toSafeUser(user),
      patient,
      doctor
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});
router.get("/auth/me", authenticateToken, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    user: db.toSafeUser(req.user),
    patient: req.patient,
    doctor: req.doctor
  });
});
router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = db.findUserByEmail(cleanEmail);
  if (!user) {
    res.status(404).json({ error: "No account found with this email address." });
    return;
  }
  const resetToken = db.createPasswordResetToken(cleanEmail);
  res.json({
    message: `A secure password reset token has been issued for ${user.email}. Enter your new password below to complete verification.`,
    resetToken,
    userEmail: user.email
  });
});
router.post("/auth/reset-password", (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    res.status(400).json({ error: "Reset token and new password are required." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long." });
    return;
  }
  const success = db.resetPasswordWithToken(resetToken, newPassword);
  if (!success) {
    res.status(400).json({ error: "Invalid or expired password reset token. Please request a new one." });
    return;
  }
  res.json({
    message: "Your password has been successfully updated. You may now log in with your new password."
  });
});
router.get("/departments", (_req, res) => {
  res.json({ departments: db.getDepartments() });
});
router.patch("/departments/:id/config-wait-time", authenticateToken, requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const { averageConsultationTime } = req.body;
  if (!averageConsultationTime || isNaN(Number(averageConsultationTime))) {
    res.status(400).json({ error: "Valid averageConsultationTime in minutes is required" });
    return;
  }
  const updated = db.updateDepartmentConsultationTime(id, Number(averageConsultationTime));
  if (!updated) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json({
    message: `Average consultation time for ${updated.name} updated to ${updated.averageConsultationTime} minutes. Wait times recalculated!`,
    department: updated
  });
});
router.get("/doctors", (req, res) => {
  const { department } = req.query;
  let doctors = db.getDoctors();
  if (department && typeof department === "string") {
    doctors = doctors.filter((d) => d.department.toLowerCase() === department.toLowerCase());
  }
  res.json({ doctors });
});
router.patch("/doctors/:id/status", authenticateToken, requireRole("admin", "doctor"), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !["Available", "In Consultation", "On Break"].includes(status)) {
    res.status(400).json({ error: "Valid status required (Available, In Consultation, On Break)" });
    return;
  }
  if (req.user?.role === "doctor") {
    const doc = db.getDoctors().find((d) => d._id === id || d.name.toLowerCase() === req.user.name.toLowerCase());
    if (!doc || doc._id !== id && doc.name.toLowerCase() !== req.user.name.toLowerCase()) {
      res.status(403).json({ error: "Doctors can only modify their own availability status." });
      return;
    }
  }
  const updatedDoctor = db.updateDoctorStatus(id, status);
  if (!updatedDoctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json({
    message: `Doctor status updated to ${status}`,
    doctor: updatedDoctor
  });
});
router.get("/appointments", authenticateToken, (req, res) => {
  const { patientId, doctorId, department, date, status } = req.query;
  let appointments = db.getAppointments();
  if (req.user?.role === "patient") {
    const pId = req.patient?._id || req.user._id;
    appointments = appointments.filter((a) => a.patientId === pId || a.patientId === req.user?._id);
  } else if (req.user?.role === "doctor") {
    const docId = req.doctor?._id;
    const docName = req.doctor?.name || req.user.name;
    const docDept = req.doctor?.department;
    if (department && typeof department === "string") {
      appointments = appointments.filter((a) => a.department.toLowerCase() === department.toLowerCase());
    } else {
      appointments = appointments.filter(
        (a) => docId && a.doctorId === docId || a.doctorName.toLowerCase() === docName.toLowerCase() || docDept && a.department.toLowerCase() === docDept.toLowerCase()
      );
    }
  } else {
    if (patientId) appointments = appointments.filter((a) => a.patientId === patientId);
    if (doctorId) appointments = appointments.filter((a) => a.doctorId === doctorId);
    if (department) appointments = appointments.filter((a) => a.department === department);
    if (date) appointments = appointments.filter((a) => a.date === date);
    if (status) appointments = appointments.filter((a) => a.status === status);
  }
  res.json({ appointments });
});
router.post("/appointments/book", authenticateToken, (req, res) => {
  try {
    const { doctorId, doctorName, department, date, time, notes } = req.body;
    if (!department || !doctorName || !date || !time) {
      res.status(400).json({ error: "Department, doctor, date, and time are required." });
      return;
    }
    let finalPatientId;
    let finalPatientName;
    let finalPatientPhone;
    if (req.user?.role === "patient") {
      finalPatientId = req.patient?._id || req.user._id;
      finalPatientName = req.patient?.name || req.user.name;
      finalPatientPhone = req.patient?.phone || req.user.phone || "+1 (555) 012-3456";
    } else {
      finalPatientId = req.body.patientId || req.user._id;
      finalPatientName = req.body.patientName || req.user.name;
      finalPatientPhone = req.body.patientPhone || req.user.phone || "+1 (555) 012-3456";
    }
    const result = db.createAppointment({
      patientId: finalPatientId,
      patientName: finalPatientName,
      patientPhone: finalPatientPhone,
      doctorId: doctorId || "doc-1",
      doctorName,
      department,
      date,
      time,
      notes
    });
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: result.appointment,
      queueItem: result.queueItem
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to book appointment" });
  }
});
router.post("/appointments/:id/cancel", authenticateToken, (req, res) => {
  const { id } = req.params;
  const apt = db.getAppointments().find((a) => a._id === id);
  if (!apt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (req.user?.role === "patient") {
    const pId = req.patient?._id || req.user._id;
    if (apt.patientId !== pId && apt.patientId !== req.user._id) {
      res.status(403).json({ error: "Access denied: You can only cancel your own appointments." });
      return;
    }
  }
  apt.status = "cancelled";
  db.updateQueueStatus(apt.tokenNumber, "skipped");
  db.addNotification({
    userId: apt.patientId,
    patientId: apt.patientId,
    title: "Appointment Cancelled",
    message: `Appointment for ${apt.department} on ${apt.date} at ${apt.time} (Token ${apt.tokenNumber}) has been cancelled.`,
    type: "cancelled",
    tokenNumber: apt.tokenNumber
  });
  res.json({ message: "Appointment cancelled successfully", appointment: apt });
});
router.post("/appointments/:id/reschedule", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { newTime, newDate, reason } = req.body;
  if (!newTime) {
    res.status(400).json({ error: "New time is required" });
    return;
  }
  const apt = db.getAppointments().find((a) => a._id === id);
  if (!apt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (req.user?.role === "patient") {
    const pId = req.patient?._id || req.user._id;
    if (apt.patientId !== pId && apt.patientId !== req.user._id) {
      res.status(403).json({ error: "Access denied: You can only reschedule your own appointments." });
      return;
    }
  }
  const result = db.rescheduleAppointment(id, newTime, newDate, reason);
  if (!result) {
    res.status(404).json({ error: "Appointment could not be rescheduled." });
    return;
  }
  res.json({
    message: `Appointment successfully rescheduled to ${newTime}!`,
    appointment: result.appointment,
    queueItem: result.queueItem
  });
});
router.get("/appointments/available-slots", (req, res) => {
  const allSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM"
  ];
  const { department, doctorId } = req.query;
  const bookedTimes = db.getAppointments().filter((a) => a.status !== "cancelled" && (!department || a.department === department) && (!doctorId || a.doctorId === doctorId)).map((a) => a.time);
  const freeSlots = allSlots.filter((s) => !bookedTimes.includes(s));
  res.json({
    availableSlots: freeSlots.length > 0 ? freeSlots : ["11:30 AM", "12:15 PM", "02:00 PM", "03:30 PM", "04:45 PM"],
    allSlots
  });
});
router.get("/queue", (req, res) => {
  const { department, activeOnly } = req.query;
  let queue = db.getQueue();
  if (department && typeof department === "string") {
    queue = queue.filter((q) => q.department.toLowerCase() === department.toLowerCase());
  }
  if (activeOnly === "true") {
    queue = queue.filter((q) => q.status !== "completed" && q.status !== "skipped");
  }
  res.json({ queue });
});
router.get("/queue/patient-summary", optionalAuthenticateToken, (req, res) => {
  const { patientId: queryPatientId, tokenNumber } = req.query;
  const activePatientId = typeof queryPatientId === "string" && queryPatientId ? queryPatientId : req.patient?._id || req.user?._id;
  const queueList = db.getQueue();
  let patientQueueItem = queueList.find(
    (q) => tokenNumber && q.tokenNumber === tokenNumber || activePatientId && (q.patientId === activePatientId || req.user && q.patientId === req.user._id) && q.status !== "completed" && q.status !== "skipped"
  );
  if (!patientQueueItem && activePatientId) {
    const patientItems = queueList.filter((q) => q.patientId === activePatientId || req.user && q.patientId === req.user._id);
    if (patientItems.length > 0) {
      patientQueueItem = patientItems[patientItems.length - 1];
    }
  }
  if (!patientQueueItem) {
    const deptQueue2 = queueList.filter((q) => q.status !== "completed" && q.status !== "skipped");
    const currentActive2 = deptQueue2.find((q) => q.status === "current");
    res.json({
      patientQueueItem: null,
      appointment: null,
      currentActiveToken: currentActive2?.tokenNumber || "None",
      peopleAhead: 0,
      estimatedWaitTime: 0,
      departmentQueue: deptQueue2
    });
    return;
  }
  const deptQueue = queueList.filter((q) => q.department.toLowerCase() === patientQueueItem.department.toLowerCase()).sort((a, b) => a.queuePosition - b.queuePosition);
  const currentActive = deptQueue.find((q) => q.status === "current");
  let peopleAhead = 0;
  if (patientQueueItem.status === "current" || patientQueueItem.status === "completed" || patientQueueItem.status === "skipped") {
    peopleAhead = 0;
  } else {
    peopleAhead = deptQueue.filter(
      (q) => q.status !== "completed" && q.status !== "skipped" && q.queuePosition < patientQueueItem.queuePosition
    ).length;
  }
  const appointment = db.getAppointments().find((a) => a.tokenNumber === patientQueueItem.tokenNumber);
  res.json({
    patientQueueItem,
    appointment,
    currentActiveToken: currentActive?.tokenNumber || "None",
    peopleAhead,
    estimatedWaitTime: patientQueueItem.estimatedWaitTime,
    departmentQueue: deptQueue
  });
});
router.post("/queue/call-next", authenticateToken, requireRole("admin", "doctor"), (req, res) => {
  const { department, doctorId } = req.body;
  if (!department) {
    res.status(400).json({ error: "Department is required" });
    return;
  }
  const nextActive = db.callNextPatient(department, doctorId || req.doctor?._id);
  res.json({
    message: nextActive ? `Token ${nextActive.tokenNumber} is now active!` : "No upcoming patients in queue for this department.",
    currentPatient: nextActive,
    queue: db.getQueue().filter((q) => q.department.toLowerCase() === department.toLowerCase())
  });
});
router.patch("/queue/:id/status", authenticateToken, requireRole("admin", "doctor"), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["completed", "current", "next", "waiting", "skipped"].includes(status)) {
    res.status(400).json({ error: "Invalid status value" });
    return;
  }
  const updated = db.updateQueueStatus(id, status);
  if (!updated) {
    res.status(404).json({ error: "Queue item not found" });
    return;
  }
  res.json({
    message: `Queue status updated to ${status}`,
    item: updated,
    queue: db.getQueue()
  });
});
router.patch("/queue/:id/delay", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { delayMinutes = 30 } = req.body;
  const item = db.getQueue().find((q) => q._id === id || q.tokenNumber === id);
  if (!item) {
    res.status(404).json({ error: "Queue item not found" });
    return;
  }
  if (req.user?.role === "patient") {
    const pId = req.patient?._id || req.user._id;
    if (item.patientId !== pId && item.patientId !== req.user._id) {
      res.status(403).json({ error: "You can only report delay for your own token." });
      return;
    }
  }
  const updatedItem = db.markPatientDelayed(id, Number(delayMinutes));
  res.json({
    message: `Patient ${updatedItem?.patientName} (${updatedItem?.tokenNumber}) marked delayed by ${delayMinutes} mins. Position adjusted.`,
    item: updatedItem,
    queue: db.getQueue()
  });
});
router.patch("/queue/:id/no-show", authenticateToken, requireRole("admin", "doctor"), (req, res) => {
  const { id } = req.params;
  const item = db.markPatientNoShow(id);
  if (!item) {
    res.status(404).json({ error: "Queue item not found" });
    return;
  }
  res.json({
    message: `Patient ${item.patientName} (${item.tokenNumber}) marked as No-Show. Next patients moved forward.`,
    item,
    queue: db.getQueue()
  });
});
router.get("/notifications", authenticateToken, (req, res) => {
  let notifications = db.getNotifications();
  if (req.user?.role === "patient") {
    const pId = req.patient?._id || req.user._id;
    notifications = notifications.filter((n) => n.userId === req.user?._id || n.userId === pId || n.patientId === pId);
  } else if (req.user?.role === "doctor") {
    notifications = notifications.filter((n) => n.userId === req.user?._id || !n.userId);
  }
  const unreadCount = notifications.filter((n) => !n.read).length;
  res.json({ notifications, unreadCount });
});
router.patch("/notifications/:id/read", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});
router.post("/notifications/read-all", authenticateToken, (req, res) => {
  const userId = req.user?._id;
  db.markAllNotificationsRead(userId);
  res.json({ success: true, message: "All notifications marked as read" });
});
router.get("/admin/stats", authenticateToken, requireRole("admin"), (_req, res) => {
  const appointments = db.getAppointments();
  const queue = db.getQueue();
  const departments = db.getDepartments();
  const completedToday = appointments.filter((a) => a.status === "completed").length;
  const ongoingToday = appointments.filter((a) => a.status === "ongoing").length;
  const upcomingToday = appointments.filter((a) => a.status === "upcoming").length;
  const totalToday = appointments.length;
  const completedPct = totalToday > 0 ? Math.round(completedToday / totalToday * 100) : 0;
  const ongoingPct = totalToday > 0 ? Math.round(ongoingToday / totalToday * 100) : 0;
  const upcomingPct = totalToday > 0 ? Math.max(0, 100 - completedPct - ongoingPct) : 0;
  const patientsInQueue = queue.filter((q) => q.status === "waiting" || q.status === "next" || q.status === "current").length;
  const waitingItems = queue.filter((q) => q.status === "waiting" || q.status === "next");
  const avgWaitTime = waitingItems.length > 0 ? Math.round(waitingItems.reduce((acc, curr) => acc + curr.estimatedWaitTime, 0) / waitingItems.length) : departments[0]?.averageConsultationTime || 10;
  const chartData = [
    { name: "Completed", value: completedToday, color: "#10B981", percentage: completedPct },
    { name: "Ongoing", value: ongoingToday, color: "#0EA5E9", percentage: ongoingPct },
    { name: "Upcoming", value: upcomingToday, color: "#F59E0B", percentage: upcomingPct }
  ];
  res.json({
    stats: {
      todaysAppointments: totalToday,
      patientsInQueue,
      averageWaitTime: avgWaitTime,
      completedToday
    },
    chartData,
    departmentsCount: departments.length,
    activeDoctorsCount: db.getDoctors().filter((d) => d.status === "Available" || d.status === "In Consultation").length
  });
});
router.post("/admin/reset-sample-data", authenticateToken, requireRole("admin"), (_req, res) => {
  const freshData = db.resetSampleData();
  res.json({
    message: "QuickCare sample data reset to initial benchmark state successfully!",
    freshData
  });
});
var routes_default = router;

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use(import_express2.default.json());
  app.use(import_express2.default.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });
  app.use("/api", routes_default);
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "QuickCare \u2013 Smart Hospital Queue Management System",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuickCare Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start QuickCare server:", err);
});
//# sourceMappingURL=server.cjs.map
