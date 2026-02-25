import { useState, useCallback } from 'react';
import type { AuthError, FormValidation, LoginForm, RegisterForm } from '../types';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6 && password.length <= 50;
};

const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_]+$/.test(username);
};

const validateFullName = (fullName: string): boolean => {
  return fullName.trim().length >= 2 && fullName.trim().length <= 100;
};

const validateDateOfBirth = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false;
  const date = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  return age >= 13 && age <= 120;
};

const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  
  if (score <= 3) return { score, label: 'Fraca', color: 'bg-red-500' };
  if (score <= 5) return { score, label: 'Média', color: 'bg-yellow-500' };
  return { score, label: 'Forte', color: 'bg-green-500' };
};

export const useFormValidation = () => {
  const [errors, setErrors] = useState<AuthError[]>([]);

  const validateLoginForm = useCallback((form: LoginForm): FormValidation => {
    const newErrors: AuthError[] = [];

    if (!form.email) {
      newErrors.push({ field: 'email', message: 'E-mail é obrigatório' });
    } else if (!validateEmail(form.email)) {
      newErrors.push({ field: 'email', message: 'E-mail inválido' });
    }

    if (!form.password) {
      newErrors.push({ field: 'password', message: 'Senha é obrigatória' });
    } else if (!validatePassword(form.password)) {
      newErrors.push({ field: 'password', message: 'Senha deve ter entre 6 e 50 caracteres' });
    }

    setErrors(newErrors);
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    };
  }, []);

  const validateRegisterForm = useCallback((form: RegisterForm): FormValidation => {
    const newErrors: AuthError[] = [];

    if (!form.fullName) {
      newErrors.push({ field: 'fullName', message: 'Nome completo é obrigatório' });
    } else if (!validateFullName(form.fullName)) {
      newErrors.push({ field: 'fullName', message: 'Nome deve ter entre 2 e 100 caracteres' });
    }

    if (!form.username) {
      newErrors.push({ field: 'username', message: 'Nome de usuário é obrigatório' });
    } else if (!validateUsername(form.username)) {
      newErrors.push({ field: 'username', message: 'Usuário deve ter entre 3 e 30 caracteres (letras, números, _)' });
    }

    if (!form.email) {
      newErrors.push({ field: 'email', message: 'E-mail é obrigatório' });
    } else if (!validateEmail(form.email)) {
      newErrors.push({ field: 'email', message: 'E-mail inválido' });
    }

    if (!form.password) {
      newErrors.push({ field: 'password', message: 'Senha é obrigatória' });
    } else if (!validatePassword(form.password)) {
      newErrors.push({ field: 'password', message: 'Senha deve ter pelo menos 6 caracteres' });
    }

    if (!form.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Confirmação de senha é obrigatória' });
    } else if (form.password !== form.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'As senhas não coincidem' });
    }

    if (!form.dateOfBirth) {
      newErrors.push({ field: 'dateOfBirth', message: 'Data de nascimento é obrigatória' });
    } else if (!validateDateOfBirth(form.dateOfBirth)) {
      newErrors.push({ field: 'dateOfBirth', message: 'Idade deve estar entre 13 e 120 anos' });
    }

    if (!form.acceptTerms) {
      newErrors.push({ field: 'acceptTerms', message: 'Você deve aceitar os termos de uso' });
    }

    setErrors(newErrors);
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    };
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => [...prev, { field, message }]);
  }, []);

  return {
    errors,
    validateLoginForm,
    validateRegisterForm,
    getFieldError,
    setFieldError,
    clearErrors,
    calculatePasswordStrength
  };
};
