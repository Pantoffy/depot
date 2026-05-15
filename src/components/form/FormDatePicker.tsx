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
      // Use local date parts to avoid UTC timezone offset shifting the date
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      onChange?.(formattedDate);
    }
  };

  let inputClasses = `h-[48px] w-full rounded-xl border px-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors pr-11 ${className}`;

  if (disabled) {
    inputClasses += ` bg-gray-100 text-gray-500 border-gray-200 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
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
