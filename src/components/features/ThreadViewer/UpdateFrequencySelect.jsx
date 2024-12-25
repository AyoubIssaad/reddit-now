import React from "react";
import { Clock } from "lucide-react";

const FREQUENCY_OPTIONS = [
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
];

const UpdateFrequencySelect = ({ value, onChange, disabled }) => {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-9 rounded-md border border-input bg-background pl-8 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {FREQUENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Update every {option.label}
          </option>
        ))}
      </select>
      <Clock className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default UpdateFrequencySelect;
