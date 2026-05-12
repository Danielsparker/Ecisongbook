import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SongSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SongSearch({ value, onChange, placeholder }: SongSearchProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        placeholder={placeholder || "Search by title, genre, or song number..."}
        className="h-12 pl-10 pr-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-brand-500 dark:text-white dark:placeholder:text-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
