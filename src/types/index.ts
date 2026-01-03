export interface User {
  id: number;
  username: string;
  email: string;
  role: 'trainee' | 'admin';
  fullName: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  options: QuestionOption[];
  correctOptionId: number;
  points: number;
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  score: number;
  totalPoints: number;
  completedAt: string;
  answers: UserAnswer[];
}

export interface UserAnswer {
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
}

export interface Manual {
  id: number;
  title: string;
  category: string;
  content: string;
  pdfUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: number;
  userId: number;
  userName: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  adminComments: AdminComment[];
}

export interface AdminComment {
  id: number;
  feedbackId: number;
  adminId: number;
  adminName: string;
  comment: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
