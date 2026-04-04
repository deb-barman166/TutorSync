import React, { useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function CustomTimeInput({ value, onChange, className = '', required }: Props) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');
    
    // Auto-insert colon
    if (val.length === 2 && !val.includes(':') && localValue.length < val.length) {
      val += ':';
    }
    
    // Limit length
    if (val.length > 5) {
      val = val.slice(0, 5);
    }

    setLocalValue(val);
    
    // Only trigger onChange if it's a valid time format (HH:MM) or empty
    if (val === '' || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    if (localValue && localValue.length > 0 && localValue.length < 5) {
      let [h, m] = localValue.split(':');
      h = (h || '00').padStart(2, '0');
      m = (m || '00').padEnd(2, '0');
      
      // Validate hours and minutes
      if (parseInt(h) > 23) h = '23';
      if (parseInt(m) > 59) m = '59';
      
      const formatted = `${h}:${m}`;
      setLocalValue(formatted);
      onChange(formatted);
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="HH:MM"
      required={required}
      className={`neon-input text-center font-mono tracking-wider ${className}`}
    />
  );
}
