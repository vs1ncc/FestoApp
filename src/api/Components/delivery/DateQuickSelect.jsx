import React, { useState } from "react";
import { format, addDays } from "date-fns";

export default function DateQuickSelect({ value, onChange }) {
  const today = new Date();
  const presets = [
    { label: "Вчера", value: format(addDays(today, -1), "yyyy-MM-dd") },
    { label: "Сегодня", value: format(today, "yyyy-MM-dd") },
    { label: "Завтра", value: format(addDays(today, 1), "yyyy-MM-dd") },
  ];
  const isPreset = presets.some((p) => p.value === value);
  const isOther = value && !isPreset;
  const [calendarOpen, setCalendarOpen] = useState(isOther);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {presets.map((p) => (
          <button
            type="button"
            key={p.value}
            onClick={() => { onChange(p.value); setCalendarOpen(false); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${value === p.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setCalendarOpen(true); if (isPreset) onChange(""); }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${calendarOpen || isOther ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Другое
        </button>
      </div>
      {calendarOpen && (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      )}
    </div>
  );
}