// Landing Page Types
export interface Plan {
  id: string;
  name: string;
  price?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

// Auth Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  acceptTerms: boolean;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: AuthError[];
}

// Admin Types
export interface Exam {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  _count?: {
    topics: number;
  };
  topics?: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
  createdAt: string;
  updatedAt: string;
  exam?: Exam;
  _count?: {
    levels: number;
  };
  levels?: Level[];
}

export interface Level {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  topicId: string;
  simuladoName?: string;
  simuladoDescription?: string;
  xpReward: number;
  passingPercentage: number;
  createdAt: string;
  updatedAt: string;
  topic?: Topic;
  _count?: {
    questions: number;
  };
  questions?: Question[];
}

export interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  questionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  explanation?: string;
  studyLink?: string;
  order: number;
  levelId: string;
  options: Option[];
  createdAt: string;
  updatedAt: string;
  level?: Level;
}
