import { useState, useEffect } from 'react'
import { useTeams } from '../context/TeamsContext'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { Activity, Users, CheckSquare, Calendar, Clock, TrendingUp, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'

const ActivityFeed = () => {
  const { user } = useAuth()
  const { ownedTeams, joinedTeams, invitations } = useTeams()
  const { tasks } = useTasks()
  const [activities, setActivities] = useState([])
  const [filter, setFilter] = useState('all')
  const [showRealTime, setShowRealTime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Generate activities from existing data
  useEffect(() => {
    const generateActivities = () => {
      const acts = []

      // Team activities
      ownedTeams.forEach(team => {
        acts.push({
          id: `team-${team._id}`,
          type: 'team',
          title: 'Team Created',
          message: `You created team "${team.name}"`,
          timestamp: new Date(team.createdAt || Date.now()),
          data: team,
          icon: 'team',
          category: 'teams'
        })
      })

      joinedTeams.forEach(team => {
        acts.push({
          id: `joined-${team._id}`,
          type: 'team-joined',
          title: 'Team Joined',
          message: `You joined team "${team.name}"`,
          timestamp: new Date(team.createdAt || Date.now()),
          data: team,
          icon: 'team-joined',
          category: 'teams'
        })
      })

      // Task activities
      tasks.forEach(task => {
        if (task.status === 'completed') {
          acts.push({
            id: `task-completed-${task.id}`,
            type: 'task-completed',
            title: 'Task Completed',
            message: `Task "${task.title}" was completed`,
            timestamp: new Date(task.completionTime || Date.now()),
            data: task,
            icon: 'task-completed',
            category: 'tasks'
          })
        }

        if (task.assignedTo && task.assignedTo !== task.createdBy) {
          acts.push({
            id: `task-assigned-${task.id}`,
            type: 'task-assigned',
            title: 'Task Assigned',
            message: `Task "${task.title}" was assigned to you`,
            timestamp: new Date(task.createdAt || Date.now()),
            data: task,
            icon: 'task-assigned',
            category: 'tasks'
          })
        }
      })

      // Invitation activities
      invitations.forEach(inv => {
        acts.push({
          id: `inv-${inv._id}`,
          type: 'invitation',
          title: 'Team Invitation',
          message: `You were invited to join team "${inv.team?.name}" by ${inv.invitedBy?.name}`,
          timestamp: new Date(inv.createdAt || Date.now()),
          data: inv,
          icon: 'invitation',
          category: 'teams'
        })
      })

      // Sort by timestamp (newest first)
      acts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setActivities(acts)
    }

    generateActivities()
  }, [ownedTeams, joinedTeams, invitations, tasks])

  // Real-time updates simulation
  useEffect(() => {
    if (!showRealTime) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // In a real app, you'd fetch new activities here
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [showRealTime])

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'team':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'team-joined':
        return <Users className="h-5 w-5 text-green-600" />
      case 'task-completed':
        return <CheckSquare className="h-5 w-5 text-green-600" />
      case 'task-assigned':
        return <CheckSquare className="h-5 w-5 text-orange-600" />
      case 'invitation':
        return <Users className="h-5 w-5 text-purple-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'teams': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'tasks': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'projects': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.category === filter
  })

  const refreshActivities = () => {
    setLastUpdate(new Date())
    // In a real app, you'd refetch activities here
  }

  const getActivityStats = () => {
    const total = activities.length
    const teams = activities.filter(a => a.category === 'teams').length
    const tasks = activities.filter(a => a.category === 'tasks').length
    const today = activities.filter(a => {
      const today = new Date()
      const activityDate = new Date(a.timestamp)
      return activityDate.toDateString() === today.toDateString()
    }).length

    return { total, teams, tasks, today }
  }

  const stats = getActivityStats()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Stay updated with all your team and task activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRealTime(!showRealTime)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
              showRealTime 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {showRealTime ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showRealTime ? 'Real-time On' : 'Real-time Off'}
          </button>
          <button
            onClick={refreshActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Activities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.teams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Task Activities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'teams', 'tasks'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No activities found</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                      {activity.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(activity.timestamp)}
                    </span>
                    {activity.data && (
                      <Link
                        to={activity.type.includes('team') ? `/teams/${activity.data._id}` : `/tasks/edit/${activity.data.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityFeed
