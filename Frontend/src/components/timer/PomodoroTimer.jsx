import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { toast } from 'react-hot-toast'
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const PomodoroTimer = () => {
  const { user } = useAuth()
  const { getTasksByUser } = useTasks()
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionType, setSessionType] = useState('work') // 'work' or 'break'
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  })
  const [selectedTask, setSelectedTask] = useState('')
  const intervalRef = useRef(null)

  const userTasks = getTasksByUser(user?.id)
  const activeTasks = userTasks.filter(task => task.status !== 'completed')

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  useEffect(() => {
    // Reset timer when session type changes
    const duration = sessionType === 'work' ? settings.workDuration : settings.breakDuration
    setTimeLeft(duration * 60)
  }, [sessionType, settings])

  const handleSessionComplete = () => {
    setIsRunning(false)
    
    if (sessionType === 'work') {
      setCompletedSessions(prev => prev + 1)
      toast.success('Work session completed! Take a break.')
      
      // Check if it's time for a long break
      if ((completedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setSessionType('longBreak')
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setSessionType('break')
        setTimeLeft(settings.breakDuration * 60)
      }
    } else {
      toast.success('Break completed! Back to work.')
      setSessionType('work')
      setTimeLeft(settings.workDuration * 60)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    const duration = sessionType === 'work' ? settings.workDuration : 
                    sessionType === 'break' ? settings.breakDuration : 
                    settings.longBreakDuration
    setTimeLeft(duration * 60)
  }

  const skipSession = () => {
    handleSessionComplete()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalDuration = sessionType === 'work' ? settings.workDuration * 60 :
                         sessionType === 'break' ? settings.breakDuration * 60 :
                         settings.longBreakDuration * 60
    return ((totalDuration - timeLeft) / totalDuration) * 100
  }

  const getSessionTypeColor = () => {
    switch (sessionType) {
      case 'work':
        return 'text-red-600 dark:text-red-400'
      case 'break':
        return 'text-green-600 dark:text-green-400'
      case 'longBreak':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSessionTypeIcon = () => {
    switch (sessionType) {
      case 'work':
        return <AlertCircle className="h-6 w-6" />
      case 'break':
      case 'longBreak':
        return <CheckCircle className="h-6 w-6" />
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Stay focused and productive with timed work sessions
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-8">
              {/* Session Type */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center space-x-2 text-lg font-medium ${getSessionTypeColor()}`}>
                  {getSessionTypeIcon()}
                  <span>
                    {sessionType === 'work' ? 'Work Session' :
                     sessionType === 'break' ? 'Short Break' : 'Long Break'}
                  </span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                  {formatTime(timeLeft)}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-lg font-medium rounded-lg transition-colors"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={skipSession}
                  className="inline-flex items-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </button>
                
                <button
                  onClick={resetTimer}
                  className="inline-flex items-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed Sessions:</span>
                <span className="font-medium text-gray-900 dark:text-white">{completedSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Next Long Break:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {settings.sessionsBeforeLongBreak - (completedSessions % settings.sessionsBeforeLongBreak)} sessions
                </span>
              </div>
            </div>
          </div>

          {/* Task Focus */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Focus on Task</h3>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a task to focus on</option>
              {activeTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {selectedTask && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Focusing on: {activeTasks.find(t => t.id === selectedTask)?.title}
                </p>
              </div>
            )}
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.breakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sessions before Long Break
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionsBeforeLongBreak: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer 