import React, { useState } from 'react';
import { X, Wrench, AlertCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ComplaintForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'plumbing',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast.error('Please fill in both ticket subject and description.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/complaints', {
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description
      });

      if (res.data.success) {
        toast.success('Complaint ticket raised successfully! Our team will inspect it shortly.');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200/80 shadow-ledger-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
          <div>
            <h3 className="font-display font-black text-lg text-parchment">Raise Maintenance Ticket</h3>
            <p className="text-xs text-ledger-400 font-sans">Report an issue with room, washroom, or mess</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ledger-400 hover:text-brass-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Issue Subject / Summary *</label>
            <input
              type="text"
              required
              className="input-field font-sans"
              placeholder="e.g. Washroom tap leaking continuously"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Issue Category *</label>
              <select
                className="input-field font-sans text-xs"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="plumbing">Plumbing & Water</option>
                <option value="electrical">Electrical & Lighting</option>
                <option value="wifi-internet">WiFi & Internet</option>
                <option value="furniture">Furniture & Carpentry</option>
                <option value="cleaning">Cleaning & Hygiene</option>
                <option value="mess-food">Mess & Food Quality</option>
                <option value="security">Security & Locks</option>
                <option value="noise">Noise Disturbance</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Priority Tag</label>
              <select
                className="input-field font-sans text-xs"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low (General Inquiry)</option>
                <option value="medium">Medium (Standard Repair)</option>
                <option value="high">High (Needs Today)</option>
                <option value="urgent">Urgent (Water/Power Emergency)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Detailed Problem Description *</label>
            <textarea
              rows={4}
              required
              className="input-field font-sans text-xs resize-none"
              placeholder="Explain what is broken, when it started, and any specific details for the maintenance technician..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 text-xs text-ledger-600 font-sans space-y-1">
            <p className="font-bold text-ink">Inspection Workflow Notice:</p>
            <p>Your ticket will be automatically assigned to the block maintenance warden. You can track progress live from your portal.</p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-ledger-100">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2.5">
              {loading ? 'Submitting Ticket...' : 'File Maintenance Ticket'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
