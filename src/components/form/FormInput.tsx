import type React from "react";
import type { FC } from "react";

interface FormInputProps {
  label?: string;
  type?: "text" | "number" | "email" | "password" | "tel" | "url" | "search" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
}

const FormInput: FC<FormInputProps> = ({
  label,
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  helperText,
  required = false,
  readOnly = false,
  autoComplete,
}) => {
  let inputClasses = `h-[48px] w-full rounded-xl border px-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${className}`;

  if (disabled) {
    inputClasses += ` bg-gray-100 text-gray-500 border-gray-200 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (readOnly) {
    inputClasses += ` bg-gray-50 text-gray-700 border-gray-200 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` bg-white text-gray-900 border-error-500 focus:outline-none focus:ring-2 focus:ring-error-500 dark:bg-gray-900 dark:text-white dark:border-error-500`;
  } else if (success) {
    inputClasses += ` bg-white text-gray-900 border-success-500 focus:outline-none focus:ring-2 focus:ring-success-500 dark:bg-gray-900 dark:text-white dark:border-success-500`;
  } else {
    inputClasses += ` bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white`;
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
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        className={inputClasses}
      />
      {(hint || helperText) && <p className={helperClasses}>{hint || helperText}</p>}
    </div>
  );
};

export default FormInput;
