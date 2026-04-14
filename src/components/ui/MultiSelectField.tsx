import { useState, useRef, useEffect } from "react";

type Props = {
  label?: string;
  name: string;
  value: string[];
  onChange: (selected: string[]) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
};

export default function MultiSelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeItem = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Box */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full min-h-[42px] border border-gray-300 rounded px-2 py-1 flex flex-wrap items-center gap-1 cursor-pointer ${
          disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
        }`}
      >
        {value.length === 0 && (
          <span className="text-black text-sm">Select options</span>
        )}

        {value.map((item) => (
          <span
            key={item}
            className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded flex items-center gap-1"
          >
            {item}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item);
                }}
                className="text-purple-500 hover:text-purple-700"
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}