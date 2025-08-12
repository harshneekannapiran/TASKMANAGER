import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar
} from 'lucide-react'

const CalendarView = () => {
  const { user } = useAuth()
  const { getTasksByUser } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([])

  const userTasks = getTasksByUser(user?.id)

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const getTasksForDate = (date) => {
    // Format the date in YYYY-MM-DD format using local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    return userTasks.filter(task => {
      if (task.dueDate) {
        // Handle both ISO string format and date-only format
        let taskDate
        if (task.dueDate.includes('T')) {
          // If it's an ISO string, extract the date part
          taskDate = task.dueDate.split('T')[0]
        } else {
          // If it's already a date string (YYYY-MM-DD), use it directly
          taskDate = task.dueDate
        }
        
        // Debug logging for date comparison
        if (taskDate === dateString) {
          console.log(`📅 Task "${task.title}" matches date ${dateString}`)
        }
        
        // Compare dates in YYYY-MM-DD format
        return taskDate === dateString
      }
      return false
    })
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setTasksForSelectedDate(getTasksForDate(date))
  }

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

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
        return 'border-l-4 border-red-500'
      case 'medium':
        return 'border-l-4 border-yellow-500'
      case 'low':
        return 'border-l-4 border-green-500'
      default:
        return 'border-l-4 border-gray-300'
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View your tasks on a calendar
            </p>
          </div>
          <Link
            to="/tasks/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(currentDate)}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24"></div>
                  }
                  
                  const tasksForDay = getTasksForDate(day)
                  const isCurrentDay = isToday(day)
                  const isSelectedDay = isSelected(day)
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`h-24 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-colors ${
                        isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      } ${
                        isSelectedDay ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {day.getDate()}
                        </span>
                        {tasksForDay.length > 0 && (
                          <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">
                            {tasksForDay.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Task Indicators */}
                      <div className="space-y-1">
                        {tasksForDay.slice(0, 2).map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className={`text-xs p-1 rounded truncate ${getStatusColor(task.status)}`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {tasksForDay.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{tasksForDay.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select a date'}
              </h3>
            </div>
            
            <div className="p-6">
              {selectedDate ? (
                tasksForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {tasksForSelectedDate.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${getPriorityColor(task.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ')}
                              </span>
                              {task.priority && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {task.priority} priority
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/tasks/edit/${task.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No tasks for this date</p>
                    <Link
                      to="/tasks/new"
                      className="mt-4 inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Link>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Click on a date to view tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView 