import React from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

const ComplaintList = ({ complaints, onViewDetails }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-ledger-200/60 shadow-card space-y-2">
        <p className="font-display font-bold text-lg text-ink">No Complaint Tickets Found</p>
        <p className="text-xs text-ledger-500 font-sans">All maintenance systems operating smoothly!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ledger-950 text-parchment font-sans uppercase text-[10px] tracking-wider border-b border-ledger-800">
            <tr>
              <th className="py-3.5 px-4 font-bold">Ticket ID</th>
              <th className="py-3.5 px-4 font-bold">Subject & Category</th>
              <th className="py-3.5 px-4 font-bold">Resident / Room</th>
              <th className="py-3.5 px-4 font-bold">Priority</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-ledger-100 font-sans">
            {complaints.map((c) => {
              const student = c.studentId || {};
              const user = student.userId || {};
              const room = c.roomId;

              return (
                <tr key={c._id} className="hover:bg-parchment/60 transition-colors">
                  
                  {/* Ticket ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">
                    #{c._id?.slice(-6).toUpperCase()}
                  </td>

                  {/* Subject & Category */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-ink text-xs">{c.subject}</p>
                    <p className="text-[11px] text-ledger-500 font-sans capitalize">{c.category}</p>
                  </td>

                  {/* Resident / Room */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-ink">{user.fullName || 'Resident'}</p>
                    <p className="text-[10px] font-mono text-ledger-500">
                      {room ? `Room ${room.roomNumber} (${room.block} Block)` : 'No Room Info'}
                    </p>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.priority === 'urgent' ? 'bg-danger-light text-danger' :
                      c.priority === 'high' ? 'bg-brass-50 text-brass-700' :
                      'bg-ledger-100 text-ledger-700'
                    }`}>
                      {c.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'resolved' ? 'badge-success' :
                      c.status === 'in-progress' ? 'badge-info font-mono' : 'badge-warning font-mono'
                    }`}>
                      {c.status?.toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewDetails(c)}
                      className="p-1.5 rounded-lg text-ledger-500 hover:text-brass-600 hover:bg-brass-50 transition-colors"
                      title="Inspect Ticket"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintList;
