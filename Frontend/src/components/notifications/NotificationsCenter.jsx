import { useState, useEffect } from 'react'
import { useTeams } from '../context/TeamsContext'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { Bell, CheckCircle, Clock, AlertCircle, Users, CheckSquare, Calendar, Filter, Search, Archive, MessageSquare, Trash2 } from 'lucide-react'
import axios from 'axios'
const api = axios.create({ baseURL: 'https://trilo.up.railway.app/api/v1' })
api.interceptors.request.use((config)=>{
  const token = localStorage.getItem('taskmanager_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})
import { toast } from 'react-hot-toast'

const NotificationsCenter = () => {
  const { user } = useAuth()
  const { invitations, respondInvitation } = useTeams()
  const { tasks } = useTasks()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [readNotifications, setReadNotifications] = useState(new Set())

  // Load read notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('readNotifications')
    if (saved) {
      try {
        setReadNotifications(new Set(JSON.parse(saved)))
      } catch (e) {
        console.error('Failed to load read notifications:', e)
      }
    }
  }, [])

  // Generate notifications from existing data plus unread messages
  useEffect(() => {
    const buildBaseNotifications = () => {
      const notifs = []

      // Team invitations
      invitations.forEach(inv => {
        notifs.push({
          id: `inv-${inv._id}`,
          type: 'team-invitation',
          title: 'Team Invitation',
          message: `You've been invited to join team "${inv.team?.name}" by ${inv.invitedBy?.name}`,
          timestamp: new Date(inv.createdAt || Date.now()),
          data: inv,
          isRead: readNotifications.has(`inv-${inv._id}`),
          priority: 'high'
        })
      })

      // Task due dates (due within 24 hours)
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      tasks.forEach(task => {
        if (task.dueDate && new Date(task.dueDate) <= tomorrow && task.status !== 'completed') {
          const dueDate = new Date(task.dueDate)
          const hoursLeft = Math.floor((dueDate - now) / (1000 * 60 * 60))
          
          notifs.push({
            id: `task-${task.id}`,
            type: 'task-due',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due ${hoursLeft > 0 ? `in ${hoursLeft} hours` : 'now'}`,
            timestamp: dueDate,
            data: task,
            isRead: readNotifications.has(`task-${task.id}`),
            priority: hoursLeft <= 2 ? 'urgent' : 'medium'
          })
        }
      })

      return notifs
    }

    const loadWithMessages = async () => {
      try {
        const base = buildBaseNotifications()
        const res = await api.get('/tasks/messages/unread?limit=50')
        const msgs = res.data?.data?.messages || []
        msgs.forEach(m => {
          base.push({
            id: `msg-${m._id}`,
            type: 'message',
            title: `New message on ${m.task?.title || 'task'}`,
            message: `${m.sender?.name || 'Someone'}: ${m.text}`,
            timestamp: new Date(m.createdAt),
            data: m,
            isRead: false,
            priority: 'high'
          })
        })

        base.sort((a, b) => {
          const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          return new Date(b.timestamp) - new Date(a.timestamp)
        })
        setNotifications(base)
      } catch (e) {
        const base = buildBaseNotifications()
        base.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        setNotifications(base)
      }
    }

    loadWithMessages()
  }, [invitations, tasks, readNotifications])

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await respondInvitation(invitationId, action)
      // Remove the notification after responding
      setNotifications(prev => prev.filter(n => n.id !== `inv-${invitationId}`))
      toast.success(`Invitation ${action}ed successfully`)
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
    }
  }

  const markAsRead = (notificationId) => {
    const newReadSet = new Set(readNotifications)
    newReadSet.add(notificationId)
    setReadNotifications(newReadSet)
    localStorage.setItem('readNotifications', JSON.stringify([...newReadSet]))
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    const allNotificationIds = notifications.map(n => n.id)
    const newReadSet = new Set([...readNotifications, ...allNotificationIds])
    setReadNotifications(newReadSet)
    localStorage.setItem('readNotifications', JSON.stringify([...newReadSet]))
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
    toast.success('All notifications marked as read')
  }

  const archiveNotification = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isArchived: true } : n)
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'low': return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
      default: return 'border-gray-300 bg-white dark:bg-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'team-invitation': return <Users className="h-5 w-5 text-blue-600" />
      case 'task-due': return <CheckSquare className="h-5 w-5 text-orange-600" />
      case 'message': return <MessageSquare className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all' && !showArchived) return !notification.isArchived
    if (filter === 'unread') return !notification.isRead && !notification.isArchived
    if (filter === 'team') return notification.type === 'team-invitation' && !notification.isArchived
    if (filter === 'tasks') return notification.type === 'task-due' && !notification.isArchived
    if (showArchived) return notification.isArchived
    return true
  }).filter(notification => 
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Mark All as Read
            </button>
          )}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showArchived 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Archive className="h-4 w-4 mr-2 inline" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'team', 'tasks'].map((filterType) => (
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
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {showArchived ? 'No archived notifications' : 'No notifications found'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 p-4 transition-all hover:shadow-md ${
                getPriorityColor(notification.priority)
              } ${notification.isRead ? 'opacity-75' : ''} ${notification.type === 'message' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30' : ''}`}
              onClick={() => {
                if (notification.type === 'message' && notification.data?.task?._id) {
                  const tid = notification.data.task._id
                  window.location.href = `/assigned?taskId=${tid}`
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.timestamp.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                        notification.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  
                  {notification.type === 'team-invitation' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInvitationResponse(notification.data._id, 'accept')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInvitationResponse(notification.data._id, 'reject')}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        if (notification.type === 'message' && notification.data?._id) {
                          await api.delete(`/tasks/messages/${notification.data._id}`)
                        }
                      } catch (err) {}
                      setNotifications(prev => prev.filter(n => n.id !== notification.id))
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => archiveNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Archive notification"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsCenter
