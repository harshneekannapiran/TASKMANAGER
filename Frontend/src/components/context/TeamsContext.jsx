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
      setInvitations(res.data.data.invitations)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invitations')
    }
  }, [user])

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

  const createTeam = async (name) => {
    setLoading(true)
    try {
      const res = await api.post('/teams', { name })
      toast.success('Team created')
      await loadOwnedTeams()
      return res.data.data.team
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const invite = async (teamId, inviteeId) => {
    try {
      const res = await api.post('/teams/invite', { teamId, inviteeId })
      if (res.data?.status !== 'success') throw new Error('Invite failed')
      toast.success('Invitation sent')
      return true
    } catch (err) {
      console.error('Invite error:', err)
      toast.error(err.response?.data?.message || 'Failed to send invite')
      return false
    }
  }

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
      }
      
      toast.success(`Invitation ${action}ed successfully`)
      return true
    } catch (err) {
      console.error('Invitation response error:', err)
      toast.error(err.response?.data?.message || 'Failed to respond to invitation')
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


