import React from "react";
import { Calendar } from "lucide-react";

export function ExamSemesterFilter({ semesters = [], selectedSemesterId, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <select
        value={selectedSemesterId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all disabled:opacity-50"
      >
        {semesters.map((sem) => (
          <option key={sem.semesterId || sem.id} value={sem.semesterId || sem.id}>
            {sem.semesterName || sem.name} {sem.academicYear ? `(${sem.academicYear})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ExamSemesterFilter;
