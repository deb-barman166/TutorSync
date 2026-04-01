import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select...', className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-left text-white focus:outline-none focus:border-[#00F5FF] transition-colors flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-white' : 'text-[#A0A0A0]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-[#A0A0A0] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden origin-top"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#A0A0A0]">No options available</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${
                      value === option.value ? 'text-[#00F5FF] bg-[#00F5FF]/10' : 'text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
