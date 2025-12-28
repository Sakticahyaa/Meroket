import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader, XCircle, X } from 'lucide-react';

export type ToastType = 'loading' | 'success' | 'error';

type ToastProps = {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, duration, onClose]);

  const icons = {
    loading: <Loader className="w-5 h-5 animate-spin text-blue-600" />,
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
  };

  const bgColors = {
    loading: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
  };

  const textColors = {
    loading: 'text-blue-900',
    success: 'text-green-900',
    error: 'text-red-900',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-lg border-2 shadow-2xl backdrop-blur-sm"
          style={{
            backgroundColor: type === 'loading' ? 'rgba(239, 246, 255, 0.95)' :
                           type === 'success' ? 'rgba(240, 253, 244, 0.95)' :
                           'rgba(254, 242, 242, 0.95)',
            borderColor: type === 'loading' ? 'rgb(191, 219, 254)' :
                        type === 'success' ? 'rgb(187, 247, 208)' :
                        'rgb(254, 202, 202)',
          }}
        >
          <div className="flex items-center gap-3">
            {icons[type]}
            <span className={`font-medium ${textColors[type]}`}>
              {message}
            </span>
          </div>
          {type !== 'loading' && (
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
