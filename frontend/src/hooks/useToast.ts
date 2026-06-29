import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  [key: string]: unknown;
};

function toast({
  title,
  description,
  variant = 'default',
  ...props
}: ToastProps) {
  const options = { description, ...props };

  if (variant === 'success') {
    return sonnerToast.success(title, options);
  }
  if (variant === 'destructive') {
    return sonnerToast.error(title, options);
  }
  if (variant === 'warning') {
    return sonnerToast.warning(title, options);
  }

  return sonnerToast(title, options);
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
