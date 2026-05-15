import type React from "react";
import { useState } from "react";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const removeOption = (value: string) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div className="relative z-20 inline-block w-full">
        <div className="relative flex flex-col items-center">
          <div onClick={toggleDropdown} className="w-full">
            <div className="mb-2 flex h-[48px] rounded-xl border border-gray-200 bg-cyan-50 py-1.5 pl-3 pr-3 shadow-sm outline-none transition focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-cyan-500/10">
              <div className="flex flex-wrap flex-auto gap-2">
                {selectedValuesText.length > 0 ? (
                  selectedValuesText.map((text, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-center rounded-full border-[0.7px] border-cyan-300 bg-cyan-100 py-1 pl-2.5 pr-2 text-sm text-cyan-900 hover:border-cyan-400 dark:bg-cyan-500/30 dark:text-white dark:hover:border-cyan-500/50"
                    >
                      <span className="flex-initial max-w-full">{text}</span>
                      <div className="flex flex-row-reverse flex-auto">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(selectedOptions[index]);
                          }}
                          className="pl-2 text-cyan-700 cursor-pointer group-hover:text-cyan-600 dark:text-cyan-300 dark:group-hover:text-cyan-200"
                        >
                          <svg
                            className="fill-current"
                            role="button"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <input
                    placeholder="Select option"
                    className="w-full h-full p-1 pr-2 text-sm bg-transparent border-0 outline-none appearance-none placeholder:text-gray-700 focus:border-0 focus:outline-none focus:ring-0 dark:placeholder:text-gray-300"
                    readOnly
                    value="Select option"
                  />
                )}
              </div>
              <div className="flex items-center py-1 pl-1 pr-1 w-7">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="w-5 h-5 text-cyan-600 outline-none cursor-pointer focus:outline-none dark:text-cyan-400"
                >
                  <svg
                    className={`stroke-current ${isOpen ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isOpen && (
            <div
              className="absolute left-0 z-40 w-full overflow-y-auto bg-cyan-50 rounded-xl shadow-lg top-full max-h-select border border-gray-200 dark:bg-cyan-500/10 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`w-full cursor-pointer border-b border-gray-200 dark:border-gray-700`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div
                      className={`relative flex w-full items-center p-2.5 pl-4 transition-colors ${
                        selectedOptions.includes(option.value)
                          ? "bg-cyan-200 text-cyan-900 dark:bg-cyan-500/40 dark:text-white"
                          : "text-gray-800 hover:bg-cyan-100 dark:text-gray-100 dark:hover:bg-cyan-500/20"
                      }`}
                    >
                      <div className="mx-2 leading-6 text-gray-800 dark:text-white/90">
                        {option.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;
