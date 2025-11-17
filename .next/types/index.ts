// types/index.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  contactNumber?: string;
  birthday?: string;
  profilePhoto?: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'moderate' | 'high';
  completed: boolean;
  createdAt: string;
  userId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contactNumber: string;
  birthday: string;
}