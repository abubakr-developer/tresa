import { MessageSquare, Calendar, Flag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const PRIORITY_CONFIG = {
  low: { color: 'text-gray-400', bg: 'bg-gray-800', label: 'Low' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-900/40', label: 'Medium' },
  high: { color: 'text-orange-400', bg: 'bg-orange-900/40', label: 'High' },
  urgent: { color: 'text-red-400', bg: 'bg-red-900/40', label: 'Urgent' },
};

export default function TaskCard({ task, onClick }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div
      onClick={onClick}
      className="card p-3.5 cursor-pointer hover:border-primary-600/60 hover:bg-surface-hover transition-all group"
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {task.labels.map((l, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary-900/50 text-primary-300 rounded font-medium">{l}</span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug mb-2">{task.title}</p>

      {/* Priority */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className={`badge ${priority.bg} ${priority.color} flex items-center gap-1`}>
          <Flag className="w-2.5 h-2.5" />{priority.label}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1">
          {task.assignees?.slice(0, 3).map((a, i) => (
            <div key={i} title={a.name} className="w-5 h-5 rounded-full bg-primary-700 border border-surface-border flex items-center justify-center text-[9px] font-bold text-white">
              {a.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-red-400' : isDueToday ? 'text-yellow-400' : 'text-gray-500'}`}>
              <Calendar className="w-2.5 h-2.5" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
