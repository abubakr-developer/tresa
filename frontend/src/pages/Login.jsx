import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-surface-card to-surface flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <Layers className="w-8 h-8 text-primary-400" />
          <span className="text-2xl font-bold text-white tracking-tight">Tresa</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Team work<br />made <span className="text-primary-400">effortless</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage projects, assign tasks, and collaborate in real time.</p>
        </div>
        <div className="flex gap-6">
          {['Projects', 'Tasks', 'Comments', 'Real-time'].map((t) => (
            <span key={t} className="text-xs text-gray-500 border border-surface-border rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Layers className="w-6 h-6 text-primary-400" />
            <span className="text-xl font-bold text-white">Tresa</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your workspace</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  className="input pl-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            New to Tresa?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
