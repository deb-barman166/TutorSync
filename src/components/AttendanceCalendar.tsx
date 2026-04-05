import React, { useMemo, useState } from 'react';
import { useAppStore } from '../lib/store';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, isSameDay, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AttendanceCalendar({ studentId }: { studentId: string }) {
  const { attendance } = useAppStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const studentAttendance = useMemo(() => {
    return attendance.filter(a => a.studentId === studentId);
  }, [attendance, studentId]);

  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = endOfMonth(monthStart);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      result.push({
        monthStart,
        days
      });
    }
    return result;
  }, [currentYear]);

  const getStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = studentAttendance.find(a => a.date === dateStr);
    return record?.status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
        <button 
          onClick={() => setCurrentYear(y => y - 1)}
          className="p-2 hover:bg-white/10 rounded-lg text-[#A0A0A0] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white tracking-wider">{currentYear}</h3>
        <button 
          onClick={() => setCurrentYear(y => y + 1)}
          className="p-2 hover:bg-white/10 rounded-lg text-[#A0A0A0] hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month, index) => (
          <div key={index} className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
            <h4 className="text-white font-medium mb-3 text-center">{format(month.monthStart, 'MMMM')}</h4>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-[10px] text-center text-[#A0A0A0] font-medium">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getDay(month.monthStart) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {month.days.map(day => {
                const status = getStatus(day);
                const isCurrentDay = isToday(day);
                
                let circleClass = "bg-white/5 border-white/10";
                if (status === 'Present') {
                  circleClass = "bg-emerald-500/10 neon-pulse-green text-emerald-400 font-bold";
                } else if (status === 'Absent') {
                  circleClass = "bg-red-500/10 neon-pulse-red text-red-400 font-bold";
                }

                return (
                  <div 
                    key={day.toISOString()} 
                    className="aspect-square flex items-center justify-center relative group"
                  >
                    <div className={`w-full h-full rounded-full border flex items-center justify-center text-[10px] transition-all ${circleClass} ${isCurrentDay ? 'ring-1 ring-[#00F5FF]' : ''}`}>
                      <span className={status ? 'text-current drop-shadow-md' : 'text-[#A0A0A0]'}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <div className="bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-white/20">
                        {format(day, 'MMM d, yyyy')}
                        {status && <span className="ml-1 font-bold">({status})</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
