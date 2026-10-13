import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AllocateRoom = ({ room, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnallocatedStudents = async () => {
      try {
        const res = await api.get('/students?limit=100');
        if (res.data.success) {
          // Filter students who are not yet allocated to this room
          setStudents(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load students list');
      }
    };
    fetchUnallocatedStudents();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error('Please select a student to allocate.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/students/${selectedStudentId}/allocate-room`, {
        roomId: room._id
      });

      if (res.data.success) {
        toast.success(`Student allocated to Room ${room.roomNumber} successfully!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl border border-ledger-200/80 shadow-ledger-lg overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
          <div>
            <h3 className="font-display font-black text-lg text-parchment">Allocate Bed in Room {room?.roomNumber}</h3>
            <p className="text-xs text-ledger-400 font-sans">Block {room?.block} · Vacant Beds: {room?.capacity - room?.currentOccupancy}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ledger-400 hover:text-brass-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleAllocate} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-ledger-700 mb-1.5 font-sans">Select Student Resident *</label>
            <select
              required
              className="input-field font-sans text-xs"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Choose Student from Directory --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} - {s.userId?.fullName || 'Student'} ({s.department}, Yr {s.year}) {s.roomId ? `[Currently in Room ${s.roomId.roomNumber}]` : '[Unallocated]'}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 text-xs text-ledger-600 font-sans space-y-1">
            <p className="font-bold text-ink">Room Allocation Policy:</p>
            <p>Assigning a student to Room {room?.roomNumber} will automatically update the room occupancy count and bed availability status in real time.</p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-ledger-100">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2.5">
              {loading ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AllocateRoom;
