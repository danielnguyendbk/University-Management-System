export const GRID_START = "07:00";
export const GRID_END = "21:30";
export const ROW_HEIGHT = 40;
const STEP_MINUTES = 30;

export const toMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

export const formatTime = (minutes) => {
  if (minutes === null || Number.isNaN(minutes)) return "";
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

export const buildTimeAxis = () => {
  const startMinutes = toMinutes(GRID_START);
  const endMinutes = toMinutes(GRID_END);
  if (startMinutes === null || endMinutes === null) return [];

  const slots = [];
  for (let current = startMinutes; current <= endMinutes; current += STEP_MINUTES) {
    slots.push(formatTime(current));
  }
  return slots;
};

export const getTopByTime = (time) => {
  const minutes = toMinutes(time);
  const startMinutes = toMinutes(GRID_START);
  if (minutes === null || startMinutes === null) return 0;
  return ((minutes - startMinutes) / STEP_MINUTES) * ROW_HEIGHT;
};

export const getHeightByTime = (startTime, endTime) => {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes === null || endMinutes === null) return ROW_HEIGHT;
  return ((endMinutes - startMinutes) / STEP_MINUTES) * ROW_HEIGHT;
};

export const isTimeInsideGrid = (time) => {
  const minutes = toMinutes(time);
  const startMinutes = toMinutes(GRID_START);
  const endMinutes = toMinutes(GRID_END);
  if (minutes === null || startMinutes === null || endMinutes === null) return false;
  return minutes >= startMinutes && minutes <= endMinutes;
};

export const getWeekDatesFromMonday = (mondayDate) => {
  const base = (() => {
    if (!mondayDate) return new Date();
    if (mondayDate instanceof Date) return new Date(mondayDate);
    if (typeof mondayDate === "string" && mondayDate.length === 10) {
      return new Date(`${mondayDate}T00:00:00`);
    }
    return new Date(mondayDate);
  })();

  if (Number.isNaN(base.getTime())) return [];

  const day = base.getDay();
  const diff = (day + 6) % 7;
  base.setDate(base.getDate() - diff);
  base.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return date;
  });
};
