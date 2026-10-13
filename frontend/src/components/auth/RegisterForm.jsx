import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    });
    if (res.success && res.user) {
      if (res.user.role === 'admin' || res.user.role === 'warden') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">

      {/* Full Name */}
      <div>
        <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5 font-sans">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            required
            className="input-field pl-10"
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5 font-sans">Campus Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              className="input-field pl-10"
              placeholder="rahul@student.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5 font-sans">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              className="input-field pl-10 font-mono tracking-wide"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5 font-sans">Create Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="input-field pl-10 pr-10 font-mono tracking-wider"
              placeholder="Min 6 chars"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7A7268] hover:text-[#B08D57]"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs label-uppercase text-[#2E2A26] mb-1.5 font-sans">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A7268]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="input-field pl-10 font-mono tracking-wider"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 mt-2"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-[#FAF8F5]/30 border-t-[#FAF8F5] rounded-full animate-spin" />
            Creating Account...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Complete Registration <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </button>

      <div className="text-center pt-2 text-xs text-[#7A7268] font-sans">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-[#B08D57] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
