import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../lib/store';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  Node,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { format } from 'date-fns';
import { DayOfWeek } from '../types';
import { Plus, Users, Clock, Calendar, X, Trash2, CheckCircle2 } from 'lucide-react';

// Custom Edge Component with Delete Button
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/50"
            onClick={(event) => onEdgeClick(event, id)}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Custom Node Component for Batch
const BatchNode = ({ id, data }: any) => {
  const { setNodes, setEdges } = useReactFlow();
  const { batches } = useAppStore();
  const [currentTimeStr, setCurrentTimeStr] = React.useState(format(new Date(), 'HH:mm'));
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeStr(format(new Date(), 'HH:mm'));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const batch = batches.find(b => b.id === data.batchId);

  let status: 'upcoming' | 'in-progress' | 'completed' | 'not-today' = 'not-today';
  
  if (batch) {
    const now = new Date();
    const currentDay = format(now, 'EEE') as DayOfWeek;
    const currentTime = currentTimeStr;

    if (batch.days.includes(currentDay)) {
      let start = '';
      let end = '';
      
      if (batch.dayTimes && batch.dayTimes[currentDay]) {
        start = batch.dayTimes[currentDay]!.start;
        end = batch.dayTimes[currentDay]!.end;
      } else {
        // Fallback parsing if dayTimes is missing
        const dayStr = `${currentDay} (`;
        const dayIndex = batch.time.indexOf(dayStr);
        if (dayIndex !== -1) {
          const startIndex = dayIndex + dayStr.length;
          const endIndex = batch.time.indexOf(')', startIndex);
          if (endIndex !== -1) {
            const timeRange = batch.time.substring(startIndex, endIndex);
            const parts = timeRange.split(' - ');
            if (parts.length === 2) {
              const parse12to24 = (time12h: string) => {
                const [time, modifier] = time12h.split(' ');
                if (!time || !modifier) return '';
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
                return `${hours.padStart(2, '0')}:${minutes}`;
              };
              start = parse12to24(parts[0]);
              end = parse12to24(parts[1]);
            }
          }
        }
      }

      if (start && end) {
        if (currentTime >= start && currentTime <= end) {
          status = 'in-progress';
        } else if (currentTime > end) {
          status = 'completed';
        } else {
          status = 'upcoming';
        }
      } else {
        status = 'upcoming';
      }
    }
  }

  let borderClass = 'border-white/10 hover:border-[#00F5FF]/50';
  let icon = <Calendar className="w-4 h-4 text-[#00F5FF]" />;
  let iconBg = 'from-[#00F5FF]/20 to-[#7C3AED]/20';
  let statusText = null;

  if (status === 'in-progress') {
    borderClass = 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    icon = <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
    iconBg = 'from-amber-500/20 to-amber-500/10';
    statusText = <span className="text-[10px] font-bold text-amber-500 ml-2 animate-pulse uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">In Progress</span>;
  } else if (status === 'completed') {
    borderClass = 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-[#121212]';
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    iconBg = 'from-emerald-500/20 to-emerald-500/10';
    statusText = <span className="text-[10px] font-bold text-emerald-500 ml-2 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>;
  }

  const onDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div className={`bg-[#121212] p-4 rounded-xl border shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[200px] transition-colors group relative ${borderClass}`}>
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-red-500/50 z-10"
      >
        <X className="w-3 h-3" />
      </button>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#7C3AED] border-none" />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h4 className="font-bold text-white">{data.name}</h4>
          {statusText}
        </div>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-[#A0A0A0] mb-3">{data.subject}</p>
      <div className="space-y-1">
        <div className="flex items-center text-xs text-[#EAEAEA]">
          <Clock className="w-3 h-3 mr-2 text-[#7C3AED]" />
          {data.time}
        </div>
        <div className="flex items-center text-xs text-[#EAEAEA]">
          <Users className="w-3 h-3 mr-2 text-[#7C3AED]" />
          {data.studentsCount} students
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#00F5FF] border-none" />
    </div>
  );
};

const nodeTypes = {
  batch: BatchNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function ScheduleFlow() {
  const { batches, students, scheduleNodes, scheduleEdges, onNodesChange, onEdgesChange, onConnect, addScheduleNode, clearSchedule } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNode = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const studentsCount = students.filter(s => s.batchId === batch.id).length;

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'batch',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        batchId: batch.id,
        name: batch.name,
        subject: batch.subject,
        time: batch.time,
        studentsCount,
      },
    };

    addScheduleNode(newNode);
    setIsAdding(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Workflow Schedule</h2>
          <p className="text-[#A0A0A0]">Connect batches to create your daily workflow.</p>
        </div>
        <button
          onClick={clearSchedule}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all duration-300 border border-red-500/20"
        >
          <Trash2 className="w-4 h-4" />
          Clear Schedule
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden relative bg-[#0A0A0A]">
        <ReactFlow
          nodes={scheduleNodes}
          edges={scheduleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          colorMode="dark"
        >
          <Background gap={24} size={2} color="#333" />
          <Controls className="bg-[#121212] border-white/10 fill-white" />
          
          <Panel position="top-right" className="m-4">
            <div className="relative">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Batch Node
              </button>

              {isAdding && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/5 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">Select Batch</h4>
                    <button onClick={() => setIsAdding(false)} className="text-[#A0A0A0] hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {batches.length > 0 ? (
                      batches.map(batch => (
                        <button
                          key={batch.id}
                          onClick={() => handleAddNode(batch.id)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="font-medium text-white text-sm">{batch.name}</div>
                          <div className="text-xs text-[#A0A0A0]">{batch.time}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-[#A0A0A0]">
                        No batches available.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </motion.div>
  );
}

export function Schedule() {
  return (
    <ReactFlowProvider>
      <ScheduleFlow />
    </ReactFlowProvider>
  );
}
