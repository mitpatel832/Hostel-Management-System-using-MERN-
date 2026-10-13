import React, { useState } from 'react';
import { X, Megaphone, Pin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const NoticeForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    targetAudience: 'all',
    block: 'A',
    isPinned: false,
    expiryDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please enter both title and content.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        targetDetails: formData.targetAudience === 'specific-block' ? { block: formData.block } : {},
        isPinned: formData.isPinned,
        expiryDate: formData.expiryDate || null
      };

      const res = await api.post('/notices', payload);
      if (res.data.success) {
        toast.success('Notice broadcasted successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ledger-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-ledger-200/80 shadow-ledger-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-ledger-950 text-parchment flex items-center justify-between border-b border-ledger-800">
          <div>
            <h3 className="font-display font-black text-lg text-parchment">Broadcast Campus Announcement</h3>
            <p className="text-xs text-ledger-400 font-sans">Publishes real-time notice to student portal</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ledger-400 hover:text-brass-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Announcement Title *</label>
            <input
              type="text"
              required
              className="input-field font-sans"
              placeholder="e.g. Water Supply Disruption Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Category</label>
              <select
                className="input-field font-sans text-xs"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General Announcement</option>
                <option value="academic">Academic & Exams</option>
                <option value="events">Hostel Events & Cultural</option>
                <option value="maintenance">Maintenance & Water</option>
                <option value="rules">Rules & Discipline</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Priority Level</label>
              <select
                className="input-field font-sans text-xs"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="normal">Normal Priority</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent / Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Target Audience</label>
              <select
                className="input-field font-sans text-xs"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="all">Entire Campus Hostel</option>
                <option value="students">Students Only</option>
                <option value="specific-block">Specific Hostel Block</option>
              </select>
            </div>

            {formData.targetAudience === 'specific-block' && (
              <div>
                <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Select Block</label>
                <select
                  className="input-field font-sans text-xs"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                >
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">Notice Body / Message *</label>
            <textarea
              rows={4}
              required
              className="input-field font-sans text-xs resize-none"
              placeholder="Write announcement content clearly here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-parchment border border-ledger-200/60 flex items-center justify-between text-xs font-sans">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded accent-brass-500"
              />
              <span>Pin to Top of Notice Board</span>
            </label>
            <span className="text-[10px] text-ledger-500">Pinned notices remain highlighted first</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-ledger-100">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2.5">
              {loading ? 'Broadcasting...' : 'Publish Announcement'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NoticeForm;
