import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Plus, X, BookOpen, Clock, Users, Calendar, Edit2, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { DAYS_OF_WEEK } from '../lib/utils';
import { Batch, DayOfWeek } from '../types';
import { CustomTimeInput } from './ui/CustomTimeInput';

export function Batches() {
  const { batches, addBatch, updateBatch, deleteBatch, students, fees } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', subject: '', time: '', days: [] as DayOfWeek[] });
  const [dayTimes, setDayTimes] = useState<Partial<Record<DayOfWeek, { start: string, end: string }>>>({});

  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const parseTime12to24 = (time12h: string) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    if (!time || !modifier) return '';
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const parseTimeRange = (timeString: string) => {
    if (!timeString) return { start: '', end: '' };
    const parts = timeString.split(' - ');
    if (parts.length !== 2) return { start: '', end: '' };
    return {
      start: parseTime12to24(parts[0]),
      end: parseTime12to24(parts[1])
    };
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.subject || newBatch.days.length === 0) return;
    
    for (const day of newBatch.days) {
      if (!dayTimes[day]?.start || !dayTimes[day]?.end) {
        alert(`Please set start and end time for ${day}`);
        return;
      }
    }

    const cleanedDayTimes: Partial<Record<DayOfWeek, { start: string, end: string }>> = {};
    newBatch.days.forEach(day => {
      if (dayTimes[day]) cleanedDayTimes[day] = dayTimes[day];
    });

    const timeString = newBatch.days.map(day => {
      const times = cleanedDayTimes[day];
      if (times && times.start && times.end) {
        return `${day} (${formatTime12h(times.start)} - ${formatTime12h(times.end)})`;
      }
      return '';
    }).filter(Boolean).join(', ');
    
    addBatch({ ...newBatch, time: timeString, dayTimes: cleanedDayTimes });
    setNewBatch({ name: '', subject: '', time: '', days: [] });
    setDayTimes({});
    setIsAdding(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editingBatch.name || !editingBatch.subject || editingBatch.days.length === 0) return;
    
    for (const day of editingBatch.days) {
      if (!dayTimes[day]?.start || !dayTimes[day]?.end) {
        alert(`Please set start and end time for ${day}`);
        return;
      }
    }

    setConfirmUpdate(true);
  };

  const executeEdit = () => {
    if (!editingBatch) return;

    const cleanedDayTimes: Partial<Record<DayOfWeek, { start: string, end: string }>> = {};
    editingBatch.days.forEach(day => {
      if (dayTimes[day]) cleanedDayTimes[day] = dayTimes[day];
    });

    const timeString = editingBatch.days.map(day => {
      const times = cleanedDayTimes[day];
      if (times && times.start && times.end) {
        return `${day} (${formatTime12h(times.start)} - ${formatTime12h(times.end)})`;
      }
      return '';
    }).filter(Boolean).join(', ');
    
    updateBatch(editingBatch.id, { ...editingBatch, time: timeString, dayTimes: cleanedDayTimes });
    setEditingBatch(null);
    setDayTimes({});
    setConfirmUpdate(false);
  };

  const startEditing = (batch: Batch) => {
    setEditingBatch(batch);
    if (batch.dayTimes) {
      setDayTimes(batch.dayTimes);
    } else {
      const parsed = parseTimeRange(batch.time);
      const newDayTimes: Partial<Record<DayOfWeek, { start: string, end: string }>> = {};
      batch.days.forEach(day => {
        newDayTimes[day] = parsed;
      });
      setDayTimes(newDayTimes);
    }
    setIsAdding(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    setNewBatch((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Batch Management</h2>
          <p className="text-[#A0A0A0]">Organize your classes and schedules.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Batch
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Create New Batch</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    placeholder="e.g., Morning Physics A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Subject</label>
                  <input
                    type="text"
                    value={newBatch.subject}
                    onChange={(e) => setNewBatch({ ...newBatch, subject: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    placeholder="e.g., Advanced Physics"
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Days & Times</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          newBatch.days.includes(day)
                            ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/50 shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                            : 'bg-[#0A0A0A] text-[#A0A0A0] border border-white/10 hover:border-white/30'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  
                  {newBatch.days.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {newBatch.days.map(day => (
                        <div key={day} className="flex items-center gap-4 bg-[#0A0A0A] p-3 rounded-xl border border-white/10">
                          <span className="w-12 font-medium text-white">{day}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <CustomTimeInput
                              value={dayTimes[day]?.start || ''}
                              onChange={(val) => setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], start: val, end: prev[day]?.end || '' } }))}
                              className="flex-1 px-3 py-2 text-sm"
                              required
                            />
                            <span className="text-[#A0A0A0]">to</span>
                            <CustomTimeInput
                              value={dayTimes[day]?.end || ''}
                              onChange={(val) => setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], end: val, start: prev[day]?.start || '' } }))}
                              className="flex-1 px-3 py-2 text-sm"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#EAEAEA] transition-colors"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {editingBatch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleEdit} className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative">
              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Edit Batch</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={editingBatch.name}
                    onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Subject</label>
                  <input
                    type="text"
                    value={editingBatch.subject}
                    onChange={(e) => setEditingBatch({ ...editingBatch, subject: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Days & Times</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setEditingBatch(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
                            };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          editingBatch.days.includes(day)
                            ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/50 shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                            : 'bg-[#0A0A0A] text-[#A0A0A0] border border-white/10 hover:border-white/30'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  
                  {editingBatch.days.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {editingBatch.days.map(day => (
                        <div key={day} className="flex items-center gap-4 bg-[#0A0A0A] p-3 rounded-xl border border-white/10">
                          <span className="w-12 font-medium text-white">{day}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <CustomTimeInput
                              value={dayTimes[day]?.start || ''}
                              onChange={(val) => setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], start: val, end: prev[day]?.end || '' } }))}
                              className="flex-1 px-3 py-2 text-sm"
                              required
                            />
                            <span className="text-[#A0A0A0]">to</span>
                            <CustomTimeInput
                              value={dayTimes[day]?.end || ''}
                              onChange={(val) => setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], end: val, start: prev[day]?.start || '' } }))}
                              className="flex-1 px-3 py-2 text-sm"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-6 py-3 bg-transparent text-white font-bold rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#EAEAEA] transition-colors"
                >
                  Update Batch
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch, i) => {
          const batchStudents = students.filter(s => s.batchId === batch.id).length;
          return (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative group hover:border-[#7C3AED]/50 transition-all duration-300"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-all">
                <button
                  onClick={() => setViewingBatch(batch)}
                  className="p-2 bg-[#121212] border border-white/10 text-[#A0A0A0] hover:text-[#00F5FF] hover:border-[#00F5FF]/50 rounded-lg transition-all"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEditing(batch)}
                  className="p-2 bg-[#121212] border border-white/10 text-[#A0A0A0] hover:text-[#7C3AED] hover:border-[#7C3AED]/50 rounded-lg transition-all"
                  title="Edit Batch"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingBatchId(batch.id)}
                  className="p-2 bg-[#121212] border border-white/10 text-[#A0A0A0] hover:text-red-500 hover:border-red-500/50 rounded-lg transition-all"
                  title="Delete Batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent flex items-center justify-center mb-4 border border-[#7C3AED]/20">
                <BookOpen className="w-6 h-6 text-[#7C3AED]" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{batch.name}</h3>
              <p className="text-[#A0A0A0] text-sm mb-6">{batch.subject}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-[#EAEAEA]">
                  <Clock className="w-4 h-4 mr-3 text-[#00F5FF]" />
                  {batch.time}
                </div>
                <div className="flex items-center text-sm text-[#EAEAEA]">
                  <Calendar className="w-4 h-4 mr-3 text-[#00F5FF]" />
                  {batch.days.join(', ')}
                </div>
                <div className="flex items-center text-sm text-[#EAEAEA]">
                  <Users className="w-4 h-4 mr-3 text-[#00F5FF]" />
                  {batchStudents} Students Enrolled
                </div>
              </div>
            </motion.div>
          );
        })}
        {batches.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-20 text-[#A0A0A0] border border-dashed border-white/10 rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No batches found.</p>
            <p className="text-sm mt-1">Create your first batch to get started.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmUpdate(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-[#00F5FF]/20 relative z-10 w-full max-w-md shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#00F5FF]/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-[#00F5FF]" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Update Batch?</h3>
              <p className="text-[#A0A0A0] text-center mb-6">
                Are you sure you want to update this batch? This will overwrite the previous schedule and remove any unselected days.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmUpdate(false)}
                  className="flex-1 px-4 py-3 bg-[#0A0A0A] text-white font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeEdit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all"
                >
                  Confirm Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingBatchId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingBatchId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-red-500/20 relative z-10 w-full max-w-md shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Batch?</h3>
              <p className="text-[#A0A0A0] text-center mb-6">
                Are you sure you want to delete this batch? This action cannot be undone and will affect enrolled students.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingBatchId(null)}
                  className="flex-1 px-4 py-3 bg-[#0A0A0A] text-white font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteBatch(deletingBatchId);
                    setDeletingBatchId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingBatch(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative z-10 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setViewingBatch(null)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent flex items-center justify-center border border-[#7C3AED]/20">
                  <BookOpen className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{viewingBatch.name}</h3>
                  <p className="text-[#A0A0A0]">{viewingBatch.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-[#A0A0A0] mb-1">Time</p>
                  <p className="text-sm font-medium text-white">{viewingBatch.time}</p>
                </div>
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-[#A0A0A0] mb-1">Days</p>
                  <p className="text-sm font-medium text-white">{viewingBatch.days.join(', ')}</p>
                </div>
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-[#A0A0A0] mb-1">Total Students</p>
                  <p className="text-sm font-medium text-white">{students.filter(s => s.batchId === viewingBatch.id).length}</p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-white mb-4">Enrolled Students</h4>
              <div className="bg-[#0A0A0A] rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[#A0A0A0] text-sm uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Join Date</th>
                      <th className="px-4 py-3 font-medium">Pending Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.filter(s => s.batchId === viewingBatch.id).map(student => {
                      const currentMonthStr = format(new Date(), 'yyyy-MM');
                      const pastAndPresentFees = fees.filter(f => f.month <= currentMonthStr);
                      const pendingFeesCount = pastAndPresentFees.filter(f => f.studentId === student.id && f.status === 'Pending').length;
                      return (
                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{student.name}</td>
                          <td className="px-4 py-3 text-[#A0A0A0] text-sm">{student.joinDate}</td>
                          <td className="px-4 py-3">
                            {pendingFeesCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {pendingFeesCount} Months Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Clear
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {students.filter(s => s.batchId === viewingBatch.id).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-[#A0A0A0]">
                          No students enrolled in this batch yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
