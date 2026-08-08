import { useState } from 'react';
import { X, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4'];

export default function ProjectSettingsModal({ project, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: project.name, description: project.description || '', color: project.color });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.put(`/projects/${project._id}`, form);
      onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await api.delete(`/projects/${project._id}`);
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold text-white">Project Settings</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="label">Project name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full hover:scale-110 transition-transform relative" style={{ background: c }}>
                  {form.color === c && <div className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-surface-card" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
        <div className="px-5 pb-5">
          <div className="border-t border-surface-border pt-4">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
            <button onClick={handleDelete} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm border border-red-900/50 hover:border-red-700 px-3 py-2 rounded-lg transition-colors w-full justify-center">
              <Trash2 className="w-4 h-4" /> Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
