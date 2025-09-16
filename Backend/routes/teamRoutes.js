const express = require('express');
const { protect } = require('../middleware/auth');
const teamController = require('../controllers/teamController');

const router = express.Router();
router.use(protect);

// Team management
router.post('/', teamController.createTeam);
router.get('/owned', teamController.getOwnedTeams);
router.get('/joined', teamController.getJoinedTeams);

// Invitations
router.post('/invite', teamController.inviteToTeam);
router.get('/invitations', teamController.getInvitations);
router.patch('/invitations/:invitationId', teamController.respondToInvitation);
router.post('/remove-member', teamController.removeMember);

// Team tasks
router.get('/:teamId', teamController.getTeam);
router.get('/:teamId/tasks', teamController.getTeamTasks);
router.post('/:teamId/tasks', teamController.createTeamTask);
router.patch('/:teamId/tasks/:taskId', teamController.updateTeamTask);
router.delete('/:teamId/tasks/:taskId', teamController.deleteTeamTask);

// Meetings
router.get('/:teamId/meetings', teamController.getTeamMeetings);
router.post('/:teamId/meetings', teamController.createTeamMeeting);
router.patch('/:teamId/meetings/:meetingId', teamController.updateTeamMeeting);
router.delete('/:teamId/meetings/:meetingId', teamController.deleteTeamMeeting);

module.exports = router;


