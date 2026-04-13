
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ModalProps) {

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const variantStyles = {
    danger: {
      icon: 'fa-exclamation-triangle',
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      confirmBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: 'fa-exclamation-circle',
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-50',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
    },
    info: {
      icon: 'fa-info-circle',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                <i className={`fas ${styles.icon} text-xl ${styles.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#1f2937] mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-[#6b7280] mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${styles.confirmBg}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}