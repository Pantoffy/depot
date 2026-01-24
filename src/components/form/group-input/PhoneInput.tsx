import { useState } from "react";

interface PhoneInputProps {
  placeholder?: string;
  onChange?: (phoneNumber: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  placeholder = "123 456 789",
  onChange,
}) => {
  const [localNumber, setLocalNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.startsWith("0")) {
      value = value.slice(1);
    }

    setLocalNumber(value);
    onChange?.(`+84${value}`);
  };

  return (
    <div className="relative flex">
      {/* Prefix +84 */}
      <div className="flex items-center px-3 h-11 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        +84
      </div>

      {/* Input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-r-lg border border-l-0 border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
    </div>
  );
};

export default PhoneInput;
