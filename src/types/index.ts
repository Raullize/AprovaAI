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