import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, FileText, Save, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaved(false);
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Profile Settings</h1>

      <div className="card p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" /> Profile updated!
            </div>
          )}

          <div>
            <label className="label flex items-center gap-1.5"><User className="w-3 h-3" /> Display Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><FileText className="w-3 h-3" /> Bio</label>
            <textarea className="input resize-none" rows={3} placeholder="Tell your team about yourself..."
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
