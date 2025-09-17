import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a custom axios instance that always attaches the token
const api = axios.create({
  baseURL: 'https://trilo.up.railway.app/api/v1',
});

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

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Helper to normalize task shape
  const normalizeTask = (task) => {
    const getId = (value) => {
      if (!value) return value
      if (typeof value === 'string') return value
      if (typeof value === 'object') return value._id || value.id || value
      return value
    }

    return {
      ...task,
      id: task._id,
      // Ensure these are always comparable IDs (strings)
      createdBy: getId(task.createdBy),
      assignedTo: getId(task.assignedTo),
    }
  }

  const loadTasks = useCallback(async () => {
    if (!user || authLoading) {
      console.log('loadTasks skipped:', { user: user?.id, authLoading })
      return
    }
    console.log('loadTasks called for user:', user.id)
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      const normalizedTasks = response.data.data.tasks.map(normalizeTask);
      console.log('Tasks loaded:', normalizedTasks.length, 'tasks')
      setTasks(normalizedTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err)
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Reset tasks whenever the authenticated user changes to avoid leaking previous user's tasks
    console.log('TaskContext useEffect triggered:', { user: user?.id, authLoading })
    setTasks([])
    if (user && !authLoading) {
      console.log('Loading tasks for user:', user.id)
      loadTasks()
    }
  }, [user, authLoading, loadTasks])

  const addTask = async (task) => {
    try {
      console.log('Creating task with data:', task)
      const response = await api.post('/tasks', task);
      const normalizedTask = normalizeTask(response.data.data.task);
      console.log('Task created successfully:', normalizedTask)
      setTasks((prev) => {
        const newTasks = [...prev, normalizedTask];
        console.log('Updated tasks list:', newTasks);
        return newTasks;
      });
      toast.success('Task created successfully!');
      return normalizedTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      // If the task is being marked as completed, add completion time
      if (updates.status === 'completed') {
        updates.completionTime = new Date().toISOString()
        console.log('🎯 Task marked as completed, setting completionTime:', updates.completionTime)
      }
      
      console.log('📝 Updating task:', id, 'with updates:', updates)
      
      const response = await api.patch(`/tasks/${id}`, updates)
      console.log('✅ Task update response:', response.data.data.task)
      
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? normalizeTask(response.data.data.task) : task))
      )
      toast.success('Task updated successfully!')
    } catch (err) {
      console.error('❌ Error updating task:', err)
      toast.error(err.response?.data?.message || 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const getTasksByUser = (userId) => {
    const idsEqual = (a, b) => {
      if (!a || !b) return false
      return String(a) === String(b)
    }
    const userTasks = tasks.filter(
      (task) => idsEqual(task.createdBy, userId) || idsEqual(task.assignedTo, userId)
    )
    console.log('getTasksByUser called with userId:', userId)
    console.log('All tasks:', tasks)
    console.log('User tasks:', userTasks)
    return userTasks
  }

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getTasksByPriority = (priority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    getTasksByStatus,
    getTasksByPriority,
    loadTasks,
    refreshTasks: loadTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};