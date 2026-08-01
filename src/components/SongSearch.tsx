import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SongSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SongSearch({ value, onChange, placeholder }: SongSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange, value]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        placeholder={placeholder || "Search by title, genre, or song number..."}
        className="h-12 pl-10 pr-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-brand-500 dark:text-white dark:placeholder:text-slate-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search songs by title, genre, or song number"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
          aria-label="Clear search query"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
