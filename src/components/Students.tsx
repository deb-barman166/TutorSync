import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../lib/store';
import { Plus, X, Search, User, Phone, Calendar, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Student } from '../types';

import { CustomSelect } from './CustomSelect';

export function Students() {
  const { students, addStudent, updateStudent, deleteStudent, batches, currency } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', phone: '', batchId: '', joinDate: format(new Date(), 'yyyy-MM-dd'), feeAmount: 1000 });
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.phone || !newStudent.batchId || newStudent.feeAmount <= 0) return;
    addStudent(newStudent);
    setNewStudent({ name: '', phone: '', batchId: '', joinDate: format(new Date(), 'yyyy-MM-dd'), feeAmount: 1000 });
    setIsAdding(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, {
      name: editingStudent.name,
      phone: editingStudent.phone,
      batchId: editingStudent.batchId,
      joinDate: editingStudent.joinDate,
      feeAmount: editingStudent.feeAmount,
    });
    setEditingStudent(null);
  };

  const confirmDelete = () => {
    if (deletingStudentId) {
      deleteStudent(deletingStudentId);
      setDeletingStudentId(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Student Directory</h2>
          <p className="text-[#A0A0A0]">Manage your students and their batch assignments.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-300 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative mb-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Register New Student</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    placeholder="e.g., Alex Johnson"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    placeholder="e.g., +1 234 567 8900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Assign Batch</label>
                  <CustomSelect
                    value={newStudent.batchId}
                    onChange={(value) => setNewStudent({ ...newStudent, batchId: value })}
                    options={batches.map(b => ({ value: b.id, label: `${b.name} (${b.subject})` }))}
                    placeholder="Select a batch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Join Date</label>
                  <input
                    type="date"
                    value={newStudent.joinDate}
                    onChange={(e) => setNewStudent({ ...newStudent, joinDate: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Monthly Fee ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudent.feeAmount}
                    onChange={(e) => setNewStudent({ ...newStudent, feeAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#EAEAEA] transition-colors"
                >
                  Save Student
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[#A0A0A0] text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map((student, i) => {
                const batch = batches.find(b => b.id === student.batchId);
                return (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/20 flex items-center justify-center border border-white/10">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#EAEAEA]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#A0A0A0]" />
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
                        {batch?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {student.joinDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-[#A0A0A0] hover:text-[#00F5FF] transition-colors p-2 rounded-lg hover:bg-[#00F5FF]/10"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(student.id)}
                          className="text-[#A0A0A0] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#A0A0A0]">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No students found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-white/10 relative z-10 w-full max-w-2xl shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Edit Student</h3>
              
              <form onSubmit={handleEdit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editingStudent.phone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Assign Batch</label>
                    <CustomSelect
                      value={editingStudent.batchId}
                      onChange={(value) => setEditingStudent({ ...editingStudent, batchId: value })}
                      options={batches.map(b => ({ value: b.id, label: `${b.name} (${b.subject})` }))}
                      placeholder="Select a batch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Join Date</label>
                    <input
                      type="date"
                      value={editingStudent.joinDate}
                      onChange={(e) => setEditingStudent({ ...editingStudent, joinDate: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors [color-scheme:dark]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Monthly Fee ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStudent.feeAmount || 0}
                      onChange={(e) => setEditingStudent({ ...editingStudent, feeAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingStudentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingStudentId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] p-6 rounded-2xl border border-red-500/20 relative z-10 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Student?</h3>
              <p className="text-[#A0A0A0] mb-8">
                Are you sure you want to delete this student? This action cannot be undone and will remove all associated fee records.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeletingStudentId(null)}
                  className="px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30 flex-1"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

