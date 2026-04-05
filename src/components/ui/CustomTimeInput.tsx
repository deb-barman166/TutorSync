import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
  value: string; // 24-hour format (e.g., "14:30")
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function CustomTimeInput({ value, onChange, className = '', required }: Props) {
  const [localTime, setLocalTime] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      let hours = parseInt(h, 10);
      const isPM = hours >= 12;
      if (hours === 0) hours = 12;
      else if (hours > 12) hours -= 12;
      
      setLocalTime(`${hours.toString().padStart(2, '0')}:${m || '00'}`);
      setAmpm(isPM ? 'PM' : 'AM');
      setError('');
    } else {
      setLocalTime('');
      setAmpm('AM');
      setError('');
    }
  }, [value]);

  const updatePosition = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < 100 && rect.top > 100;
      
      let left = rect.right - 80;
      if (left + 80 > window.innerWidth - 16) {
        left = window.innerWidth - 80 - 16;
      }
      if (left < 16) left = 16;
      
      setDropdownStyle({
        position: 'fixed',
        top: showAbove ? 'auto' : rect.bottom + 8,
        bottom: showAbove ? window.innerHeight - rect.top + 8 : 'auto',
        left: left,
        width: 80,
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

  const updateValue = (timeStr: string, period: 'AM' | 'PM') => {
    if (!timeStr || timeStr.length < 5) return;
    
    let [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const formatted24h = `${hours.toString().padStart(2, '0')}:${m}`;
    onChange(formatted24h);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');
    
    // Auto-insert colon
    if (val.length === 2 && !val.includes(':') && localTime.length < val.length) {
      val += ':';
    }
    
    // Limit length
    if (val.length > 5) {
      val = val.slice(0, 5);
    }

    setLocalTime(val);
    setError('');
    
    if (val.length === 5) {
      const [h, m] = val.split(':');
      const hours = parseInt(h, 10);
      const minutes = parseInt(m, 10);
      
      if (isNaN(hours) || isNaN(minutes) || hours > 12 || hours === 0 || minutes > 59) {
        setError('Invalid time');
      } else {
        updateValue(val, ampm);
      }
    } else if (val === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    if (localTime && localTime.length > 0) {
      if (localTime.length < 5) {
        let [h, m] = localTime.split(':');
        h = (h || '12').padStart(2, '0');
        m = (m || '00').padEnd(2, '0');
        
        let hours = parseInt(h, 10);
        let minutes = parseInt(m, 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours > 12 || hours === 0 || minutes > 59) {
          setError('Invalid time');
          return;
        }
        
        h = hours.toString().padStart(2, '0');
        m = minutes.toString().padStart(2, '0');
        
        const formatted = `${h}:${m}`;
        setLocalTime(formatted);
        updateValue(formatted, ampm);
      } else {
        const [h, m] = localTime.split(':');
        const hours = parseInt(h, 10);
        const minutes = parseInt(m, 10);
        if (isNaN(hours) || isNaN(minutes) || hours > 12 || hours === 0 || minutes > 59) {
          setError('Invalid time');
        }
      }
    }
  };

  const handleAmpmChange = (newAmpm: 'AM' | 'PM') => {
    setAmpm(newAmpm);
    setIsOpen(false);
    if (localTime.length === 5) {
      updateValue(localTime, newAmpm);
    }
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={dropdownStyle}
          className="bg-[#121212] border border-[#00F5FF]/30 rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.15)] overflow-hidden min-w-[80px]"
        >
          <div 
            className={`px-4 py-2 cursor-pointer hover:bg-white/10 text-center font-bold transition-colors ${ampm === 'AM' ? 'text-[#00F5FF] bg-[#00F5FF]/10' : 'text-white'}`}
            onClick={() => handleAmpmChange('AM')}
          >
            AM
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer hover:bg-white/10 text-center font-bold transition-colors ${ampm === 'PM' ? 'text-[#00F5FF] bg-[#00F5FF]/10' : 'text-white'}`}
            onClick={() => handleAmpmChange('PM')}
          >
            PM
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative w-full">
      <div className={`relative flex items-center neon-input p-0 overflow-visible ${error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''} ${className}`} ref={ref}>
        <input
          type="text"
          value={localTime}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="12:00"
          required={required}
          className={`bg-transparent border-none outline-none text-center font-mono tracking-wider w-full py-2 pl-3 pr-1 ${error ? 'text-red-400' : ''}`}
        />
        <div 
          className="flex items-center gap-1 pr-3 pl-1 cursor-pointer text-[#00F5FF] font-bold hover:text-white transition-colors h-full"
          onClick={() => {
            if (!isOpen) updatePosition();
            setIsOpen(!isOpen);
          }}
        >
          <span>{ampm}</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
      </div>
      {error && (
        <div className="absolute -bottom-5 left-0 text-[10px] text-red-400 font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
