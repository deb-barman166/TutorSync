import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Calendar, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { format, parse } from 'date-fns';
import { CustomSelect } from './CustomSelect';

import { CustomDatePicker } from './ui/CustomDatePicker';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AnimatePresence } from 'framer-motion';

export function Attendance() {
  const { batches, students, attendance, markAttendance } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<any>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;
  const isFuture = selectedDate > todayStr;

  // Get day of week for selected date (e.g., 'Mon', 'Tue')
  const selectedDayOfWeek = useMemo(() => {
    const date = new Date(selectedDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }, [selectedDate]);

  // Filter batches that happen on the selected day
  const batchesOnDay = useMemo(() => {
    return batches.filter(b => b.days.includes(selectedDayOfWeek as any));
  }, [batches, selectedDayOfWeek]);

  // Auto-select first batch if none selected or selected is not on this day
  useMemo(() => {
    if (batchesOnDay.length > 0) {
      if (!selectedBatchId || !batchesOnDay.find(b => b.id === selectedBatchId)) {
        setSelectedBatchId(batchesOnDay[0].id);
      }
    } else {
      setSelectedBatchId('');
    }
  }, [batchesOnDay, selectedBatchId]);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const batchStudents = students.filter(s => s.batchId === selectedBatchId);

  // Check if current time is within the batch time (only relevant if isToday)
  const isRightTime = useMemo(() => {
    if (!isToday || !selectedBatch) return false;
    
    let startTimeStr = selectedBatch.time;
    let endTimeStr = ''; // We don't have end time strictly, but maybe we can just allow it if it's today.
    // The user requested: "teacher can check ✅ the student when the right time (5:30 PM to 7:00 PM)"
    // Since we only have a start time in Batch (or dayTimes), let's check dayTimes if available.
    if (selectedBatch.dayTimes && selectedBatch.dayTimes[selectedDayOfWeek as any]) {
      startTimeStr = selectedBatch.dayTimes[selectedDayOfWeek as any]!.start;
      endTimeStr = selectedBatch.dayTimes[selectedDayOfWeek as any]!.end;
    }

    if (!startTimeStr) return true; // Fallback

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;

    const parseTime = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const startMins = parseTime(startTimeStr);
    const endMins = endTimeStr ? parseTime(endTimeStr) : startMins + 120; // Assume 2 hours if no end time

    // Allow marking attendance from 30 mins before start to 30 mins after end
    return currentTime >= (startMins - 30) && currentTime <= (endMins + 30);
  }, [isToday, selectedBatch, selectedDayOfWeek]);

  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${m} ${ampm}`;
  };

  const getBatchTimeDisplay = () => {
    if (!selectedBatch) return '';
    if (selectedBatch.dayTimes && selectedBatch.dayTimes[selectedDayOfWeek as any]) {
      const { start, end } = selectedBatch.dayTimes[selectedDayOfWeek as any]!;
      return `${formatTime(start)} to ${formatTime(end)}`;
    }
    return formatTime(selectedBatch.time);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00F5FF]" />
            Attendance
          </h2>
          <p className="text-[#A0A0A0] text-sm mt-1">Track student attendance for your classes</p>
        </div>
        <div className="flex bg-[#121212] rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setViewMode('mark')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'mark'
                ? 'bg-[#00F5FF]/20 text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'history'
                ? 'bg-[#00F5FF]/20 text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {viewMode === 'mark' ? (
        <div className="bg-[#121212] p-6 rounded-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Select Date</label>
              <CustomDatePicker
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Select Batch</label>
              <CustomSelect
                value={selectedBatchId}
                onChange={setSelectedBatchId}
                options={batchesOnDay.map(b => ({ value: b.id, label: `${b.name} - ${b.subject}` }))}
                placeholder={batchesOnDay.length > 0 ? "Select a batch" : "No batches on this day"}
              />
            </div>
          </div>

          {selectedBatch && (
            <div className="mb-6 p-4 bg-[#0A0A0A] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedBatch.name}</h3>
                <p className="text-[#A0A0A0] text-sm">{selectedBatch.subject}</p>
              </div>
              <div className="flex items-center gap-2 text-[#00F5FF] bg-[#00F5FF]/10 px-3 py-1.5 rounded-lg border border-[#00F5FF]/20">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{getBatchTimeDisplay()}</span>
              </div>
            </div>
          )}

          {!isRightTime && isToday && selectedBatch && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
              Note: It is currently not the scheduled time for this class. Attendance can only be marked during the scheduled class time.
            </div>
          )}
          {isFuture && selectedBatch && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
              Note: You cannot mark attendance for future dates.
            </div>
          )}

          {!selectedBatch ? (
            <div className="text-center py-12 text-[#A0A0A0]">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Select a date and batch to manage attendance</p>
            </div>
          ) : batchStudents.length === 0 ? (
            <div className="text-center py-12 text-[#A0A0A0]">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No students in this batch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batchStudents.map(student => {
                const record = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                const status = record?.status;
                const isDisabled = (!isRightTime && isToday) || isFuture;

                return (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="font-medium text-white">{student.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAttendance(student.id, selectedBatch.id, selectedDate, 'Present')}
                        disabled={isDisabled}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          status === 'Present' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-white/5 text-[#A0A0A0] hover:bg-white/10 border border-transparent'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, selectedBatch.id, selectedDate, 'Absent')}
                        disabled={isDisabled}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          status === 'Absent' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-white/5 text-[#A0A0A0] hover:bg-white/10 border border-transparent'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <XCircle className="w-4 h-4" />
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, i) => {
            const batch = batches.find(b => b.id === student.batchId);
            const studentAttendance = attendance.filter(a => a.studentId === student.id);
            const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
            const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
            const total = presentCount + absentCount;
            const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedHistoryStudent(student)}
                className="bg-[#121212] p-6 rounded-2xl border border-white/10 hover:border-[#00F5FF]/50 relative overflow-hidden transition-all duration-300 cursor-pointer group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20 bg-[#00F5FF]" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#00F5FF]/10 border-[#00F5FF]/20 text-[#00F5FF]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#00F5FF] transition-colors">{student.name}</h3>
                    <p className="text-sm text-[#A0A0A0] mb-3">{batch?.name || 'Unassigned Batch'}</p>
                    
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                        {presentCount} Present
                      </div>
                      <div className="text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                        {absentCount} Absent
                      </div>
                      <div className="text-[#00F5FF] bg-[#00F5FF]/10 px-2 py-1 rounded-md border border-[#00F5FF]/20 ml-auto">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {students.length === 0 && (
            <div className="col-span-full text-center py-20 text-[#A0A0A0] border border-dashed border-white/10 rounded-2xl">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No students found.</p>
            </div>
          )}
        </div>
      )}

      {/* Student History Modal */}
      <AnimatePresence>
        {selectedHistoryStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHistoryStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-4 sm:p-6 rounded-2xl border border-white/10 relative z-10 w-full max-w-5xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedHistoryStudent(null)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors z-10"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/20 flex items-center justify-center border border-white/10">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedHistoryStudent.name}</h3>
                  <p className="text-[#A0A0A0]">Full Year Attendance</p>
                </div>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                <AttendanceCalendar studentId={selectedHistoryStudent.id} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
