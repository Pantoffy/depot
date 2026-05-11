interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
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
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  placeholder = "Chọn một tùy chọn",
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
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange?.(selectedValue);
  };

  let selectClasses = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${className}`;

  if (disabled) {
    selectClasses += ` bg-gray-100 text-gray-500 border-gray-300 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    selectClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-error-500 focus:border-error-500 focus:ring-error-500/20 dark:border-error-500`;
  } else if (success) {
    selectClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-success-500 focus:border-success-500 focus:ring-success-500/20 dark:border-success-500`;
  } else {
    selectClasses += ` bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-500`;
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
        <select
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          className={selectClasses}
        >
          <option value="" disabled className="text-gray-400 dark:text-gray-500">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {(hint || helperText) && <p className={helperClasses}>{hint || helperText}</p>}
    </div>
  );
};

export default FormSelect;
