import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Components
import LandingPage from './components/LandingPage'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Dashboard from './components/dashboard/Dashboard'
import TaskList from './components/tasks/TaskList'
import TaskForm from './components/tasks/TaskForm'
import CalendarView from './components/calendar/CalendarView'
import PomodoroTimer from './components/timer/PomodoroTimer'
import DailyReport from './components/reports/DailyReport'
import Navbar from './components/layout/Navbar'
import { ThemeProvider } from './components/context/ThemeProvider'
import { TeamsProvider } from './components/context/TeamsContext'
import TeamsHome from './components/teams/TeamsHome'
import TeamDashboard from './components/teams/TeamDashboard'

// Context
import { AuthProvider, useAuth } from './components/context/AuthContext'
import { TaskProvider } from './components/context/TaskContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <TeamsProvider>
          <Router>
            <div className="app">
              <Toaster position="top-right" />
              <AppContent />
            </div>
          </Router>
          </TeamsProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      {user && <Navbar />}
      <main className={user ? "main-content" : ""}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/tasks" element={user ? <TaskList /> : <Navigate to="/" />} />
          <Route path="/tasks/new" element={user ? <TaskForm /> : <Navigate to="/" />} />
          <Route path="/tasks/edit/:id" element={user ? <TaskForm /> : <Navigate to="/" />} />
          <Route path="/calendar" element={user ? <CalendarView /> : <Navigate to="/" />} />
          <Route path="/timer" element={user ? <PomodoroTimer /> : <Navigate to="/" />} />
          <Route path="/report" element={user ? <DailyReport /> : <Navigate to="/" />} />
          {/* Teams */}
          <Route path="/teams" element={user ? <TeamsHome /> : <Navigate to="/" />} />
          <Route path="/teams/:teamId" element={user ? <TeamDashboard /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </>
  )
}

export default App
