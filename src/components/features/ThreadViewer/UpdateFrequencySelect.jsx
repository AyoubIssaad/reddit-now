import React from "react";
import { Clock } from "lucide-react";

const FREQUENCY_OPTIONS = [
  { value: 10000, label: "10s" },
  { value: 30000, label: "30s" },
  { value: 60000, label: "1m" },
  { value: 300000, label: "5m" },
];

const UpdateFrequencySelect = ({ value, onChange, disabled }) => {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {FREQUENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Update every {option.label}
          </option>
        ))}
      </select>
      <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default UpdateFrequencySelect;
