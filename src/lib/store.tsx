import React, { createContext, useContext, useEffect, useState } from 'react';
import { Batch, FeeRecord, Student, FreeSlot, AttendanceRecord } from '../types';
import { Node, Edge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

interface AppState {
  batches: Batch[];
  students: Student[];
  fees: FeeRecord[];
  freeSlots: FreeSlot[];
  attendance: AttendanceRecord[];
  scheduleNodes: Node[];
  scheduleEdges: Edge[];
  teacherName: string;
  currency: string;
  autoGenerateFees: boolean;
  dashboardTimeStart: string;
  dashboardTimeEnd: string;
  freeTimeStart: string;
  freeTimeEnd: string;
}

interface AppContextType extends AppState {
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  updateStudentFeeAmount: (id: string, newAmount: number) => void;
  deleteStudent: (id: string) => void;
  addFeeRecord: (fee: Omit<FeeRecord, 'id'>) => void;
  updateFeeStatus: (id: string, status: 'Paid' | 'Pending') => void;
  updateFeeRecord: (id: string, updates: Partial<FeeRecord>) => void;
  deleteFeeRecord: (id: string) => void;
  addFreeSlot: (slot: Omit<FreeSlot, 'id'>) => void;
  deleteFreeSlot: (id: string) => void;
  markAttendance: (studentId: string, batchId: string, date: string, status: 'Present' | 'Absent') => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addScheduleNode: (node: Node) => void;
  clearSchedule: () => void;
  clearAllData: () => void;
  updateSettings: (settings: Partial<Pick<AppState, 'teacherName' | 'currency' | 'autoGenerateFees' | 'dashboardTimeStart' | 'dashboardTimeEnd' | 'freeTimeStart' | 'freeTimeEnd'>>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'tuition_management_data';

const initialState: AppState = {
  batches: [],
  students: [],
  fees: [],
  freeSlots: [],
  attendance: [],
  scheduleNodes: [],
  scheduleEdges: [],
  teacherName: 'Teacher Profile',
  currency: '₹',
  autoGenerateFees: false,
  dashboardTimeStart: '',
  dashboardTimeEnd: '',
  freeTimeStart: '05:30',
  freeTimeEnd: '22:00',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      } catch (e) {
        console.error('Failed to parse local storage data');
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    setState((prev) => ({
      ...prev,
      batches: [...prev.batches, { ...batch, id: crypto.randomUUID() }],
    }));
  };

  const updateBatch = (id: string, data: Partial<Batch>) => {
    setState((prev) => {
      const updatedBatches = prev.batches.map((b) => (b.id === id ? { ...b, ...data } : b));
      const updatedBatch = updatedBatches.find(b => b.id === id);
      
      return {
        ...prev,
        batches: updatedBatches,
        scheduleNodes: prev.scheduleNodes.map(node => {
          // Update node if it has the matching batchId, or fallback to matching by name/subject for older nodes
          const oldBatch = prev.batches.find(b => b.id === id);
          if (node.data.batchId === id || (oldBatch && !node.data.batchId && node.data.name === oldBatch.name && node.data.subject === oldBatch.subject)) {
            return {
              ...node,
              data: {
                ...node.data,
                name: updatedBatch?.name || node.data.name,
                subject: updatedBatch?.subject || node.data.subject,
                time: updatedBatch?.time || node.data.time,
              }
            };
          }
          return node;
        })
      };
    });
  };

  const deleteBatch = (id: string) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== id),
      students: prev.students.filter((s) => s.batchId !== id),
      fees: prev.fees.filter((f) => {
        const student = prev.students.find((s) => s.id === f.studentId);
        return student?.batchId !== id;
      }),
      scheduleNodes: prev.scheduleNodes.filter(node => node.data.batchId !== id),
      scheduleEdges: prev.scheduleEdges.filter(edge => {
        const sourceNode = prev.scheduleNodes.find(n => n.id === edge.source);
        const targetNode = prev.scheduleNodes.find(n => n.id === edge.target);
        return sourceNode?.data.batchId !== id && targetNode?.data.batchId !== id;
      })
    }));
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const studentId = crypto.randomUUID();
    const newStudent = { ...student, id: studentId };

    setState((prev) => {
      const generatedFees: FeeRecord[] = [];
      if (prev.autoGenerateFees) {
        const joinDate = new Date(student.joinDate);
        
        // Generate 12 months of fees starting from the join date
        for (let i = 0; i < 12; i++) {
          const feeDate = new Date(joinDate.getFullYear(), joinDate.getMonth() + i, 1);
          const monthStr = `${feeDate.getFullYear()}-${String(feeDate.getMonth() + 1).padStart(2, '0')}`;
          generatedFees.push({
            id: crypto.randomUUID(),
            studentId,
            month: monthStr,
            amount: student.feeAmount,
            status: 'Pending'
          });
        }
      }

      return {
        ...prev,
        students: [...prev.students, newStudent],
        fees: [...prev.fees, ...generatedFees],
      };
    });
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  };

  const updateStudentFeeAmount = (id: string, newAmount: number) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, feeAmount: newAmount } : s)),
      fees: prev.fees.map((f) => 
        (f.studentId === id && f.status === 'Pending') ? { ...f, amount: newAmount } : f
      ),
    }));
  };

  const deleteStudent = (id: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      fees: prev.fees.filter((f) => f.studentId !== id),
    }));
  };

  const addFeeRecord = (fee: Omit<FeeRecord, 'id'>) => {
    setState((prev) => ({
      ...prev,
      fees: [...prev.fees, { ...fee, id: crypto.randomUUID() }],
    }));
  };

  const updateFeeStatus = (id: string, status: 'Paid' | 'Pending') => {
    setState((prev) => ({
      ...prev,
      fees: prev.fees.map((f) =>
        f.id === id ? { ...f, status, paidDate: status === 'Paid' ? new Date().toISOString() : undefined } : f
      ),
    }));
  };

  const updateFeeRecord = (id: string, updates: Partial<FeeRecord>) => {
    setState((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const deleteFeeRecord = (id: string) => {
    setState((prev) => ({
      ...prev,
      fees: prev.fees.filter((f) => f.id !== id),
    }));
  };

  const addFreeSlot = (slot: Omit<FreeSlot, 'id'>) => {
    setState((prev) => ({
      ...prev,
      freeSlots: [...prev.freeSlots, { ...slot, id: crypto.randomUUID() }],
    }));
  };

  const deleteFreeSlot = (id: string) => {
    setState((prev) => ({
      ...prev,
      freeSlots: prev.freeSlots.filter((s) => s.id !== id),
    }));
  };

  const markAttendance = (studentId: string, batchId: string, date: string, status: 'Present' | 'Absent') => {
    setState((prev) => {
      const existingIndex = prev.attendance.findIndex(
        (a) => a.studentId === studentId && a.date === date
      );

      if (existingIndex >= 0) {
        const newAttendance = [...prev.attendance];
        newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
        return { ...prev, attendance: newAttendance };
      }

      return {
        ...prev,
        attendance: [
          ...prev.attendance,
          { id: crypto.randomUUID(), studentId, batchId, date, status }
        ]
      };
    });
  };

  const clearAllData = () => {
    setState((prev) => ({
      ...initialState,
      teacherName: prev.teacherName,
      currency: prev.currency,
      autoGenerateFees: prev.autoGenerateFees,
      dashboardTimeStart: prev.dashboardTimeStart,
      dashboardTimeEnd: prev.dashboardTimeEnd,
      freeTimeStart: prev.freeTimeStart,
      freeTimeEnd: prev.freeTimeEnd,
    }));
  };

  const onNodesChange = (changes: NodeChange[]) => {
    setState((prev) => ({
      ...prev,
      scheduleNodes: applyNodeChanges(changes, prev.scheduleNodes),
    }));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setState((prev) => ({
      ...prev,
      scheduleEdges: applyEdgeChanges(changes, prev.scheduleEdges),
    }));
  };

  const onConnect = (connection: Connection) => {
    setState((prev) => ({
      ...prev,
      scheduleEdges: addEdge({ ...connection, type: 'custom', animated: true, style: { stroke: '#00F5FF', strokeWidth: 2 } } as any, prev.scheduleEdges),
    }));
  };

  const addScheduleNode = (node: Node) => {
    setState((prev) => ({
      ...prev,
      scheduleNodes: [...prev.scheduleNodes, node],
    }));
  };

  const clearSchedule = () => {
    setState((prev) => ({
      ...prev,
      scheduleNodes: [],
      scheduleEdges: [],
    }));
  };

  const updateSettings = (settings: Partial<Pick<AppState, 'teacherName' | 'currency' | 'autoGenerateFees' | 'dashboardTimeStart' | 'dashboardTimeEnd' | 'freeTimeStart' | 'freeTimeEnd'>>) => {
    setState((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addBatch,
        updateBatch,
        deleteBatch,
        addStudent,
        updateStudent,
        updateStudentFeeAmount,
        deleteStudent,
        addFeeRecord,
        updateFeeStatus,
        updateFeeRecord,
        deleteFeeRecord,
        addFreeSlot,
        deleteFreeSlot,
        markAttendance,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addScheduleNode,
        clearSchedule,
        clearAllData,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
