import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAuth } from './AuthContext'

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' })
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskmanager_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

const TeamsContext = createContext()

export const useTeams = () => {
  const ctx = useContext(TeamsContext)
  if (!ctx) throw new Error('useTeams must be used within TeamsProvider')
  return ctx
}

export const TeamsProvider = ({ children }) => {
  const { user } = useAuth()
  const [ownedTeams, setOwnedTeams] = useState([])
  const [joinedTeams, setJoinedTeams] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOwnedTeams = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/teams/owned')
      setOwnedTeams(res.data.data.teams)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load owned teams')
    }
  }, [user])

  const loadJoinedTeams = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/teams/joined')
      setJoinedTeams(res.data.data.teams)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load joined teams')
    }
  }, [user])

  const loadInvitations = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/teams/invitations')
      const newInvitations = res.data.data.invitations
      
      // Check if there are new invitations (more than before)
      if (newInvitations.length > invitations.length && invitations.length > 0) {
        // Play notification sound for new invitations
        playNotificationSound()
        
        // Show toast notification for new invitations
        const newCount = newInvitations.length - invitations.length
        if (newCount > 0) {
          toast.success(`You have ${newCount} new team invitation${newCount > 1 ? 's' : ''}!`, {
            duration: 4000,
            icon: '🎉',
          })
        }
      }
      
      setInvitations(newInvitations)
    } catch (err) {
      console.error('Failed to load invitations:', err)
      toast.error(err.response?.data?.message || 'Failed to load invitations')
    }
  }, [user, invitations.length])

  // Simple notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Simple, subtle notification tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0.03, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (error) {
      console.log('Audio notification not supported:', error)
    }
  }

  // Auto-refresh teams data when user changes
  useEffect(() => {
    if (user) {
      loadOwnedTeams()
      loadJoinedTeams()
      loadInvitations()
    } else {
      // Clear data when user logs out
      setOwnedTeams([])
      setJoinedTeams([])
      setInvitations([])
    }
  }, [user, loadOwnedTeams, loadJoinedTeams, loadInvitations])

  // Periodic refresh of invitations for real-time notifications
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      loadInvitations()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [user, loadInvitations])

  // Smart notification system
  const sendSmartNotification = (type, data) => {
    switch (type) {
      case 'team-created':
        toast.success(`Team "${data.name}" created successfully!`, {
          duration: 3000,
          icon: '🎯',
        })
        break
      case 'member-joined':
        toast.success(`${data.memberName} joined your team!`, {
          duration: 3000,
          icon: '👋',
        })
        break
      case 'invitation-sent':
        toast.success(`Invitation sent to ${data.inviteeName}!`, {
          duration: 3000,
          icon: '📤',
        })
        break
      case 'task-completed':
        toast.success(`Task "${data.title}" completed!`, {
          duration: 3000,
          icon: '✅',
        })
        break
      default:
        break
    }
  }

  // Enhanced invitation response with smart notifications
  const respondInvitation = async (invitationId, action) => {
    try {
      const res = await api.patch(`/teams/invitations/${invitationId}`, { action })
      if (res.data?.status !== 'success') throw new Error('Failed to respond to invitation')
      
      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitationId))
      
      // If accepted, refresh teams lists
      if (action === 'accept') {
        await loadOwnedTeams()
        await loadJoinedTeams()
        
        // Find the invitation data for smart notification
        const invitation = invitations.find(inv => inv._id === invitationId)
        if (invitation) {
          sendSmartNotification('member-joined', { 
            memberName: user?.name || 'New member',
            teamName: invitation.team?.name 
          })
        }
      }
      
      toast.success(`Invitation ${action}ed successfully`)
      return true
    } catch (err) {
      console.error('Invitation response error:', err)
      toast.error(err.response?.data?.message || 'Failed to respond to invitation')
      return false
    }
  }

  // Enhanced team creation with smart notifications
  const createTeam = async (name) => {
    setLoading(true)
    try {
      const res = await api.post('/teams', { name })
      sendSmartNotification('team-created', { name })
      await loadOwnedTeams()
      return res.data.data.team
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Enhanced invite function with smart notifications
  const invite = async (teamId, inviteeId) => {
    try {
      const res = await api.post('/teams/invite', { teamId, inviteeId })
      if (res.data?.status !== 'success') throw new Error('Invite failed')
      
      // Get invitee name for smart notification
      try {
        const userRes = await api.get(`/users/${inviteeId}`)
        const inviteeName = userRes.data.data.user.name
        sendSmartNotification('invitation-sent', { inviteeName })
      } catch (userErr) {
        // Fallback if user fetch fails
        sendSmartNotification('invitation-sent', { inviteeName: 'User' })
      }
      
      return true
    } catch (err) {
      console.error('Invite error:', err)
      toast.error(err.response?.data?.message || 'Failed to send invite')
      return false
    }
  }

  const removeMember = async (teamId, memberId) => {
    try {
      await api.post('/teams/remove-member', { teamId, memberId })
      toast.success('Member removed')
      await loadOwnedTeams()
      await loadJoinedTeams()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadOwnedTeams(),
      loadJoinedTeams(),
      loadInvitations()
    ])
  }, [loadOwnedTeams, loadJoinedTeams, loadInvitations])

  const value = {
    ownedTeams,
    joinedTeams,
    invitations,
    loading,
    loadOwnedTeams,
    loadJoinedTeams,
    loadInvitations,
    createTeam,
    invite,
    respondInvitation,
    removeMember,
    refreshAll,
  }

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
}


