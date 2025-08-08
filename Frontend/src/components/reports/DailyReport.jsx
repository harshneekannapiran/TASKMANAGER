import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Target,
  Award
} from 'lucide-react'

const DailyReport = () => {
  const { user } = useAuth()
  const { tasks, getTasksByUser } = useTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reportData, setReportData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    productivity: 0,
    averageCompletionTime: 0
  })

  // Get user tasks and memoize to prevent unnecessary recalculations
  const userTasks = useMemo(() => {
    const userSpecificTasks = getTasksByUser(user?.id)
    console.log('👤 User tasks for user:', user?.id, 'Total tasks:', userSpecificTasks.length)
    console.log('📋 User-specific tasks:', userSpecificTasks)
    
    // If no tasks found for user, try to get all tasks as fallback
    if (userSpecificTasks.length === 0) {
      console.log('⚠️ No tasks found for user, trying fallback...')
      console.log('📋 All available tasks:', tasks)
      return tasks // Use the global tasks array
    }
    
    return userSpecificTasks
  }, [user?.id, getTasksByUser, tasks])

  // Utility function to estimate completion time for tasks without completionTime field
  const estimateCompletionTime = (task) => {
    const created = new Date(task.createdAt)
    let completionDate = new Date()
    
    // If task has due date and it's in the past, use it as completion date
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      if (dueDate < new Date()) {
        completionDate = dueDate
      }
    }
    
    // If task was updated recently (within last 24 hours), use updatedAt
    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      const updated = new Date(task.updatedAt)
      const hoursSinceUpdate = (new Date() - updated) / (1000 * 60 * 60)
      if (hoursSinceUpdate < 24) {
        completionDate = updated
      }
    }
    
    // For completed tasks without completionTime, estimate based on when they were likely completed
    // If the task was created and updated on the same day, assume it took 2 hours
    if (task.status === 'completed' && !task.completionTime) {
      const createdDate = new Date(task.createdAt).toDateString()
      const updatedDate = task.updatedAt ? new Date(task.updatedAt).toDateString() : createdDate
      
      if (createdDate === updatedDate) {
        // Same day completion, estimate 2 hours
        return 2
      } else {
        // Different day, use the time difference
        const timeDiff = (completionDate - created) / (1000 * 60 * 60)
        return Math.max(0.5, Math.min(timeDiff, 24)) // Between 30 minutes and 24 hours
      }
    }
    
    return (completionDate - created) / (1000 * 60 * 60) // Convert to hours
  }



  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0]
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()

    // Filter tasks for selected date
    const tasksForDate = userTasks.filter(task => {
      if (task.dueDate) {
        const taskDate = task.dueDate.split('T')[0]
        return taskDate === dateString
      }
      return false
    })

    // Debug: Log tasks for the selected date
    console.log('🔍 Tasks for date:', dateString, tasksForDate)
    console.log('🔍 User ID:', user?.id)
    console.log('🔍 User tasks count:', userTasks.length)
    console.log('🔍 Tasks for date count:', tasksForDate.length)

    // Calculate statistics
    const totalTasks = tasksForDate.length
    const completedTasks = tasksForDate.filter(task => task.status === 'completed').length
    const pendingTasks = tasksForDate.filter(task => task.status === 'todo' || task.status === 'in-progress').length
    const overdueTasks = tasksForDate.filter(task => {
      if (task.dueDate && task.status !== 'completed') {
        return new Date(task.dueDate) < new Date()
      }
      return false
    }).length

    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate average completion time - improved logic with debug logging
    const completedTasksWithTime = tasksForDate.filter(task => 
      task.status === 'completed' && task.createdAt
    )
    
    console.log('✅ Completed tasks with time:', completedTasksWithTime)
    console.log('✅ Task details:', completedTasksWithTime.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      createdAt: task.createdAt,
      completionTime: task.completionTime,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate
    })))
    
    let totalCompletionTime = 0
    let validCompletionTimes = 0
    
    completedTasksWithTime.forEach(task => {
      try {
        const created = new Date(task.createdAt)
        let completionTime = 0
        let timeSource = 'none'
        
        // If task has a completionTime field, use it
        if (task.completionTime) {
          completionTime = (new Date(task.completionTime) - created) / (1000 * 60 * 60) // Convert to hours
          timeSource = 'completionTime'
        } else {
          // Use the utility function to estimate completion time
          completionTime = estimateCompletionTime(task)
          timeSource = 'estimated'
        }
        
        console.log(`📊 Task "${task.title}":`, {
          id: task.id,
          createdAt: task.createdAt,
          completionTime: task.completionTime,
          updatedAt: task.updatedAt,
          dueDate: task.dueDate,
          calculatedTime: completionTime,
          timeSource: timeSource,
          isValid: completionTime >= 0.01 && completionTime <= 168
        })
        
        // Only count reasonable completion times (between 0.01 hours and 168 hours - 1 week)
        if (completionTime >= 0.01 && completionTime <= 168) {
          totalCompletionTime += completionTime
          validCompletionTimes++
        } else {
          console.log(`⚠️ Task "${task.title}" excluded: completion time ${completionTime}h is outside valid range (0.01-168h)`)
        }
      } catch (error) {
        console.warn('Error calculating completion time for task:', task.id, error)
      }
    })
    
    console.log('📈 Completion time calculation summary:', {
      totalCompletedTasks: completedTasksWithTime.length,
      validCompletionTimes: validCompletionTimes,
      totalCompletionTime: totalCompletionTime,
      averageCompletionTime: validCompletionTimes > 0 ? Math.round((totalCompletionTime / validCompletionTimes) * 10) / 10 : 0
    })
    
    const averageCompletionTime = validCompletionTimes > 0 
      ? Math.round((totalCompletionTime / validCompletionTimes) * 10) / 10 
      : 0

    setReportData({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      productivity,
      averageCompletionTime
    })
  }, [selectedDate, userTasks])



  const getTasksByStatus = (status) => {
    const dateString = selectedDate.toISOString().split('T')[0]
    return userTasks.filter(task => {
      if (task.dueDate) {
        const taskDate = task.dueDate.split('T')[0]
        return taskDate === dateString && task.status === status
      }
      return false
    })
  }

  const getTasksByPriority = (priority) => {
    const dateString = selectedDate.toISOString().split('T')[0]
    return userTasks.filter(task => {
      if (task.dueDate) {
        const taskDate = task.dueDate.split('T')[0]
        return taskDate === dateString && task.priority === priority
      }
      return false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getProductivityColor = (productivity) => {
    if (productivity >= 80) return 'text-green-600 dark:text-green-400'
    if (productivity >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProductivityIcon = (productivity) => {
    if (productivity >= 80) return <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
    if (productivity >= 60) return <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
    return <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Report</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your productivity and task completion
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report for {formatDate(selectedDate)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {reportData.totalTasks} total tasks scheduled
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getProductivityIcon(reportData.productivity)}
              <span className={`text-2xl font-bold ${getProductivityColor(reportData.productivity)}`}>
                {reportData.productivity}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {reportData.completedTasks} of {reportData.totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (reportData.completedTasks / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTasksByStatus('in-progress').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (getTasksByStatus('in-progress').length / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To Do</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTasksByStatus('todo').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (getTasksByStatus('todo').length / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Priority</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTasksByPriority('high').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (getTasksByPriority('high').length / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Priority</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTasksByPriority('medium').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (getTasksByPriority('medium').length / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Priority</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getTasksByPriority('low').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reportData.totalTasks > 0 ? (getTasksByPriority('low').length / reportData.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productivity Insights</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {reportData.productivity}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Productivity Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {reportData.averageCompletionTime < 1 && reportData.averageCompletionTime > 0
                  ? `${Math.round(reportData.averageCompletionTime * 60)} min`
                  : `${reportData.averageCompletionTime}h`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {reportData.overdueTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue Tasks</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {reportData.productivity < 50 && (
                <li>• Focus on completing high-priority tasks first</li>
              )}
              {reportData.overdueTasks > 0 && (
                <li>• Address overdue tasks to improve your completion rate</li>
              )}
              {reportData.pendingTasks > reportData.completedTasks && (
                <li>• Consider breaking down large tasks into smaller, manageable pieces</li>
              )}
              {reportData.productivity >= 80 && (
                <li>• Excellent work! Keep up the great productivity</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyReport