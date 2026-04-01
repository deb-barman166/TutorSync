export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Batch {
  id: string;
  name: string;
  subject: string;
  days: DayOfWeek[];
  time: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  batchId: string;
  joinDate: string;
  feeAmount: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // Format: YYYY-MM
  amount: number;
  status: 'Paid' | 'Pending';
  paidDate?: string;
}

export interface FreeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  note?: string;
}
