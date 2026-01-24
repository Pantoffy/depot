import { useState, useEffect } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

let confirmCallback: ((options: ConfirmOptions) => void) | null = null;

export const showConfirm = (options: ConfirmOptions) => {
  if (confirmCallback) {
    confirmCallback(options);
  }
};

export const ConfirmDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    confirmCallback = (opts: ConfirmOptions) => {
      setOptions(opts);
      setIsOpen(true);
    };

    return () => {
      confirmCallback = null;
    };
  }, []);

  const handleConfirm = () => {
    options?.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setIsOpen(false);
  };

  if (!isOpen || !options) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {options.title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {options.title}
          </h3>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {options.message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            {options.cancelText || "Hủy"}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 font-medium transition-colors"
          >
            {options.okText || "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};
