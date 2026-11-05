const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
const MONTH_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

/** Máximo de días hacia adelante para agendar un paseo. */
export const WALK_SCHEDULE_MAX_DAYS_AHEAD = 60;

export interface WalkDayOption {
  /** yyyy-MM-dd */
  id: string;
  /** Chip label: Hoy, Mañana, Vie 30… */
  label: string;
  dayText: string;
}

function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWalkScheduleMinDate(now = new Date()): Date {
  return startOfLocalDay(now);
}

export function getWalkScheduleMaxDate(now = new Date()): Date {
  const max = startOfLocalDay(now);
  max.setDate(max.getDate() + WALK_SCHEDULE_MAX_DAYS_AHEAD);
  return max;
}

/** Nunca devuelve un día anterior a hoy ni más allá del máximo permitido. */
export function clampWalkScheduleDate(date: Date, now = new Date()): Date {
  const min = getWalkScheduleMinDate(now).getTime();
  const max = getWalkScheduleMaxDate(now).getTime();
  const day = startOfLocalDay(date).getTime();
  if (day < min) return new Date(min);
  if (day > max) return new Date(max);
  return startOfLocalDay(date);
}

export function toWalkDayId(date: Date): string {
  return toIsoDateLocal(startOfLocalDay(date));
}

export function isIsoDateBeforeToday(iso: string, now = new Date()): boolean {
  return parseIsoDateLocal(iso).getTime() < getWalkScheduleMinDate(now).getTime();
}

/** Texto amigable para la solicitud: Hoy, Mañana, Vie 6 nov… */
export function formatWalkDayText(date: Date, now = new Date()): string {
  const today = getWalkScheduleMinDate(now);
  const day = startOfLocalDay(date);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';

  const weekday = WEEKDAY_SHORT[day.getDay()];
  const dom = day.getDate();
  const month = MONTH_SHORT[day.getMonth()];
  const yearSuffix =
    day.getFullYear() !== now.getFullYear() ? ` ${day.getFullYear()}` : '';
  return `${weekday} ${dom} ${month}${yearSuffix}`;
}

/** Fecha completa para la UI (evita repetir solo «Hoy»). */
export function formatWalkDayCalendar(date: Date): string {
  const day = startOfLocalDay(date);
  const weekday = WEEKDAY_SHORT[day.getDay()];
  const dom = day.getDate();
  const month = MONTH_SHORT[day.getMonth()];
  return `${weekday} ${dom} ${month} ${day.getFullYear()}`;
}

export function getWalkDayOptions(count = 14, fromDate = new Date()): WalkDayOption[] {
  const base = startOfLocalDay(fromDate);
  const options: WalkDayOption[] = [];

  for (let offset = 0; offset < count; offset++) {
    const day = new Date(base);
    day.setDate(base.getDate() + offset);

    let label: string;
    if (offset === 0) label = 'Hoy';
    else if (offset === 1) label = 'Mañana';
    else label = `${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}`;

    options.push({
      id: toIsoDateLocal(day),
      label,
      dayText: formatWalkDayText(day, fromDate),
    });
  }

  return options;
}

export function formatTimeHHmm(date: Date): string {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
}

export function parseIsoDateLocal(iso: string): Date {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(y!, mo! - 1, d!, 0, 0, 0, 0);
}

export function combineWalkDayAndTime(dayId: string, time: Date): Date {
  const day = parseIsoDateLocal(dayId);
  day.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return day;
}

export function isWalkScheduleInPast(
  dayId: string,
  time: Date,
  now = new Date()
): boolean {
  return combineWalkDayAndTime(dayId, time).getTime() <= now.getTime();
}

/** Redondea minutos al intervalo más cercano (p. ej. 15). */
export function roundTimeToInterval(date: Date, intervalMinutes = 15): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
  rounded.setMinutes(roundedMinutes, 0, 0);
  return rounded;
}

export function getDefaultWalkTime(from = new Date(), intervalMinutes = 15): Date {
  const next = new Date(from);
  next.setMinutes(next.getMinutes() + 45);
  return roundTimeToInterval(next, intervalMinutes);
}

/** Entrevista de verificación (walkers): ventana de agenda. */
export const INTERVIEW_SCHEDULE_MAX_DAYS_AHEAD = 30;
export const INTERVIEW_HOUR_START = 9;
export const INTERVIEW_HOUR_END = 18;

export function getInterviewScheduleMaxDate(now = new Date()): Date {
  const max = startOfLocalDay(now);
  max.setDate(max.getDate() + INTERVIEW_SCHEDULE_MAX_DAYS_AHEAD);
  return max;
}

export function clampInterviewScheduleDate(date: Date, now = new Date()): Date {
  const min = getWalkScheduleMinDate(now).getTime();
  const max = getInterviewScheduleMaxDate(now).getTime();
  const day = startOfLocalDay(date).getTime();
  if (day < min) return new Date(min);
  if (day > max) return new Date(max);
  return startOfLocalDay(date);
}

export function clampInterviewTime(time: Date): Date {
  const rounded = roundTimeToInterval(time, 15);
  const minutes = rounded.getHours() * 60 + rounded.getMinutes();
  const minMinutes = INTERVIEW_HOUR_START * 60;
  const maxMinutes = INTERVIEW_HOUR_END * 60;
  if (minutes < minMinutes) {
    rounded.setHours(INTERVIEW_HOUR_START, 0, 0, 0);
  } else if (minutes > maxMinutes) {
    rounded.setHours(INTERVIEW_HOUR_END, 0, 0, 0);
  }
  return rounded;
}

export function getDefaultInterviewTime(from = new Date()): Date {
  const candidate = clampInterviewTime(getDefaultWalkTime(from, 15));
  const dayId = toWalkDayId(from);
  if (!isWalkScheduleInPast(dayId, candidate, from)) {
    return candidate;
  }
  const fallback = new Date(from);
  fallback.setHours(10, 0, 0, 0);
  return clampInterviewTime(fallback);
}

/** Persistencia: yyyy-MM-ddTHH:mm */
export function formatInterviewSlotStored(dayId: string, time: Date): string {
  return `${dayId}T${formatTimeHHmm(time)}`;
}

export function parseInterviewSlotStored(
  slot: string
): { dayId: string; time: Date } | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(slot.trim());
  if (!match) return null;
  const dayId = match[1]!;
  const hm = match[2]!;
  const [h, m] = hm.split(':').map(Number);
  const time = parseIsoDateLocal(dayId);
  time.setHours(h!, m!, 0, 0);
  return { dayId, time };
}

export function formatInterviewSlotLabel(dayId: string, time: Date): string {
  return `${formatWalkDayCalendar(parseIsoDateLocal(dayId))} · ${formatTimeHHmm(time)}`;
}

export function isInterviewScheduleInPast(
  dayId: string,
  time: Date,
  now = new Date()
): boolean {
  return isWalkScheduleInPast(dayId, time, now);
}

export function initInterviewScheduleFromStored(
  storedSlot: string | undefined,
  now = new Date()
): { date: Date; time: Date } {
  const parsed = storedSlot ? parseInterviewSlotStored(storedSlot) : null;
  if (parsed) {
    const date = clampInterviewScheduleDate(parseIsoDateLocal(parsed.dayId), now);
    const dayId = toWalkDayId(date);
    let time = clampInterviewTime(parsed.time);
    if (isInterviewScheduleInPast(dayId, time, now)) {
      time = getDefaultInterviewTime(now);
    }
    return { date, time };
  }

  let date = getWalkScheduleMinDate(now);
  let time = getDefaultInterviewTime(now);
  if (isInterviewScheduleInPast(toWalkDayId(date), time, now)) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    date = clampInterviewScheduleDate(nextDay, now);
    time = clampInterviewTime(new Date(date));
    time.setHours(10, 0, 0, 0);
  }
  return { date, time };
}
