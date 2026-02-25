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
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    topics: number;
  };
  topics?: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  description?: string | null;
  order: number;
  topicId: string;
  xpReward: number;
  passingPercentage: number;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Question {
  id: string;
  content: string;
  imageUrl?: string | null;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  explanation?: string | null;
  studyLink?: string | null;
  order: number;
  levelId: string;
  options: Option[];
  createdAt: string | Date;
  updatedAt: string | Date;
  level?: Level;
}
