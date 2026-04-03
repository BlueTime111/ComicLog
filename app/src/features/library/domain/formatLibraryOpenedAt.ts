const pad2 = (value: number): string => String(value).padStart(2, '0');

const shiftMinutes = (date: Date, offsetMinutes: number): Date => {
  return new Date(date.getTime() + offsetMinutes * 60_000);
};

export const formatLibraryOpenedAt = (
  value?: string,
  timezoneOffsetMinutes?: number,
): string => {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  const baseDate = timezoneOffsetMinutes === undefined
    ? parsed
    : shiftMinutes(parsed, timezoneOffsetMinutes + parsed.getTimezoneOffset());

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;
  const day = baseDate.getDate();
  const hours = pad2(baseDate.getHours());
  const minutes = pad2(baseDate.getMinutes());

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};
