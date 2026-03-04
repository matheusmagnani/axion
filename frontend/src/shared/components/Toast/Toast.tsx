import { Alert } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@shared/hooks/useToast';

const successClassNames = {
  base: '!bg-green-600 !text-green-950',
  iconWrapper: '!bg-green-700 !border-none !shadow-none',
  alertIcon: '!text-green-950 [&>path]:!fill-green-950',
  closeButton: '!text-green-950 hover:!bg-green-700',
  title: 'whitespace-pre-line !text-green-950',
};

const dangerClassNames = {
  base: '!bg-red-500 !text-red-950',
  iconWrapper: '!bg-red-600 !border-none !shadow-none',
  alertIcon: '!text-red-950 [&>path]:!fill-red-950',
  closeButton: '!text-red-950 hover:!bg-red-600',
  title: 'whitespace-pre-line !text-red-950',
};

const warningClassNames = {
  base: '!bg-amber-400 !text-amber-950',
  iconWrapper: '!bg-amber-500 !border-none !shadow-none',
  alertIcon: '!text-amber-950 [&>path]:!fill-amber-950',
  closeButton: '!text-amber-950 hover:!bg-amber-500',
  title: 'whitespace-pre-line !text-amber-950',
};

const defaultClassNames = {
  title: 'whitespace-pre-line',
};

const classNamesMap: Record<string, typeof defaultClassNames> = {
  success: successClassNames,
  danger: dangerClassNames,
  warning: warningClassNames,
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
              classNames={classNamesMap[toast.type] ?? defaultClassNames}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
