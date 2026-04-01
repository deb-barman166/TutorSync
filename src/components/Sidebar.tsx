import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { LayoutDashboard, Users, BookOpen, Coins, Calendar, Menu, X, Clock, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'batches', label: 'Batches', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'fees', label: 'Fees', icon: Coins },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'freetime', label: 'Free Time', icon: Clock },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { teacherName } = useAppStore();

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] bg-clip-text text-transparent">
          TutorSync
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-white p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <div
        className={cn(
          "fixed md:static top-0 left-0 h-screen bg-[#0A0A0A] border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className={cn("p-6 flex items-center", isCollapsed ? "justify-between md:justify-center" : "justify-between")}>
          <div className={cn(isCollapsed ? "block md:hidden" : "block")}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] bg-clip-text text-transparent">
              TutorSync
            </h1>
            <p className="text-xs text-[#A0A0A0] mt-1 tracking-wider uppercase">Management</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-[#A0A0A0] hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:block text-[#A0A0A0] hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-6 h-6" /> : <PanelLeftClose className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center py-3 rounded-xl transition-all duration-300 relative group',
                  isCollapsed ? 'px-4 md:px-0 md:justify-center' : 'px-4 space-x-3',
                  isActive ? 'text-white' : 'text-[#A0A0A0] hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-[#121212] border border-white/10 rounded-xl shadow-[0_0_15px_rgba(0,245,255,0.1)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn('w-5 h-5 relative z-10 transition-colors duration-300', isActive ? 'text-[#00F5FF]' : 'group-hover:text-[#00F5FF]', isCollapsed ? 'mr-3 md:mr-0' : '')} />
                <span className={cn("font-medium relative z-10", isCollapsed ? "block md:hidden" : "block")}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className={cn(
            "rounded-xl bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 shadow-[0_0_20px_rgba(124,58,237,0.1)] flex items-center",
            isCollapsed ? "p-4 md:p-2 md:justify-center" : "p-4"
          )}>
            <div className={cn(
              "rounded-full bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] flex items-center justify-center text-black font-bold shrink-0",
              isCollapsed ? "w-10 h-10 md:w-8 md:h-8 md:text-sm" : "w-10 h-10"
            )}>
              {teacherName ? teacherName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className={cn("ml-3", isCollapsed ? "block md:hidden" : "block")}>
              <p className="text-sm font-medium text-white truncate max-w-[120px]">{teacherName || 'Teacher Profile'}</p>
              <p className="text-xs text-[#A0A0A0]">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
