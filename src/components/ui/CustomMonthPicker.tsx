import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function CustomMonthPicker({ value, onChange, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const initialDate = value ? new Date(value + '-01') : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;
  const [currentYear, setCurrentYear] = useState(validInitialDate.getFullYear());

  const updatePosition = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < 250 && rect.top > 250;
      
      let left = rect.left;
      const dropdownWidth = 288; // w-72 = 18rem = 288px
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (left < 16) left = 16;
      
      setDropdownStyle({
        position: 'fixed',
        top: showAbove ? 'auto' : rect.bottom + 8,
        bottom: showAbove ? window.innerHeight - rect.top + 8 : 'auto',
        left: left,
        zIndex: 99999,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMonth = (monthIndex: number) => {
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={dropdownStyle}
          className="p-4 bg-[#0D0D0D]/95 backdrop-blur-xl border border-[#00F5FF]/30 rounded-2xl shadow-[0_0_30px_rgba(0,245,255,0.15)] w-64"
        >
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => setCurrentYear(y => y - 1)} className="p-1.5 hover:bg-white/10 rounded-lg text-[#A0A0A0] hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-white font-bold text-lg">
              {currentYear}
            </div>
            <button type="button" onClick={() => setCurrentYear(y => y + 1)} className="p-1.5 hover:bg-white/10 rounded-lg text-[#A0A0A0] hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const formattedMonth = (index + 1).toString().padStart(2, '0');
              const dateStr = `${currentYear}-${formattedMonth}`;
              const isSelected = value === dateStr;
              
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={`p-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-[#00F5FF] text-black font-bold shadow-[0_0_15px_rgba(0,245,255,0.5)]' 
                      : 'text-[#EAEAEA] hover:bg-white/10'
                    }
                  `}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-3 cursor-pointer neon-input w-full ${isOpen ? 'active' : ''} ${className}`}
      >
        <CalendarIcon className="w-4 h-4 text-[#00F5FF]" />
        <span className={value ? "text-white" : "text-[#A0A0A0]"}>
          {value || 'Select Month'}
        </span>
      </div>
      
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}
