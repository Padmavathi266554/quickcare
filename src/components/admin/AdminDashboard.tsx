import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Stethoscope,
  BarChart3,
  Bell,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  SkipForward,
  ChevronDown,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Sliders,
  ShieldCheck,
  Search,
  Filter,
  UserX,
  Clock3,
  Check,
  DoorOpen,
  CalendarDays
} from 'lucide-react';
import {
  AdminStats,
  ChartDataItem,
  QueueItem,
  Appointment,
  Department,
  Doctor
} from '../../types';
import { api } from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'appointments' | 'queue' | 'patients' | 'doctors' | 'reports' | 'notifications' | 'settings'
  >('dashboard');

  const [stats, setStats] = useState<AdminStats>({
    todaysAppointments: 158,
    patientsInQueue: 42,
    averageWaitTime: 28,
    completedToday: 116
  });

  const [chartData, setChartData] = useState<ChartDataItem[]>([
    { name: 'Completed', value: 116, color: '#10B981', percentage: 73 },
    { name: 'Ongoing', value: 27, color: '#0EA5E9', percentage: 17 },
    { name: 'Upcoming', value: 15, color: '#6366F1', percentage: 10 }
  ]);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Config modal for Smart Waiting Time Prediction
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newConsultTime, setNewConsultTime] = useState<number>(5);

  const fetchAdminData = async () => {
    try {
      const [adminStats, queueData, apts, depts, docs] = await Promise.all([
        api.getAdminStats(),
        api.getQueue(),
        api.getAppointments(),
        api.getDepartments(),
        api.getDoctors()
      ]);

      if (adminStats.stats) setStats(adminStats.stats);
      if (adminStats.chartData) setChartData(adminStats.chartData);
      setQueue(queueData);
      setAppointments(apts);
      setDepartments(depts);
      setDoctors(docs);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Admin Queue Actions
  const handleMarkCompleted = async (queueId: string) => {
    try {
      await api.updateQueueItemStatus(queueId, 'completed');
      setActionMessage('Patient marked as completed. Next patient automatically promoted!');
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error updating status');
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleCallNext = async (department: string) => {
    try {
      const result = await api.callNextPatient(department);
      setActionMessage(result.message);
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error calling next patient');
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleSkipPatient = async (queueId: string) => {
    try {
      await api.updateQueueItemStatus(queueId, 'skipped');
      setActionMessage('Patient marked as skipped.');
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error skipping patient');
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  // Mark patient as delayed (+30 minutes)
  const handleDelayPatient = async (queueId: string, token: string) => {
    try {
      await api.markPatientDelay(queueId, 30);
      setActionMessage(`Patient ${token} marked as delayed (+30m). Next waiting patient promoted!`);
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error delaying patient');
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Mark patient as No-Show / Did not come
  const handleNoShowPatient = async (queueId: string, token: string) => {
    try {
      await api.markPatientNoShow(queueId);
      setActionMessage(`Patient ${token} marked as No-Show. Queue advanced.`);
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error marking patient no-show');
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Update Doctor Availability
  const handleDoctorStatusChange = async (doctorId: string, newStatus: any) => {
    try {
      await api.updateDoctorStatus(doctorId, newStatus);
      setActionMessage(`Doctor status updated to ${newStatus}`);
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error updating doctor status');
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  // Smart Wait Time Prediction - Configure consultation time
  const handleSaveConsultationTime = async () => {
    if (!editingDept) return;
    try {
      await api.updateDepartmentConsultationTime(editingDept._id, newConsultTime);
      setActionMessage(`Updated ${editingDept.name} average consultation time to ${newConsultTime} mins. Wait times dynamically recalculated!`);
      setEditingDept(null);
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Error saving consultation time');
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filtered Queue
  const filteredQueue = queue.filter(item => {
    const matchesDept = departmentFilter === 'All' || item.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Waiting Patients Queue
  const waitingPatients = queue.filter(item => item.status === 'waiting' || item.status === 'next');

  // Available Doctors Count
  const availableDoctorsCount = doctors.filter(d => d.status === 'available').length;

  const sidebarNavItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'appointments', label: t('appointments', 'Appointments'), icon: Calendar },
    { id: 'queue', label: t('queueTab', 'Live Queue'), icon: Layers },
    { id: 'patients', label: t('patientsWaiting', 'Patients Waiting'), icon: Users },
    { id: 'doctors', label: t('doctorsTab', 'Doctors Availability'), icon: Stethoscope },
    { id: 'reports', label: t('analyticsTab', 'Reports'), icon: BarChart3 },
    { id: 'notifications', label: t('notifications', 'Notifications'), icon: Bell },
    { id: 'settings', label: t('settingsTab', 'Settings'), icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div className="p-5">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-3">
            Hospital Admin Portal
          </div>
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'queue' && (
                    <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Live
                    </span>
                  )}
                  {item.id === 'patients' && waitingPatients.length > 0 && (
                    <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {waitingPatients.length}
                    </span>
                  )}
                  {item.id === 'doctors' && (
                    <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-emerald-700 text-white' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {availableDoctorsCount}/{doctors.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick config teaser in sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
            <Sliders className="h-3.5 w-3.5 text-emerald-600" />
            <span>Smart Prediction</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Configure average consultation times per department to recalculate patient wait forecasts.
          </p>
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-[11px] font-bold shadow-2xs transition-colors"
          >
            Adjust Prediction Formula
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Hospital Operations Overview'}
              {activeTab === 'appointments' && 'Hospital Appointments Booked Today'}
              {activeTab === 'queue' && 'Multi-Department Live Queue'}
              {activeTab === 'patients' && 'Patients Waiting & Queue Flow Management'}
              {activeTab === 'doctors' && 'Doctor Availability & On-Duty Status'}
              {activeTab === 'reports' && 'Clinical Operational Reports'}
              {activeTab === 'notifications' && 'System Announcements'}
              {activeTab === 'settings' && 'Queue Configuration & Prediction Settings'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              QuickCare Administrative Control Center • Live hospital management system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 1. TAB: DASHBOARD (As requested: "the above is ok so don't change it") */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 DASHBOARD STATISTICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('appointments', "Today's Appointments")}
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {stats.todaysAppointments}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    +12% from yesterday
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('patientsWaiting', 'Patients in Queue')}
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {stats.patientsInQueue}
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-block">
                    Across {departments.length} departments
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('estimatedWait', 'Average Wait Time')}
                  </span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    {stats.averageWaitTime} <span className="text-sm font-medium text-slate-500">{t('mins', 'mins')}</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    -4 mins faster vs target
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('completed', 'Completed Today')}
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {stats.completedToday}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    73% completion rate
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>
            </div>

            {/* LIVE QUEUE TABLE + APPOINTMENTS DONUT CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Live Hospital Queue
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time digital ticket pipeline with instant completion advance
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="All">All Departments</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => handleCallNext(departmentFilter === 'All' ? 'General Physician' : departmentFilter)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Call Next</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5">Token</th>
                          <th className="py-3 px-3.5">Patient</th>
                          <th className="py-3 px-3.5">Department</th>
                          <th className="py-3 px-3.5">Wait Time</th>
                          <th className="py-3 px-3.5">Status</th>
                          <th className="py-3 px-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredQueue.slice(0, 8).map((item) => {
                          const isCurrent = item.status === 'current';
                          return (
                            <tr
                              key={item._id}
                              className={`transition-colors ${
                                isCurrent ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/60'
                              }`}
                            >
                              <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                                {item.tokenNumber}
                              </td>
                              <td className="py-3 px-3.5 text-slate-800 font-medium">
                                {item.patientName}
                              </td>
                              <td className="py-3 px-3.5 text-slate-600">
                                {item.department}
                              </td>
                              <td className="py-3 px-3.5 text-slate-600">
                                {item.status === 'completed'
                                  ? '0 mins'
                                  : item.status === 'current'
                                  ? '0 mins (Active)'
                                  : `${item.estimatedWaitTime} mins`}
                              </td>
                              <td className="py-3 px-3.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                    item.status === 'current'
                                      ? 'bg-emerald-500 text-white'
                                      : item.status === 'next'
                                      ? 'bg-teal-100 text-teal-800'
                                      : item.status === 'completed'
                                      ? 'bg-slate-100 text-slate-500'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {item.status !== 'completed' && (
                                    <button
                                      id={`complete-token-${item.tokenNumber}`}
                                      onClick={() => handleMarkCompleted(item._id)}
                                      className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors"
                                      title="Mark Completed"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  {item.status !== 'skipped' && item.status !== 'completed' && (
                                    <button
                                      onClick={() => handleSkipPatient(item._id)}
                                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition-colors"
                                      title="Skip Patient"
                                    >
                                      Skip
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* APPOINTMENTS DONUT CHART */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Appointments Overview
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Today's clinical consultation distribution
                  </p>

                  <div className="h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name, item) => [
                            `${val} (${item.payload.percentage}%)`,
                            name
                          ]}
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900 font-mono">158</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Visits</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2 pt-3 border-t border-slate-100 text-xs">
                    {chartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Healthcare Green & Teal Balanced Metrics
                  </span>
                </div>
              </div>
            </div>

            {/* SMART WAITING TIME PREDICTION CONFIGURATION */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Smart Waiting Time Prediction Configuration
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formula: <span className="font-mono font-bold text-emerald-700">Estimated Wait Time = Patients Ahead × Average Consultation Time</span>
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Live Dynamic Recalculation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {departments.map((dept) => (
                  <div
                    key={dept._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          Prefix: {dept.prefix}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Consult Time</span>
                        <span className="text-base font-black font-mono text-emerald-700">
                          {dept.averageConsultationTime} mins
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setNewConsultTime(dept.averageConsultationTime);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: APPOINTMENTS (As requested: "In appointments we can see how many appointments are booked on that day") */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Big summary banner of appointments booked on that day */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Day Schedule
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">
                    Today's Hospital Appointments
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total booked patient consultations across all clinical departments for today
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-4xl font-black font-mono text-slate-900">
                    {stats.todaysAppointments}
                  </span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Booked Today
                  </p>
                </div>
              </div>

              {/* Status Breakdown row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Total Booked</span>
                  <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.todaysAppointments}</span>
                  <span className="text-[11px] text-slate-400">All registered slots</span>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-xs font-bold text-teal-800 uppercase block">In Consultation</span>
                  <span className="text-2xl font-black text-teal-900 mt-0.5 block">27</span>
                  <span className="text-[11px] text-teal-600">Currently in rooms</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase block">Waiting in Queue</span>
                  <span className="text-2xl font-black text-amber-900 mt-0.5 block">15</span>
                  <span className="text-[11px] text-amber-600">Arrived at hospital</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Completed Today</span>
                  <span className="text-2xl font-black text-emerald-900 mt-0.5 block">{stats.completedToday}</span>
                  <span className="text-[11px] text-emerald-600">73% completed</span>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Booked Appointment Records
                </h3>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search patient or token..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Token</th>
                      <th className="py-3 px-3.5">Patient Name</th>
                      <th className="py-3 px-3.5">Contact</th>
                      <th className="py-3 px-3.5">Doctor</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Time Slot</th>
                      <th className="py-3 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {appointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{apt.tokenNumber}</td>
                        <td className="py-3 px-3.5 text-slate-800 font-medium">{apt.patientName}</td>
                        <td className="py-3 px-3.5 text-slate-500">{apt.patientPhone}</td>
                        <td className="py-3 px-3.5 text-slate-700 font-medium">{apt.doctorName}</td>
                        <td className="py-3 px-3.5 text-slate-600">{apt.department}</td>
                        <td className="py-3 px-3.5 font-mono text-slate-800">{apt.time}</td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : apt.status === 'in-progress'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB: LIVE QUEUE (As requested: "In live queue they can see the patient queue of different departments and whom to call next") */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Department Selection Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Department:</span>
              <button
                onClick={() => setDepartmentFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  departmentFilter === 'All'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d._id}
                  onClick={() => setDepartmentFilter(d.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    departmentFilter === d.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {/* Whom to Call Next & Current Consultation Spotlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Currently in Room */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5" />
                    <span>Currently In Consultation Room</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">Room 101</span>
                </div>

                {queue.find(q => q.status === 'current') ? (
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Attending Patient:</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-3xl font-black font-mono text-slate-900">
                        {queue.find(q => q.status === 'current')?.tokenNumber}
                      </span>
                      <span className="text-base font-bold text-slate-800">
                        {queue.find(q => q.status === 'current')?.patientName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Department: {queue.find(q => q.status === 'current')?.department} • Doctor on Duty: Dr. Ramesh Chandra
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4">No patient currently in room.</p>
                )}
              </div>

              {/* Card 2: Whom to call next */}
              <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded border border-teal-200 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Whom To Call Next</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600 animate-pulse">Next in Line</span>
                </div>

                {queue.find(q => q.status === 'next') || queue.find(q => q.status === 'waiting') ? (
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Next Patient in Queue:</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-3xl font-black font-mono text-emerald-700">
                        {(queue.find(q => q.status === 'next') || queue.find(q => q.status === 'waiting'))?.tokenNumber}
                      </span>
                      <span className="text-base font-bold text-slate-800">
                        {(queue.find(q => q.status === 'next') || queue.find(q => q.status === 'waiting'))?.patientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Estimated Wait: {(queue.find(q => q.status === 'next') || queue.find(q => q.status === 'waiting'))?.estimatedWaitTime} mins
                      </span>
                      <button
                        onClick={() => handleCallNext(departmentFilter === 'All' ? 'General Physician' : departmentFilter)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Call Next to Room</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4">No waiting patients in queue.</p>
                )}
              </div>
            </div>

            {/* Detailed Department Queue Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Department Queue Stream ({filteredQueue.length} Patients)
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Position</th>
                      <th className="py-3 px-3.5">Token</th>
                      <th className="py-3 px-3.5">Patient</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Wait Time</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredQueue.map((item, idx) => (
                      <tr key={item._id} className={item.status === 'current' ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/60'}>
                        <td className="py-3 px-3.5 font-mono text-slate-500">#{item.queuePosition || idx + 1}</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{item.tokenNumber}</td>
                        <td className="py-3 px-3.5 text-slate-800 font-medium">{item.patientName}</td>
                        <td className="py-3 px-3.5 text-slate-600">{item.department}</td>
                        <td className="py-3 px-3.5 text-slate-600">{item.estimatedWaitTime} mins</td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.status === 'current'
                              ? 'bg-emerald-500 text-white'
                              : item.status === 'next'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== 'completed' && (
                              <button
                                onClick={() => handleMarkCompleted(item._id)}
                                className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px]"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelayPatient(item._id, item.tokenNumber)}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px]"
                              title="Delay patient (+30m)"
                            >
                              Delay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: PATIENTS WAITING (As requested: "In patients waiting we can see the how many patients are waiting in the queue and according to that they should manage the queue of patients when patient is not come or delayed the time") */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Header banner showing how many patients are waiting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Queue Flow Control
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Patients Currently Waiting in Queue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage patient delays, adjust arrival times, and handle no-shows to keep hospital operations running smoothly
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black font-mono text-amber-600">
                  {waitingPatients.length}
                </span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patients Waiting
                </p>
              </div>
            </div>

            {/* Waiting Patients Management Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Waiting Queue List & Flow Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Click <strong>Delay (+30m)</strong> to shift delayed patients back, or <strong>No-Show</strong> if patient has not arrived.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Token</th>
                      <th className="py-3 px-3.5">Patient Name</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Wait Time</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Delay / No-Show Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {waitingPatients.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{item.tokenNumber}</td>
                        <td className="py-3 px-3.5 text-slate-800 font-medium">{item.patientName}</td>
                        <td className="py-3 px-3.5 text-slate-600">{item.department}</td>
                        <td className="py-3 px-3.5 font-bold text-emerald-700">{item.estimatedWaitTime} mins</td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.status === 'next' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Mark delayed (+30 min) */}
                            <button
                              onClick={() => handleDelayPatient(item._id, item.tokenNumber)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition-colors flex items-center gap-1"
                              title="Shift patient back 30 mins because they are delayed"
                            >
                              <Clock3 className="h-3 w-3" />
                              <span>Delay (+30m)</span>
                            </button>

                            {/* Mark No-Show / Not come */}
                            <button
                              onClick={() => handleNoShowPatient(item._id, item.tokenNumber)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 transition-colors flex items-center gap-1"
                              title="Mark patient not come"
                            >
                              <UserX className="h-3 w-3" />
                              <span>Not Come (No-Show)</span>
                            </button>

                            {/* Call Next immediately */}
                            <button
                              onClick={() => handleCallNext(item.department)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                              title="Call to room"
                            >
                              Call In
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB: DOCTORS (As requested: "In doctors they can see how many doctors are available and doctor availability") */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Header banner showing doctor availability count */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Clinical Staff On Duty
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Doctor Availability & Room Assignments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  See how many doctors are currently available and toggle their status in real time
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black font-mono text-emerald-600">
                  {availableDoctorsCount} <span className="text-xl font-normal text-slate-400">/ {doctors.length}</span>
                </span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Doctors Available Now
                </p>
              </div>
            </div>

            {/* Doctor Cards Grid with Real-time Status Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => {
                const isAvailable = doc.status === 'available';
                const isConsulting = doc.status === 'in-consultation';
                const isOnBreak = doc.status === 'on-break';

                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-base flex items-center justify-center shadow-xs">
                            {doc.name.replace('Dr. ', '').charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                            <p className="text-xs text-emerald-700 font-semibold">{doc.department}</p>
                            <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : isConsulting
                            ? 'bg-blue-100 text-blue-800'
                            : isOnBreak
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Room</span>
                          <span className="font-bold text-slate-800">{doc.roomNumber}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Avg Duration</span>
                          <span className="font-bold text-slate-800">{doc.averageConsultationTime} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Status Switcher */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Update Availability:
                      </label>
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleDoctorStatusChange(doc._id, 'available')}
                          className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                            doc.status === 'available'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Available
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDoctorStatusChange(doc._id, 'in-consultation')}
                          className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                            doc.status === 'in-consultation'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          Busy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDoctorStatusChange(doc._id, 'on-break')}
                          className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                            doc.status === 'on-break'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Break
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. TAB: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Hospital Operational Reports</h3>
            <p className="text-xs text-slate-500">Real-time daily patient throughput and queue efficiency analytics</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Patient Satisfaction</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">94.8%</span>
                <span className="text-[11px] text-slate-400">Based on 240 post-consultation reviews</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Queue Congestion Rate</span>
                <span className="text-2xl font-black text-teal-600 mt-1 block">Low (8%)</span>
                <span className="text-[11px] text-slate-400">Zero corridor bottlenecks detected</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">No-Show Rate</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">3.2%</span>
                <span className="text-[11px] text-slate-400">Decreased by 18% with SMS live alerts</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Hospital Staff Announcements</h3>
            <p className="text-xs text-slate-500">Live operational alerts broadcast to doctors, reception, and patients</p>
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">Cardiology Wing Operational</p>
                  <p className="text-slate-600">Dr. Suresh Patel is attending patients in Room 204.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Scheduled Sanitization Break</p>
                  <p className="text-slate-600">General Physician consultation room 101 sanitized at 1:00 PM.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Smart Wait Time Formula Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Adjust average consultation durations to optimize queue prediction accuracy</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                    <p className="text-[11px] text-slate-500">Current avg duration: <strong className="text-emerald-700">{dept.averageConsultationTime} mins</strong></p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDept(dept);
                      setNewConsultTime(dept.averageConsultationTime);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold hover:border-emerald-500"
                  >
                    Adjust Time
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Edit Department Consultation Time */}
        {editingDept && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <h4 className="text-base font-bold text-slate-900">
                Configure {editingDept.name}
              </h4>
              <p className="text-xs text-slate-500">
                Adjust average doctor consultation duration. All waiting patients in this department will immediately have their predicted wait times recalculated.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Average Consultation Time (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newConsultTime}
                  onChange={(e) => setNewConsultTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <strong>Example recalculation:</strong> 8 patients ahead × {newConsultTime} mins ={' '}
                <span className="font-bold">{8 * newConsultTime} mins predicted wait</span>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConsultationTime}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Save & Recalculate
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
