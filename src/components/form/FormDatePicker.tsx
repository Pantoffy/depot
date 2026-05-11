import { FC } from "react";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../icons";

interface FormDatePickerProps {
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
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
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  displayFormat?: string;
}

const FormDatePicker: FC<FormDatePickerProps> = ({
  label,
  value = "",
  onChange,
  onBlur,
  onFocus,
  placeholder = "Chọn ngày",
  className = "",
  disabled = false,
  error = false,
  success = false,
  hint,
  helperText,
  required = false,
  id,
  name,
  minDate,
  maxDate,
  dateFormat = "Y-m-d",
  displayFormat = "d/m/Y",
}) => {
  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const date = selectedDates[0];
      // Format date as YYYY-MM-DD for storage
      const formattedDate = date.toISOString().split("T")[0];
      onChange?.(formattedDate);
    }
  };

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

  const flatpickrOptions: any = {
    dateFormat,
    altInput: true,
    altFormat: displayFormat,
    disableMobile: true,
    minDate: minDate,
    maxDate: maxDate,
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flatpickr-wrapper">
        <Flatpickr
          value={value}
          onChange={handleDateChange}
          onBlur={onBlur}
          onFocus={onFocus}
          name={name}
          options={flatpickrOptions}
          placeholder={placeholder}
          className={`${inputClasses} flatpickr-input`}
          disabled={disabled}
        />
        <span className="absolute text-gray-400 dark:text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
          <CalenderIcon className="size-5" />
        </span>
      </div>
      {(hint || helperText) && <p className={helperClasses}>{hint || helperText}</p>}
    </div>
  );
};

export default FormDatePicker;
