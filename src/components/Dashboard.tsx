import { motion } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Users, BookOpen, Coins, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { DayOfWeek } from '../types';

export function Dashboard() {
  const { students, batches, fees, currency, dashboardTimeStart, dashboardTimeEnd } = useAppStore();

  const totalStudents = students.length;
  const totalBatches = batches.length;
  
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  
  // Only consider fees up to the current month (past and present)
  const pastAndPresentFees = fees.filter(f => f.month <= currentMonthStr);
  
  const pendingFees = pastAndPresentFees.filter((f) => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalCollected = fees.filter((f) => {
    if (f.status !== 'Paid') return false;
    
    if (!dashboardTimeStart && !dashboardTimeEnd) return true;
    
    const [feeYear, feeMonth] = f.month.split('-');
    const feeDate = new Date(Number(feeYear), Number(feeMonth) - 1, 1);
    
    if (dashboardTimeStart) {
      const [startYear, startMonth] = dashboardTimeStart.split('-');
      const startDate = new Date(Number(startYear), Number(startMonth) - 1, 1);
      if (feeDate < startDate) return false;
    }
    
    if (dashboardTimeEnd) {
      const [endYear, endMonth] = dashboardTimeEnd.split('-');
      const endDate = new Date(Number(endYear), Number(endMonth), 0); // Last day of the month
      if (feeDate > endDate) return false;
    }

    return true;
  }).reduce((acc, curr) => acc + curr.amount, 0);

  let collectedLabel = 'Collected (All Time)';
  if (dashboardTimeStart && dashboardTimeEnd) {
    const [startYear, startMonth] = dashboardTimeStart.split('-');
    const [endYear, endMonth] = dashboardTimeEnd.split('-');
    collectedLabel = `Collected (${format(new Date(Number(startYear), Number(startMonth) - 1, 1), 'MMM yyyy')} - ${format(new Date(Number(endYear), Number(endMonth) - 1, 1), 'MMM yyyy')})`;
  } else if (dashboardTimeStart) {
    const [startYear, startMonth] = dashboardTimeStart.split('-');
    collectedLabel = `Collected (From ${format(new Date(Number(startYear), Number(startMonth) - 1, 1), 'MMM yyyy')})`;
  } else if (dashboardTimeEnd) {
    const [endYear, endMonth] = dashboardTimeEnd.split('-');
    collectedLabel = `Collected (Until ${format(new Date(Number(endYear), Number(endMonth) - 1, 1), 'MMM yyyy')})`;
  }

  const todayStr = format(new Date(), 'EEE') as DayOfWeek;
  const todaysBatches = batches.filter((b) => b.days.includes(todayStr));

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'from-blue-500/20 to-blue-500/0', textColor: 'text-blue-400' },
    { label: 'Active Batches', value: totalBatches, icon: BookOpen, color: 'from-purple-500/20 to-purple-500/0', textColor: 'text-purple-400' },
    { label: 'Pending Fees (Up to Now)', value: `${currency}${pendingFees}`, icon: Coins, color: 'from-red-500/20 to-red-500/0', textColor: 'text-red-400' },
    { label: collectedLabel, value: `${currency}${totalCollected}`, icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-500/0', textColor: 'text-emerald-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-[#A0A0A0]">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#A0A0A0] font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${stat.textColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#121212] p-6 rounded-2xl border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00F5FF]" />
              Today's Classes
            </h3>
            <span className="text-sm text-[#A0A0A0]">{format(new Date(), 'EEEE, MMM do')}</span>
          </div>

          {todaysBatches.length > 0 ? (
            <div className="space-y-4">
              {todaysBatches.map((batch) => {
                const batchStudents = students.filter(s => s.batchId === batch.id).length;
                let displayTime = batch.time;
                if (batch.dayTimes && batch.dayTimes[todayStr]) {
                  const times = batch.dayTimes[todayStr];
                  if (times && times.start && times.end) {
                    const formatTime12h = (time24: string) => {
                      if (!time24) return '';
                      const [h, m] = time24.split(':');
                      const hours = parseInt(h, 10);
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const h12 = hours % 12 || 12;
                      return `${h12}:${m} ${ampm}`;
                    };
                    displayTime = `${formatTime12h(times.start)} - ${formatTime12h(times.end)}`;
                  }
                }
                return (
                  <div key={batch.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <h4 className="font-semibold text-white">{batch.name}</h4>
                      <p className="text-sm text-[#A0A0A0]">{batch.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#00F5FF] font-medium">{displayTime}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{batchStudents} students</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[#A0A0A0]">
              <p>No classes scheduled for today.</p>
              <p className="text-sm mt-1">Enjoy your free time!</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#121212] p-6 rounded-2xl border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#7C3AED]" />
              Recent Pending Fees
            </h3>
          </div>

          {pastAndPresentFees.filter(f => f.status === 'Pending').length > 0 ? (
            <div className="space-y-4">
              {pastAndPresentFees.filter(f => f.status === 'Pending').slice(0, 5).map((fee) => {
                const student = students.find(s => s.id === fee.studentId);
                return (
                  <div key={fee.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <h4 className="font-semibold text-white">{student?.name || 'Unknown Student'}</h4>
                      <p className="text-sm text-[#A0A0A0]">Month: {fee.month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-medium">{currency}{fee.amount}</p>
                      <span className="inline-block px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs mt-1">
                        Pending
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[#A0A0A0]">
              <p>All fees are cleared!</p>
              <p className="text-sm mt-1">Great job collecting payments.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
