import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTeams } from '../context/TeamsContext'
import { toast } from 'react-hot-toast'

const api = axios.create({ baseURL: 'https://trilo.up.railway.app/api/v1' })
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskmanager_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

const TeamDashboard = () => {
  const { teamId } = useParams()
  const { user } = useAuth()
  const { loadInvitations } = useTeams()
  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [users, setUsers] = useState([])
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviting, setInviting] = useState(false)
  // Meetings
  const [meetings, setMeetings] = useState([])
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingStartAt, setMeetingStartAt] = useState('')
  const [meetingEndAt, setMeetingEndAt] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [creatingMeeting, setCreatingMeeting] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'meetings'

  const isOwner = team && String(team.owner?._id || team.owner) === String(user?.id)
  const teamMemberIds = useMemo(() => {
    if (!team) return []
    const ownerId = String(team.owner?._id || team.owner)
    const memberIds = (team.members || []).map((m) => String(m?._id || m))
    return [ownerId, ...memberIds]
  }, [team])

  const loadTeam = async () => {
    try {
      const res = await api.get(`/teams/${teamId}`)
      setTeam(res.data.data.team)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load team')
    }
  }

  const loadTasks = async () => {
    try {
      const res = await api.get(`/teams/${teamId}/tasks`)
      setTasks(res.data.data.tasks)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks')
    }
  }

  const loadUsers = async () => {
    try {
      const res = await api.get('/users')
      const normalized = res.data.data.users.map((u) => ({ ...u, id: u._id }))
      setUsers(normalized)
    } catch (_) {}
  }

  useEffect(() => {
    loadTeam()
    loadTasks()
    loadUsers()
    loadInvitations() // Refresh invitations when component mounts
    loadMeetings()
  }, [teamId, loadInvitations])

  const loadMeetings = async () => {
    try {
      const res = await api.get(`/teams/${teamId}/meetings`)
      setMeetings(res.data.data.meetings)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load meetings')
    }
  }

  const createMeeting = async (e) => {
    e.preventDefault()
    if (!meetingTitle.trim() || !meetingStartAt) return
    setCreatingMeeting(true)
    try {
      const payload = {
        title: meetingTitle.trim(),
        startAt: new Date(meetingStartAt).toISOString(),
        endAt: meetingEndAt ? new Date(meetingEndAt).toISOString() : undefined,
        link: meetingLink || undefined,
      }
      const res = await api.post(`/teams/${teamId}/meetings`, payload)
      setMeetings((prev) => [...prev, res.data.data.meeting].sort((a,b)=> new Date(a.startAt)-new Date(b.startAt)))
      setMeetingTitle('')
      setMeetingStartAt('')
      setMeetingEndAt('')
      setMeetingLink('')
      toast.success('Meeting created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create meeting')
    } finally {
      setCreatingMeeting(false)
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await api.post(`/teams/${teamId}/tasks`, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
        tags: tags
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
      })
      setTitle('')
      setDescription('')
      setAssignedTo('')
      setStatus('todo')
      setPriority('medium')
      setDueDate('')
      setTags('')
      setTasks((prev) => [...prev, res.data.data.task])
      toast.success('Task created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    try {
      const res = await api.patch(`/teams/${teamId}/tasks/${taskId}`, { status })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.data.task : t)))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/teams/${teamId}/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task')
    }
  }

  const sendInvite = async (e) => {
    e.preventDefault()
    if (!inviteUserId) return
    setInviting(true)
    try {
      await api.post('/teams/invite', { teamId, inviteeId: inviteUserId })
      toast.success('Invitation sent')
      setInviteUserId('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (memberId) => {
    try {
      await api.post('/teams/remove-member', { teamId, memberId })
      toast.success('Member removed')
      await loadTeam()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const deleteMeeting = async (meetingId) => {
    try {
      await api.delete(`/teams/${teamId}/meetings/${meetingId}`)
      setMeetings((prev) => prev.filter((m) => m._id !== meetingId))
      toast.success('Meeting deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete meeting')
    }
  }

  const getUserName = (userId) => {
    if (!userId) return 'Unassigned'
    if (String(userId) === String(user?.id)) return 'You'
    // Check populated team members first
    const fromTeam = (team?.members || []).find((m) => String(m?._id || m) === String(userId))
    if (fromTeam?.name) return fromTeam.name
    if (String(team?.owner?._id || team?.owner) === String(userId)) return team?.owner?.name || 'Owner'
    const fromUsers = users.find((u) => String(u.id) === String(userId))
    return fromUsers?.name || 'Unknown'
  }

  const priorityBadgeClasses = (priorityValue) => {
    switch (priorityValue) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{team?.name}</p>

      {/* Members and Invite (owner only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Members</h2>
          <ul className="space-y-3">
            {team && (
              <li className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{team.owner?.name || 'Owner'}</span>
                <span className="text-xs rounded px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Owner</span>
              </li>
            )}
            {(team?.members || []).map((m) => (
              <li key={m._id || m} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{m.name || m}</span>
                {isOwner && (
                  <button
                    onClick={() => removeMember(m._id || m)}
                    className="text-xs px-2 py-1 rounded bg-red-600 text-white"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        {isOwner && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite Member</h2>
            <form onSubmit={sendInvite} className="flex space-x-2">
              <select
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select user</option>
                {users
                  .filter((u) => !teamMemberIds.includes(String(u.id)))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
              <button disabled={inviting || !inviteUserId} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <button
          className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab === 'meetings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
          onClick={() => setActiveTab('meetings')}
        >
          Meetings
        </button>
      </div>

      {activeTab === 'tasks' && isOwner && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <form onSubmit={createTask} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <input
              type="date"
              placeholder="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <button disabled={loading || !title.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'meetings' && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Meetings</h2>
        </div>
        {isOwner && (
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Create Meeting</h3>
              <form onSubmit={createMeeting} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Meeting title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="datetime-local"
                  placeholder="Start time"
                  value={meetingStartAt}
                  onChange={(e) => setMeetingStartAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                {showEndTime && (
                  <input
                    type="datetime-local"
                    placeholder="End time (optional)"
                    value={meetingEndAt}
                    onChange={(e) => setMeetingEndAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                )}
                <input
                  type="url"
                  placeholder="Meeting link (optional)"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEndTime((s) => !s)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showEndTime ? 'Remove end time' : 'Add end time'}
                  </button>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    disabled={creatingMeeting || !meetingTitle.trim() || !meetingStartAt}
                    className="px-4 py-2 !bg-blue-600 hover:!bg-blue-700 text-white rounded-md disabled:opacity-60"
                  >
                    {creatingMeeting ? 'Creating…' : 'Create Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {meetings.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No meetings scheduled</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {meetings.map((m) => (
              <li key={m._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {new Date(m.startAt).toLocaleString()} {m.endAt ? `- ${new Date(m.endAt).toLocaleString()}` : ''}
                  </p>
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 underline">
                      Join link
                    </a>
                  )}
                </div>
                {(isOwner || String(m.createdBy) === String(user?.id)) && (
                  <button
                    onClick={() => deleteMeeting(m._id)}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      {activeTab === 'tasks' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['todo', 'in-progress', 'completed'].map((col) => (
          <div key={col} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{col.replace('-', ' ')}</h3>
            </div>
            <div
              className="p-4 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const taskId = e.dataTransfer.getData('text/plain')
                updateStatus(taskId, col)
              }}
            >
              {tasks.filter((t) => t.status === col).length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">No tasks</p>
              ) : (
                tasks
                  .filter((t) => t.status === col)
                  .map((t) => (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', t._id)}
                      className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{t.description}</p>
                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        {t.priority && (
                          <span className={`px-2 py-0.5 rounded text-xs ${priorityBadgeClasses(t.priority)}`}>
                            {t.priority}
                          </span>
                        )}
                        {t.assignedTo && (
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                            {getUserName(t.assignedTo)}
                          </span>
                        )}
                      </div>
                      
                      {/* Completion Time for completed tasks */}
                      {t.status === 'completed' && t.completionTime && (
                        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Completed: {new Date(t.completionTime).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center space-x-2">
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t._id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        {isOwner && (
                          <button onClick={() => deleteTask(t._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default TeamDashboard


