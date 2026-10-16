const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Whole days from today to the date (negative = past). */
export function daysFromToday(date) {
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY);
}

/** Stored due dates: "Today", "Tomorrow", "Yesterday", "In 3 days", "2 days late", or "Mon 14 Oct". */
export function relativeDue(date) {
  if (!date) return '';
  const diff = daysFromToday(asLocalDay(date));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff} days late`;
  if (diff < 7) return `In ${diff} days`;
  return formatDate(date);
}

export function formatDate(date) {
  return asLocalDay(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Value for <input type="date"> from a stored date (uses the date as saved in UTC). */
export function toDateInput(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

/** Stored dates are midnight UTC; read them back as that calendar day locally. */
export function asLocalDay(date) {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Bucket for the dashboard's upcoming list. */
export function dueGroup(date) {
  if (!date) return 'Someday';
  const diff = daysFromToday(asLocalDay(date));
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff < 7) return 'This week';
  return 'Later';
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
