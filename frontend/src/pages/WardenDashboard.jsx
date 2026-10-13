import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BedDouble,
  AlertCircle,
  Receipt,
  BellRing,
  Sparkles,
  Clock,
  ArrowRight,
  RefreshCw,
  Building,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  UserPlus,
  Eye,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  Wrench,
  Pin,
  Megaphone,
  Printer,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoticeForm from '../components/warden/NoticeComposer';
import AllocateRoom from '../components/warden/RoomAssignModal';
import ComplaintList from '../components/warden/TicketQueue';
import StatsCard from '../components/warden/OccupancyStats';
import RoomCard from '../components/student/RoomCard';
import FeeReceiptModal from '../components/student/FeeReceiptModal';

const Loader = ({ text = 'Loading Master Console...' }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
    <div className="w-8 h-8 border-3 border-brass-500 border-t-transparent rounded-full animate-spin"></div>
    {text && <p className="mt-3 text-xs tracking-widest text-ledger-500 uppercase font-bold font-sans">{text}</p>}
  </div>
);

const WardenDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active section view based on pathname
  const currentPath = location.pathname;

  // Overview Data State
  const [dashData, setDashData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [allocatingRoom, setAllocatingRoom] = useState(null);
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);

  // --- 1. OVERVIEW DATA FETCH ---
  const fetchOverviewData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [dashRes, actRes] = await Promise.allSettled([
        api.get('/dashboard/admin'),
        api.get('/dashboard/recent-activities')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.success) {
        setDashData(dashRes.value.data.data || {});
      } else {
        try {
          const wardenRes = await api.get('/dashboard/warden');
          if (wardenRes.data?.success) {
            setDashData(wardenRes.data.data || {});
          } else {
            setDashData({});
          }
        } catch (e) {
          setDashData({});
        }
      }

      if (actRes.status === 'fulfilled' && actRes.value?.data?.success) {
        setActivities(actRes.value.data.data || []);
      } else {
        setActivities([]);
      }

      if (showToast) toast.success('Master dashboard synchronized live!');
    } catch (error) {
      toast.error('Failed to synchronize dashboard metrics.');
      setDashData({});
      setActivities([]);
    } finally {
      setLoadingOverview(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // --- 2. STUDENTS MANAGEMENT VIEW STATE & HANDLERS ---
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('');
  const [showAdmitStudentModal, setShowAdmitStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Admit Student Form
  const [admitForm, setAdmitForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    studentId: '',
    department: 'Computer Science',
    year: 1,
    semester: 1,
    fatherName: '',
    guardianContact: '',
    permanentAddress: ''
  });

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      let url = `/students?limit=100`;
      if (studentSearch) url += `&search=${encodeURIComponent(studentSearch)}`;
      if (studentDeptFilter) url += `&department=${encodeURIComponent(studentDeptFilter)}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setStudents(res.data.data || []);
      } else {
        setStudents([]);
      }
    } catch (err) {
      toast.error('Failed to fetch students list.');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [studentSearch, studentDeptFilter]);

  useEffect(() => {
    if (currentPath.includes('/admin/students') || currentPath.includes('/warden/students')) {
      fetchStudents();
    }
  }, [currentPath, fetchStudents]);

  const handleAdmitStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Register User Account
      const regRes = await api.post('/auth/register', {
        fullName: admitForm.fullName,
        email: admitForm.email,
        password: admitForm.password || 'student123',
        phone: admitForm.phone,
        role: 'student'
      });

      if (!regRes.data.success || !regRes.data.data._id) {
        toast.error('Failed to create user login credentials.');
        return;
      }

      const createdUserId = regRes.data.data._id;

      // Step 2: Create Student Profile
      const studentRes = await api.post('/students', {
        userId: createdUserId,
        studentId: admitForm.studentId,
        department: admitForm.department,
        year: Number(admitForm.year),
        semester: Number(admitForm.semester),
        fatherName: admitForm.fatherName,
        guardianContact: admitForm.guardianContact,
        permanentAddress: admitForm.permanentAddress
      });

      if (studentRes.data.success) {
        toast.success(`Student ${admitForm.fullName} admitted successfully!`);
        setShowAdmitStudentModal(false);
        setAdmitForm({
          fullName: '', email: '', phone: '', password: '',
          studentId: '', department: 'Computer Science', year: 1, semester: 1,
          fatherName: '', guardianContact: '', permanentAddress: ''
        });
        fetchStudents();
        fetchOverviewData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to admit student.');
    }
  };

  const handleVacateStudentRoom = async (studentId) => {
    if (!window.confirm('Are you sure you want to vacate this student from their room?')) return;
    try {
      const res = await api.put(`/students/${studentId}/vacate-room`);
      if (res.data.success) {
        toast.success('Student room vacated successfully.');
        fetchStudents();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vacate room.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student record?')) return;
    try {
      const res = await api.delete(`/students/${studentId}`);
      if (res.data.success) {
        toast.success('Student record deleted.');
        fetchStudents();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.put(`/auth/users/${userId}/toggle-status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status.');
    }
  };

  // --- 3. ROOMS MANAGEMENT VIEW STATE & HANDLERS ---
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomBlockFilter, setRoomBlockFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [inspectRoom, setInspectRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: 'A',
    floor: 1,
    type: 'double',
    rentPerMonth: 5000,
    hasAC: false,
    hasAttachedBathroom: false,
    hasBalcony: false
  });

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      let url = `/rooms?limit=100`;
      if (roomBlockFilter) url += `&block=${roomBlockFilter}`;
      if (roomTypeFilter) url += `&type=${roomTypeFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setRooms(res.data.data || []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      toast.error('Failed to load rooms.');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [roomBlockFilter, roomTypeFilter]);

  useEffect(() => {
    if (currentPath.includes('/admin/rooms') || currentPath.includes('/warden/rooms')) {
      fetchRooms();
    }
  }, [currentPath, fetchRooms]);

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', {
        roomNumber: roomForm.roomNumber,
        block: roomForm.block,
        floor: Number(roomForm.floor),
        type: roomForm.type,
        rentPerMonth: Number(roomForm.rentPerMonth),
        amenities: {
          hasAC: roomForm.hasAC,
          hasAttachedBathroom: roomForm.hasAttachedBathroom,
          hasBalcony: roomForm.hasBalcony,
          hasWiFi: true,
          hasStudyTable: true
        }
      });
      if (res.data.success) {
        toast.success(`Room ${roomForm.roomNumber} created successfully!`);
        setShowAddRoomModal(false);
        setRoomForm({
          roomNumber: '', block: 'A', floor: 1, type: 'double',
          rentPerMonth: 5000, hasAC: false, hasAttachedBathroom: false, hasBalcony: false
        });
        fetchRooms();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room.');
    }
  };

  const handleToggleRoomStatus = async (room) => {
    const newStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
    try {
      const res = await api.put(`/rooms/${room._id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Room ${room.roomNumber} marked as ${newStatus}!`);
        fetchRooms();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room status.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        toast.success('Room deleted successfully.');
        fetchRooms();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  // --- 4. COMPLAINTS MANAGEMENT VIEW STATE & HANDLERS ---
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketRemarks, setTicketRemarks] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      let url = `/complaints?limit=100`;
      if (complaintStatusFilter) url += `&status=${complaintStatusFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      toast.error('Failed to fetch tickets.');
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  }, [complaintStatusFilter]);

  useEffect(() => {
    if (currentPath.includes('/admin/complaints') || currentPath.includes('/warden/complaints')) {
      fetchComplaints();
    }
  }, [currentPath, fetchComplaints]);

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      const res = await api.put(`/complaints/${ticketId}/status`, {
        status,
        remarks: ticketRemarks || `Ticket marked ${status} by Warden`
      });
      if (res.data.success) {
        toast.success(`Ticket marked as ${status.toUpperCase()}!`);
        setSelectedTicket(null);
        setTicketRemarks('');
        fetchComplaints();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await api.delete(`/complaints/${ticketId}`);
      if (res.data.success) {
        toast.success('Complaint ticket deleted.');
        setSelectedTicket(null);
        fetchComplaints();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  // --- 5. FEES MANAGEMENT VIEW STATE & HANDLERS ---
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [feeStatusFilter, setFeeStatusFilter] = useState('');
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false);
  const [recordPaymentFee, setRecordPaymentFee] = useState(null);
  const [applyFineFee, setApplyFineFee] = useState(null);
  const [fineForm, setFineForm] = useState({ amount: 500, reason: 'Overdue Rent Penalty' });

  // Create Fee Form
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    feeType: 'hostel-rent',
    amount: 5000,
    dueDate: '',
    month: 'October',
    year: 2025,
    remarks: ''
  });

  const fetchFees = useCallback(async () => {
    setLoadingFees(true);
    try {
      let url = `/fees?limit=100`;
      if (feeStatusFilter) url += `&status=${feeStatusFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setFees(res.data.data || []);
      } else {
        setFees([]);
      }
    } catch (err) {
      toast.error('Failed to load fee invoices.');
      setFees([]);
    } finally {
      setLoadingFees(false);
    }
  }, [feeStatusFilter]);

  useEffect(() => {
    if (currentPath.includes('/admin/fees') || currentPath.includes('/warden/fees')) {
      fetchFees();
    }
  }, [currentPath, fetchFees]);

  const handleCreateFeeSubmit = async (e) => {
    e.preventDefault();
    if (!feeForm.studentId || !feeForm.amount || !feeForm.dueDate) {
      toast.error('Please fill required invoice fields.');
      return;
    }
    try {
      const res = await api.post('/fees', {
        studentId: feeForm.studentId,
        feeType: feeForm.feeType,
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        month: feeForm.month,
        year: Number(feeForm.year),
        remarks: feeForm.remarks
      });
      if (res.data.success) {
        toast.success('Fee invoice created successfully!');
        setShowCreateFeeModal(false);
        setFeeForm({
          studentId: '', feeType: 'hostel-rent', amount: 5000,
          dueDate: '', month: 'October', year: 2025, remarks: ''
        });
        fetchFees();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee invoice.');
    }
  };

  const handleRecordPayment = async (feeId) => {
    try {
      const res = await api.put(`/fees/${feeId}/pay`, {
        paymentMethod: 'cash',
        transactionId: `CASH-${Date.now().toString().slice(-6)}`,
        remarks: 'Payment collected & verified in-person by Warden'
      });
      if (res.data.success) {
        toast.success('Payment recorded! Digital receipt generated.');
        setRecordPaymentFee(null);
        fetchFees();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  const handleApplyFineSubmit = async (e) => {
    e.preventDefault();
    if (!applyFineFee) return;
    try {
      const res = await api.put(`/fees/${applyFineFee._id}/fine`, {
        amount: Number(fineForm.amount),
        reason: fineForm.reason
      });
      if (res.data.success) {
        toast.success(`Fine of ₹${fineForm.amount} applied to invoice!`);
        setApplyFineFee(null);
        fetchFees();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply fine.');
    }
  };

  const handleWaiveFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to waive off this fee invoice?')) return;
    try {
      const res = await api.put(`/fees/${feeId}/waive`, { reason: 'Waived by warden authority' });
      if (res.data.success) {
        toast.success('Invoice marked as waived.');
        fetchFees();
        fetchOverviewData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to waive fee.');
    }
  };

  // --- 6. NOTICES MANAGEMENT VIEW STATE & HANDLERS ---
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await api.get('/notices?limit=50');
      if (res.data?.success) {
        setNotices(res.data.data || []);
      } else {
        setNotices([]);
      }
    } catch (err) {
      toast.error('Failed to load notice board.');
      setNotices([]);
    } finally {
      setLoadingNotices(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath.includes('/admin/notices') || currentPath.includes('/warden/notices')) {
      fetchNotices();
    }
  }, [currentPath, fetchNotices]);

  const handleTogglePinNotice = async (noticeId) => {
    try {
      const res = await api.put(`/notices/${noticeId}/pin`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchNotices();
      }
    } catch (err) {
      toast.error('Failed to pin/unpin notice.');
    }
  };

  const handleArchiveNotice = async (noticeId) => {
    try {
      const res = await api.put(`/notices/${noticeId}/archive`);
      if (res.data.success) {
        toast.success('Notice archived.');
        fetchNotices();
      }
    } catch (err) {
      toast.error('Failed to archive notice.');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Permanently delete this announcement?')) return;
    try {
      const res = await api.delete(`/notices/${noticeId}`);
      if (res.data.success) {
        toast.success('Notice deleted.');
        fetchNotices();
      }
    } catch (err) {
      toast.error('Failed to delete notice.');
    }
  };

  // Helper chart data
  const blockChartData = (dashData?.blockDistribution || dashData?.stats?.occupancy || []).map((b) => ({
    name: `Block ${b._id || b.block || ''}`,
    Occupied: b.occupied || 0,
    Vacant: Math.max(0, (b.capacity || 0) - (b.occupied || 0))
  })) || [];

  const complaintPieData = [
    { name: 'Pending', value: dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0, color: '#C9A15C' },
    { name: 'In-Progress', value: dashData?.metrics?.complaints?.inProgress || 0, color: '#5E7A6B' },
    { name: 'Resolved', value: dashData?.metrics?.complaints?.resolved || 0, color: '#354555' }
  ];

  const unassignedStudents = (students || []).filter(s => !s?.roomId && !s?.room) || [];

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Warden Sidebar */}
      <Sidebar role="admin" />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header Bar */}
        <header className="h-16 bg-ledger-950 border-b border-ledger-800/60 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-lg text-parchment tracking-tight">
              Warden Management Console
            </h1>
            <span className="hidden sm:inline-flex badge-success text-[10px] py-0.5 bg-sage-500/20 text-sage-300 border-sage-500/30 font-sans">
              ● Live Sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchOverviewData(true);
                if (currentPath.includes('/admin/students') || currentPath.includes('/warden/students')) fetchStudents();
                if (currentPath.includes('/admin/rooms') || currentPath.includes('/warden/rooms')) fetchRooms();
                if (currentPath.includes('/admin/complaints') || currentPath.includes('/warden/complaints')) fetchComplaints();
                if (currentPath.includes('/admin/fees') || currentPath.includes('/warden/fees')) fetchFees();
                if (currentPath.includes('/admin/notices') || currentPath.includes('/warden/notices')) fetchNotices();
              }}
              disabled={refreshing}
              className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 font-sans"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brass-400' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <button
              onClick={() => setShowNoticeModal(true)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-sans"
            >
              <Megaphone className="h-3.5 w-3.5 text-brass-600" />
              <span className="hidden sm:inline">Broadcast Notice</span>
            </button>

            <button
              onClick={() => setShowAdmitStudentModal(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-sans"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admit Student</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {(currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath === '/warden' || currentPath === '/warden/dashboard') && (
            loadingOverview ? <Loader text="Synchronizing master analytics..." /> : (
              <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-ledger-950 p-6 sm:p-7 rounded-2xl border border-ledger-800/60 text-parchment shadow-ledger-lg relative overflow-hidden">
                  <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brass-500/15 border border-brass-500/30 text-[11px] font-bold text-brass-400 uppercase tracking-[0.1em] font-sans">
                      <Sparkles className="h-3 w-3" /> Campus Administration Console
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-parchment">
                      Welcome, {user?.fullName || 'Chief Warden'}
                    </h2>
                    <p className="text-xs sm:text-sm text-ledger-400 leading-relaxed font-sans">
                      Bed occupancy is currently at <strong className="text-brass-400 font-mono">{dashData?.occupancyPercentage != null ? `${dashData.occupancyPercentage}%` : (dashData?.metrics?.rooms?.occupancyRate || '0%')}</strong>. You have <strong className="text-parchment">{dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0} pending</strong> maintenance tickets requiring resolution.
                    </p>
                  </div>
                  <div className="hidden lg:block absolute -right-6 -bottom-10 opacity-[0.06]">
                    <Building className="h-64 w-64 text-brass-400" />
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatsCard
                    title="Total Residents"
                    value={dashData?.totalResidents ?? dashData?.metrics?.students?.total ?? 0}
                    subtitle={`${dashData?.metrics?.students?.active ?? dashData?.totalResidents ?? 0} Active on Campus`}
                    icon={Users}
                    iconBg="bg-ledger-100 text-ledger-700 border-ledger-200/60"
                    trend="100% Verified"
                    trendPositive={true}
                  />
                  <StatsCard
                    title="Bed Occupancy"
                    value={dashData?.occupancyPercentage != null ? `${dashData.occupancyPercentage}%` : (dashData?.metrics?.rooms?.occupancyRate || '0%')}
                    subtitle={`${dashData?.availableBeds ?? dashData?.metrics?.rooms?.vacantBeds ?? 0} Vacant beds available`}
                    icon={BedDouble}
                    iconBg="bg-sage-50 text-sage-600 border-sage-200/60"
                    trend={`${dashData?.occupiedBeds ?? dashData?.metrics?.rooms?.occupiedBeds ?? 0} Occupied`}
                    trendPositive={true}
                  />
                  <StatsCard
                    title="Fees Collected"
                    value={`₹${(dashData?.metrics?.financials?.totalCollected ?? 0).toLocaleString('en-IN')}`}
                    subtitle={`₹${(dashData?.totalPendingAmount ?? dashData?.metrics?.financials?.totalPendingDues ?? 0).toLocaleString('en-IN')} Dues Pending`}
                    icon={DollarSign}
                    iconBg="bg-brass-50 text-brass-600 border-brass-200/60"
                    trend="Zero Cash Risk"
                    trendPositive={true}
                  />
                  <StatsCard
                    title="Open Tickets"
                    value={dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0}
                    subtitle={`${dashData?.metrics?.complaints?.resolved ?? 0} Resolved tickets`}
                    icon={AlertCircle}
                    iconBg="bg-danger-light text-danger border-danger/20"
                    trend={(dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0) === 0 ? 'All Clear' : 'Action Required'}
                    trendPositive={(dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0) === 0}
                  />
                </div>

                {/* Visual Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Block Occupancy Bar Chart */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">
                          Block Occupancy Breakdown
                        </h3>
                        <p className="text-xs text-ledger-500 font-sans">Occupied vs Vacant beds per block</p>
                      </div>
                      <span className="badge-brass text-[10px]">Real-time</span>
                    </div>
                    <div className="h-64 w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={blockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#6B8299" fontSize={11} tickLine={false} fontFamily="IBM Plex Mono" />
                          <YAxis stroke="#6B8299" fontSize={11} tickLine={false} fontFamily="IBM Plex Mono" />
                          <Tooltip
                            contentStyle={{ background: '#12181F', borderRadius: '12px', color: '#F7F5F0', fontSize: '12px', border: '1px solid rgba(201,161,92,0.2)', fontFamily: 'Inter' }}
                            itemStyle={{ color: '#F7F5F0' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: 'Inter' }} />
                          <Bar dataKey="Occupied" fill="#C9A15C" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="Vacant" fill="#D1DCE5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Complaint Resolution Pie Chart */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-base text-ink">
                          Ticket Resolution Pipeline
                        </h3>
                        <span className="badge-warning text-[10px]">Maintenance</span>
                      </div>
                      <p className="text-xs text-ledger-500 mt-0.5 font-sans">Complaints category status</p>
                    </div>

                    <div className="h-52 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={complaintPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value">
                            {complaintPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#12181F', borderRadius: '12px', color: '#F7F5F0', fontSize: '12px', border: '1px solid rgba(201,161,92,0.2)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ledger-100 text-center">
                      <div>
                        <p className="text-[10px] text-ledger-500 font-bold uppercase font-sans">Pending</p>
                        <p className="text-sm font-black font-display text-brass-600">{dashData?.openTicketsCount ?? dashData?.metrics?.complaints?.pending ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ledger-500 font-bold uppercase font-sans">Active</p>
                        <p className="text-sm font-black font-display text-sage-600">{dashData?.metrics?.complaints?.inProgress || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ledger-500 font-bold uppercase font-sans">Resolved</p>
                        <p className="text-sm font-black font-display text-ledger-700">{dashData?.metrics?.complaints?.resolved || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Tickets & Activity Log */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Recent Maintenance Queue */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">Recent Maintenance Tickets</h3>
                        <p className="text-xs text-ledger-500 font-sans">Issues needing inspection</p>
                      </div>
                      <Link to="/admin/complaints" className="text-xs font-bold text-brass-600 hover:underline flex items-center gap-1 font-sans">
                        View All <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {!dashData?.recentComplaints || dashData.recentComplaints.length === 0 ? (
                        <p className="text-xs text-ledger-400 py-6 text-center font-sans">No tickets pending inspection.</p>
                      ) : (
                        (dashData?.recentComplaints || []).map((c) => (
                          <div key={c._id} className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between hover:bg-ledger-100/40 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-sans ${
                                  c.priority === 'urgent' ? 'bg-danger-light text-danger' :
                                  c.priority === 'high' ? 'bg-brass-50 text-brass-700' :
                                  'bg-ledger-100 text-ledger-700'
                                }`}>
                                  {c.priority}
                                </span>
                                <p className="text-xs font-bold text-ink font-sans">{c.subject}</p>
                              </div>
                              <p className="text-[11px] text-ledger-500 font-sans">
                                {c.studentId?.userId?.fullName || 'Resident'} · <span className="font-mono text-ledger-600">{c.roomId?.roomNumber ? `Room ${c.roomId.roomNumber}` : 'General'}</span> · {c.category}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                navigate('/admin/complaints');
                                setSelectedTicket(c);
                              }}
                              className="text-xs font-semibold px-2.5 py-1 rounded-full badge-warning font-sans hover:scale-105 transition-transform"
                            >
                              Inspect
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Activity Log */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">Campus Activity Stream</h3>
                        <p className="text-xs text-ledger-500 font-sans">Real-time event logging</p>
                      </div>
                      <span className="flex h-2 w-2 rounded-full bg-sage-500 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                      {(activities || []).slice(0, 5).map((act, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <div className="h-7 w-7 rounded-lg bg-brass-50 border border-brass-200/60 flex items-center justify-center text-brass-600 shrink-0 mt-0.5">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <p className="font-bold text-ink truncate font-sans">{act.title}</p>
                            <p className="text-[11px] text-ledger-500 truncate font-sans">{act.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* VIEW 2: STUDENTS DIRECTORY (/admin/students) */}
          {currentPath.includes('/admin/students') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Student Residents Directory</h2>
                  <p className="text-xs text-ledger-500 font-sans">Manage admissions, room allocations, and resident profiles</p>
                </div>
                <button
                  onClick={() => setShowAdmitStudentModal(true)}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-sans self-start sm:self-auto"
                >
                  <UserPlus className="h-4 w-4" /> Admit New Resident
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-xl border border-ledger-200/60 shadow-card flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-ledger-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by student ID, name, or department..."
                    className="input-field pl-9 text-xs font-sans"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input-field text-xs font-sans sm:w-48"
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              {/* Students Table */}
              {loadingStudents ? (
                <Loader text="Fetching student records..." />
              ) : (
                <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ledger-950 text-parchment font-sans uppercase text-[10px] tracking-wider border-b border-ledger-800">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Roll / Student ID</th>
                          <th className="py-3.5 px-4 font-bold">Resident Name</th>
                          <th className="py-3.5 px-4 font-bold">Department & Year</th>
                          <th className="py-3.5 px-4 font-bold">Room Assigned</th>
                          <th className="py-3.5 px-4 font-bold">Guardian Contact</th>
                          <th className="py-3.5 px-4 font-bold">Account Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ledger-100 font-sans">
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-ledger-400 font-sans">
                              No student residents match the search criteria.
                            </td>
                          </tr>
                        ) : (
                          students.map((s) => (
                            <tr key={s._id} className="hover:bg-parchment/60 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-ink">{s.studentId}</td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-ink">{s.userId?.fullName || 'Student'}</p>
                                <p className="text-[11px] text-ledger-500 font-sans">{s.userId?.email}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-ink">{s.department}</p>
                                <p className="text-[11px] text-ledger-500 font-sans">Year {s.year} · Sem {s.semester}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                {s.roomId ? (
                                  <span className="badge-brass text-xs font-mono">
                                    Room {s.roomId.roomNumber} ({s.roomId.block})
                                  </span>
                                ) : (
                                  <span className="badge-warning text-[10px] font-sans">Unallocated</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-ledger-600">
                                {typeof s.guardianContact === 'object' && s.guardianContact !== null
                                  ? (s.guardianContact.phone || s.guardianContact.name || s.userId?.phone || 'N/A')
                                  : (typeof s.guardian === 'object' && s.guardian !== null
                                    ? (s.guardian.phone || s.guardian.name || 'N/A')
                                    : (s.guardianContact || s.guardian || s.userId?.phone || 'N/A'))}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.userId?.isActive !== false ? 'badge-success' : 'badge-danger'
                                }`}>
                                  {s.userId?.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => setAllocatingRoom({ _id: s.roomId?._id || '', roomNumber: s.roomId?.roomNumber || '', block: s.roomId?.block || 'A', capacity: 2, currentOccupancy: 1 })}
                                  className="btn-secondary text-[11px] py-1 px-2.5"
                                  title="Assign Room"
                                >
                                  Assign Room
                                </button>

                                {s.roomId && (
                                  <button
                                    onClick={() => handleVacateStudentRoom(s._id)}
                                    className="p-1.5 rounded-lg text-ledger-500 hover:text-brass-600 hover:bg-brass-50 transition-colors"
                                    title="Vacate Room"
                                  >
                                    <BedDouble className="h-4 w-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleUserStatus(s.userId?._id)}
                                  className="p-1.5 rounded-lg text-ledger-500 hover:text-sage-600 hover:bg-sage-50 transition-colors"
                                  title="Toggle Status"
                                >
                                  {s.userId?.isActive !== false ? <UserX className="h-4 w-4 text-danger" /> : <UserCheck className="h-4 w-4 text-sage-600" />}
                                </button>

                                <button
                                  onClick={() => handleDeleteStudent(s._id)}
                                  className="p-1.5 rounded-lg text-ledger-500 hover:text-danger hover:bg-danger-light transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: ROOMS & BEDS MANAGEMENT (/admin/rooms) */}
          {currentPath.includes('/admin/rooms') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Rooms & Bed Occupancy Control</h2>
                  <p className="text-xs text-ledger-500 font-sans">Monitor live bed capacity, maintenance status, and amenities</p>
                </div>
                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-sans self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Add New Room
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-ledger-200/60 shadow-card flex flex-col sm:flex-row gap-3">
                <select
                  className="input-field text-xs font-sans sm:w-48"
                  value={roomBlockFilter}
                  onChange={(e) => setRoomBlockFilter(e.target.value)}
                >
                  <option value="">All Hostel Blocks</option>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                </select>

                <select
                  className="input-field text-xs font-sans sm:w-48"
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                >
                  <option value="">All Room Types</option>
                  <option value="single">Single Sharing</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                </select>
              </div>

              {/* Room Cards Grid */}
              {loadingRooms ? (
                <Loader text="Loading hostel room configurations..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-ledger-200/60 shadow-card">
                      <p className="font-display font-bold text-lg text-ink">No Rooms Found</p>
                      <p className="text-xs text-ledger-500 font-sans mt-1">Adjust filters or create a new room.</p>
                    </div>
                  ) : (
                    rooms.map((rm) => (
                      <RoomCard
                        key={rm._id}
                        room={rm}
                        onViewDetails={(room) => setInspectRoom(room)}
                        onAllocate={(room) => setAllocatingRoom(room)}
                        onToggleStatus={(room) => handleToggleRoomStatus(room)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: MAINTENANCE TICKETS QUEUE (/admin/complaints) */}
          {currentPath.includes('/admin/complaints') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Maintenance Tickets Queue</h2>
                  <p className="text-xs text-ledger-500 font-sans">Inspect, assign staff, and update ticket resolution status</p>
                </div>

                <div className="flex items-center gap-2">
                  {['', 'pending', 'in-progress', 'resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setComplaintStatusFilter(st)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold font-sans transition-all ${
                        complaintStatusFilter === st
                          ? 'bg-ledger-950 text-parchment'
                          : 'bg-parchment text-ledger-600 hover:bg-ledger-100'
                      }`}
                    >
                      {st === '' ? 'All Tickets' : st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {loadingComplaints ? (
                <Loader text="Fetching ticket queue..." />
              ) : (
                <ComplaintList
                  complaints={complaints}
                  onViewDetails={(ticket) => setSelectedTicket(ticket)}
                />
              )}
            </div>
          )}

          {/* VIEW 5: FEES & INVOICING (/admin/fees) */}
          {currentPath.includes('/admin/fees') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Hostel Fee Invoices & Dues</h2>
                  <p className="text-xs text-ledger-500 font-sans">Issue digital invoices, record cash/online payments, and print formal receipts</p>
                </div>
                <button
                  onClick={() => setShowCreateFeeModal(true)}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-sans self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Issue Fee Invoice
                </button>
              </div>

              {/* Status Filters */}
              <div className="bg-white p-4 rounded-xl border border-ledger-200/60 shadow-card flex flex-wrap gap-2">
                {['', 'pending', 'paid', 'overdue'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFeeStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold font-sans transition-all ${
                      feeStatusFilter === st
                        ? 'bg-ledger-950 text-parchment'
                        : 'bg-parchment text-ledger-600 hover:bg-ledger-100'
                    }`}
                  >
                    {st === '' ? 'All Invoices' : st.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Fee Invoices Table */}
              {loadingFees ? (
                <Loader text="Fetching billing invoices..." />
              ) : (
                <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ledger-950 text-parchment font-sans uppercase text-[10px] tracking-wider border-b border-ledger-800">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Resident / Student ID</th>
                          <th className="py-3.5 px-4 font-bold">Fee Description</th>
                          <th className="py-3.5 px-4 font-bold">Billing Cycle</th>
                          <th className="py-3.5 px-4 font-bold">Total Amount</th>
                          <th className="py-3.5 px-4 font-bold">Due Date</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ledger-100 font-sans">
                        {fees.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-ledger-400 font-sans">
                              No fee invoices found.
                            </td>
                          </tr>
                        ) : (
                          fees.map((f) => {
                            const student = f.studentId || {};
                            const user = student.userId || {};
                            const totalPayable = f.amount + (f.fine?.amount || 0);

                            return (
                              <tr key={f._id} className="hover:bg-parchment/60 transition-colors">
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-ink">{user.fullName || 'Resident'}</p>
                                  <p className="text-[10px] font-mono text-ledger-500">{student.studentId || 'N/A'}</p>
                                </td>

                                <td className="py-3.5 px-4 capitalize font-bold text-ink">
                                  {f.feeType === 'hostel-rent' ? 'Hostel Rent' : f.feeType}
                                  {f.fine?.amount > 0 && <span className="block text-[10px] text-brass-600 font-normal">+ ₹{f.fine.amount} Fine</span>}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-ledger-600">
                                  {f.month} {f.year}
                                </td>

                                <td className="py-3.5 px-4 font-mono font-bold text-ink">
                                  ₹{totalPayable.toLocaleString('en-IN')}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-ledger-600">
                                  {new Date(f.dueDate).toLocaleDateString()}
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    f.status === 'paid' ? 'badge-success' :
                                    f.status === 'overdue' ? 'badge-danger' : 'badge-warning font-mono'
                                  }`}>
                                    {f.status?.toUpperCase()}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right space-x-1.5">
                                  {f.status !== 'paid' && (
                                    <>
                                      <button
                                        onClick={() => handleRecordPayment(f._id)}
                                        className="btn-primary text-[11px] py-1 px-2.5"
                                      >
                                        Record Payment
                                      </button>
                                      <button
                                        onClick={() => setApplyFineFee(f)}
                                        className="btn-secondary text-[11px] py-1 px-2"
                                        title="Apply Penalty Fine"
                                      >
                                        Fine
                                      </button>
                                    </>
                                  )}

                                  {f.status === 'paid' && (
                                    <button
                                      onClick={() => setSelectedReceiptFee(f)}
                                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 inline-flex"
                                    >
                                      <Printer className="h-3 w-3" /> Receipt
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 6: NOTICES BOARD MANAGEMENT (/admin/notices) */}
          {currentPath.includes('/admin/notices') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Campus Announcement Board</h2>
                  <p className="text-xs text-ledger-500 font-sans">Broadcast notices, pin emergency alerts, and manage published posts</p>
                </div>
                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-sans self-start sm:self-auto"
                >
                  <Megaphone className="h-4 w-4" /> Broadcast Announcement
                </button>
              </div>

              {loadingNotices ? (
                <Loader text="Fetching published announcements..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notices.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-ledger-200/60 shadow-card">
                      <p className="font-display font-bold text-lg text-ink">No Broadcasted Notices</p>
                    </div>
                  ) : (
                    notices.map((n) => (
                      <div
                        key={n._id}
                        className={`bg-white rounded-2xl border p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 ${
                          n.isPinned ? 'border-brass-400/80 bg-brass-50/10' : 'border-ledger-200/60'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              n.priority === 'urgent' ? 'bg-danger-light text-danger' :
                              n.priority === 'important' ? 'bg-brass-50 text-brass-700' : 'bg-ledger-100 text-ledger-700'
                            }`}>
                              {n.priority}
                            </span>

                            {n.isPinned && (
                              <span className="badge-brass text-[10px] flex items-center gap-1">
                                <Pin className="h-3 w-3 fill-brass-600" /> PINNED
                              </span>
                            )}
                          </div>

                          <h3 className="font-display font-bold text-lg text-ink">{n.title}</h3>
                          <p className="text-xs text-ledger-600 leading-relaxed font-sans whitespace-pre-line">{n.content}</p>
                        </div>

                        <div className="pt-4 border-t border-ledger-100 flex items-center justify-between text-xs font-sans text-ledger-500">
                          <span>Target: <strong className="text-ink capitalize">{n.targetAudience}</strong></span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePinNotice(n._id)}
                              className="p-1.5 rounded-lg text-ledger-500 hover:text-brass-600 hover:bg-brass-50 transition-colors"
                              title={n.isPinned ? 'Unpin Notice' : 'Pin to Top'}
                            >
                              <Pin className={`h-4 w-4 ${n.isPinned ? 'fill-brass-600 text-brass-600' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteNotice(n._id)}
                              className="p-1.5 rounded-lg text-ledger-500 hover:text-danger hover:bg-danger-light transition-colors"
                              title="Delete Announcement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Broadcast Notice Modal */}
      {showNoticeModal && (
        <NoticeForm
          onClose={() => setShowNoticeModal(false)}
          onSuccess={() => {
            fetchNotices();
            fetchOverviewData();
          }}
        />
      )}

      {/* 2. Room Allocation Modal */}
      {allocatingRoom && (
        <AllocateRoom
          room={allocatingRoom}
          onClose={() => setAllocatingRoom(null)}
          onSuccess={() => {
            fetchRooms();
            fetchStudents();
            fetchOverviewData();
          }}
        />
      )}

      {/* 3. Fee Receipt Modal */}
      {selectedReceiptFee && (
        <FeeReceiptModal
          fee={selectedReceiptFee}
          onClose={() => setSelectedReceiptFee(null)}
        />
      )}

      {/* 4. Admit Student Modal */}
      {showAdmitStudentModal && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <h3 className="font-display font-black text-lg text-parchment">Admit New Student Resident</h3>
              <button onClick={() => setShowAdmitStudentModal(false)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitStudentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Full Name *</label>
                  <input
                    type="text" required className="input-field" placeholder="Rahul Sharma"
                    value={admitForm.fullName} onChange={(e) => setAdmitForm({ ...admitForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Student Roll ID *</label>
                  <input
                    type="text" required className="input-field font-mono" placeholder="CS2025009"
                    value={admitForm.studentId} onChange={(e) => setAdmitForm({ ...admitForm, studentId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Email Address *</label>
                  <input
                    type="email" required className="input-field" placeholder="rahul@student.com"
                    value={admitForm.email} onChange={(e) => setAdmitForm({ ...admitForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text" required className="input-field font-mono" placeholder="9876543210"
                    value={admitForm.phone} onChange={(e) => setAdmitForm({ ...admitForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Department</label>
                  <select
                    className="input-field" value={admitForm.department}
                    onChange={(e) => setAdmitForm({ ...admitForm, department: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Tech</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Year</label>
                  <input
                    type="number" min="1" max="4" required className="input-field"
                    value={admitForm.year} onChange={(e) => setAdmitForm({ ...admitForm, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Semester</label>
                  <input
                    type="number" min="1" max="8" required className="input-field"
                    value={admitForm.semester} onChange={(e) => setAdmitForm({ ...admitForm, semester: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Father's Name</label>
                  <input
                    type="text" className="input-field" placeholder="Father Name"
                    value={admitForm.fatherName} onChange={(e) => setAdmitForm({ ...admitForm, fatherName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Guardian Phone *</label>
                  <input
                    type="text" required className="input-field font-mono" placeholder="9876543210"
                    value={admitForm.guardianContact} onChange={(e) => setAdmitForm({ ...admitForm, guardianContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button type="button" onClick={() => setShowAdmitStudentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Admission</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <h3 className="font-display font-black text-lg text-parchment">Create New Room</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Room Number *</label>
                  <input
                    type="text" required className="input-field font-mono uppercase" placeholder="A-105"
                    value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Block *</label>
                  <select
                    className="input-field" value={roomForm.block}
                    onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Floor</label>
                  <input
                    type="number" min="1" required className="input-field"
                    value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Sharing Type</label>
                  <select
                    className="input-field" value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number" required className="input-field font-mono"
                    value={roomForm.rentPerMonth} onChange={(e) => setRoomForm({ ...roomForm, rentPerMonth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-parchment rounded-xl border border-ledger-200/60">
                <p className="font-bold text-ledger-700">Amenities Provided:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roomForm.hasAC} onChange={(e) => setRoomForm({ ...roomForm, hasAC: e.target.checked })} />
                    <span>AC</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roomForm.hasAttachedBathroom} onChange={(e) => setRoomForm({ ...roomForm, hasAttachedBathroom: e.target.checked })} />
                    <span>Attached Bath</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roomForm.hasBalcony} onChange={(e) => setRoomForm({ ...roomForm, hasBalcony: e.target.checked })} />
                    <span>Balcony</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Fee Invoice Modal */}
      {showCreateFeeModal && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <h3 className="font-display font-black text-lg text-parchment">Issue Fee Invoice</h3>
              <button onClick={() => setShowCreateFeeModal(false)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeeSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-ledger-700 mb-1">Select Resident *</label>
                <select
                  required className="input-field" value={feeForm.studentId}
                  onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentId} - {s.userId?.fullName || 'Student'} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Fee Type</label>
                  <select
                    className="input-field" value={feeForm.feeType}
                    onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                  >
                    <option value="hostel-rent">Hostel Rent</option>
                    <option value="mess-dues">Mess Dues</option>
                    <option value="caution-deposit">Caution Deposit</option>
                    <option value="utility">Utility Charges</option>
                    <option value="fine">Fine / Penalty</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number" required className="input-field font-mono"
                    value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Month & Year</label>
                  <select
                    className="input-field" value={feeForm.month}
                    onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
                  >
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                    <option value="January">January</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ledger-700 mb-1">Due Date *</label>
                  <input
                    type="date" required className="input-field font-mono"
                    value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button type="button" onClick={() => setShowCreateFeeModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Apply Fine Modal */}
      {applyFineFee && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-parchment">Apply Penalty Fine</h3>
              <button onClick={() => setApplyFineFee(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFineSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-ledger-700 mb-1">Fine Amount (₹) *</label>
                <input
                  type="number" required className="input-field font-mono"
                  value={fineForm.amount} onChange={(e) => setFineForm({ ...fineForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-ledger-700 mb-1">Reason for Penalty</label>
                <input
                  type="text" required className="input-field"
                  value={fineForm.reason} onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button type="button" onClick={() => setApplyFineFee(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Apply Fine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Inspect Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <div>
                <h3 className="font-display font-black text-lg text-parchment">Inspect Maintenance Ticket</h3>
                <p className="text-xs text-ledger-400 font-mono">#{selectedTicket._id?.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3.5 bg-parchment rounded-xl border border-ledger-200/60 space-y-1">
                <p className="font-bold text-ink text-sm font-display">{selectedTicket.subject}</p>
                <p className="text-ledger-600 leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-ledger-500 font-mono">Category & Priority</p>
                  <p className="font-bold text-ink capitalize">{selectedTicket.category} ({selectedTicket.priority})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-ledger-500 font-mono">Resident / Room</p>
                  <p className="font-bold text-ink">{selectedTicket.studentId?.userId?.fullName || 'Resident'} ({selectedTicket.roomId?.roomNumber ? `Room ${selectedTicket.roomId.roomNumber}` : 'General'})</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ledger-700 mb-1">Resolution Remarks / Notes</label>
                <textarea
                  rows={3}
                  className="input-field text-xs resize-none"
                  placeholder="Enter notes for technician or student..."
                  value={ticketRemarks}
                  onChange={(e) => setTicketRemarks(e.target.value)}
                />
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ledger-100">
                <button
                  onClick={() => handleDeleteTicket(selectedTicket._id)}
                  className="btn-danger text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket._id, 'in-progress')}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket._id, 'resolved')}
                    className="btn-primary text-xs py-2 px-3"
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Inspect Room Details Modal */}
      {inspectRoom && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-parchment">Room {inspectRoom.roomNumber} Details</h3>
              <button onClick={() => setInspectRoom(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-parchment rounded-xl border border-ledger-200/60">
                  <p className="text-[10px] text-ledger-500 font-bold uppercase font-mono">Block</p>
                  <p className="text-sm font-bold text-ink">Block {inspectRoom.block}</p>
                </div>
                <div className="p-3 bg-parchment rounded-xl border border-ledger-200/60">
                  <p className="text-[10px] text-ledger-500 font-bold uppercase font-mono">Floor</p>
                  <p className="text-sm font-bold text-ink">Floor {inspectRoom.floor}</p>
                </div>
                <div className="p-3 bg-parchment rounded-xl border border-ledger-200/60">
                  <p className="text-[10px] text-ledger-500 font-bold uppercase font-mono">Rent</p>
                  <p className="text-sm font-bold text-brass-600 font-mono">₹{inspectRoom.rentPerMonth}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-ledger-700 mb-2">Occupants Assigned ({inspectRoom.currentOccupancy} / {inspectRoom.capacity}):</p>
                {!inspectRoom.occupants || inspectRoom.occupants.length === 0 ? (
                  <p className="text-ledger-400 py-3 text-center border border-dashed border-ledger-300 rounded-xl">No occupants currently in room.</p>
                ) : (
                  <div className="space-y-2">
                    {inspectRoom.occupants.map((occ) => (
                      <div key={occ._id} className="p-3 bg-parchment rounded-xl border border-ledger-200/60 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink">{occ.userId?.fullName || 'Student'}</p>
                          <p className="text-[11px] text-ledger-500">{occ.department} · Year {occ.year}</p>
                        </div>
                        <span className="font-mono text-[10px] text-ledger-600 font-bold">{occ.studentId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button
                  onClick={() => handleDeleteRoom(inspectRoom._id)}
                  className="btn-danger text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Room
                </button>
                <button onClick={() => setInspectRoom(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WardenDashboard;
