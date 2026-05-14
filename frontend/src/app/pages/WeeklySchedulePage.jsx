import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00"
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROLE_SCHEDULE_CONFIG = {
  Admin: {
    title: "Weekly Visual Schedule",
    subtitle: "Interactive grid view of classroom schedules",
    rowHeader: "Room / Time",
    rowItemLabel: "Room",
    detailLabel: "Lecturer",
    countLabel: "Students",
    rows: ["A-301", "A-302", "B-105", "B-106", "C-201"],
    scheduleData: {
      "A-301": {
        "Monday-08:00 - 10:00": { code: "CS101", detail: "Dr. Sarah", count: 45 },
        "Tuesday-10:00 - 12:00": { code: "MATH201", detail: "Prof. Chen", count: 60 },
        "Wednesday-14:00 - 16:00": { code: "PHY301", detail: "Dr. Brown", count: 35 }
      },
      "A-302": {
        "Monday-10:00 - 12:00": { code: "ENG102", detail: "Dr. Lee", count: 50 },
        "Thursday-08:00 - 10:00": { code: "BIO201", detail: "Dr. White", count: 40 }
      },
      "B-105": {
        "Tuesday-08:00 - 10:00": { code: "CHEM301", detail: "Prof. Kim", count: 38 },
        "Friday-14:00 - 16:00": { code: "CS201", detail: "Dr. Johnson", count: 42 }
      },
      "B-106": {
        "Wednesday-10:00 - 12:00": { code: "HIST101", detail: "Dr. Taylor", count: 55 }
      },
      "C-201": {
        "Thursday-14:00 - 16:00": { code: "ART201", detail: "Prof. Davis", count: 30 },
        "Friday-08:00 - 10:00": { code: "MUS101", detail: "Dr. Wilson", count: 25 }
      }
    }
  },
  Staff: {
    title: "Weekly Visual Schedule",
    subtitle: "School-wide allocation monitoring for staff",
    rowHeader: "Room / Time",
    rowItemLabel: "Room",
    detailLabel: "Status",
    countLabel: "Seats Used",
    rows: ["A-301", "A-302", "C-201", "D-102"],
    scheduleData: {
      "A-301": {
        "Monday-08:00 - 10:00": { code: "CS101.L11", detail: "Allocated", count: 45 },
        "Thursday-08:00 - 10:00": { code: "AI401.L01", detail: "Conflict", count: 35, status: "conflict" }
      },
      "A-302": {
        "Monday-10:00 - 12:00": { code: "ENG102.L04", detail: "Allocated", count: 50 },
        "Friday-14:00 - 16:00": { code: "SE302.L03", detail: "Allocated", count: 48 }
      },
      "C-201": {
        "Wednesday-14:00 - 16:00": { code: "DB202.L08", detail: "Allocated", count: 52 }
      },
      "D-102": {
        "Tuesday-08:00 - 10:00": { code: "NET301.L05", detail: "Pending room", count: 38 }
      }
    }
  },
  Lecturer: {
    title: "Weekly Visual Schedule",
    subtitle: "My teaching schedule in weekly grid",
    rowHeader: "Section / Time",
    rowItemLabel: "Section",
    detailLabel: "Class",
    countLabel: "Students",
    rows: ["CS101.L11", "CS201.L03", "AI401.L01"],
    scheduleData: {
      "CS101.L11": {
        "Monday-08:00 - 10:00": { code: "Object-Oriented Programming", detail: "D21CNTT01", count: 45 },
        "Friday-14:00 - 16:00": { code: "Office Hour", detail: "Consultation", count: 0 }
      },
      "CS201.L03": {
        "Tuesday-10:00 - 12:00": { code: "Data Structures", detail: "D21CNTT02", count: 42 }
      },
      "AI401.L01": {
        "Thursday-08:00 - 10:00": { code: "Artificial Intelligence", detail: "D20CNTT01", count: 35, status: "conflict" }
      }
    }
  },
  Employee: {
    title: "Weekly Visual Schedule",
    subtitle: "Room operations schedule for facility staff",
    rowHeader: "Room / Time",
    rowItemLabel: "Room",
    detailLabel: "Task",
    countLabel: "People",
    rows: ["A-101", "B-203", "C-301", "E-101"],
    scheduleData: {
      "A-101": {
        "Monday-08:00 - 10:00": { code: "CS101 Session", detail: "Open & setup projector", count: 45 },
        "Monday-14:00 - 16:00": { code: "NET301 Session", detail: "Check network lab", count: 38 }
      },
      "B-203": {
        "Tuesday-10:00 - 12:00": { code: "DB202 Session", detail: "Lab support", count: 28 }
      },
      "C-301": {
        "Wednesday-08:00 - 10:00": { code: "MATH201 Session", detail: "General room prep", count: 58 }
      },
      "E-101": {
        "Friday-14:00 - 16:00": { code: "CHEM301 Lab", detail: "Safety check", count: 22 }
      }
    }
  },
  Student: {
    title: "Weekly Visual Schedule",
    subtitle: "My enrolled classes in weekly grid",
    rowHeader: "Course / Time",
    rowItemLabel: "Course",
    detailLabel: "Room",
    countLabel: "Credits",
    rows: ["CS101", "CS201", "MATH201", "DB202", "ENG102"],
    scheduleData: {
      CS101: {
        "Monday-08:00 - 10:00": { code: "OOP", detail: "A-301", count: 3 },
        "Thursday-10:00 - 12:00": { code: "OOP Practice", detail: "B-302", count: 1 }
      },
      CS201: {
        "Tuesday-10:00 - 12:00": { code: "Data Structures", detail: "A-205", count: 3 }
      },
      MATH201: {
        "Wednesday-08:00 - 10:00": { code: "Calculus II", detail: "B-105", count: 4 }
      },
      DB202: {
        "Wednesday-14:00 - 16:00": { code: "Database Systems", detail: "C-201", count: 3 }
      },
      ENG102: {
        "Friday-10:00 - 12:00": { code: "Technical English", detail: "A-101", count: 2 }
      }
    }
  }
};
const WeeklySchedulePage = () => {
  const { user } = useAuth();
  const [weekNumber, setWeekNumber] = useState(1);
  const [hoveredCell, setHoveredCell] = useState(null);
  const roleConfig = ROLE_SCHEDULE_CONFIG[user?.role] || ROLE_SCHEDULE_CONFIG.Admin;
  const { title, subtitle, rowHeader, rowItemLabel, detailLabel, countLabel, rows, scheduleData } = roleConfig;
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mt-1", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setWeekNumber((prev) => Math.max(1, prev - 1)), children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium px-4", children: [
          "Week ",
          weekNumber,
          ", March 2026"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setWeekNumber((prev) => Math.min(20, prev + 1)), children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto", children: /* @__PURE__ */ jsxs("div", { className: "min-w-[1200px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[150px_repeat(6,1fr)] border-b border-gray-200 bg-gray-50", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 font-medium text-gray-700 border-r border-gray-200", children: rowHeader }),
        days.map((day) => /* @__PURE__ */ jsx("div", { className: "p-4 font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0", children: day }, day))
      ] }),
      rows.map((row) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[150px_repeat(6,1fr)] bg-blue-50 border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 font-semibold text-blue-900 border-r border-gray-200 flex items-center", children: row }),
          /* @__PURE__ */ jsx("div", { className: "col-span-6" })
        ] }),
        timeSlots.map((timeSlot) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "grid grid-cols-[150px_repeat(6,1fr)] border-b border-gray-200",
            children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 text-sm text-gray-600 border-r border-gray-200 flex items-center", children: timeSlot }),
              days.map((day) => {
                const cellKey = `${day}-${timeSlot}`;
                const classData = scheduleData[row]?.[cellKey];
                const isHovered = hoveredCell === `${row}-${cellKey}`;
                const isConflict = classData?.status === "conflict";
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `p-2 border-r border-gray-200 last:border-r-0 min-h-[80px] relative transition-all ${classData ? isConflict ? "bg-red-50 hover:bg-red-100 cursor-pointer" : "bg-blue-50 hover:bg-blue-100 cursor-pointer" : "hover:bg-gray-50"}`,
                    onMouseEnter: () => setHoveredCell(`${row}-${cellKey}`),
                    onMouseLeave: () => setHoveredCell(null),
                    children: [
                      classData && /* @__PURE__ */ jsxs("div", { className: "text-xs space-y-1", children: [
                        /* @__PURE__ */ jsx("div", { className: "font-semibold text-blue-900", children: classData.code }),
                        /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: classData.detail }),
                        classData.count > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-gray-500", children: [
                          /* @__PURE__ */ jsx(Users, { className: "w-3 h-3" }),
                          classData.count
                        ] })
                      ] }),
                      isHovered && classData && /* @__PURE__ */ jsxs("div", { className: "absolute z-10 top-full left-0 mt-1 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs w-48", children: [
                        /* @__PURE__ */ jsx("div", { className: "font-semibold mb-1", children: classData.code }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-gray-300", children: [
                          /* @__PURE__ */ jsxs("div", { children: [
                            detailLabel,
                            ": ",
                            classData.detail
                          ] }),
                          classData.count > 0 && /* @__PURE__ */ jsxs("div", { children: [
                            countLabel,
                            ": ",
                            classData.count
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            rowItemLabel,
                            ": ",
                            row
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            "Time: ",
                            timeSlot
                          ] })
                        ] })
                      ] })
                    ]
                  },
                  cellKey
                );
              })
            ]
          },
          `${row}-${timeSlot}`
        ))
      ] }, row))
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Legend" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-blue-50 border border-blue-200 rounded" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Scheduled Slot" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-white border border-gray-200 rounded" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Available Slot" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-red-50 border border-red-200 rounded" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Conflict / Warning" })
        ] })
      ] }) })
    ] })
  ] });
};
export {
  WeeklySchedulePage
};
