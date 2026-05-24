// timetableTimeUtils.js

export const TIME_SLOTS = {
  morning: {
    start: "07:00",
    end: "10:30",
    label: "Morning",
  },
  afternoon: {
    start: "13:00",
    end: "16:30",
    label: "Afternoon",
  },
  evening: {
    start: "17:30",
    end: "21:00",
    label: "Evening",
  },
};

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const SLOT_HEIGHT_PX = 60;
export const STEP_MINUTES = 30;

export const timeToMinutes = (time) => {
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes) => {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const generateRangeSlots = (startTime, endTime) => {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current <= end) {
    slots.push(minutesToTime(current));
    current += STEP_MINUTES;
  }

  return slots;
};

export const generateTimeSlots = () => {
  return [
    ...generateRangeSlots(TIME_SLOTS.morning.start, TIME_SLOTS.morning.end),
    ...generateRangeSlots(TIME_SLOTS.afternoon.start, TIME_SLOTS.afternoon.end),
    ...generateRangeSlots(TIME_SLOTS.evening.start, TIME_SLOTS.evening.end),
  ];
};

export const getSlotHeight = (startTime, endTime) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const duration = endMinutes - startMinutes;
  const slotCount = duration / STEP_MINUTES;

  return slotCount * SLOT_HEIGHT_PX;
};

export const calculateTopOffset = (startTime) => {
  const startMinutes = timeToMinutes("07:00");
  const currentMinutes = timeToMinutes(startTime);

  const slotCount = (currentMinutes - startMinutes) / STEP_MINUTES;

  return slotCount * SLOT_HEIGHT_PX;
};

export const hasTimeOverlap = (day1, start1, end1, day2, start2, end2) => {
  if (day1 !== day2) return false;

  const startMin1 = timeToMinutes(start1);
  const endMin1 = timeToMinutes(end1);
  const startMin2 = timeToMinutes(start2);
  const endMin2 = timeToMinutes(end2);

  return startMin1 < endMin2 && startMin2 < endMin1;
};

export const getDayColor = (day) => {
  const colors = {
    Monday: "bg-blue-50",
    Tuesday: "bg-purple-50",
    Wednesday: "bg-pink-50",
    Thursday: "bg-green-50",
    Friday: "bg-yellow-50",
    Saturday: "bg-orange-50",
  };

  return colors[day] || "bg-gray-50";
};

export const getSeverityColor = (severity) => {
  const colors = {
    low: "bg-yellow-100 text-yellow-800 border-yellow-300",
    medium: "bg-orange-100 text-orange-800 border-orange-300",
    high: "bg-red-100 text-red-800 border-red-300",
  };

  return colors[severity] || colors.low;
};

export const getApprovalStatusColor = (status) => {
  const colors = {
    pending: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return colors[status] || colors.pending;
};