import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Search, Coins, CheckCircle2, AlertCircle, User, Filter, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Student } from '../types';

import { CustomSelect } from './CustomSelect';

export function Fees() {
  const { fees, students, batches, updateFeeStatus, currency } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Has Pending' | 'All Clear'>('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.phone.includes(searchQuery);
      const matchesBatch = batchFilter === 'All' || student.batchId === batchFilter;
      
      const studentFees = fees.filter(f => f.studentId === student.id);
      const hasPending = studentFees.some(f => f.status === 'Pending');
      
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Has Pending' && hasPending) || 
        (statusFilter === 'All Clear' && !hasPending);

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [students, fees, searchQuery, batchFilter, statusFilter]);

  const selectedStudentFees = useMemo(() => {
    if (!selectedStudent) return [];
    return fees
      .filter(f => f.studentId === selectedStudent.id)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [fees, selectedStudent]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Fee Management</h2>
          <p className="text-[#A0A0A0]">Track student payments and pending dues.</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-[#121212] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-[#A0A0A0] font-medium mr-2">
          <Filter className="w-5 h-5" />
          <span>Filters:</span>
        </div>
        
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
          />
        </div>

        <div className="w-full md:w-48">
          <CustomSelect
            value={batchFilter}
            onChange={(value) => setBatchFilter(value)}
            options={[
              { value: 'All', label: 'All Batches' },
              ...batches.map(b => ({ value: b.id, label: b.name }))
            ]}
          />
        </div>

        <div className="w-full md:w-48">
          <CustomSelect
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as any)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Has Pending', label: 'Has Pending Fees' },
              { value: 'All Clear', label: 'All Clear' }
            ]}
          />
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, i) => {
          const studentFees = fees.filter(f => f.studentId === student.id);
          const pendingCount = studentFees.filter(f => f.status === 'Pending').length;
          const batch = batches.find(b => b.id === student.batchId);
          
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedStudent(student)}
              className={`bg-[#121212] p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 cursor-pointer group ${
                pendingCount === 0 ? 'border-emerald-500/20 hover:border-emerald-500/50' : 'border-red-500/20 hover:border-red-500/50'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20 ${
                pendingCount === 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  pendingCount === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#00F5FF] transition-colors">{student.name}</h3>
                  <p className="text-sm text-[#A0A0A0] mb-3">{batch?.name || 'Unassigned Batch'}</p>
                  
                  {pendingCount > 0 ? (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle className="w-3 h-3 mr-1.5" />
                      {pendingCount} Months Pending
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      All Clear
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-20 text-[#A0A0A0] border border-dashed border-white/10 rounded-2xl">
            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No students found matching filters.</p>
          </div>
        )}
      </div>

      {/* Student Fees Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative z-10 w-full max-w-4xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/20 flex items-center justify-center border border-white/10">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-[#A0A0A0]">Fee Records (12 Months)</p>
                </div>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStudentFees.map((fee, i) => {
                    const isPaid = fee.status === 'Paid';
                    return (
                      <motion.div
                        key={fee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`bg-[#0A0A0A] p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                          isPaid ? 'border-emerald-500/20' : 'border-red-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <Calendar className="w-4 h-4 text-[#A0A0A0]" />
                            {format(new Date(fee.month + '-01'), 'MMMM yyyy')}
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {fee.status}
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-4">
                          <div>
                            <p className="text-xs text-[#A0A0A0] mb-0.5">Amount</p>
                            <p className="text-xl font-bold text-white">{currency}{fee.amount.toFixed(2)}</p>
                          </div>
                          
                          {!isPaid && (
                            <button
                              onClick={() => updateFeeStatus(fee.id, 'Paid')}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                            >
                              Mark Paid
                            </button>
                          )}
                          {isPaid && fee.paidDate && (
                            <div className="text-right">
                              <p className="text-[10px] text-[#A0A0A0]">Paid on</p>
                              <p className="text-xs text-emerald-400">{format(new Date(fee.paidDate), 'MMM do, yyyy')}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {selectedStudentFees.length === 0 && (
                    <div className="col-span-full text-center py-10 text-[#A0A0A0]">
                      No fee records found for this student.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
