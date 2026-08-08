import { useState, useEffect } from 'react';
import { X, CheckSquare, Search, UserPlus, XCircle } from 'lucide-react';
import api from '../../utils/api';

export default function CreateTaskModal({ project, defaultStatus, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', status: defaultStatus || 'To Do',
    priority: 'medium', dueDate: '', labels: '',
  });
  const [assignees, setAssignees] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const projectMembers = project.members.map(m => m.user).filter(Boolean);
  const filtered = memberSearch
    ? projectMembers.filter(u =>
        u.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : projectMembers;

  const toggleAssignee = (user) => {
    setAssignees(prev =>
      prev.find(a => a._id === user._id)
        ? prev.filter(a => a._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        projectId: project._id,
        assignees: assignees.map(a => a._id),
        labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || undefined,
      };
      const { data } = await api.post('/tasks', payload);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold text-white">New Task</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="label">Task title *</label>
            <input className="input" placeholder="What needs to be done?" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Add details..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {project.columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="label">Assign to</label>
            {assignees.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {assignees.map(a => (
                  <span key={a._id} className="flex items-center gap-1 bg-primary-900/50 text-primary-300 text-xs rounded-full px-2 py-0.5">
                    {a.name}
                    <button type="button" onClick={() => toggleAssignee(a)}><XCircle className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input className="input pl-8 text-sm" placeholder="Search members..."
                value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 rounded-lg border border-surface-border p-1">
              {filtered.length === 0 && <p className="text-xs text-gray-500 px-2 py-1">No members found</p>}
              {filtered.map(u => {
                const selected = assignees.find(a => a._id === u._id);
                return (
                  <button key={u._id} type="button" onClick={() => toggleAssignee(u)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${selected ? 'bg-primary-900/40 text-primary-300' : 'hover:bg-surface-hover text-gray-300'}`}>
                    <div className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="flex-1 text-left truncate">{u.name}</span>
                    {selected && <CheckSquare className="w-3.5 h-3.5 text-primary-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          <div>
            <label className="label">Labels <span className="text-gray-600 font-normal">(comma-separated)</span></label>
            <input className="input" placeholder="e.g. bug, frontend, design" value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })} />
          </div>
        </form>

        <div className="flex gap-3 px-5 pb-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
