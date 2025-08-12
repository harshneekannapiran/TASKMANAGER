import { useState } from 'react'
import { useTeams } from '../context/TeamsContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const TeamsHome = () => {
  const { user } = useAuth()
  const {
    ownedTeams,
    joinedTeams,
    invitations,
    createTeam,
    respondInvitation,
  } = useTeams()
  const [teamName, setTeamName] = useState('')
  const navigate = useNavigate()

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) return
    const team = await createTeam(teamName.trim())
    setTeamName('')
    navigate(`/teams/${team._id}`)
  }

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await respondInvitation(invitationId, action)
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Teams</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create a Team</h2>
          <form onSubmit={handleCreate} className="flex space-x-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invitations</h2>
          {invitations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No pending invitations</p>
          ) : (
            <ul className="space-y-3">
              {invitations.map((inv) => (
                <li key={inv._id} className="flex items-center justify-between">
                  <span className="text-gray-800 dark:text-gray-200">Invitation to team {inv.team?.name} from {inv.invitedBy?.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleInvitationResponse(inv._id, 'accept')}
                      className="px-3 py-1 rounded bg-green-600 text-white"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(inv._id, 'reject')}
                      className="px-3 py-1 rounded bg-gray-600 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teams You Own</h2>
          {ownedTeams.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No teams created</p>
          ) : (
            <ul className="space-y-3">
              {ownedTeams.map((t) => (
                <li key={t._id}>
                  <Link className="text-blue-600" to={`/teams/${t._id}`}>{t.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teams You've Joined</h2>
          {joinedTeams.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Not a member of any team</p>
          ) : (
            <ul className="space-y-3">
              {joinedTeams.map((t) => (
                <li key={t._id}>
                  <Link className="text-blue-600" to={`/teams/${t._id}`}>{t.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamsHome


