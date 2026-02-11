import { Alert } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@shared/hooks/useToast';

const dangerClassNames = {
  base: '!bg-red-500/20 !text-red-600',
  iconWrapper: '!bg-red-500/25 !border-none !shadow-none',
  alertIcon: '!text-red-600 [&>path]:!fill-red-600',
  closeButton: '!text-red-500 hover:!bg-red-200',
  title: 'whitespace-pre-line',
};

const defaultClassNames = {
  title: 'whitespace-pre-line',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[360px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.25 }}
          >
            <Alert
              color={toast.type}
              title={toast.message}
              isClosable
              onClose={() => removeToast(toast.id)}
              classNames={toast.type === 'danger' ? dangerClassNames : defaultClassNames}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
