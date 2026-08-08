import { useState, useEffect, useRef } from 'react';
import { X, Flag, Calendar, User, Tag, Trash2, Edit3, Check, MessageSquare, Send, UserPlus, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function TaskModal({ task, project, onClose, onUpdated, onDeleted }) {
  const { user, socket } = useAuth();
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [editDesc, setEditDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [typing, setTyping] = useState([]);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [currentTask, setCurrentTask] = useState(task);
  const commentsEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api.get(`/comments/task/${task._id}`).then(({ data }) => setComments(data)).catch(() => {});
    if (socket) {
      socket.emit('join:task', task._id);
      socket.on('comment:created', (c) => setComments((prev) => [...prev, c]));
      socket.on('comment:updated', (c) => setComments((prev) => prev.map((x) => x._id === c._id ? c : x)));
      socket.on('comment:deleted', (id) => setComments((prev) => prev.filter((c) => c._id !== id)));
      socket.on('typing:start', (data) => setTyping((prev) => prev.find(t => t.userId === data.userId) ? prev : [...prev, data]));
      socket.on('typing:stop', ({ userId }) => setTyping((prev) => prev.filter((t) => t.userId !== userId)));
    }
    return () => {
      if (socket) {
        socket.emit('leave:task', task._id);
        ['comment:created','comment:updated','comment:deleted','typing:start','typing:stop']
          .forEach(e => socket.off(e));
      }
    };
  }, [task._id, socket]);

  useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const updateField = async (field, value) => {
    try {
      const { data } = await api.put(`/tasks/${currentTask._id}`, { [field]: value });
      setCurrentTask(data);
      onUpdated(data);
    } catch (err) { console.error(err); }
  };

  const saveTitle = async () => {
    setEditTitle(false);
    if (title !== currentTask.title) await updateField('title', title);
  };

  const saveDesc = async () => {
    setEditDesc(false);
    if (description !== currentTask.description) await updateField('description', description);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await api.delete(`/tasks/${currentTask._id}`);
    onDeleted(currentTask._id);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await api.post(`/comments/task/${currentTask._id}`, { content: newComment });
      setNewComment('');
      socket?.emit('typing:stop', { taskId: currentTask._id });
    } catch (err) { console.error(err); }
    finally { setPostingComment(false); }
  };

  const handleCommentInput = (e) => {
    setNewComment(e.target.value);
    socket?.emit('typing:start', { taskId: currentTask._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing:stop', { taskId: currentTask._id });
    }, 2000);
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/comments/${commentId}`);
  };

  const toggleAssignee = async (member) => {
    const alreadyAssigned = currentTask.assignees?.find(a => a._id === member._id);
    const newAssignees = alreadyAssigned
      ? currentTask.assignees.filter(a => a._id !== member._id)
      : [...(currentTask.assignees || []), member];
    await updateField('assignees', newAssignees.map(a => a._id));
  };

  const projectMembers = project.members.map(m => m.user).filter(Boolean);
  const filteredMembers = assignSearch
    ? projectMembers.filter(u => u.name?.toLowerCase().includes(assignSearch.toLowerCase()))
    : projectMembers;

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const PRIORITY_COLORS = { low: 'text-gray-400', medium: 'text-blue-400', high: 'text-orange-400', urgent: 'text-red-400' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-surface-border gap-4">
          <div className="flex-1">
            {editTitle ? (
              <div className="flex items-center gap-2">
                <input className="input flex-1 text-base font-semibold" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(false); setTitle(currentTask.title); } }}
                  autoFocus />
                <button onClick={saveTitle} className="text-primary-400 hover:text-primary-300"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <h2 className="text-base font-semibold text-white cursor-text hover:text-primary-300 transition-colors"
                onClick={() => setEditTitle(true)}>
                {title}
                <span className="ml-2 text-gray-600 hover:text-gray-400 transition-colors"><Edit3 className="w-3 h-3 inline" /></span>
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={handleDelete} className="btn-ghost p-1.5 text-gray-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Description + Comments */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-w-0">

            {/* Description */}
            <div>
              <label className="label">Description</label>
              {editDesc ? (
                <div>
                  <textarea className="input resize-none text-sm" rows={4} value={description}
                    onChange={(e) => setDescription(e.target.value)} autoFocus />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveDesc} className="btn-primary text-xs px-3 py-1">Save</button>
                    <button onClick={() => { setEditDesc(false); setDescription(currentTask.description || ''); }} className="btn-secondary text-xs px-3 py-1">Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditDesc(true)}
                  className="text-sm text-gray-400 hover:text-gray-200 cursor-text min-h-[2.5rem] p-2.5 rounded-lg hover:bg-surface-hover transition-colors leading-relaxed">
                  {description || <span className="text-gray-600 italic">Click to add a description...</span>}
                </div>
              )}
            </div>

            {/* Labels */}
            {currentTask.labels?.length > 0 && (
              <div>
                <label className="label flex items-center gap-1.5"><Tag className="w-3 h-3" /> Labels</label>
                <div className="flex gap-1.5 flex-wrap">
                  {currentTask.labels.map((l, i) => (
                    <span key={i} className="badge bg-primary-900/50 text-primary-300">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <label className="label flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Comments
                <span className="text-gray-600 font-normal">({comments.length})</span>
              </label>

              <div className="space-y-3 mb-4">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-600 italic py-2">No comments yet. Be the first!</p>
                )}
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                      {initials(c.author?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-300">{c.author?.name}</span>
                        <span className="text-xs text-gray-600">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                        {c.author?._id === user?._id && (
                          <button onClick={() => deleteComment(c._id)} className="text-gray-600 hover:text-red-400 ml-auto transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="bg-surface-hover rounded-lg px-3 py-2 text-sm text-gray-300 leading-relaxed break-words">
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))}
                {typing.length > 0 && (
                  <p className="text-xs text-gray-500 italic pl-10">
                    {typing.map(t => t.name).join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
                  </p>
                )}
                <div ref={commentsEndRef} />
              </div>

              <form onSubmit={handlePostComment} className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-primary-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials(user?.name)}
                </div>
                <div className="flex-1 flex gap-2">
                  <input className="input flex-1 text-sm" placeholder="Write a comment..."
                    value={newComment} onChange={handleCommentInput}
                    onBlur={() => socket?.emit('typing:stop', { taskId: currentTask._id })} />
                  <button type="submit" className="btn-primary px-3 py-2" disabled={postingComment || !newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right sidebar: meta */}
          <div className="w-52 border-l border-surface-border p-4 space-y-4 flex-shrink-0 overflow-y-auto">

            <div>
              <label className="label">Status</label>
              <select className="input text-xs" value={currentTask.status}
                onChange={(e) => updateField('status', e.target.value)}>
                {project.columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label flex items-center gap-1"><Flag className="w-3 h-3" /> Priority</label>
              <select className={`input text-xs ${PRIORITY_COLORS[currentTask.priority]}`}
                value={currentTask.priority} onChange={(e) => updateField('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="label flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</label>
              <input type="date" className="input text-xs"
                value={currentTask.dueDate ? currentTask.dueDate.slice(0, 10) : ''}
                onChange={(e) => updateField('dueDate', e.target.value || null)} />
            </div>

            {/* Assignees */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0 flex items-center gap-1"><User className="w-3 h-3" /> Assignees</label>
                <button onClick={() => setShowAssignPicker(!showAssignPicker)}
                  className="text-gray-500 hover:text-primary-400 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAssignPicker && (
                <div className="mb-2 rounded-lg border border-surface-border overflow-hidden">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 w-3 h-3 text-gray-500" />
                    <input className="w-full bg-surface-hover text-xs pl-6 pr-2 py-1.5 focus:outline-none text-gray-300 placeholder-gray-600"
                      placeholder="Search..." value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)} />
                  </div>
                  <div className="max-h-24 overflow-y-auto">
                    {filteredMembers.map(u => {
                      const assigned = currentTask.assignees?.find(a => a._id === u._id);
                      return (
                        <button key={u._id} type="button" onClick={() => toggleAssignee(u)}
                          className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${assigned ? 'bg-primary-900/30 text-primary-300' : 'hover:bg-surface-hover text-gray-400'}`}>
                          <div className="w-4 h-4 rounded-full bg-primary-700 flex items-center justify-center text-[9px] font-bold text-white">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="flex-1 text-left truncate">{u.name}</span>
                          {assigned && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {currentTask.assignees?.length === 0 && (
                  <p className="text-xs text-gray-600">No one assigned</p>
                )}
                {currentTask.assignees?.map((a) => (
                  <div key={a._id} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {initials(a.name)}
                    </div>
                    <span className="text-xs text-gray-300 truncate flex-1">{a.name}</span>
                    <button onClick={() => toggleAssignee(a)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <XCircle className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Created by */}
            <div>
              <label className="label">Created by</label>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-800 flex items-center justify-center text-[10px] font-bold text-white">
                  {initials(currentTask.createdBy?.name)}
                </div>
                <span className="text-xs text-gray-400 truncate">{currentTask.createdBy?.name}</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                {currentTask.createdAt && format(new Date(currentTask.createdAt), 'MMM d, yyyy')}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
