'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useIndustries } from '@/hooks/use-industries';

interface IndustryComboboxProps {
  value: string | null;
  onSelect: (id: string, name: string) => void;
}

export function IndustryCombobox({ value, onSelect }: IndustryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data, isLoading } = useIndustries(debouncedSearch);
  const industries = data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#E7E5E4] bg-white px-3 text-sm text-[#1C1917] outline-none transition-colors hover:border-[#D6D3D1] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
        aria-expanded={open}
        role="combobox"
      >
        <span className={value ? 'text-[#1C1917]' : 'text-[#A8A29E]'}>
          {value ? selectedName : 'Select industry...'}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#78716C]" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--anchor-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search industries..."
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <AnimatePresence mode="wait">
              <motion.div
                key={debouncedSearch}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-[#A8A29E]">
                    Searching...
                  </div>
                ) : industries.length === 0 ? (
                  <CommandEmpty>No industries found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {industries.map((industry) => (
                      <CommandItem
                        key={industry.id}
                        value={industry.id}
                        data-checked={value === industry.id ? true : undefined}
                        onSelect={() => {
                          onSelect(industry.id, industry.name);
                          setSelectedName(industry.name);
                          setOpen(false);
                          setSearch('');
                          setDebouncedSearch('');
                        }}
                        className="cursor-pointer"
                      >
                        <span className="flex-1">{industry.name}</span>
                        {value === industry.id && (
                          <Check className="ml-auto h-4 w-4 text-[#1C1917]" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </motion.div>
            </AnimatePresence>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
