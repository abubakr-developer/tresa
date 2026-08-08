import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content, mentions } = req.body;
    const comment = await Comment.create({
      content,
      task: req.params.taskId,
      author: req.user._id,
      mentions: mentions || [],
    });

    await comment.populate('author', 'name email avatar');
    await comment.populate('mentions', 'name email');

    const task = await Task.findById(req.params.taskId).populate('project');

    // Notify mentioned users
    if (mentions?.length) {
      for (const userId of mentions) {
        const user = await User.findById(userId);
        if (user && user._id.toString() !== req.user._id.toString()) {
          user.notifications.push({
            message: `${req.user.name} mentioned you in a comment`,
            type: 'comment',
            projectId: task?.project?._id,
            taskId: task._id,
          });
          await user.save();
          req.io.to(`user:${userId}`).emit('notification', user.notifications.at(-1));
        }
      }
    }

    req.io.to(`task:${req.params.taskId}`).emit('comment:created', comment);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    comment.content = req.body.content;
    await comment.save();
    await comment.populate('author', 'name email avatar');
    req.io.to(`task:${comment.task}`).emit('comment:updated', comment);
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await comment.deleteOne();
    req.io.to(`task:${comment.task}`).emit('comment:deleted', req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
