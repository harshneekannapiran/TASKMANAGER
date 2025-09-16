const Team = require('../models/Team');
const TeamInvitation = require('../models/TeamInvitation');
const Task = require('../models/Task');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Meeting = require('../models/Meeting');

// Create a team (owner = current user)
exports.createTeam = catchAsync(async (req, res, next) => {
  const team = await Team.create({ name: req.body.name, owner: req.user.id, members: [] });
  res.status(201).json({ status: 'success', data: { team } });
});

// Get teams owned by user
exports.getOwnedTeams = catchAsync(async (req, res, next) => {
  const teams = await Team.find({ owner: req.user.id });
  res.status(200).json({ status: 'success', results: teams.length, data: { teams } });
});

// Get teams where user is a member
exports.getJoinedTeams = catchAsync(async (req, res, next) => {
  const teams = await Team.find({ members: req.user.id });
  res.status(200).json({ status: 'success', results: teams.length, data: { teams } });
});

// Get a single team (owner or member)
exports.getTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId)
    .populate('owner', 'name email')
    .populate('members', 'name email');
  if (!team) return next(new AppError('Team not found', 404));
  const isOwner = String(team.owner?._id || team.owner) === String(req.user.id);
  const isMember = (team.members || []).some((m) => String(m?._id || m) === String(req.user.id));
  if (!isOwner && !isMember) return next(new AppError('Forbidden', 403));
  res.status(200).json({ status: 'success', data: { team } });
});

// Invite a user to a team (owner only)
exports.inviteToTeam = catchAsync(async (req, res, next) => {
  const { teamId, inviteeId } = req.body;
  
  if (!teamId || !inviteeId) {
    return next(new AppError('Team ID and invitee ID are required', 400));
  }

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  
  if (String(team.owner) !== String(req.user.id)) {
    return next(new AppError('Only the owner can invite', 403));
  }
  
  if (String(team.owner) === String(inviteeId)) {
    return next(new AppError('Owner is already part of the team', 400));
  }
  
  if (team.members.some((m) => String(m) === String(inviteeId))) {
    return next(new AppError('User already a member', 400));
  }

  const existing = await TeamInvitation.findOne({ 
    team: teamId, 
    invitee: inviteeId, 
    status: 'pending' 
  });
  
  if (existing) {
    return next(new AppError('An active invitation already exists', 400));
  }

  const invitation = await TeamInvitation.create({ 
    team: teamId, 
    invitedBy: req.user.id, 
    invitee: inviteeId 
  });
  
  console.log('Invitation created:', invitation);
  res.status(201).json({ status: 'success', data: { invitation } });
});

// List invitations for current user
exports.getInvitations = catchAsync(async (req, res, next) => {
  const invitations = await TeamInvitation.find({ invitee: req.user.id, status: 'pending' })
    .populate('team', 'name')
    .populate('invitedBy', 'name email');
  
  console.log('Found invitations for user:', req.user.id, invitations.length);
  res.status(200).json({ status: 'success', results: invitations.length, data: { invitations } });
});

// Accept or reject invitation
exports.respondToInvitation = catchAsync(async (req, res, next) => {
  const { invitationId } = req.params;
  const { action } = req.body; // 'accept' | 'reject'
  
  console.log('Responding to invitation:', invitationId, action, 'by user:', req.user.id);
  
  const invitation = await TeamInvitation.findOne({ _id: invitationId, invitee: req.user.id });
  if (!invitation) {
    console.log('Invitation not found:', invitationId);
    return next(new AppError('Invitation not found', 404));
  }
  
  if (invitation.status !== 'pending') {
    console.log('Invitation already handled:', invitation.status);
    return next(new AppError('Invitation already handled', 400));
  }

  if (action === 'accept') {
    invitation.status = 'accepted';
    await invitation.save();
    await Team.findByIdAndUpdate(invitation.team, { $addToSet: { members: req.user.id } });
    console.log('Invitation accepted, user added to team');
  } else if (action === 'reject') {
    invitation.status = 'rejected';
    await invitation.save();
    console.log('Invitation rejected');
  } else {
    return next(new AppError('Invalid action', 400));
  }

  res.status(200).json({ status: 'success', data: { invitation } });
});

// Remove a member (owner only)
exports.removeMember = catchAsync(async (req, res, next) => {
  const { teamId, memberId } = req.body;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  if (String(team.owner) !== String(req.user.id)) return next(new AppError('Only the owner can remove members', 403));
  await Team.findByIdAndUpdate(teamId, { $pull: { members: memberId } });
  res.status(200).json({ status: 'success' });
});

// Team-scoped tasks with permissions
exports.getTeamTasks = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  const isOwner = String(team.owner) === String(req.user.id);
  const isMember = team.members.some((m) => String(m) === String(req.user.id));
  if (!isOwner && !isMember) return next(new AppError('Forbidden', 403));

  const tasks = await Task.find({ team: teamId });
  res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
});

exports.createTeamTask = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  if (String(team.owner) !== String(req.user.id)) return next(new AppError('Only the owner can create tasks', 403));
  const task = await Task.create({ ...req.body, team: teamId, createdBy: req.user.id });
  res.status(201).json({ status: 'success', data: { task } });
});

exports.updateTeamTask = catchAsync(async (req, res, next) => {
  const { teamId, taskId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  const isOwnerOrMember =
    String(team.owner) === String(req.user.id) ||
    team.members.some((m) => String(m) === String(req.user.id));
  if (!isOwnerOrMember) return next(new AppError('Forbidden', 403));

  const existing = await Task.findOne({ _id: taskId, team: teamId });
  if (!existing) return next(new AppError('Task not found', 404));

  const isCreator = String(existing.createdBy) === String(req.user.id);

  // If not the creator, only allow status updates
  const updates = { ...req.body };
  if (!isCreator) {
    Object.keys(updates).forEach((k) => {
      if (k !== 'status') delete updates[k];
    });
    if (updates.status == null) {
      return next(new AppError('Only status can be updated by members', 403));
    }
  }

  updates.updatedAt = Date.now();
  if (updates.status === 'completed') updates.completionTime = Date.now();

  const task = await Task.findOneAndUpdate({ _id: taskId, team: teamId }, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { task } });
});

exports.deleteTeamTask = catchAsync(async (req, res, next) => {
  const { teamId, taskId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  const toDelete = await Task.findOne({ _id: taskId, team: teamId });
  if (!toDelete) return next(new AppError('Task not found', 404));
  if (String(toDelete.createdBy) !== String(req.user.id)) {
    return next(new AppError('Only the task creator can delete this task', 403));
  }
  await Task.deleteOne({ _id: taskId, team: teamId });
  res.status(204).json({ status: 'success', data: null });
});

// -----------------------
// Team Meetings
// -----------------------

// List meetings for a team (owner or member)
exports.getTeamMeetings = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  const isOwner = String(team.owner) === String(req.user.id);
  const isMember = team.members.some((m) => String(m) === String(req.user.id));
  if (!isOwner && !isMember) return next(new AppError('Forbidden', 403));

  const meetings = await Meeting.find({ team: teamId })
    .sort({ startAt: 1 })
    .populate('attendees', 'name email');

  res.status(200).json({ status: 'success', results: meetings.length, data: { meetings } });
});

// Create a meeting (owner only for simplicity)
exports.createTeamMeeting = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));
  if (String(team.owner) !== String(req.user.id)) return next(new AppError('Only the owner can create meetings', 403));

  const payload = {
    team: teamId,
    title: req.body.title,
    description: req.body.description,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    link: req.body.link,
    attendees: (req.body.attendees || []).filter(Boolean),
    createdBy: req.user.id,
  };

  if (!payload.title || !payload.startAt) {
    return next(new AppError('Title and start time are required', 400));
  }

  const meeting = await Meeting.create(payload);
  res.status(201).json({ status: 'success', data: { meeting } });
});

// Update a meeting (owner or creator). Members can only RSVP in future iteration
exports.updateTeamMeeting = catchAsync(async (req, res, next) => {
  const { teamId, meetingId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));

  const meeting = await Meeting.findOne({ _id: meetingId, team: teamId });
  if (!meeting) return next(new AppError('Meeting not found', 404));

  const isOwner = String(team.owner) === String(req.user.id);
  const isCreator = String(meeting.createdBy) === String(req.user.id);
  if (!isOwner && !isCreator) return next(new AppError('Forbidden', 403));

  const updates = {
    title: req.body.title,
    description: req.body.description,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    link: req.body.link,
    attendees: req.body.attendees,
  };

  Object.keys(updates).forEach((k) => updates[k] == null && delete updates[k]);

  const updated = await Meeting.findOneAndUpdate({ _id: meetingId, team: teamId }, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { meeting: updated } });
});

// Delete a meeting (owner or creator)
exports.deleteTeamMeeting = catchAsync(async (req, res, next) => {
  const { teamId, meetingId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));

  const meeting = await Meeting.findOne({ _id: meetingId, team: teamId });
  if (!meeting) return next(new AppError('Meeting not found', 404));

  const isOwner = String(team.owner) === String(req.user.id);
  const isCreator = String(meeting.createdBy) === String(req.user.id);
  if (!isOwner && !isCreator) return next(new AppError('Forbidden', 403));

  await Meeting.deleteOne({ _id: meetingId, team: teamId });
  res.status(204).json({ status: 'success', data: null });
});

