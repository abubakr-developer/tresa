import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Users, CheckSquare, Clock, Layers } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects').then(({ data }) => { setProjects(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleProjectCreated = (project) => {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length, icon: Folder, color: 'text-primary-400 bg-primary-900/30' },
          { label: 'Active Projects', value: projects.filter(p => !p.isArchived).length, icon: Layers, color: 'text-green-400 bg-green-900/30' },
          { label: 'Collaborations', value: projects.filter(p => p.owner._id !== user?._id).length, icon: Users, color: 'text-blue-400 bg-blue-900/30' },
          { label: 'Owned', value: projects.filter(p => p.owner._id === user?._id).length, icon: CheckSquare, color: 'text-yellow-400 bg-yellow-900/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Your Projects</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <Folder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first project to start collaborating.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create a project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project._id} to={`/project/${project._id}`} className="card p-5 hover:border-primary-600/50 transition-all hover:-translate-y-0.5 group block">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
                  <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors text-sm">{project.name}</h3>
                </div>
              </div>
              {project.description && (
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {project.members.slice(0, 4).map((m, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-primary-700 border-2 border-surface-card flex items-center justify-center text-[10px] font-bold text-white">
                      {m.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-surface-border border-2 border-surface-card flex items-center justify-center text-[10px] text-gray-400">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleProjectCreated} />}
    </div>
  );
}
