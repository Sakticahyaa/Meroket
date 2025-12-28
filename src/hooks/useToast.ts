import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

type ToastState = {
  message: string;
  type: ToastType;
  isVisible: boolean;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'loading',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const loading = useCallback((message: string = 'Saving...') => {
    showToast(message, 'loading');
  }, [showToast]);

  const success = useCallback((message: string = 'Saved successfully!') => {
    showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((message: string = 'An error occurred') => {
    showToast(message, 'error');
  }, [showToast]);

  return {
    toast,
    loading,
    success,
    error,
    hideToast,
  };
}
