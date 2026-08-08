import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, status, priority, assignees, dueDate, labels } = req.body;
    const task = await Task.create({
      title,
      description,
      project: projectId,
      status: status || 'To Do',
      priority: priority || 'medium',
      assignees: assignees || [],
      dueDate,
      labels: labels || [],
      createdBy: req.user._id,
    });

    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Notify assignees
    if (assignees?.length) {
      for (const userId of assignees) {
        const user = await User.findById(userId);
        if (user && user._id.toString() !== req.user._id.toString()) {
          user.notifications.push({
            message: `You were assigned to task "${title}"`,
            type: 'task_assigned',
            projectId,
            taskId: task._id,
          });
          await user.save();
          req.io.to(`user:${userId}`).emit('notification', user.notifications.at(-1));
        }
      }
    }

    req.io.to(`project:${projectId}`).emit('task:created', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.io.to(`project:${task.project}`).emit('task:updated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.io.to(`project:${task.project}`).emit('task:deleted', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order },
      { new: true }
    )
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    req.io.to(`project:${task.project}`).emit('task:moved', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
