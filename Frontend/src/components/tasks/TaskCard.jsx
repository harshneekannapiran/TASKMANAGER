import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  MoreVertical
} from 'lucide-react'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' })

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskmanager_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [users, setUsers] = useState([])

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data.users.map(u => ({ ...u, id: u._id })));
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Helper function to get user name by ID
  const getUserName = (userId) => {
    if (!userId) return 'Unassigned';
    if (userId === user?.id) return 'You';
    
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const isOverdue = () => {
    if (!task.dueDate || task.status === 'completed') return false
    return new Date(task.dueDate) < new Date()
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusOptions = () => {
    const options = ['todo', 'in-progress', 'completed']
    return options.filter(option => option !== task.status)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="relative ml-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <Link
                  to={`/tasks/edit/${task.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Link>
                <button
                  onClick={() => {
                    onDelete(task.id)
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            {task.priority && (
              <div className="flex items-center space-x-1">
                {getPriorityIcon(task.priority)}
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            )}
          </div>
          
          {/* Status Change Dropdown */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className={`text-sm ${isOverdue() ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
              Due: {formatDate(task.dueDate)}
              {isOverdue() && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Assignee */}
        {task.assignedTo && (
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Assigned to: {getUserName(task.assignedTo)}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {formatDate(task.createdAt)}</span>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <span>Updated: {formatDate(task.updatedAt)}</span>
          )}
        </div>

        {/* Completion Time for completed tasks */}
        {task.status === 'completed' && task.completionTime && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Completed: {formatDate(task.completionTime)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard 