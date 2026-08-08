import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, LayoutDashboard, Plus, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import CreateProjectModal from '../projects/CreateProjectModal';

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(({ data }) => setProjects(data)).catch(() => {});
  }, []);

  const handleProjectCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
    navigate(`/project/${project._id}`);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {/* Collapsed toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-surface-card border border-surface-border border-l-0 rounded-r-lg p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      <aside className={`${open ? 'w-60' : 'w-0 overflow-hidden'} transition-all duration-200 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Tresa</span>
          </div>
          <button onClick={() => setOpen(false)} className="btn-ghost p-1 text-gray-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <Link
            to="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:bg-surface-hover hover:text-gray-200'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Projects section */}
          <div className="pt-3 pb-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Projects</span>
              <button onClick={() => setShowCreate(true)} className="text-gray-500 hover:text-primary-400 transition-colors p-0.5 rounded">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.map((p) => (
                <Link
                  key={p._id}
                  to={`/project/${p._id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === `/project/${p._id}` ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:bg-surface-hover hover:text-gray-200'}`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || '#6366f1' }} />
                  <span className="truncate flex-1">{p.name}</span>
                </Link>
              ))}
              {projects.length === 0 && (
                <p className="text-xs text-gray-600 px-3 py-2 italic">No projects yet</p>
              )}
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-2 border-t border-surface-border">
          <Link to="/profile" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors w-full ${location.pathname === '/profile' ? 'bg-primary-600/20' : 'hover:bg-surface-hover'}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors w-full mt-0.5">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleProjectCreated} />}
    </>
  );
}
