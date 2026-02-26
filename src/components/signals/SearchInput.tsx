import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SearchInput({ value, onChange, disabled }: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 150);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Input
      type="text"
      placeholder="Search name/group/key/units…"
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      className="h-8 text-xs"
    />
  );
}
