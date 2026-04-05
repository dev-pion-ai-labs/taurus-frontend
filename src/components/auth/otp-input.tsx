'use client';

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, OTP_LENGTH - 1));
    inputRefs.current[clamped]?.focus();
  }, []);

  const updateValue = useCallback(
    (index: number, digit: string) => {
      const arr = digits.slice();
      arr[index] = digit;
      onChange(arr.join(''));
    },
    [digits, onChange]
  );

  const handleInput = useCallback(
    (index: number, char: string) => {
      if (!/^\d$/.test(char)) return;
      updateValue(index, char);
      if (index < OTP_LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [updateValue, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (digits[index]) {
          updateValue(index, '');
        } else if (index > 0) {
          updateValue(index - 1, '');
          focusInput(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    },
    [digits, updateValue, focusInput]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (pasted.length > 0) {
        onChange(pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH).replace(/ /g, ''));
        const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        focusInput(nextIndex);
      }
    },
    [onChange, focusInput]
  );

  return (
    <div className="flex items-center justify-center gap-2.5">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digits[index] || ''}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className={cn(
            'h-12 w-12 rounded-[8px] border bg-white text-center text-xl font-semibold text-[#1C1917] outline-none transition-all duration-150',
            'border-[#E7E5E4]',
            'focus:scale-105 focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-[#A8A29E]'
          )}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            const char = target.value.slice(-1);
            target.value = '';
            handleInput(index, char);
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
