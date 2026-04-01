import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../lib/store';
import { User, Coins, Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import * as XLSX from 'xlsx';

export function Settings() {
  const { teacherName, currency, updateSettings, batches, students, fees, freeSlots } = useAppStore();

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportBatches = (format: 'csv' | 'xlsx') => {
    const data = batches.map(batch => {
      const batchStudents = students.filter(s => s.batchId === batch.id);
      return {
        'Batch Name': batch.name,
        'Subject': batch.subject,
        'Days': batch.days.join(', '),
        'Time': batch.time,
        'Total Students': batchStudents.length,
      };
    });

    if (data.length === 0) {
      alert('No batch data to export.');
      return;
    }

    if (format === 'csv') {
      exportToCSV(data, 'Batches_Data');
    } else {
      exportToExcel(data, 'Batches_Data');
    }
  };

  const exportFees = (format: 'csv' | 'xlsx') => {
    const data = fees.map(fee => {
      const student = students.find(s => s.id === fee.studentId);
      const batch = batches.find(b => b.id === student?.batchId);
      return {
        'Student Name': student?.name || 'Unknown',
        'Phone': student?.phone || 'N/A',
        'Batch Name': batch?.name || 'Unassigned',
        'Month': fee.month,
        'Amount': `${currency}${fee.amount}`,
        'Status': fee.status,
        'Paid Date': fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A',
      };
    });

    if (data.length === 0) {
      alert('No fee data to export.');
      return;
    }

    if (format === 'csv') {
      exportToCSV(data, 'Fees_Data');
    } else {
      exportToExcel(data, 'Fees_Data');
    }
  };

  const exportAllData = () => {
    const wb = XLSX.utils.book_new();

    // Batches Sheet
    const batchesData = batches.map(batch => {
      const batchStudents = students.filter(s => s.batchId === batch.id);
      return {
        'Batch Name': batch.name,
        'Subject': batch.subject,
        'Days': batch.days.join(', '),
        'Time': batch.time,
        'Total Students': batchStudents.length,
      };
    });
    if (batchesData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(batchesData), "Batches");
    }

    // Students Sheet
    const studentsData = students.map(student => {
      const batch = batches.find(b => b.id === student.batchId);
      return {
        'Student Name': student.name,
        'Phone': student.phone,
        'Batch Name': batch?.name || 'Unassigned',
        'Join Date': student.joinDate,
        'Monthly Fee': `${currency}${student.feeAmount}`,
      };
    });
    if (studentsData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsData), "Students");
    }

    // Fees Sheet
    const feesData = fees.map(fee => {
      const student = students.find(s => s.id === fee.studentId);
      const batch = batches.find(b => b.id === student?.batchId);
      return {
        'Student Name': student?.name || 'Unknown',
        'Phone': student?.phone || 'N/A',
        'Batch Name': batch?.name || 'Unassigned',
        'Month': fee.month,
        'Amount': `${currency}${fee.amount}`,
        'Status': fee.status,
        'Paid Date': fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A',
      };
    });
    if (feesData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(feesData), "Fees");
    }

    // Free Time Sheet
    const freeSlotsData = freeSlots.map(slot => ({
      'Day': slot.day,
      'Start Time': slot.startTime,
      'End Time': slot.endTime,
      'Note': slot.note || '',
    }));
    if (freeSlotsData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(freeSlotsData), "Free Time");
    }

    if (wb.SheetNames.length === 0) {
      alert('No data available to export.');
      return;
    }

    XLSX.writeFile(wb, `TutorSync_All_Data.xlsx`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-[#A0A0A0]">Manage your profile and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121212] p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Profile & Preferences</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Teacher Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => updateSettings({ teacherName: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00F5FF] transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Currency</label>
              <CustomSelect
                value={currency}
                onChange={(value) => updateSettings({ currency: value })}
                options={[
                  { value: '₹', label: '₹ (INR)' },
                  { value: '$', label: '$ (USD)' },
                  { value: '€', label: '€ (EUR)' },
                  { value: '£', label: '£ (GBP)' },
                  { value: '¥', label: '¥ (JPY/CNY)' },
                  { value: 'A$', label: 'A$ (AUD)' },
                  { value: 'C$', label: 'C$ (CAD)' },
                ]}
                placeholder="Select Currency"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Data Export</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">Export Batch Data</label>
              <div className="flex gap-3">
                <button
                  onClick={() => exportBatches('xlsx')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => exportBatches('csv')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">Export Fees Data</label>
              <div className="flex gap-3">
                <button
                  onClick={() => exportFees('xlsx')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => exportFees('csv')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">Export All Data (Backup)</label>
              <button
                onClick={exportAllData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors font-medium"
              >
                <Database className="w-4 h-4" />
                Download Complete Backup (Excel)
              </button>
              <p className="text-xs text-[#A0A0A0] mt-2">
                Includes Batches, Students, Fees, and Free Time schedules in a single multi-sheet Excel file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
