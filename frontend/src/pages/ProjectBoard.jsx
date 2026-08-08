import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserPlus, Settings, Loader } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import InviteMemberModal from '../components/projects/InviteMemberModal';
import ProjectSettingsModal from '../components/projects/ProjectSettingsModal';

export default function ProjectBoard() {
  const { id } = useParams();
  const { socket } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createColumn, setCreateColumn] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
    return () => { if (socket) socket.emit('leave:project', id); };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join:project', id);
    socket.on('task:created', (task) => setTasks((p) => [...p, task]));
    socket.on('task:updated', (task) => setTasks((p) => p.map((t) => t._id === task._id ? task : t)));
    socket.on('task:deleted', (taskId) => setTasks((p) => p.filter((t) => t._id !== taskId)));
    socket.on('task:moved', (task) => setTasks((p) => p.map((t) => t._id === task._id ? task : t)));
    socket.on('project:updated', (proj) => setProject(proj));
    return () => {
      socket.off('task:created'); socket.off('task:updated'); socket.off('task:deleted');
      socket.off('task:moved'); socket.off('project:updated');
    };
  }, [socket, id]);

  const loadData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    setTasks((prev) => prev.map((t) => t._id === draggableId ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/tasks/${draggableId}/move`, { status: newStatus, order: destination.index });
    } catch (err) {
      loadData(); // Revert on error
    }
  };

  const getColumnTasks = (col) => tasks.filter((t) => t.status === col).sort((a, b) => a.order - b.order);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader className="w-6 h-6 text-primary-400 animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">Project not found.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: project.color }} />
          <h1 className="text-lg font-semibold text-white">{project.name}</h1>
          {project.description && <span className="text-sm text-gray-400 hidden md:block">— {project.description}</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Members avatars */}
          <div className="flex -space-x-1.5 mr-2">
            {project.members.slice(0, 5).map((m, i) => (
              <div key={i} title={m.user?.name} className="w-7 h-7 rounded-full bg-primary-700 border-2 border-surface-card flex items-center justify-center text-xs font-bold text-white">
                {m.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
          </div>
          <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-1.5 text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Invite
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-ghost p-2">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-6 h-full min-w-max">
            {project.columns.map((col) => {
              const colTasks = getColumnTasks(col);
              return (
                <div key={col} className="flex flex-col w-72 flex-shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-300">{col}</span>
                      <span className="badge bg-surface-border text-gray-400">{colTasks.length}</span>
                    </div>
                    <button onClick={() => setCreateColumn(col)} className="text-gray-500 hover:text-primary-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto rounded-xl p-2 space-y-2 min-h-32 transition-colors ${snapshot.isDraggingOver ? 'bg-primary-900/20 ring-1 ring-primary-700/50' : 'bg-surface-card/50'}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={snapshot.isDragging ? 'rotate-1 shadow-2xl' : ''}>
                                <TaskCard task={task} onClick={() => setSelectedTask(task)} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-6">
                            <p className="text-gray-600 text-xs">Drop tasks here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => { setTasks((p) => p.map((t) => t._id === updated._id ? updated : t)); setSelectedTask(updated); }}
          onDeleted={(id) => { setTasks((p) => p.filter((t) => t._id !== id)); setSelectedTask(null); }}
        />
      )}
      {createColumn && (
        <CreateTaskModal
          project={project}
          defaultStatus={createColumn}
          onClose={() => setCreateColumn(null)}
          onCreated={(task) => { setTasks((p) => [...p, task]); setCreateColumn(null); }}
        />
      )}
      {showInvite && <InviteMemberModal project={project} onClose={() => setShowInvite(false)} onUpdated={setProject} />}
      {showSettings && <ProjectSettingsModal project={project} onClose={() => setShowSettings(false)} onUpdated={setProject} />}
    </div>
  );
}
