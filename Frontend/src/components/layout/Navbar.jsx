import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeProvider'
import { useTeams } from '../context/TeamsContext'
import { useTasks } from '../context/TaskContext'
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home, 
  CheckSquare, 
  Calendar, 
  Clock, 
  BarChart3,
  Layers,
  Bell,
  Activity
} from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const { invitations } = useTeams()
  const { tasks } = useTasks()
  const location = useLocation()
  const navigate = useNavigate()

  // Calculate unread notifications count
  const getUnreadNotificationsCount = () => {
    let count = 0
    
    // Team invitations
    count += invitations.length
    
    // Tasks due within 24 hours
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    tasks.forEach(task => {
      if (task.dueDate && new Date(task.dueDate) <= tomorrow && task.status !== 'completed') {
        count++
      }
    })
    
    return count
  }

  const unreadNotificationsCount = getUnreadNotificationsCount()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/timer', label: 'Timer', icon: Clock },
    { path: '/report', label: 'Reports', icon: BarChart3 },
    { path: '/teams', label: 'Teams', icon: Layers, hasNotification: invitations.length > 0, notificationCount: invitations.length },
    { path: '/notifications', label: 'Notifications', icon: Bell, hasNotification: unreadNotificationsCount > 0, notificationCount: unreadNotificationsCount },
    { path: '/activity', label: 'Activity', icon: Activity },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                TRILO
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.hasNotification && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                    {item.notificationCount > 0 && (
                      <div 
                        className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm border border-white dark:border-gray-800"
                        title={`${item.notificationCount} pending team invitation${item.notificationCount > 1 ? 's' : ''}`}
                      >
                        {item.notificationCount > 9 ? '9+' : item.notificationCount}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden md:block text-sm font-medium">
                  {user?.name}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 min-w-[220px] max-w-xs bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors relative ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.hasNotification && (
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                      {item.notificationCount > 0 && (
                        <div 
                          className="h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm border border-white dark:border-gray-800"
                          title={`${item.notificationCount} pending team invitation${item.notificationCount > 1 ? 's' : ''}`}
                        >
                          {item.notificationCount > 9 ? '9+' : item.notificationCount}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
              
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 