import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, KeyRound, Building, Calendar, CreditCard, Hash } from 'lucide-react';

const FeeReceiptModal = ({ fee, onClose }) => {
  if (!fee) return null;

  const student = fee.studentId || {};
  const user = student.userId || {};
  const room = student.roomId || fee.roomId || {};
  
  const handlePrint = () => {
    window.print();
  };

  const formattedPaidDate = fee.paidDate
    ? new Date(fee.paidDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const baseAmount = fee.amount || 0;
  const fineAmount = fee.fine?.amount || 0;
  const totalAmount = baseAmount + fineAmount;

  return (
    <div className="fixed inset-0 bg-ledger-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white max-w-2xl w-full rounded-2xl border border-ledger-200 shadow-ledger-lg overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Header Bar - Hidden during print */}
        <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brass-400" />
            <h3 className="font-display font-black text-lg text-parchment">Digital Fee Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-ledger-400 hover:text-brass-400 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 bg-white text-ink font-sans print:p-0">
          
          {/* Receipt Top Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-ledger-950">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-ledger-950 flex items-center justify-center text-brass-400 font-bold font-mono">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h2 className="text-2xl font-black font-display tracking-tight text-ledger-950">
                  Hostel<span className="text-brass-600">Hive</span>
                </h2>
              </div>
              <p className="text-xs text-ledger-500 font-medium">Campus Resident Facilities & Finance Office</p>
              <p className="text-[11px] text-ledger-400">National Institute Campus Administration · Reg No. HH-2024</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-50 text-sage-700 font-bold text-xs border border-sage-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> OFFICIAL RECEIPT
              </span>
              <p className="text-xs font-mono font-bold text-ink mt-2">
                Receipt #: <span className="text-brass-600">{fee.receiptNumber || 'RCP-2025-001'}</span>
              </p>
              <p className="text-[11px] text-ledger-500 font-mono">
                Date: {formattedPaidDate}
              </p>
            </div>
          </div>

          {/* Student & Room Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-parchment border border-ledger-200/80 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-ledger-500 font-mono">Resident Details</p>
              <p className="text-sm font-bold text-ink font-display mt-0.5">{user.fullName || 'Student Resident'}</p>
              <p className="text-ledger-600">Student ID: <span className="font-mono font-bold">{student.studentId || 'N/A'}</span></p>
              <p className="text-ledger-600">{student.department || 'Academic Dept'} · Year {student.year || 'N/A'}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-ledger-500 font-mono">Room Allocation</p>
              <p className="text-sm font-bold text-ink font-display mt-0.5">
                {room.roomNumber ? `Room ${room.roomNumber}` : 'Hostel Resident'}
              </p>
              <p className="text-ledger-600">{room.block ? `Block ${room.block}` : 'Main Campus'} {room.floor !== undefined ? `· Floor ${room.floor}` : ''}</p>
              <p className="text-ledger-600">Email: {user.email || 'N/A'}</p>
            </div>
          </div>

          {/* Payment Invoice Line Items Table */}
          <div className="border border-ledger-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-ledger-950 text-parchment font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Description / Fee Head</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ledger-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-ink">
                    {fee.feeType === 'hostel-rent' ? 'Hostel Room Accommodation Rent' :
                     fee.feeType === 'mess-dues' ? 'Mess & Dining Charges' :
                     fee.feeType === 'caution-deposit' ? 'Caution Deposit (Refundable)' :
                     fee.feeType === 'utility' ? 'Utility & Maintenance Charges' : fee.feeType}
                    {fee.remarks && <p className="text-[11px] text-ledger-500 font-normal mt-0.5">{fee.remarks}</p>}
                  </td>
                  <td className="py-3 px-4 font-mono text-ledger-600">
                    {fee.month ? `${fee.month} ${fee.year}` : `FY ${fee.year || 2025}`}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-ink">
                    ₹{baseAmount.toLocaleString('en-IN')}
                  </td>
                </tr>

                {fineAmount > 0 && (
                  <tr className="bg-brass-50/50">
                    <td className="py-2.5 px-4 font-semibold text-brass-700">
                      Late Payment Fine / Penalty ({fee.fine?.reason || 'Penalty'})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-brass-600">Overdue Charge</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-right text-brass-700">
                      + ₹{fineAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-parchment font-bold border-t-2 border-ledger-950">
                <tr>
                  <td colSpan={2} className="py-3 px-4 font-display text-sm text-ledger-950">Total Amount Paid</td>
                  <td className="py-3 px-4 font-mono text-base text-right text-brass-600">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Method & Verification Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-ledger-500 font-mono">Transaction Metadata</p>
              <p className="text-ledger-700 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-ledger-500" />
                Payment Method: <span className="font-bold uppercase font-mono">{fee.paymentMethod || 'UPI / Online'}</span>
              </p>
              <p className="text-ledger-700 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-ledger-500" />
                Ref Txn ID: <span className="font-mono font-bold text-ink">{fee.transactionId || 'TXN-HOSTELHIVE-8823'}</span>
              </p>
            </div>

            <div className="text-right space-y-1 flex flex-col items-end">
              <p className="text-[10px] font-bold uppercase text-ledger-500 font-mono">Verification Stamp</p>
              <div className="p-2.5 rounded-lg bg-sage-50 border border-sage-200 text-sage-800 text-[11px] font-medium text-right max-w-xs">
                Verified electronically by <strong className="text-sage-950 font-bold">{fee.verifiedBy?.fullName || 'Chief Hostel Warden'}</strong>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-ledger-200 text-center text-[10px] text-ledger-400 font-mono">
            This is a computer-generated official receipt issued by HostelHive. No physical signature is required.
          </div>

        </div>

        {/* Footer Actions - Hidden during print */}
        <div className="px-6 py-4 bg-parchment border-t border-ledger-200 flex items-center justify-between print:hidden">
          <p className="text-xs text-ledger-500">Need help? Contact accounts@hostelhive.edu</p>
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeeReceiptModal;
