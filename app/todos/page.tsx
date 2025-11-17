// app/todos/page.tsx
'use client';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Plus, Search, Calendar, GripVertical, CheckCircle2, AlertCircle, Clock, ListTodo } from 'lucide-react';
import Input from '@/components/Input';

interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'moderate' | 'high';
  completed: boolean;
  createdAt: string;
  userId: string;
}

interface DraggableTodoItemProps {
  todo: Todo;
  index: number;
  moveTodo: (dragId: string, hoverId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const DraggableTodoItem = ({
  todo,
  index,
  moveTodo,
  onEdit,
  onDelete,
  onToggleComplete
}: DraggableTodoItemProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', todo.id);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('text/plain');
    const hoverId = todo.id;
    
    if (dragId !== hoverId) {
      moveTodo(dragId, hoverId);
    }
    setIsDragging(false);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} />;
      case 'moderate': return <Clock size={16} />;
      case 'low': return <CheckCircle2 size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const isOverdue = new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-white rounded-xl shadow-sm border p-6 cursor-move transition-all hover:shadow-md ${
        isDragging ? 'opacity-50 bg-blue-50 border-blue-300' : 'opacity-100'
      } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical size={20} className="text-gray-400" />
          </div>
          
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {todo.title}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
            {getPriorityIcon(todo.priority)}
            <span>{todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{todo.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            <Calendar size={16} className="mr-2" />
            Due {new Date(todo.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
            {isOverdue && <span className="ml-2 text-red-600">• Overdue</span>}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(todo)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'moderate' as Todo['priority']
  });
  const router = useRouter();

  useEffect(() => {
    const loadTodos = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const userTodos = JSON.parse(localStorage.getItem('todos') || '[]');
        const user = JSON.parse(currentUser);
        const userSpecificTodos = userTodos.filter((todo: Todo) => todo.userId === user.id);
        
        setTimeout(() => {
          setTodos(userSpecificTodos);
          setIsLoading(false);
        }, 0);
      } catch (error) {
        console.error('Error loading todos:', error);
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [router]);

  // Filter and sort todos
  const filteredTodos = todos
    .filter(todo => 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, moderate: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Move todo for drag and drop - Fixed to use todo IDs instead of indices
  const moveTodo = useCallback((dragId: string, hoverId: string) => {
    setTodos(prevTodos => {
      const updatedTodos = [...prevTodos];
      const dragIndex = updatedTodos.findIndex(todo => todo.id === dragId);
      const hoverIndex = updatedTodos.findIndex(todo => todo.id === hoverId);
      
      if (dragIndex === -1 || hoverIndex === -1) {
        return prevTodos;
      }
      
      const [movedTodo] = updatedTodos.splice(dragIndex, 1);
      updatedTodos.splice(hoverIndex, 0, movedTodo);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  }, []);

  // Statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const overdueTodos = todos.filter(todo => 
    new Date(todo.dueDate) < new Date() && !todo.completed
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const todoData: Todo = {
      id: editingTodo ? editingTodo.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      completed: editingTodo ? editingTodo.completed : false,
      createdAt: editingTodo ? editingTodo.createdAt : new Date().toISOString(),
      userId: currentUser.id
    };

    setTodos(prevTodos => {
      let updatedTodos: Todo[];
      if (editingTodo) {
        updatedTodos = prevTodos.map(todo => todo.id === editingTodo.id ? todoData : todo);
      } else {
        updatedTodos = [...prevTodos, todoData];
      }
      
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return updatedTodos;
    });

    setShowModal(false);
    setEditingTodo(null);
    setFormData({ title: '', description: '', dueDate: '', priority: 'moderate' });
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate.split('T')[0],
      priority: todo.priority
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      setTodos(prevTodos => {
        const updatedTodos = prevTodos.filter(todo => todo.id !== id);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        return updatedTodos;
      });
    }
  };

  const handleToggleComplete = (id: string) => {
    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="todos" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

   return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar currentPage="todos" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your tasks efficiently</p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Plus size={20} />
              <span>New Task</span>
            </button>
          </div>

          {/* Statistics Cards - 3 in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalTodos}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ListTodo size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{completedTodos}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{overdueTodos}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your task here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'title')}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Todos Grid - 3 cards in a row */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Tasks</h2>
            
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No todos yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first todo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTodos.map((todo, index) => (
                  <DraggableTodoItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    moveTodo={moveTodo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Todo Modal */}
      

{/* Add/Edit Todo Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {editingTodo ? 'Edit Task' : 'Add New Task'}
        </h2>
        <button 
          onClick={() => {
            setShowModal(false);
            setEditingTodo(null);
            setFormData({ title: '', description: '', dueDate: '', priority: 'moderate' });
          }}
          className="text-gray-500 hover:text-gray-700 transition-colors text-lg font-medium"
        >
          Go Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Title" 
          value={formData.title} 
          onChange={(v) => setFormData(prev => ({ ...prev, title: v }))} 
          type="text" 
          placeholder="Enter task title" 
          required 
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Due Date" 
            value={formData.dueDate} 
            onChange={(v) => setFormData(prev => ({ ...prev, dueDate: v }))} 
            type="date" 
            required 
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="mt-2 flex items-center space-x-4">
              {['low', 'moderate', 'high'].map((priority) => (
                <label key={priority} className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={() => setFormData(prev => ({ ...prev, priority: priority as Todo['priority'] }))}
                    className={`h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                      priority === 'high' ? 'text-red-600' : 
                      priority === 'moderate' ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}
                  />
                  <span className="ml-2 capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Start writing here...."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors resize-none"
            required
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="submit"
            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-150 transform hover:scale-105 active:scale-95"
          >
            {editingTodo ? 'Update Task' : 'Add Task'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setEditingTodo(null);
              setFormData({ title: '', description: '', dueDate: '', priority: 'moderate' });
            }}
            className="py-3 px-8 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition duration-150 transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );

}