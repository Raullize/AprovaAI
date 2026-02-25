export interface AuthError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: AuthError[];
}

export interface LoginForm {
  email?: string;
  password?: string;
}

export interface RegisterForm {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
  acceptTerms?: boolean;
}
