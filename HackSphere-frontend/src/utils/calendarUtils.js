function formatICSDate(date) {
  const d = new Date(date);
  return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

export function getGoogleCalendarUrl({ title, description, location, startDate, endDate }) {
  const start = formatICSDate(startDate || new Date());
  const end = formatICSDate(endDate || new Date(Date.now() + 24 * 60 * 60 * 1000));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description || '',
    location: location || 'Online / Hybrid',
    dates: `${start}/${end}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile({ title, description, location, startDate, endDate }) {
  const start = formatICSDate(startDate || new Date());
  const end = formatICSDate(endDate || new Date(Date.now() + 24 * 60 * 60 * 1000));

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HackSphere Platform//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description ? description.replace(/\n/g, '\\n') : ''}`,
    `LOCATION:${location || 'Online'}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
