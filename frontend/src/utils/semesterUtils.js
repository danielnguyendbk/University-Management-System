const toDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const getSemesterDateValue = (semester) => {
  const endDate = toDateValue(semester?.endDate ?? semester?.end_date ?? semester?.endAt);
  if (endDate) return endDate;
  return toDateValue(semester?.startDate ?? semester?.start_date ?? semester?.startAt);
};

const parseAcademicYear = (value) => {
  if (!value) return null;
  const match = String(value).match(/(\d{4})\D+(\d{4})/);
  if (!match) return null;
  return { startYear: Number(match[1]), endYear: Number(match[2]) };
};

const parseSemesterNumber = (semester) => {
  const raw =
    semester?.semesterNo ??
    semester?.semesterNumber ??
    semester?.term ??
    semester?.semester ??
    semester?.semester_index ??
    semester?.semesterIndex;
  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && numeric > 0) return numeric;

  const text = String(semester?.code ?? semester?.name ?? semester?.semesterName ?? "");
  const hkMatch = text.match(/HK\s*(\d+)/i) || text.match(/H\u1ecdc\s*k\u1ef3\s*(\d+)/i);
  if (hkMatch) {
    const hkNumber = Number(hkMatch[1]);
    if (!Number.isNaN(hkNumber)) return hkNumber;
  }

  const termMatch = text.match(/(?:semester|term)\s*(\d+)/i);
  if (termMatch) {
    const termNumber = Number(termMatch[1]);
    if (!Number.isNaN(termNumber)) return termNumber;
  }

  return null;
};

const parseSemesterOrder = (semester) => {
  const yearInfo =
    parseAcademicYear(semester?.academicYear) ||
    parseAcademicYear(semester?.year) ||
    parseAcademicYear(semester?.code) ||
    parseAcademicYear(semester?.name) ||
    parseAcademicYear(semester?.semesterName);

  const semesterNo = parseSemesterNumber(semester);
  if (!yearInfo && !semesterNo) return null;

  return {
    startYear: yearInfo?.startYear ?? 0,
    endYear: yearInfo?.endYear ?? 0,
    semesterNo: semesterNo ?? 0,
  };
};

const getSemesterIdValue = (semester) => semester?.id ?? semester?.semesterId;

export const getLatestSemester = (items) => {
  if (!items?.length) return null;

  const withDates = items
    .map((semester) => ({
      semester,
      dateValue: getSemesterDateValue(semester),
    }))
    .filter((item) => item.dateValue);

  if (withDates.length) {
    return withDates.reduce((best, current) =>
      current.dateValue > best.dateValue ? current : best
    ).semester;
  }

  const withOrder = items
    .map((semester) => ({
      semester,
      order: parseSemesterOrder(semester),
    }))
    .filter((item) => item.order);

  if (withOrder.length) {
    return withOrder.reduce((best, current) => {
      if (current.order.endYear !== best.order.endYear) {
        return current.order.endYear > best.order.endYear ? current : best;
      }
      if (current.order.startYear !== best.order.startYear) {
        return current.order.startYear > best.order.startYear ? current : best;
      }
      return current.order.semesterNo > best.order.semesterNo ? current : best;
    }).semester;
  }

  const latestById = items
    .map((semester) => ({
      semester,
      idValue: Number(getSemesterIdValue(semester)),
    }))
    .filter((item) => !Number.isNaN(item.idValue));

  if (latestById.length) {
    return latestById.reduce((best, current) =>
      current.idValue > best.idValue ? current : best
    ).semester;
  }

  return items[0] ?? null;
};
