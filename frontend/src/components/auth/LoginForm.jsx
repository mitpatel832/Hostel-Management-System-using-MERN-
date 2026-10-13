import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

const ROLE_OPTIONS = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    subtitle: 'Access your suite, fees, complaints & notices',
    placeholder: 'e.g. rahul@student.com',
    dashboard: '/student/dashboard'
  },
  {
    id: 'warden',
    label: 'Warden',
    icon: Building2,
    subtitle: 'Manage suites, tickets, residents & notices',
    placeholder: 'e.g. warden@hostelhive.com',
    dashboard: '/admin/dashboard'
  }
];

const LoginForm = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const activeRole = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];
  const ActiveIcon = activeRole.icon;

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    const res = await login(formData.email.trim().toLowerCase(), formData.password);

    if (!res?.success || !res?.user) {
      return;
    }

    const actualRole = res.user.role;

    if (actualRole !== selectedRole) {
      authService.logout();
      toast.error(
        `This account is registered as ${actualRole}. Please use the ${actualRole === 'warden' ? 'Warden' : 'Student'} login tab.`
      );
      window.location.href = '/login';
      return;
    }

    toast.success(`Welcome back, ${res.user.fullName}!`);

    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(activeRole.dashboard, { replace: true });
    }
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Role Selector Tabs (2 Roles Only) */}
      <div>
        <p className="label-uppercase text-[10px] text-[#7A7268] mb-2.5 text-center">
          Select Portal Login
        </p>
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-[2px] bg-[#F6F2EA] border border-[#DDD3C3]">
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleChange(role.id)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-[2px] text-xs label-uppercase transition-all duration-300 ${
                  isActive
                    ? 'bg-[#25382F] text-[#B08D57] border border-[#25382F]'
                    : 'bg-transparent text-[#7A7268] hover:bg-[#FAF8F5] hover:text-[#2E2A26]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#B08D57]' : 'text-[#7A7268]'}`} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active role description banner */}
      <div className="flex items-start gap-3.5 p-4 rounded-[2px] bg-[#1F2623] border border-[#25382F]">
        <div className="h-9 w-9 rounded-[2px] bg-[#25382F] border border-[#B08D57]/40 flex items-center justify-center shrink-0">
          <ActiveIcon className="h-4 w-4 text-[#B08D57]" />
        </div>
        <div>
          <p className="text-sm font-serif font-medium text-[#F6F2EA]">
            {activeRole.label} Portal
          </p>
          <p className="text-xs text-[#EDE6DA]/80 font-sans leading-relaxed mt-0.5">
            {activeRole.subtitle}
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5">
            Campus Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="username"
              className="input-field pl-10"
              placeholder={activeRole.placeholder}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs label-uppercase text-[#2E2A26]">
              Password
            </label>
            <span className="text-[11px] text-[#7A7268] font-medium cursor-not-allowed">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              className="input-field pl-10 pr-10 font-mono tracking-wider"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A7268] hover:text-[#B08D57] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 mt-2"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-[#FAF8F5]/30 border-t-[#FAF8F5] rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              Sign in as {activeRole.label}
              <ArrowRight className="h-4 w-4 ml-1" />
            </span>
          )}
        </button>
      </form>

      <div className="text-center pt-2 text-xs text-[#7A7268] font-sans">
        {selectedRole === 'student' ? (
          <>
            New student resident?{' '}
            <Link to="/register" className="font-semibold text-[#B08D57] hover:underline">
              Create Account
            </Link>
          </>
        ) : (
          <span className="text-[#7A7268]">
            Warden accounts are issued by the hostel administration office.
          </span>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
