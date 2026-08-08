import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Layers className="w-7 h-7 text-primary-400" />
          <span className="text-xl font-bold text-white">Tresa</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-gray-400 text-sm mb-8">Join your team on Tresa</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input type="text" className="input pl-9" placeholder="Jane Smith" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input type="email" className="input pl-9" placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input type="password" className="input pl-9" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={loading}>
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Get started <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
