import type React from "react";
import type { FC } from "react";
import { TimeIcon } from "../../icons";

interface FormTimePickerProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  hint?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
}

const FormTimePicker: FC<FormTimePickerProps> = ({
  label,
  value = "",
  onChange,
  onBlur,
  onFocus,
  placeholder = "HH:MM",
  className = "",
  disabled = false,
  error = false,
  success = false,
  hint,
  helperText,
  required = false,
  id,
  name,
  min,
  max,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors pr-11 ${className}`;

  if (disabled) {
    inputClasses += ` bg-gray-100 text-gray-500 border-gray-300 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-error-500 focus:border-error-500 focus:ring-error-500/20 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-success-500 focus:border-success-500 focus:ring-success-500/20 dark:border-success-500`;
  } else {
    inputClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-500`;
  }

  const containerClasses = "w-full";
  const labelClasses = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
  const helperClasses = `mt-1.5 text-xs ${
    error
      ? "text-error-500 dark:text-error-400"
      : success
        ? "text-success-500 dark:text-success-400"
        : "text-gray-500 dark:text-gray-400"
  }`;

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="time"
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          min={min}
          max={max}
          className={inputClasses}
        />
        <span className="absolute text-gray-400 dark:text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
          <TimeIcon className="size-5" />
        </span>
      </div>
      {(hint || helperText) && <p className={helperClasses}>{hint || helperText}</p>}
    </div>
  );
};

export default FormTimePicker;
