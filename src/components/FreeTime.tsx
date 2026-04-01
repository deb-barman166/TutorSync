import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Clock, Calendar } from 'lucide-react';
import { DAYS_OF_WEEK } from '../lib/utils';
import { DayOfWeek } from '../types';

// Helper to parse "10:00 AM" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else if (modifier === 'PM') {
    hours += 12;
  }
  return hours * 60 + minutes;
}

// Helper to format minutes since midnight to "10:00 AM"
function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const modifier = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${modifier}`;
}

export function FreeTime() {
  const { batches } = useAppStore();

  // Calculate free slots automatically based on batches
  const autoFreeSlots = useMemo(() => {
    const WORK_START = 8 * 60; // 8:00 AM
    const WORK_END = 20 * 60; // 8:00 PM

    const slotsByDay: Record<DayOfWeek, { start: number; end: number }[]> = {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    };

    // Gather all busy slots
    batches.forEach(batch => {
      try {
        const [startStr, endStr] = batch.time.split(' - ');
        if (!startStr || !endStr) return;
        
        const startMin = parseTimeToMinutes(startStr);
        const endMin = parseTimeToMinutes(endStr);

        batch.days.forEach(day => {
          slotsByDay[day].push({ start: startMin, end: endMin });
        });
      } catch (e) {
        // Ignore invalid time formats
      }
    });

    // Calculate free slots for each day
    const freeSlots: Record<DayOfWeek, { startTime: string; endTime: string; isFullDay?: boolean }[]> = {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    };

    DAYS_OF_WEEK.forEach(day => {
      // Sort busy slots by start time
      const busySlots = slotsByDay[day].sort((a, b) => a.start - b.start);
      
      if (busySlots.length === 0) {
        freeSlots[day].push({ startTime: 'Full Day', endTime: 'Free', isFullDay: true });
        return;
      }
      
      // Merge overlapping busy slots
      const mergedBusy: { start: number; end: number }[] = [];
      if (busySlots.length > 0) {
        let current = { ...busySlots[0] };
        for (let i = 1; i < busySlots.length; i++) {
          if (busySlots[i].start <= current.end) {
            current.end = Math.max(current.end, busySlots[i].end);
          } else {
            mergedBusy.push(current);
            current = { ...busySlots[i] };
          }
        }
        mergedBusy.push(current);
      }

      // Find gaps
      let currentTime = WORK_START;
      mergedBusy.forEach(busy => {
        if (busy.start > currentTime) {
          freeSlots[day].push({
            startTime: formatMinutesToTime(currentTime),
            endTime: formatMinutesToTime(busy.start)
          });
        }
        currentTime = Math.max(currentTime, busy.end);
      });

      if (currentTime < WORK_END) {
        freeSlots[day].push({
          startTime: formatMinutesToTime(currentTime),
          endTime: formatMinutesToTime(WORK_END)
        });
      }
    });

    return freeSlots;
  }, [batches]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Free Time Tracker</h2>
          <p className="text-[#A0A0A0]">Automatically calculated free slots between 8:00 AM and 8:00 PM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = autoFreeSlots[day];
          return (
            <div key={day} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full min-h-[300px]">
              <div className="bg-white/5 p-3 text-center font-bold text-white border-b border-white/5">
                {day}
              </div>
              <div className="p-3 flex-1 space-y-3 bg-gradient-to-b from-transparent to-black/20">
                {daySlots.length > 0 ? (
                  daySlots.map((slot, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 relative group hover:border-emerald-500/50 transition-colors"
                    >
                      {slot.isFullDay ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Clock className="w-6 h-6 text-emerald-400 mb-2" />
                          <span className="text-emerald-400 font-bold text-center">Full Day Free</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold text-sm">
                                {slot.startTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 flex justify-center"><div className="w-0.5 h-3 bg-emerald-500/30 rounded-full"></div></div>
                              <span className="text-[#A0A0A0] text-xs">to</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold text-sm">
                                {slot.endTime}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-emerald-500/70 mt-2 font-medium">Available</p>
                        </>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-[#A0A0A0] text-xs opacity-50">
                    Fully Booked
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
