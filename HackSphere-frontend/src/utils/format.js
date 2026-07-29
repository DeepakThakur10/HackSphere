const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatCurrency(value) {
  if (!value) {
    return 'Free';
  }
  return currencyFormatter.format(value);
}

export function formatDateRange(start, end) {
  if (!start || !end) {
    return 'Dates coming soon';
  }
  return `${shortDateFormatter.format(new Date(start))} - ${shortDateFormatter.format(new Date(end))}`;
}

export function formatCreatedAt(value) {
  if (!value) {
    return 'Unknown';
  }
  return longDateFormatter.format(new Date(value));
}

export function getOrganizerName(createdBy) {
  if (!createdBy) {
    return 'HackSphere Organizer';
  }
  const fullName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ');
  return fullName || createdBy.email || 'HackSphere Organizer';
}
