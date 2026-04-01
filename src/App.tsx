/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider } from './lib/store';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Batches } from './components/Batches';
import { Students } from './components/Students';
import { Fees } from './components/Fees';
import { Schedule } from './components/Schedule';
import { FreeTime } from './components/FreeTime';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'batches':
        return <Batches />;
      case 'students':
        return <Students />;
      case 'fees':
        return <Fees />;
      case 'schedule':
        return <Schedule />;
      case 'freetime':
        return <FreeTime />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] flex items-center justify-center text-black font-bold text-4xl mb-6 shadow-[0_0_30px_rgba(0,245,255,0.3)]"
        >
          T
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] bg-clip-text text-transparent"
        >
          TutorSync
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#A0A0A0] mt-2 text-sm tracking-widest uppercase"
        >
          Loading Workspace...
        </motion.p>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="flex h-screen bg-[#0A0A0A] text-[#EAEAEA] overflow-hidden font-sans selection:bg-[#00F5FF]/30 selection:text-[#00F5FF]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />
          
          <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
