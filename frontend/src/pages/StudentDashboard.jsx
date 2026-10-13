import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Bed,
  Users,
  AlertCircle,
  Receipt,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Building,
  Wrench,
  BellRing,
  User,
  Plus,
  X,
  CreditCard,
  Printer,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  Star,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import api, { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/student/ComplaintForm';
import FeeReceiptModal from '../components/student/FeeReceiptModal';

const StatsCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-white border border-sand-300 rounded-xl p-5 shadow-sm hover:shadow transition-all font-sans">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-sand-600 uppercase">{title}</p>
        <p className="text-2xl font-bold text-sand-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-sand-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="p-3 bg-sand-100 rounded-lg text-forest-600">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  </div>
);

const Loader = ({ text = 'Loading Student Portal...' }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
    <div className="w-8 h-8 border-3 border-brass-500 border-t-transparent rounded-full animate-spin"></div>
    {text && <p className="mt-3 text-xs tracking-widest text-ledger-500 uppercase font-bold font-sans">{text}</p>}
  </div>
);

const StudentDashboardPage = () => {
  const { user, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  // Student Dashboard Data State
  const [data, setData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedFeeReceipt, setSelectedFeeReceipt] = useState(null);
  const [paymentModalFee, setPaymentModalFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [inspectTicket, setInspectTicket] = useState(null);
  const [inspectNotice, setInspectNotice] = useState(null);

  // Ticket Feedback Form
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // --- 1. OVERVIEW DATA FETCH ---
  const fetchStudentData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await api.get('/dashboard/student');
      if (res.data && res.data.success) {
        setData(res.data.data);
        if (showToast) toast.success('Student dashboard synchronized!');
      }
    } catch (error) {
      toast.error('Failed to load student portal data.');
    } finally {
      setLoadingOverview(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // --- 2. MY COMPLAINTS VIEW STATE & HANDLERS ---
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const fetchMyComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const res = await api.get('/complaints/my');
      if (res.data.success) {
        setMyComplaints(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch your complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath.includes('/student/complaints')) {
      fetchMyComplaints();
    }
  }, [currentPath, fetchMyComplaints]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!inspectTicket) return;
    try {
      const res = await api.post(`/complaints/${inspectTicket._id}/feedback`, {
        rating: Number(feedbackRating),
        comment: feedbackComment
      });
      if (res.data.success) {
        toast.success('Thank you for rating our service!');
        setInspectTicket(null);
        setFeedbackComment('');
        fetchMyComplaints();
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    }
  };

  const handleCancelPendingTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    try {
      const res = await api.delete(`/complaints/${ticketId}`);
      if (res.data.success) {
        toast.success('Ticket cancelled successfully.');
        setInspectTicket(null);
        fetchMyComplaints();
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel ticket.');
    }
  };

  // --- 3. MY FEES VIEW STATE & HANDLERS ---
  const [myFees, setMyFees] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);

  const fetchMyFees = useCallback(async () => {
    setLoadingFees(true);
    try {
      const res = await api.get('/fees/my');
      if (res.data.success) {
        setMyFees(res.data.data);
        setFeeSummary(res.data.summary);
      }
    } catch (err) {
      toast.error('Failed to fetch fee invoices.');
    } finally {
      setLoadingFees(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath.includes('/student/fees')) {
      fetchMyFees();
    }
  }, [currentPath, fetchMyFees]);

  const handlePayFeeSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalFee) return;
    try {
      const txnId = `TXN-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const res = await api.put(`/fees/${paymentModalFee._id}/pay`, {
        paymentMethod,
        transactionId: txnId,
        remarks: 'Paid online via Student Resident Portal'
      });
      if (res.data.success) {
        toast.success('Payment successful! Digital receipt generated.');
        const paidFeeObj = res.data.data;
        setPaymentModalFee(null);
        setSelectedFeeReceipt(paidFeeObj);
        fetchMyFees();
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed.');
    }
  };

  // --- 4. NOTICES VIEW STATE & HANDLERS ---
  const [notices, setNotices] = useState([]);
  const [noticeCategory, setNoticeCategory] = useState('');
  const [loadingNotices, setLoadingNotices] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      let url = `/notices?limit=50`;
      if (noticeCategory) url += `&category=${noticeCategory}`;
      const res = await api.get(url);
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch notice board.');
    } finally {
      setLoadingNotices(false);
    }
  }, [noticeCategory]);

  useEffect(() => {
    if (currentPath.includes('/student/notices')) {
      fetchNotices();
    }
  }, [currentPath, fetchNotices]);

  const handleOpenNoticeModal = async (notice) => {
    setSelectedFeeReceipt(null);
    setInspectNotice(notice);
    try {
      // Fetch full notice details (auto-marks read)
      await api.get(`/notices/${notice._id}`);
    } catch (err) {
      // Ignore background view count error
    }
  };

  // --- 5. MY PROFILE VIEW STATE & HANDLERS ---
  const profile = data?.profile || {};
  const room = data?.roomDetails || null;
  const financials = data?.financialSummary || {};
  const complaintSummary = data?.complaintSummary || {};

  const getContactString = (contact) => {
    if (!contact) return '';
    if (typeof contact === 'string') return contact;
    if (typeof contact === 'object') return contact.phone || contact.name || '';
    return '';
  };

  const getAddressString = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') return [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
    return '';
  };

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    fatherName: profile?.fatherName || '',
    motherName: profile?.motherName || '',
    guardianContact: getContactString(profile?.guardianContact),
    permanentAddress: getAddressString(profile?.permanentAddress)
  });

  useEffect(() => {
    if (user || profile) {
      setProfileForm({
        fullName: user?.fullName || profile?.userId?.fullName || '',
        phone: user?.phone || profile?.userId?.phone || '',
        fatherName: profile?.fatherName || '',
        motherName: profile?.motherName || '',
        guardianContact: getContactString(profile?.guardianContact),
        permanentAddress: getAddressString(profile?.permanentAddress)
      });
    }
  }, [user, profile]);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update User auth record
      await authService.updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone
      });

      // Update Student record if profile ID exists
      if (profile._id) {
        await api.put(`/students/${profile._id}`, {
          fatherName: profileForm.fatherName,
          motherName: profileForm.motherName,
          guardianContact: profileForm.guardianContact,
          permanentAddress: profileForm.permanentAddress
        });
      }

      toast.success('Profile details updated successfully!');
      checkAuth();
      fetchStudentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    try {
      const res = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Student Sidebar */}
      <Sidebar role="student" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className="h-16 bg-ledger-950 border-b border-ledger-800/60 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-lg text-parchment">
              Student Resident Portal
            </h1>
            <span className="badge-success text-[10px] py-0.5 bg-sage-500/20 text-sage-300 border-sage-500/30 font-sans">
              ● Active Stay
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStudentData(true);
                if (currentPath.includes('/student/complaints')) fetchMyComplaints();
                if (currentPath.includes('/student/fees')) fetchMyFees();
                if (currentPath.includes('/student/notices')) fetchNotices();
              }}
              disabled={refreshing}
              className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 font-sans"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brass-400' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <button
              onClick={() => setShowComplaintModal(true)}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 font-sans"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Raise Maintenance Ticket</span>
            </button>
          </div>
        </header>

        {/* Body Container */}
        <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* VIEW 1: MY DASHBOARD OVERVIEW */}
          {(currentPath === '/student' || currentPath === '/student/dashboard') && (
            loadingOverview ? <Loader text="Loading your resident portal..." /> : (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-ledger-950 p-6 sm:p-7 rounded-2xl border border-ledger-800/60 text-parchment shadow-ledger-lg relative overflow-hidden">
                  <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brass-500/15 border border-brass-500/30 text-[11px] font-bold text-brass-400 uppercase tracking-[0.1em] font-sans">
                      <Sparkles className="h-3 w-3" /> Roll ID: {profile?.studentId || 'CS2024001'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-parchment">
                      Welcome back, {user?.fullName || profile?.userId?.fullName || 'Rahul'} 👋
                    </h2>
                    <p className="text-xs sm:text-sm text-ledger-400 leading-relaxed font-sans">
                      {profile?.department || 'Computer Science'} · Year {profile?.year || 3} · Allocated to <strong className="text-brass-400 font-mono">{room ? `Room ${room.roomNumber} (${room.block} Block)` : 'Unallocated'}</strong>.
                    </p>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatsCard
                    title="Allocated Room"
                    value={room ? `Room ${room.roomNumber}` : 'Pending'}
                    subtitle={room ? `Block ${room.block} · Floor ${room.floor}` : 'Contact Warden'}
                    icon={Bed}
                  />

                  <StatsCard
                    title="Pending Dues"
                    value={`₹${(financials?.pendingDues || 0).toLocaleString('en-IN')}`}
                    subtitle={`${financials?.overdueCount || 0} Overdue invoices`}
                    icon={Receipt}
                  />

                  <StatsCard
                    title="My Complaints"
                    value={complaintSummary?.total || 0}
                    subtitle={`${complaintSummary?.resolved || 0} Resolved tickets`}
                    icon={AlertCircle}
                  />

                  <StatsCard
                    title="Roommates"
                    value={room ? `${room.roommates?.length || 0} Roommate(s)` : 'N/A'}
                    subtitle={room ? `Capacity: ${room.capacity} Beds` : 'No room data'}
                    icon={Users}
                  />
                </div>

                {/* Main Content Grid: Room Info & Roommates */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Room Details Card */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-ledger-100">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">
                          My Room Allocation Details
                        </h3>
                        <p className="text-xs text-ledger-500 font-sans">Current residence assignment</p>
                      </div>
                      {room && (
                        <span className="badge-brass text-xs font-mono">
                          Room {room.roomNumber}
                        </span>
                      )}
                    </div>

                    {room ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60">
                            <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Hostel Block</p>
                            <p className="text-sm font-bold text-ink font-display">Block {room.block}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60">
                            <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Floor Level</p>
                            <p className="text-sm font-bold text-ink font-display">Floor {room.floor}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60">
                            <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Room Type</p>
                            <p className="text-sm font-bold text-ink font-display capitalize">{room.type} Sharing</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60">
                            <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Monthly Rent</p>
                            <p className="text-sm font-bold text-brass-600 font-mono">₹{room.rentPerMonth}</p>
                          </div>
                        </div>

                        {/* Room Amenities */}
                        <div>
                          <p className="text-xs font-bold text-ledger-700 font-sans mb-2">Room Amenities Provided:</p>
                          <div className="flex flex-wrap gap-2 text-xs font-sans">
                            {room.amenities?.hasAC && <span className="px-2.5 py-1 rounded-lg bg-sage-50 text-sage-700 font-semibold border border-sage-200/60">Air Conditioned</span>}
                            {room.amenities?.hasAttachedBathroom && <span className="px-2.5 py-1 rounded-lg bg-brass-50 text-brass-800 font-semibold border border-brass-200/60">Attached Washroom</span>}
                            {room.amenities?.hasWiFi && <span className="px-2.5 py-1 rounded-lg bg-ledger-100 text-ledger-700 font-semibold border border-ledger-200/60">High-Speed WiFi</span>}
                            {room.amenities?.hasBalcony && <span className="px-2.5 py-1 rounded-lg bg-ledger-100 text-ledger-700 font-semibold border border-ledger-200/60">Balcony</span>}
                            {room.amenities?.hasStudyTable && <span className="px-2.5 py-1 rounded-lg bg-ledger-100 text-ledger-700 font-semibold border border-ledger-200/60">Study Desk & Chair</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center space-y-2 bg-parchment rounded-xl border border-dashed border-ledger-300">
                        <ShieldAlert className="h-8 w-8 text-brass-600 mx-auto" />
                        <p className="text-sm font-bold text-ink font-display">No Room Currently Assigned</p>
                        <p className="text-xs text-ledger-500 font-sans">Contact the Chief Warden or Hostel Office to get a room allocated.</p>
                      </div>
                    )}
                  </div>

                  {/* Roommates Card */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-ledger-100">
                      <h3 className="font-display font-bold text-base text-ink">My Roommate(s)</h3>
                      <span className="badge-info text-[10px] font-mono">
                        {room?.currentOccupancy || 0} / {room?.capacity || 0} Beds Filled
                      </span>
                    </div>

                    <div className="space-y-3">
                      {!room?.roommates || room.roommates.length === 0 ? (
                        <p className="text-xs text-ledger-400 py-6 text-center font-sans">
                          You currently have no roommates in this room.
                        </p>
                      ) : (
                        room.roommates.map((mate) => (
                          <div
                            key={mate._id}
                            className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-ledger-950 text-brass-400 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                                {mate.userId?.fullName?.slice(0, 2).toUpperCase() || 'RM'}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-ink font-display">
                                  {mate.userId?.fullName}
                                </p>
                                <p className="text-[11px] text-ledger-500 font-sans">
                                  {mate.department} · Year {mate.year}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-ledger-600 bg-white px-2 py-1 rounded border border-ledger-200">
                              {mate.studentId}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Invoices & Maintenance */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Fee Invoices */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-ledger-100">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">Fee Invoices & Dues</h3>
                        <p className="text-xs text-ledger-500 font-sans">Recent hostel rent & mess billing</p>
                      </div>
                      <Link to="/student/fees" className="text-xs font-bold text-brass-600 hover:underline font-sans">
                        View All
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {!financials?.recentInvoices || financials.recentInvoices.length === 0 ? (
                        <p className="text-xs text-ledger-400 py-6 text-center font-sans">No fee invoices found.</p>
                      ) : (
                        financials.recentInvoices.map((inv) => (
                          <div
                            key={inv._id}
                            className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-ink font-display">
                                {inv.feeType === 'hostel-rent' ? 'Hostel Rent' : inv.feeType} ({inv.month} {inv.year})
                              </p>
                              <p className="text-[11px] text-ledger-500 font-sans">
                                Due: <span className="font-mono text-ledger-600">{new Date(inv.dueDate).toLocaleDateString()}</span>
                              </p>
                            </div>

                            <div className="text-right space-y-1">
                              <p className="text-xs font-bold font-mono text-ink">
                                ₹{inv.amount + (inv.fine?.amount || 0)}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inv.status === 'paid' ? 'badge-success' : 'badge-danger'
                              }`}>
                                {inv.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* My Complaints */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-ledger-100">
                      <div>
                        <h3 className="font-display font-bold text-base text-ink">My Maintenance Tickets</h3>
                        <p className="text-xs text-ledger-500 font-sans font-sans">Issues reported by you</p>
                      </div>
                      <Link to="/student/complaints" className="text-xs font-bold text-brass-600 hover:underline font-sans">
                        View All
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {!complaintSummary?.recentTickets || complaintSummary.recentTickets.length === 0 ? (
                        <p className="text-xs text-ledger-400 py-6 text-center font-sans">No complaints reported.</p>
                      ) : (
                        complaintSummary.recentTickets.map((c) => (
                          <div
                            key={c._id}
                            className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-ink font-display">{c.subject}</p>
                              <p className="text-[11px] text-ledger-500 font-sans">
                                Category: {c.category} · Priority: <span className="font-semibold">{c.priority}</span>
                              </p>
                            </div>

                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              c.status === 'resolved' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {c.status?.toUpperCase()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* VIEW 2: MY ROOM (/student/room) */}
          {currentPath.includes('/student/room') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <h2 className="font-display font-bold text-xl text-ink">My Room & Facilities</h2>
                <p className="text-xs text-ledger-500 font-sans">Complete room specs, bed status, and roommate directory</p>
              </div>

              {room ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Room Overview */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-ledger-100">
                      <div>
                        <h3 className="font-display font-black text-2xl text-ink">Room {room.roomNumber}</h3>
                        <p className="text-xs text-ledger-500 font-sans">Block {room.block} · Floor Level {room.floor}</p>
                      </div>
                      <span className="badge-brass text-sm font-mono px-3 py-1">
                        {room.type?.toUpperCase()} SHARING
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60">
                        <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Monthly Rent</p>
                        <p className="text-lg font-bold text-brass-600 font-mono mt-1">₹{room.rentPerMonth}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60">
                        <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Total Beds</p>
                        <p className="text-lg font-bold text-ink font-display mt-1">{room.capacity} Beds</p>
                      </div>
                      <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60">
                        <p className="text-[10px] text-ledger-400 font-bold uppercase font-sans">Occupancy</p>
                        <p className="text-lg font-bold text-ink font-display mt-1">{room.currentOccupancy} Filled</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-ledger-700 font-sans">Amenities & Appliances Provided:</p>
                      <div className="flex flex-wrap gap-2 text-xs font-sans">
                        {room.amenities?.hasAC && <span className="px-3 py-1.5 rounded-lg bg-sage-50 text-sage-700 font-bold border border-sage-200/60">✓ Air Conditioned</span>}
                        {room.amenities?.hasAttachedBathroom && <span className="px-3 py-1.5 rounded-lg bg-brass-50 text-brass-800 font-bold border border-brass-200/60">✓ Attached Bathroom</span>}
                        {room.amenities?.hasWiFi && <span className="px-3 py-1.5 rounded-lg bg-ledger-100 text-ledger-700 font-bold border border-ledger-200/60">✓ High Speed WiFi</span>}
                        {room.amenities?.hasBalcony && <span className="px-3 py-1.5 rounded-lg bg-ledger-100 text-ledger-700 font-bold border border-ledger-200/60">✓ Private Balcony</span>}
                      </div>
                    </div>
                  </div>

                  {/* Roommates Directory */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-4">
                    <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-ledger-100">
                      Roommate Directory ({room.roommates?.length || 0})
                    </h3>

                    <div className="space-y-3">
                      {!room.roommates || room.roommates.length === 0 ? (
                        <p className="text-xs text-ledger-400 py-8 text-center font-sans">No roommates assigned.</p>
                      ) : (
                        room.roommates.map((mate) => (
                          <div key={mate._id} className="p-4 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-ink font-display">{mate.userId?.fullName}</p>
                              <p className="text-[11px] text-ledger-500 font-sans">{mate.department} · Year {mate.year}</p>
                              <p className="text-[10px] text-ledger-400 font-mono">{mate.userId?.email}</p>
                            </div>
                            <span className="font-mono text-[10px] text-ledger-600 bg-white px-2 py-1 rounded border border-ledger-200">
                              {mate.studentId}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-ledger-300 space-y-2">
                  <ShieldAlert className="h-10 w-10 text-brass-600 mx-auto" />
                  <p className="font-display font-bold text-lg text-ink">No Room Allocated</p>
                  <p className="text-xs text-ledger-500 font-sans">Contact Warden office to assign your room.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: MY COMPLAINTS (/student/complaints) */}
          {currentPath.includes('/student/complaints') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">My Maintenance Tickets</h2>
                  <p className="text-xs text-ledger-500 font-sans">Report room issues, track warden status, and leave resolution feedback</p>
                </div>
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-sans self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Raise Maintenance Ticket
                </button>
              </div>

              {loadingComplaints ? (
                <Loader text="Fetching your maintenance tickets..." />
              ) : (
                <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ledger-950 text-parchment font-sans uppercase text-[10px] tracking-wider border-b border-ledger-800">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Ticket ID</th>
                          <th className="py-3.5 px-4 font-bold">Subject & Category</th>
                          <th className="py-3.5 px-4 font-bold">Priority</th>
                          <th className="py-3.5 px-4 font-bold">Date Raised</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ledger-100 font-sans">
                        {myComplaints.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-ledger-400 font-sans">
                              You have no reported maintenance complaints.
                            </td>
                          </tr>
                        ) : (
                          myComplaints.map((c) => (
                            <tr key={c._id} className="hover:bg-parchment/60 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-ink">
                                #{c._id?.slice(-6).toUpperCase()}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-ink">{c.subject}</p>
                                <p className="text-[11px] text-ledger-500 capitalize">{c.category}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  c.priority === 'urgent' ? 'bg-danger-light text-danger' :
                                  c.priority === 'high' ? 'bg-brass-50 text-brass-700' : 'bg-ledger-100 text-ledger-700'
                                }`}>
                                  {c.priority}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-ledger-600">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'resolved' ? 'badge-success' : 'badge-warning font-mono'
                                }`}>
                                  {c.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setInspectTicket(c)}
                                  className="btn-secondary text-[11px] py-1 px-2.5"
                                >
                                  View Details
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

          {/* VIEW 4: MY FEES & RECEIPTS (/student/fees) */}
          {currentPath.includes('/student/fees') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <h2 className="font-display font-bold text-xl text-ink">Fees, Dues & Digital Receipts</h2>
                <p className="text-xs text-ledger-500 font-sans">Pay room rent & mess dues, view transaction status, and print receipts</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatsCard title="Total Dues Paid" value={`₹${(feeSummary?.totalPaid || 0).toLocaleString('en-IN')}`} icon={CheckCircle2} />
                <StatsCard title="Pending Dues" value={`₹${(feeSummary?.pendingDues || 0).toLocaleString('en-IN')}`} icon={Receipt} />
                <StatsCard title="Overdue Invoices" value={feeSummary?.overdueInvoices || 0} icon={AlertCircle} />
              </div>

              {loadingFees ? (
                <Loader text="Fetching fee history..." />
              ) : (
                <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ledger-950 text-parchment font-sans uppercase text-[10px] tracking-wider border-b border-ledger-800">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">Fee Description</th>
                          <th className="py-3.5 px-4 font-bold">Billing Cycle</th>
                          <th className="py-3.5 px-4 font-bold">Amount (₹)</th>
                          <th className="py-3.5 px-4 font-bold">Due Date</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ledger-100 font-sans">
                        {myFees.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-ledger-400 font-sans">
                              No fee invoices issued for your account.
                            </td>
                          </tr>
                        ) : (
                          myFees.map((f) => {
                            const totalAmount = f.amount + (f.fine?.amount || 0);
                            return (
                              <tr key={f._id} className="hover:bg-parchment/60 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-ink capitalize">
                                  {f.feeType === 'hostel-rent' ? 'Hostel Rent' : f.feeType}
                                  {f.fine?.amount > 0 && <span className="block text-[10px] text-brass-600 font-normal">+ ₹{f.fine.amount} Late Penalty</span>}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-ledger-600">{f.month} {f.year}</td>
                                <td className="py-3.5 px-4 font-mono font-bold text-ink">₹{totalAmount.toLocaleString('en-IN')}</td>
                                <td className="py-3.5 px-4 font-mono text-ledger-600">{new Date(f.dueDate).toLocaleDateString()}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    f.status === 'paid' ? 'badge-success' : 'badge-danger'
                                  }`}>
                                    {f.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  {f.status !== 'paid' ? (
                                    <button
                                      onClick={() => setPaymentModalFee(f)}
                                      className="btn-primary text-[11px] py-1 px-3"
                                    >
                                      Pay Dues Now
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setSelectedFeeReceipt(f)}
                                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 inline-flex"
                                    >
                                      <Printer className="h-3 w-3" /> Digital Receipt
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

          {/* VIEW 5: NOTICE BOARD (/student/notices) */}
          {currentPath.includes('/student/notices') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <div>
                  <h2 className="font-display font-bold text-xl text-ink">Campus Notice Board</h2>
                  <p className="text-xs text-ledger-500 font-sans">Official announcements, exam schedules, and emergency alerts</p>
                </div>

                <select
                  className="input-field text-xs font-sans sm:w-48"
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="academic">Academic & Exams</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="events">Events</option>
                  <option value="emergency">Emergency Alerts</option>
                </select>
              </div>

              {loadingNotices ? (
                <Loader text="Loading announcements..." />
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
                        onClick={() => handleOpenNoticeModal(n)}
                        className={`bg-white rounded-2xl border p-6 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
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
                                PINNED ANNOUNCEMENT
                              </span>
                            )}
                          </div>

                          <h3 className="font-display font-bold text-lg text-ink">{n.title}</h3>
                          <p className="text-xs text-ledger-600 leading-relaxed font-sans line-clamp-3">{n.content}</p>
                        </div>

                        <div className="pt-4 border-t border-ledger-100 flex items-center justify-between text-xs font-sans text-ledger-500">
                          <span>Posted by <strong className="text-ink">{n.author?.fullName || 'Warden'}</strong></span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 6: MY PROFILE (/student/profile) */}
          {currentPath.includes('/student/profile') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card">
                <h2 className="font-display font-bold text-xl text-ink">Resident Profile & Security</h2>
                <p className="text-xs text-ledger-500 font-sans">Manage your personal details, guardian contact, and account security</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Edit Form */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-5">
                  <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-ledger-100">
                    Personal & Guardian Details
                  </h3>

                  <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ledger-700 mb-1">Full Name *</label>
                        <input
                          type="text" required className="input-field"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-ledger-700 mb-1">Mobile Phone *</label>
                        <input
                          type="text" required className="input-field font-mono"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ledger-700 mb-1">Father's Name</label>
                        <input
                          type="text" className="input-field"
                          value={profileForm.fatherName}
                          onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-ledger-700 mb-1">Guardian Phone Contact *</label>
                        <input
                          type="text" required className="input-field font-mono"
                          value={profileForm.guardianContact}
                          onChange={(e) => setProfileForm({ ...profileForm, guardianContact: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-ledger-700 mb-1">Permanent Residential Address</label>
                      <textarea
                        rows={3} className="input-field text-xs resize-none"
                        value={profileForm.permanentAddress}
                        onChange={(e) => setProfileForm({ ...profileForm, permanentAddress: e.target.value })}
                      />
                    </div>

                    <div className="pt-3 flex justify-end border-t border-ledger-100">
                      <button type="submit" className="btn-primary text-xs py-2 px-4">
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Password Change */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-ledger-200/60 shadow-card space-y-5">
                  <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-ledger-100">
                    Change Password & Security
                  </h3>

                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block font-bold text-ledger-700 mb-1">Current Password *</label>
                      <input
                        type="password" required className="input-field"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-ledger-700 mb-1">New Password *</label>
                      <input
                        type="password" required minLength={6} className="input-field"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-ledger-700 mb-1">Confirm New Password *</label>
                      <input
                        type="password" required minLength={6} className="input-field"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      />
                    </div>

                    <div className="pt-3 flex justify-end border-t border-ledger-100">
                      <button type="submit" className="btn-primary text-xs py-2 px-4">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Raise Complaint Ticket Modal */}
      {showComplaintModal && (
        <ComplaintForm
          onClose={() => setShowComplaintModal(false)}
          onSuccess={() => {
            if (currentPath.includes('/student/complaints')) fetchMyComplaints();
            fetchStudentData();
          }}
        />
      )}

      {/* 2. Fee Receipt Modal */}
      {selectedFeeReceipt && (
        <FeeReceiptModal
          fee={selectedFeeReceipt}
          onClose={() => setSelectedFeeReceipt(null)}
        />
      )}

      {/* 3. Online Dues Payment Modal */}
      {paymentModalFee && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <div>
                <h3 className="font-display font-black text-lg text-parchment">Pay Dues Online</h3>
                <p className="text-xs text-ledger-400 capitalize">{paymentModalFee.feeType} ({paymentModalFee.month} {paymentModalFee.year})</p>
              </div>
              <button onClick={() => setPaymentModalFee(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePayFeeSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-ledger-500 font-bold uppercase">Total Payable Amount</p>
                  <p className="text-xl font-bold text-brass-600 font-mono">
                    ₹{(paymentModalFee.amount + (paymentModalFee.fine?.amount || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="badge-warning text-[10px]">INVOICE UNPAID</span>
              </div>

              <div>
                <label className="block font-bold text-ledger-700 mb-1.5">Select Payment Mode *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Debit/Credit Card' },
                    { id: 'netbanking', label: 'NetBanking' }
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === pm.id
                          ? 'border-brass-500 bg-brass-50 text-brass-700'
                          : 'border-ledger-200 bg-white text-ledger-600 hover:bg-parchment'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-ledger-100">
                <button type="button" onClick={() => setPaymentModalFee(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Inspect Ticket Modal */}
      {inspectTicket && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <div>
                <h3 className="font-display font-black text-lg text-parchment">Ticket Details</h3>
                <p className="text-xs text-ledger-400 font-mono">#{inspectTicket._id?.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setInspectTicket(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3.5 bg-parchment rounded-xl border border-ledger-200/60 space-y-1">
                <p className="font-bold text-ink text-sm font-display">{inspectTicket.subject}</p>
                <p className="text-ledger-600 leading-relaxed">{inspectTicket.description}</p>
              </div>

              {inspectTicket.resolution?.remarks && (
                <div className="p-3.5 bg-sage-50 rounded-xl border border-sage-200 text-sage-900 space-y-1">
                  <p className="font-bold text-sage-950">Warden / Technician Remarks:</p>
                  <p>{inspectTicket.resolution.remarks}</p>
                </div>
              )}

              {/* Feedback Form if Ticket is Resolved */}
              {(inspectTicket.status === 'resolved' || inspectTicket.status === 'closed') && (
                <form onSubmit={handleSubmitFeedback} className="p-4 bg-parchment rounded-xl border border-ledger-200/60 space-y-3">
                  <p className="font-bold text-ink">Rate Service Satisfaction:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button" key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 rounded ${feedbackRating >= star ? 'text-brass-500' : 'text-ledger-300'}`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text" className="input-field text-xs" placeholder="Leave brief comment..."
                    value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)}
                  />

                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                    Submit Feedback
                  </button>
                </form>
              )}

              <div className="pt-3 flex justify-between items-center border-t border-ledger-100">
                {inspectTicket.status === 'pending' ? (
                  <button
                    onClick={() => handleCancelPendingTicket(inspectTicket._id)}
                    className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Cancel Ticket
                  </button>
                ) : <div />}

                <button onClick={() => setInspectTicket(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Full Notice Details Modal */}
      {inspectNotice && (
        <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden">
            <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-brass-400 tracking-wider font-sans">{inspectNotice.category}</span>
                <h3 className="font-display font-black text-lg text-parchment">{inspectNotice.title}</h3>
              </div>
              <button onClick={() => setInspectNotice(null)} className="text-ledger-400 hover:text-brass-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <p className="text-ledger-700 leading-relaxed whitespace-pre-line text-sm">{inspectNotice.content}</p>

              <div className="pt-4 border-t border-ledger-100 flex items-center justify-between text-ledger-500">
                <span>Posted by: <strong className="text-ink">{inspectNotice.author?.fullName || 'Warden Office'}</strong></span>
                <span>Date: {new Date(inspectNotice.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setInspectNotice(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboardPage;
