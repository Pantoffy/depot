import React, { FC } from "react";

interface FormTextareaProps {
  label?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  hint?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
  name?: string;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
}

const FormTextarea: FC<FormTextareaProps> = ({
  label,
  placeholder = "Nhập nội dung",
  rows = 4,
  value = "",
  onChange,
  onBlur,
  onFocus,
  className = "",
  disabled = false,
  error = false,
  success = false,
  hint,
  helperText,
  required = false,
  id,
  name,
  maxLength,
  minLength,
  readOnly = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses = `w-full rounded-xl border px-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 text-gray-500 border-gray-200 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (readOnly) {
    textareaClasses += ` bg-gray-50 text-gray-700 border-gray-200 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-white text-gray-900 border-error-500 focus:outline-none focus:ring-2 focus:ring-error-500 dark:bg-gray-900 dark:text-white dark:border-error-500`;
  } else if (success) {
    textareaClasses += ` bg-white text-gray-900 border-success-500 focus:outline-none focus:ring-2 focus:ring-success-500 dark:bg-gray-900 dark:text-white dark:border-success-500`;
  } else {
    textareaClasses += ` bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white`;
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
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          className={textareaClasses}
        />
        {maxLength && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
      {(hint || helperText) && <p className={helperClasses}>{hint || helperText}</p>}
    </div>
  );
};

export default FormTextarea;
