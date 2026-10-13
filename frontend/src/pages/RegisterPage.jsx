import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-parchment flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Subtle texture */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.02]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2312181F\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}
      />

      {/* Back Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ledger-600 hover:text-brass-600 transition-colors font-sans"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Campus Home
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 text-center space-y-3">
        <div className="h-14 w-14 mx-auto rounded-xl bg-ledger-950 flex items-center justify-center text-brass-500 shadow-ledger-lg">
          <KeyRound className="h-7 w-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
          Create Resident <span className="italic text-brass-600">Account</span>
        </h2>
        <p className="text-xs sm:text-sm text-ledger-500 font-sans">
          Register to view vacant beds, submit hostel forms, and manage your stay.
        </p>
      </div>

      {/* Auth Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-ledger-200/60 shadow-ledger-lg">
          <RegisterForm />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-ledger-400 mt-8 font-sans">
        HostelHive · Smart Hostel Management · Final Year Academic Project
      </p>
    </div>
  );
};

export default RegisterPage;
