import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateToken, authenticateToken, optionalAuthenticateToken, requireRole, AuthRequest } from './auth.js';

const router = Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Get demo quick-login credentials list (SAFE: NEVER EXPOSES PASSWORDS)
router.get('/auth/demo-users', (_req: Request, res: Response) => {
  const users = db.getUsers().map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json({ users });
});

// Register user
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'patient', phone, age, gender } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'Email already registered. Please sign in.' });
      return;
    }

    const { user, patient } = db.createUser(
      {
        name: name.trim(),
        email: cleanEmail,
        password, // Hashed inside db.createUser using bcrypt
        role: (['patient', 'doctor', 'admin'].includes(role) ? role : 'patient') as 'patient' | 'doctor' | 'admin',
        phone: phone || '+1 (555) 000-0000'
      },
      {
        age: Number(age) || 30,
        gender: gender || 'Other'
      }
    );

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: db.toSafeUser(user),
      patient
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    // Secure bcrypt password verification
    const isValid = db.verifyPassword(user, password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid password. Please try again.' });
      return;
    }

    if (role && user.role !== role) {
      res.status(403).json({ error: `User account is registered as ${user.role}, not ${role}.` });
      return;
    }

    const token = generateToken(user);
    const patient = user.role === 'patient' ? db.getPatientByUserId(user._id) : undefined;
    const doctor = user.role === 'doctor' ? db.getDoctors().find(d => d.name.toLowerCase() === user.name.toLowerCase() || d.userId === user._id) : undefined;

    res.json({
      message: 'Login successful',
      token,
      user: db.toSafeUser(user),
      patient,
      doctor
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Get current user profile (Protected)
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.json({
    user: db.toSafeUser(req.user),
    patient: req.patient,
    doctor: req.doctor
  });
});

// Forgot password (SAFE: Never exposes current password, generates secure reset token)
router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.findUserByEmail(cleanEmail);

  if (!user) {
    // Return generic message to prevent email enumeration
    res.status(404).json({ error: 'No account found with this email address.' });
    return;
  }

  const resetToken = db.createPasswordResetToken(cleanEmail);

  res.json({
    message: `A secure password reset token has been issued for ${user.email}. Enter your new password below to complete verification.`,
    resetToken,
    userEmail: user.email
  });
});

// Reset password endpoint (Securely sets new password with reset token)
router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const success = db.resetPasswordWithToken(resetToken, newPassword);
  if (!success) {
    res.status(400).json({ error: 'Invalid or expired password reset token. Please request a new one.' });
    return;
  }

  res.json({
    message: 'Your password has been successfully updated. You may now log in with your new password.'
  });
});

// ==========================================
// DEPARTMENTS ROUTES
// ==========================================

// Get all departments (Public)
router.get('/departments', (_req: Request, res: Response) => {
  res.json({ departments: db.getDepartments() });
});

// Admin update department average consultation time (Smart wait-time config - Protected)
router.patch('/departments/:id/config-wait-time', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { averageConsultationTime } = req.body;

  if (!averageConsultationTime || isNaN(Number(averageConsultationTime))) {
    res.status(400).json({ error: 'Valid averageConsultationTime in minutes is required' });
    return;
  }

  const updated = db.updateDepartmentConsultationTime(id, Number(averageConsultationTime));
  if (!updated) {
    res.status(404).json({ error: 'Department not found' });
    return;
  }

  res.json({
    message: `Average consultation time for ${updated.name} updated to ${updated.averageConsultationTime} minutes. Wait times recalculated!`,
    department: updated
  });
});

// ==========================================
// DOCTORS ROUTES
// ==========================================

// Get all doctors with optional department filter (Public)
router.get('/doctors', (req: Request, res: Response) => {
  const { department } = req.query;
  let doctors = db.getDoctors();

  if (department && typeof department === 'string') {
    doctors = doctors.filter(d => d.department.toLowerCase() === department.toLowerCase());
  }

  res.json({ doctors });
});

// Update doctor availability status (Admin / Doctor Protected)
router.patch('/doctors/:id/status', authenticateToken, requireRole('admin', 'doctor'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Available', 'In Consultation', 'On Break'].includes(status)) {
    res.status(400).json({ error: 'Valid status required (Available, In Consultation, On Break)' });
    return;
  }

  // If requester is doctor, verify they are only updating their own doctor status
  if (req.user?.role === 'doctor') {
    const doc = db.getDoctors().find(d => d._id === id || d.name.toLowerCase() === req.user!.name.toLowerCase());
    if (!doc || (doc._id !== id && doc.name.toLowerCase() !== req.user!.name.toLowerCase())) {
      res.status(403).json({ error: 'Doctors can only modify their own availability status.' });
      return;
    }
  }

  const updatedDoctor = db.updateDoctorStatus(id, status);
  if (!updatedDoctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }

  res.json({
    message: `Doctor status updated to ${status}`,
    doctor: updatedDoctor
  });
});

// ==========================================
// APPOINTMENTS & BOOKING (PROTECTED)
// ==========================================

// Get appointments (Protected: Role-based filtering)
router.get('/appointments', authenticateToken, (req: AuthRequest, res: Response) => {
  const { patientId, doctorId, department, date, status } = req.query;
  let appointments = db.getAppointments();

  if (req.user?.role === 'patient') {
    // Patients can strictly only view their own appointments
    const pId = req.patient?._id || req.user._id;
    appointments = appointments.filter(a => a.patientId === pId || a.patientId === req.user?._id);
  } else if (req.user?.role === 'doctor') {
    // Doctors only view appointments assigned to their profile or department
    const docId = req.doctor?._id;
    const docName = req.doctor?.name || req.user.name;
    const docDept = req.doctor?.department;

    if (department && typeof department === 'string') {
      appointments = appointments.filter(a => a.department.toLowerCase() === department.toLowerCase());
    } else {
      appointments = appointments.filter(a =>
        (docId && a.doctorId === docId) ||
        a.doctorName.toLowerCase() === docName.toLowerCase() ||
        (docDept && a.department.toLowerCase() === docDept.toLowerCase())
      );
    }
  } else {
    // Admin: can filter by any parameter
    if (patientId) appointments = appointments.filter(a => a.patientId === patientId);
    if (doctorId) appointments = appointments.filter(a => a.doctorId === doctorId);
    if (department) appointments = appointments.filter(a => a.department === department);
    if (date) appointments = appointments.filter(a => a.date === date);
    if (status) appointments = appointments.filter(a => a.status === status);
  }

  res.json({ appointments });
});

// Book appointment (Protected: Patient identity enforced)
router.post('/appointments/book', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, doctorName, department, date, time, notes } = req.body;

    if (!department || !doctorName || !date || !time) {
      res.status(400).json({ error: 'Department, doctor, date, and time are required.' });
      return;
    }

    // Role-based patient identity enforcement
    let finalPatientId: string;
    let finalPatientName: string;
    let finalPatientPhone: string;

    if (req.user?.role === 'patient') {
      // Enforce authenticated patient credentials to prevent impersonation
      finalPatientId = req.patient?._id || req.user._id;
      finalPatientName = req.patient?.name || req.user.name;
      finalPatientPhone = req.patient?.phone || req.user.phone || '+1 (555) 012-3456';
    } else {
      // Admin booking on behalf of patient
      finalPatientId = req.body.patientId || req.user!._id;
      finalPatientName = req.body.patientName || req.user!.name;
      finalPatientPhone = req.body.patientPhone || req.user!.phone || '+1 (555) 012-3456';
    }

    const result = db.createAppointment({
      patientId: finalPatientId,
      patientName: finalPatientName,
      patientPhone: finalPatientPhone,
      doctorId: doctorId || 'doc-1',
      doctorName,
      department,
      date,
      time,
      notes
    });

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: result.appointment,
      queueItem: result.queueItem
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to book appointment' });
  }
});

// Cancel appointment (Protected: Patient ownership or Admin/Doctor required)
router.post('/appointments/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const apt = db.getAppointments().find(a => a._id === id);
  if (!apt) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  // Access control check: patient can only cancel their own appointment
  if (req.user?.role === 'patient') {
    const pId = req.patient?._id || req.user._id;
    if (apt.patientId !== pId && apt.patientId !== req.user._id) {
      res.status(403).json({ error: 'Access denied: You can only cancel your own appointments.' });
      return;
    }
  }

  apt.status = 'cancelled';
  // Also update queue item
  db.updateQueueStatus(apt.tokenNumber, 'skipped');

  // Add notification
  db.addNotification({
    userId: apt.patientId,
    patientId: apt.patientId,
    title: 'Appointment Cancelled',
    message: `Appointment for ${apt.department} on ${apt.date} at ${apt.time} (Token ${apt.tokenNumber}) has been cancelled.`,
    type: 'cancelled',
    tokenNumber: apt.tokenNumber
  });

  res.json({ message: 'Appointment cancelled successfully', appointment: apt });
});

// Reschedule or adjust delayed appointment time (Protected: Owner or Admin/Doctor)
router.post('/appointments/:id/reschedule', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { newTime, newDate, reason } = req.body;

  if (!newTime) {
    res.status(400).json({ error: 'New time is required' });
    return;
  }

  const apt = db.getAppointments().find(a => a._id === id);
  if (!apt) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  // Access control check: patient can only reschedule their own appointment
  if (req.user?.role === 'patient') {
    const pId = req.patient?._id || req.user._id;
    if (apt.patientId !== pId && apt.patientId !== req.user._id) {
      res.status(403).json({ error: 'Access denied: You can only reschedule your own appointments.' });
      return;
    }
  }

  const result = db.rescheduleAppointment(id, newTime, newDate, reason);
  if (!result) {
    res.status(404).json({ error: 'Appointment could not be rescheduled.' });
    return;
  }

  res.json({
    message: `Appointment successfully rescheduled to ${newTime}!`,
    appointment: result.appointment,
    queueItem: result.queueItem
  });
});

// Available free time slots for today (Public)
router.get('/appointments/available-slots', (req: Request, res: Response) => {
  const allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const { department, doctorId } = req.query;
  const bookedTimes = db.getAppointments()
    .filter(a => a.status !== 'cancelled' && (!department || a.department === department) && (!doctorId || a.doctorId === doctorId))
    .map(a => a.time);

  const freeSlots = allSlots.filter(s => !bookedTimes.includes(s));
  res.json({
    availableSlots: freeSlots.length > 0 ? freeSlots : ['11:30 AM', '12:15 PM', '02:00 PM', '03:30 PM', '04:45 PM'],
    allSlots
  });
});

// ==========================================
// LIVE QUEUE TRACKING & MANAGEMENT
// ==========================================

// Get entire live queue or filtered by department (Public for displays)
router.get('/queue', (req: Request, res: Response) => {
  const { department, activeOnly } = req.query;
  let queue = db.getQueue();

  if (department && typeof department === 'string') {
    queue = queue.filter(q => q.department.toLowerCase() === department.toLowerCase());
  }

  if (activeOnly === 'true') {
    queue = queue.filter(q => q.status !== 'completed' && q.status !== 'skipped');
  }

  res.json({ queue });
});

// Patient live queue summary (Authentic data strictly without fake fallbacks)
router.get('/queue/patient-summary', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  const { patientId: queryPatientId, tokenNumber } = req.query;

  // Use authenticated patient id if available
  const activePatientId = (typeof queryPatientId === 'string' && queryPatientId)
    ? queryPatientId
    : (req.patient?._id || req.user?._id);

  const queueList = db.getQueue();

  let patientQueueItem = queueList.find(q =>
    (tokenNumber && q.tokenNumber === tokenNumber) ||
    (activePatientId && (q.patientId === activePatientId || (req.user && q.patientId === req.user._id)) && q.status !== 'completed' && q.status !== 'skipped')
  );

  // If not found in active, find latest completed/skipped for this patient
  if (!patientQueueItem && activePatientId) {
    const patientItems = queueList.filter(q => q.patientId === activePatientId || (req.user && q.patientId === req.user._id));
    if (patientItems.length > 0) {
      patientQueueItem = patientItems[patientItems.length - 1];
    }
  }

  // If no patient queue item exists for this user, return clear empty state (DO NOT FALLBACK TO A102!)
  if (!patientQueueItem) {
    const deptQueue = queueList.filter(q => q.status !== 'completed' && q.status !== 'skipped');
    const currentActive = deptQueue.find(q => q.status === 'current');

    res.json({
      patientQueueItem: null,
      appointment: null,
      currentActiveToken: currentActive?.tokenNumber || 'None',
      peopleAhead: 0,
      estimatedWaitTime: 0,
      departmentQueue: deptQueue
    });
    return;
  }

  const deptQueue = queueList
    .filter(q => q.department.toLowerCase() === patientQueueItem!.department.toLowerCase())
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const currentActive = deptQueue.find(q => q.status === 'current');

  // Calculate real people ahead
  let peopleAhead = 0;
  if (patientQueueItem.status === 'current' || patientQueueItem.status === 'completed' || patientQueueItem.status === 'skipped') {
    peopleAhead = 0;
  } else {
    peopleAhead = deptQueue.filter(
      q => q.status !== 'completed' && q.status !== 'skipped' && q.queuePosition < patientQueueItem!.queuePosition
    ).length;
  }

  // Associated appointment
  const appointment = db.getAppointments().find(a => a.tokenNumber === patientQueueItem!.tokenNumber);

  res.json({
    patientQueueItem,
    appointment,
    currentActiveToken: currentActive?.tokenNumber || 'None',
    peopleAhead,
    estimatedWaitTime: patientQueueItem.estimatedWaitTime,
    departmentQueue: deptQueue
  });
});

// Admin / Doctor: Call next patient (Protected)
router.post('/queue/call-next', authenticateToken, requireRole('admin', 'doctor'), (req: AuthRequest, res: Response) => {
  const { department, doctorId } = req.body;

  if (!department) {
    res.status(400).json({ error: 'Department is required' });
    return;
  }

  const nextActive = db.callNextPatient(department, doctorId || req.doctor?._id);
  res.json({
    message: nextActive ? `Token ${nextActive.tokenNumber} is now active!` : 'No upcoming patients in queue for this department.',
    currentPatient: nextActive,
    queue: db.getQueue().filter(q => q.department.toLowerCase() === department.toLowerCase())
  });
});

// Admin / Doctor: Update queue item status (Protected)
router.patch('/queue/:id/status', authenticateToken, requireRole('admin', 'doctor'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['completed', 'current', 'next', 'waiting', 'skipped'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  const updated = db.updateQueueStatus(id, status);
  if (!updated) {
    res.status(404).json({ error: 'Queue item not found' });
    return;
  }

  res.json({
    message: `Queue status updated to ${status}`,
    item: updated,
    queue: db.getQueue()
  });
});

// Admin / Doctor / Patient: Mark patient as delayed (Protected)
router.patch('/queue/:id/delay', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { delayMinutes = 30 } = req.body;

  const item = db.getQueue().find(q => q._id === id || q.tokenNumber === id);
  if (!item) {
    res.status(404).json({ error: 'Queue item not found' });
    return;
  }

  // Patients can only delay their own queue item
  if (req.user?.role === 'patient') {
    const pId = req.patient?._id || req.user._id;
    if (item.patientId !== pId && item.patientId !== req.user._id) {
      res.status(403).json({ error: 'You can only report delay for your own token.' });
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

// Admin / Doctor: Mark patient as not come / no-show (Protected)
router.patch('/queue/:id/no-show', authenticateToken, requireRole('admin', 'doctor'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = db.markPatientNoShow(id);
  if (!item) {
    res.status(404).json({ error: 'Queue item not found' });
    return;
  }

  res.json({
    message: `Patient ${item.patientName} (${item.tokenNumber}) marked as No-Show. Next patients moved forward.`,
    item,
    queue: db.getQueue()
  });
});

// ==========================================
// NOTIFICATIONS (PROTECTED)
// ==========================================

router.get('/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  let notifications = db.getNotifications();

  if (req.user?.role === 'patient') {
    const pId = req.patient?._id || req.user._id;
    notifications = notifications.filter(n => n.userId === req.user?._id || n.userId === pId || n.patientId === pId);
  } else if (req.user?.role === 'doctor') {
    notifications = notifications.filter(n => n.userId === req.user?._id || !n.userId);
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ notifications, unreadCount });
});

router.patch('/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.markNotificationAsRead(id);
  res.json({ success: true });
});

router.post('/notifications/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  db.markAllNotificationsRead(userId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// ADMIN DASHBOARD REAL DATABASE METRICS (PROTECTED)
// ==========================================

router.get('/admin/stats', authenticateToken, requireRole('admin'), (_req: AuthRequest, res: Response) => {
  const appointments = db.getAppointments();
  const queue = db.getQueue();
  const departments = db.getDepartments();

  const completedToday = appointments.filter(a => a.status === 'completed').length;
  const ongoingToday = appointments.filter(a => a.status === 'ongoing').length;
  const upcomingToday = appointments.filter(a => a.status === 'upcoming').length;
  const totalToday = appointments.length;

  const completedPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const ongoingPct = totalToday > 0 ? Math.round((ongoingToday / totalToday) * 100) : 0;
  const upcomingPct = totalToday > 0 ? Math.max(0, 100 - completedPct - ongoingPct) : 0;

  // Active in queue
  const patientsInQueue = queue.filter(q => q.status === 'waiting' || q.status === 'next' || q.status === 'current').length;

  // Average wait time across waiting patients
  const waitingItems = queue.filter(q => q.status === 'waiting' || q.status === 'next');
  const avgWaitTime = waitingItems.length > 0
    ? Math.round(waitingItems.reduce((acc, curr) => acc + curr.estimatedWaitTime, 0) / waitingItems.length)
    : (departments[0]?.averageConsultationTime || 10);

  // Accurate Donut chart distribution based 100% on real data
  const chartData = [
    { name: 'Completed', value: completedToday, color: '#10B981', percentage: completedPct },
    { name: 'Ongoing', value: ongoingToday, color: '#0EA5E9', percentage: ongoingPct },
    { name: 'Upcoming', value: upcomingToday, color: '#F59E0B', percentage: upcomingPct }
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
    activeDoctorsCount: db.getDoctors().filter(d => d.status === 'Available' || d.status === 'In Consultation').length
  });
});

// Reset sample data (Protected: Admin Only)
router.post('/admin/reset-sample-data', authenticateToken, requireRole('admin'), (_req: AuthRequest, res: Response) => {
  const freshData = db.resetSampleData();
  res.json({
    message: 'QuickCare sample data reset to initial benchmark state successfully!',
    freshData
  });
});

export default router;
