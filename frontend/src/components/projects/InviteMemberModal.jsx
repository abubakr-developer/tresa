import { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import api from '../../utils/api';

export default function InviteMemberModal({ project, onClose, onUpdated }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) return setError('Email is required');
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/invite`, { email, role });
      onUpdated(data);
      setSuccess(`${email} has been invited!`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold text-white">Invite to {project.name}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2 mb-4">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-900/20 rounded-lg px-3 py-2 mb-4">{success}</p>}

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="colleague@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Done</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>

          {/* Members list */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Members</h3>
            <div className="space-y-2">
              {project.members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white">
                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{m.user?.name}</p>
                    <p className="text-xs text-gray-500">{m.user?.email}</p>
                  </div>
                  <span className="badge bg-surface-border text-gray-400 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
