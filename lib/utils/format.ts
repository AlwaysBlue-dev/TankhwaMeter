export function formatSalary(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-PK");
}

export function formatExperience(years: number): string {
  if (years === 0) return "Less than 1 year";
  return `${years} year${years === 1 ? "" : "s"} experience`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
