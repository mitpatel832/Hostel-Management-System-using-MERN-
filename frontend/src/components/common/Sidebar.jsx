import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  AlertCircle,
  Receipt,
  BellRing,
  LogOut,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  User,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isWardenPath = location.pathname.startsWith('/warden');
  const baseAdminPath = isWardenPath ? '/warden' : '/admin';

  const adminNavItems = [
    { label: 'Overview', path: `${baseAdminPath}/dashboard`, sub: 'dashboard', icon: LayoutDashboard },
    { label: 'Students', path: `${baseAdminPath}/students`, sub: 'students', icon: Users },
    { label: 'Rooms & Beds', path: `${baseAdminPath}/rooms`, sub: 'rooms', icon: BedDouble },
    { label: 'Maintenance', path: `${baseAdminPath}/complaints`, sub: 'complaints', icon: AlertCircle },
    { label: 'Fees & Dues', path: `${baseAdminPath}/fees`, sub: 'fees', icon: Receipt },
    { label: 'Notices', path: `${baseAdminPath}/notices`, sub: 'notices', icon: BellRing }
  ];

  const studentNavItems = [
    { label: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Room', path: '/student/room', icon: BedDouble },
    { label: 'Complaints', path: '/student/complaints', icon: AlertCircle },
    { label: 'Fees & Receipts', path: '/student/fees', icon: Receipt },
    { label: 'Notice Board', path: '/student/notices', icon: BellRing },
    { label: 'My Profile', path: '/student/profile', icon: User }
  ];

  const navItems = role === 'student' ? studentNavItems : adminNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#243B34] text-[#EFE8DA] min-h-screen border-r border-[#2F5D50] transition-all duration-300 flex flex-col justify-between sticky top-0 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className={`h-16 border-b border-[#2F5D50] flex items-center justify-between ${
          collapsed ? 'px-2 gap-1' : 'px-4 gap-3'
        }`}>
          {/* Logo Badge & Brand Title */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-[#E07A3F] flex items-center justify-center text-white shrink-0 shadow-md">
              <KeyRound className="h-5 w-5 shrink-0" />
            </div>
            {!collapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="font-display font-normal text-xl text-[#FAF6EF] tracking-tight leading-tight">
                  Hostel<span className="text-[#F2B134]">Hive</span>
                </span>
                <span className="text-[10px] font-bold text-[#D9E4DE] uppercase tracking-[0.15em] font-sans mt-0.5">
                  {role === 'student' ? 'Resident Portal' : 'Admin Console'}
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#D9E4DE] hover:text-[#F2B134] hover:bg-[#2F5D50] transition-colors hidden md:block shrink-0"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.sub && location.pathname.includes(item.sub)) ||
              (item.sub === 'dashboard' && (location.pathname === '/admin' || location.pathname === '/warden'));
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group font-sans ${
                  isActive
                    ? 'bg-[#E07A3F] text-white shadow-md'
                    : 'text-[#EFE8DA]/80 hover:text-[#FAF6EF] hover:bg-[#2F5D50]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-[#D9E4DE] group-hover:text-[#F2B134]'
                }`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Logout */}
      <div className="p-3 border-t border-[#2F5D50] space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D9E4DE] hover:text-[#F2B134] hover:bg-[#2F5D50] transition-colors font-sans ${collapsed ? 'justify-center' : ''}`}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Campus Homepage</span>}
        </Link>

        <div className={`p-2.5 rounded-xl bg-[#2F5D50]/60 border border-[#2F5D50] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-[#F2B134] text-[#243B34] font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#FAF6EF] truncate font-sans">{user?.fullName || 'Chief Warden'}</p>
                <p className="text-[10px] text-[#F2B134] uppercase font-bold tracking-wider truncate font-sans">{user?.role || 'Admin'}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#D9E4DE] hover:text-[#9A3B2E] hover:bg-[#F6DFDA]/20 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
