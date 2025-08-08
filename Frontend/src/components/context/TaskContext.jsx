import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a custom axios instance that always attaches the token
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Helper to normalize _id to id
  const normalizeTask = (task) => ({ ...task, id: task._id });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks.map(normalizeTask));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task) => {
    try {
      const response = await api.post('/tasks', task);
      setTasks((prev) => [...prev, normalizeTask(response.data.data.task)]);
      toast.success('Task created successfully!');
      return normalizeTask(response.data.data.task);
    } catch (err) {
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
    return tasks.filter((task) => task.createdBy === userId || task.assignedTo === userId);
  };

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
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};