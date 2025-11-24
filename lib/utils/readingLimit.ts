/**
 * Reading limit utilities for tracking daily reading counts
 */

const STORAGE_KEY = 'cosmic_tarot_readings';
const MAX_READINGS_PER_DAY = 3;

export interface ReadingRecord {
  date: string; // YYYY-MM-DD format
  count: number;
  timestamps: number[]; // Array of timestamps for each reading
}

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get reading records from localStorage
 */
export function getReadingRecords(): ReadingRecord {
  if (typeof window === 'undefined') {
    return { date: getTodayDate(), count: 0, timestamps: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { date: getTodayDate(), count: 0, timestamps: [] };
    }

    const record: ReadingRecord = JSON.parse(stored);
    const today = getTodayDate();

    // If stored date is not today, reset
    if (record.date !== today) {
      return { date: today, count: 0, timestamps: [] };
    }

    return record;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { date: getTodayDate(), count: 0, timestamps: [] };
  }
}

/**
 * Save reading records to localStorage
 */
export function saveReadingRecords(record: ReadingRecord): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Check if user can perform another reading today
 */
export function canPerformReading(): boolean {
  const record = getReadingRecords();
  return record.count < MAX_READINGS_PER_DAY;
}

/**
 * Get remaining readings for today
 */
export function getRemainingReadings(): number {
  const record = getReadingRecords();
  return Math.max(0, MAX_READINGS_PER_DAY - record.count);
}

/**
 * Record a new reading
 */
export function recordReading(): boolean {
  const record = getReadingRecords();
  
  if (record.count >= MAX_READINGS_PER_DAY) {
    return false;
  }

  record.count += 1;
  record.timestamps.push(Date.now());
  saveReadingRecords(record);
  
  return true;
}

/**
 * Get reading count for today
 */
export function getTodayReadingCount(): number {
  const record = getReadingRecords();
  return record.count;
}

/**
 * Reset reading records (useful for testing or admin)
 */
export function resetReadingRecords(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting reading records:', error);
  }
}

/**
 * Get time until next reading is available (in milliseconds)
 * Returns 0 if readings are available, or time until midnight UTC
 */
export function getTimeUntilNextReading(): number {
  const record = getReadingRecords();
  
  if (record.count < MAX_READINGS_PER_DAY) {
    return 0;
  }

  // Calculate time until next midnight UTC
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  return tomorrow.getTime() - now.getTime();
}

/**
 * Format time until next reading as human-readable string
 */
export function formatTimeUntilNextReading(): string {
  const ms = getTimeUntilNextReading();
  
  if (ms === 0) {
    return '';
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

