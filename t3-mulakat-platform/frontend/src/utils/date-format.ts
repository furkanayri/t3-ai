export const formatMontYear = (date: Date | string | null | undefined) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
  return new Date(date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

export const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: '2-digit',
    minute: "2-digit",
  };
  return new Date(date).toLocaleString('en-GB', options);
};