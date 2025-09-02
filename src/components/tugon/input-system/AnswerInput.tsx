import { useEffect, useRef, useState } from "react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

export type AnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
  onResetSpamFlag?: () => void;
  onSpamDetected?: () => void;
};

export default function AnswerInput({ 
  value, 
  onChange, 
  placeholder, 
  multiline, 
  disabled, 
  className, 
  onResetSpamFlag, 
  onSpamDetected 
}: AnswerInputProps) {
  const [localDisabled, setLocalDisabled] = useState(false);
  const [hasSpamWarned, setHasSpamWarned] = useState(false);

  const burstCountRef = useRef(0);
  const burstStartRef = useRef<number | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset spam flag on explicit request or when input is cleared
  useEffect(() => {
    if (!value) {
      setHasSpamWarned(false);
      burstCountRef.current = 0;
      burstStartRef.current = null;
    }
  }, [value]);

  useEffect(() => {
    if (!onResetSpamFlag) return;
    return () => {
      onResetSpamFlag();
    };
  }, [onResetSpamFlag]);

  useEffect(() => () => { if (cooldownRef.current) clearTimeout(cooldownRef.current); }, []);

  const SPAM_WINDOW_MS = 500;
  const SPAM_CHARS_THRESHOLD = 10;
  const COOLDOWN_MS = 2500;

  const handleChange = (next: string) => {
    const now = performance.now();
    if (burstStartRef.current == null) {
      burstStartRef.current = now;
      burstCountRef.current = 0;
    }
    const elapsed = now - burstStartRef.current;

    // Count added characters (simple approximation)
    const delta = Math.max(0, next.length - value.length);
    burstCountRef.current += delta;

    if (elapsed <= SPAM_WINDOW_MS && burstCountRef.current >= SPAM_CHARS_THRESHOLD) {
      if (!hasSpamWarned) {
        setHasSpamWarned(true);
        // notify parent and mark warned
        try { onSpamDetected?.(); } catch {}
      }
      setLocalDisabled(true);
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        setLocalDisabled(false);
        // clear local cooldown UI only
        // Reset counters for next session
        burstStartRef.current = null;
        burstCountRef.current = 0;
      }, COOLDOWN_MS);
    }

    if (elapsed > SPAM_WINDOW_MS) {
      // new window
      burstStartRef.current = now;
      burstCountRef.current = delta;
    }

    onChange(next);
  };

  const isDisabled = !!disabled || localDisabled;

  // Enhanced typography classes for bigger text input
  const inputTypographyClasses = "text-fluid-lg sm:text-fluid-xl leading-relaxed p-4 sm:p-5";

  return (
    <div className="space-y-2">
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={4}
          className={`${inputTypographyClasses} min-h-[120px] sm:min-h-[140px] ${className || ''}`}
        />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className={`${inputTypographyClasses} h-14 sm:h-16 ${className || ''}`}
        />
      )}
    </div>
  );
}
