/**
 * Formatting utilities for DORA RoI Automator
 */

/** Format ISO date string → "12 Jan 2024" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Format ISO date string → "2024-01-12" (for <input type="date"> value) */
export function formatDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Format relative time → "2 hours ago" */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Format an LEI code with spaces for readability: XXXX XXXX XXXX XXXX XXXX */
export function formatLEI(lei: string): string {
  return lei.replace(/(.{4})/g, "$1 ").trim();
}

/** Validate a 20-char alphanumeric LEI */
export function isValidLEI(lei: string): boolean {
  return /^[A-Z0-9]{20}$/.test(lei.toUpperCase());
}

/** Format a percentage score */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

/** Truncate a string with an ellipsis */
export function truncate(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

/** Format file size bytes → "1.2 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Format a currency amount */
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount);
}
