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
import { Plus, Users, Clock, Calendar, X, Trash2 } from 'lucide-react';

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

  const onDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div className="bg-[#121212] p-4 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[200px] hover:border-[#00F5FF]/50 transition-colors group relative">
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-red-500/50 z-10"
      >
        <X className="w-3 h-3" />
      </button>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#7C3AED] border-none" />
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white">{data.name}</h4>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5FF]/20 to-[#7C3AED]/20 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-[#00F5FF]" />
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
