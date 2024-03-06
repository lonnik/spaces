export const getTimeAgoText = (date: Date, now: Date) => {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) {
    return "a few seconds ago";
  }

  if (minutes === 1) {
    return "a minute ago";
  }

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  if (hours === 1) {
    return "an hour ago";
  }

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  if (days === 1) {
    return "yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (weeks === 1) {
    return "a week ago";
  }

  if (weeks < 4) {
    return `${weeks} weeks ago`;
  }

  if (months === 1) {
    return "a month ago";
  }

  if (months < 12) {
    return `${months} months ago`;
  }

  if (years === 1) {
    return "a year ago";
  }

  return `${years} years ago`;
};
