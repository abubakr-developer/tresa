import Project from '../models/Project.js';
import User from '../models/User.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      isArchived: false,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, color, columns } = req.body;
    const project = await Project.create({
      name,
      description,
      color,
      columns: columns || ['To Do', 'In Progress', 'In Review', 'Done'],
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    req.io.emit('project:created', project);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can update project' });

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    req.io.to(`project:${req.params.id}`).emit('project:updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can delete project' });

    await project.deleteOne();
    req.io.emit('project:deleted', req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: user._id, role: role || 'member' });

    // Add notification
    user.notifications.push({
      message: `You were invited to project "${project.name}"`,
      type: 'project_invite',
      projectId: project._id,
    });
    await user.save();
    await project.save();
    await project.populate('members.user', 'name email avatar');

    req.io.to(`project:${req.params.id}`).emit('project:member_added', project);
    req.io.to(`user:${user._id}`).emit('notification', user.notifications.at(-1));
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members.user', 'name email avatar');
    req.io.to(`project:${req.params.id}`).emit('project:updated', project);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
