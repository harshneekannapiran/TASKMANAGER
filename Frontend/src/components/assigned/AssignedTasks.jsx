import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTeams } from '../context/TeamsContext'
import { useTasks } from '../context/TaskContext'
import { Search, Send, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'

const api = axios.create({ baseURL: 'https://trilo.up.railway.app/api/v1' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskmanager_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

const AssignedTasks = () => {
  const { user } = useAuth()
  const location = useLocation()
  const { tasks } = useTasks()
  const [users, setUsers] = useState([])

  const [view, setView] = useState('byMe') // 'byMe' | 'toMe'
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [chatTask, setChatTask] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)

  const assignedByMe = useMemo(() => {
    return tasks.filter(t => String(t.createdBy) === String(user?.id) && t.assignedTo)
  }, [tasks, user?.id])

  const assignedToMe = useMemo(() => {
    return tasks.filter(t => String(t.assignedTo) === String(user?.id) && String(t.createdBy) !== String(user?.id))
  }, [tasks, user?.id])

  const filtered = useMemo(() => {
    const base = view === 'byMe' ? assignedByMe : assignedToMe
    return base.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (view === 'byMe' && assigneeFilter !== 'all' && String(t.assignedTo) !== assigneeFilter) return false
      if (query && !(`${t.title} ${t.description || ''}`.toLowerCase().includes(query.toLowerCase()))) return false
      return true
    })
  }, [assignedByMe, assignedToMe, view, statusFilter, assigneeFilter, query])

  const uniqueAssignees = useMemo(() => {
    const base = view === 'byMe' ? assignedByMe : assignedToMe
    const set = new Set(base.map(t => String(view === 'byMe' ? t.assignedTo : t.createdBy)).filter(Boolean))
    return Array.from(set)
  }, [assignedByMe, assignedToMe, view])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users')
        setUsers(res.data.data.users.map(u => ({ ...u, id: u._id })))
      } catch (e) {}
    }
    fetchUsers()
  }, [])

  const getUserName = (userId) => {
    const u = users.find(x => String(x.id) === String(userId))
    return u?.name || userId
  }

  const loadMessages = async (taskId) => {
    try {
      setLoadingMessages(true)
      const res = await api.get(`/tasks/${taskId}/messages`)
      setMessages(res.data.data.messages)
      // mark as read
      await api.patch(`/tasks/${taskId}/messages/read`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Polling for messages when chat open
  useEffect(() => {
    if (!chatTask) return
    loadMessages(chatTask.id)
    const id = setInterval(() => loadMessages(chatTask.id), 15000)
    return () => clearInterval(id)
  }, [chatTask])

  const openChat = (task) => {
    setChatTask(task)
    // Hide chatbot bubble if present
    const chatbotToggle = document.querySelector('[title="AI Assistant"]')
    if (chatbotToggle) chatbotToggle.style.display = 'none'
  }

  const sendMessage = async () => {
    const text = msgInput.trim()
    if (!text || !chatTask) return
    try {
      setMsgInput('')
      await api.post(`/tasks/${chatTask.id}/messages`, { text })
      await loadMessages(chatTask.id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    }
  }

  // Open chat from notifications via query param ?taskId=
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const taskId = params.get('taskId')
    if (!taskId || !tasks?.length) return
    const t = tasks.find(x => String(x.id || x._id) === String(taskId))
    if (t) {
      // Set view based on role to make name/filters friendly
      if (String(t.createdBy) === String(user?.id)) setView('byMe')
      else if (String(t.assignedTo) === String(user?.id)) setView('toMe')
      openChat(t)
    }
  }, [location.search, tasks, user?.id])

  const statusBadge = (s) => {
    if (s === 'completed') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    if (s === 'in-progress') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assigned Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Track conversations and status</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1 inline-flex">
          <button onClick={()=>setView('byMe')} className={`px-3 py-1.5 text-sm rounded ${view==='byMe' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>Assigned by me</button>
          <button onClick={()=>setView('toMe')} className={`px-3 py-1.5 text-sm rounded ${view==='toMe' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>Assigned to me</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className={`grid grid-cols-1 ${view === 'byMe' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search title/description" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {view === 'byMe' && (
            <div>
              <select value={assigneeFilter} onChange={(e)=>setAssigneeFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="all">All assignees</option>
                {uniqueAssignees.map(id => (
                  <option key={id} value={id}>{getUserName(id)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 grid grid-cols-12 gap-2">
          <div className="col-span-4">Title</div>
          <div className="col-span-2 text-center">{view==='byMe' ? 'Assignee' : 'Created by'}</div>
          <div className="col-span-2 text-center">Due</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filtered.map(t => (
            <li key={t._id || t.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <div className="font-medium text-gray-900 dark:text-white">{t.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.description}</div>
              </div>
              <div className="col-span-2 text-sm text-gray-800 dark:text-gray-200 text-center">{view==='byMe' ? getUserName(t.assignedTo) : getUserName(t.createdBy)}</div>
              <div className="col-span-2 text-sm text-gray-800 dark:text-gray-200 text-center">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</div>
              <div className="col-span-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusBadge(t.status)}`}>{t.status}</span></div>
              <div className="col-span-2 flex justify-center">
                <button onClick={() => openChat(t)} className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md">
                  <MessageSquare className="h-4 w-4 mr-1" /> Message
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">No tasks found.</li>
          )}
        </ul>
      </div>

      {/* Chat Drawer */}
      {chatTask && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => {
          setChatTask(null)
          // Restore chatbot bubble if present
          const chatbotToggle = document.querySelector('[title="AI Assistant"]')
          if (chatbotToggle) chatbotToggle.style.display = 'inline-flex'
        }}>
          <div className="absolute right-0 top-0 h-full w-[340px] sm:w-[360px] bg-white dark:bg-gray-800 shadow-xl" onClick={(e)=>e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-white">Chat about: {chatTask.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Assignee: {getUserName(chatTask.assignedTo)}</div>
            </div>
            <div className="p-3 pb-20 space-y-3 h-[calc(100%-128px)] overflow-y-auto">
              {loadingMessages ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
              ) : (
                messages.map(m => (
                  <div key={m._id} className={`flex ${String(m.sender?._id || m.sender) === String(user?.id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-md text-sm ${String(m.sender?._id || m.sender) === String(user?.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                      <div>{m.text}</div>
                      <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 fixed bottom-0 right-0 w-[340px] sm:w-[360px] bg-white dark:bg-gray-800">
              <input value={msgInput} onChange={(e)=>setMsgInput(e.target.value)} placeholder="Type a message" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              <button onClick={sendMessage} className="px-3 py-2 bg-blue-600 text-white rounded-md">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignedTasks


