/**
 * Shared date and time formatting utilities for consistent formatting across the application
 */

/**
 * Format a date string (YYYY-MM-DD) into localized display format (e.g., "Jan 15, 2026")
 * @param date - ISO date string in format YYYY-MM-DD
 * @returns Formatted date string using en-PH locale
 */
export function formatDisplayDate(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * Format a timestamp into time-only format (e.g., "14:30")
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string using 24-hour format in en-PH locale
 */
export function formatTimeOnly(timestamp: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(timestamp));
}

/**
 * Format a full ISO timestamp into readable format (e.g., "Jan 15, 2026 14:30")
 * @param timestamp - ISO timestamp string
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    const dateStr = formatDisplayDate(date.toISOString().split('T')[0]);
    const timeStr = formatTimeOnly(timestamp);

    return `${dateStr} ${timeStr}`;
}
