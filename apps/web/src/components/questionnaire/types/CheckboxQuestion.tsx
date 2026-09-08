import React from 'react';

export interface CheckboxQuestionProps {
  id: string;
  label: string;
  value: unknown;
  onChange: (val: boolean) => void;
}

export const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  return (
    <label
      htmlFor={`check-${id}`}
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
    >
      <input
        id={`check-${id}`}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm sm:text-base font-medium text-gray-800">
        {label}
      </span>
    </label>
  );
};
