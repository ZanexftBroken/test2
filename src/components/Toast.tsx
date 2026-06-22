import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: React.Key | string;
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const { icon, colorClass, borderClass } = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      colorClass: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
      borderClass: 'border-emerald-500/30'
    },
    error: {
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      colorClass: 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
      borderClass: 'border-rose-500/30'
    },
    info: {
      icon: <Info className="w-5 h-5 text-amber-500" />,
      colorClass: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
      borderClass: 'border-amber-500/30'
    }
  }[toast.type];

  return (
    <motion.div
      initial={{ x: 80, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 40, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 280 }}
      layout
      className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border ${borderClass} ${colorClass} shadow-lg backdrop-blur-md`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium tracking-tight">{toast.text}</span>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
