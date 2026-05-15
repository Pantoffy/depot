import { useEffect, useRef, useState } from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={wrapperRef} className={`relative ${buttonClassName}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white flex items-center justify-between transition-all duration-200 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <span className="truncate text-sm">{selectedOption?.label}</span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 ${menuClassName}`}>
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={`${option.value}-${option.label}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
