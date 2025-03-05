/**
 * Format a date into SQLite/PostgreSQL compatible datetime string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD HH:mm:ss format
 */
export const formatDate = (date) => {
    if (!(date instanceof Date)) {
        throw new Error('Input must be a Date object');
    }
    return date.toISOString().replace('T', ' ').split('.')[0];
};