import React, { useState, useRef, useEffect } from 'react';
import AnswerInput from './AnswerInput';

export interface UserInputProps {
  value: string[];
  onChange: (lines: string[]) => void;
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
  className?: string;
  onSpamDetected?: () => void;
  onResetSpamFlag?: () => void;
}

export default function UserInput({
  value = [''],
  onChange,
  placeholder = "Type your answer here...",
  maxLines = 8,
  disabled = false,
  className = '',
  onSpamDetected,
  onResetSpamFlag
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value.length > 0 ? value : ['']);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);

  // Update internal state when external value changes
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(lines)) {
      setLines(value.length > 0 ? value : ['']);
    }
  }, [value]);

  // Initialize refs array when lines change
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, lines.length);
  }, [lines.length]);

  // Auto-scroll to active line when lines > 2
  const scrollToLine = (index: number) => {
    if (lines.length > 2 && scrollContainerRef.current) {
      const lineHeight = 60; // Approximate height per line
      const scrollTop = Math.max(0, (index - 1) * lineHeight);
      scrollContainerRef.current.scrollTop = scrollTop;
    }
  };

  // Focus specific line input
  const focusLine = (index: number) => {
    setTimeout(() => {
      const inputElement = inputRefs.current[index];
      if (inputElement) {
        inputElement.focus();
        scrollToLine(index);
      }
    }, 0);
  };

  // Utility function to check if a string has meaningful content
  const hasValidContent = (str: string): boolean => {
    return str.trim().length > 0;
  };

  // Utility function to detect whitespace spam
  const isWhitespaceSpam = (str: string): boolean => {
    return str.length > 3 && str.trim().length === 0;
  };

  // Enhanced function to check if new line can be created
  const canCreateNewLine = (currentIndex: number): boolean => {
    const currentLine = lines[currentIndex];
    if (!hasValidContent(currentLine)) {
      return false;
    }
    return lines.length < maxLines;
  };

  // Handle Enter key press with cursor movement
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default form submission
      
      // Only create new line if current line has valid content
      if (canCreateNewLine(index)) {
        const newLines = [...lines];
        newLines.splice(index + 1, 0, ''); // Insert empty line after current
        setLines(newLines);
        onChange(newLines);
        
        // Focus the new line after state update
        focusLine(index + 1);
      }
    } else if (event.key === 'Backspace' && lines[index] === '' && lines.length > 1) {
      // Delete empty line and focus previous line
      event.preventDefault();
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      onChange(newLines);
      
      // Focus previous line
      const prevIndex = Math.max(0, index - 1);
      focusLine(prevIndex);
    } else if (event.key === 'ArrowUp' && index > 0) {
      // Navigate to previous line
      event.preventDefault();
      focusLine(index - 1);
    } else if (event.key === 'ArrowDown' && index < lines.length - 1) {
      // Navigate to next line
      event.preventDefault();
      focusLine(index + 1);
    }
  };

  // Handle line change
  const handleLineChange = (index: number, newValue: string) => {
    // Prevent whitespace spam
    if (isWhitespaceSpam(newValue)) {
      onSpamDetected?.();
      return;
    }

    const updatedLines = [...lines];
    updatedLines[index] = newValue;
    setLines(updatedLines);
    onChange(updatedLines);
  };

  // Handle line deletion
  const handleDeleteLine = (index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      onChange(newLines);
      
      // Focus the line above or the first line
      const focusIndex = Math.max(0, index - 1);
      focusLine(focusIndex);
    }
  };

  // Add new line manually
  const addNewLine = () => {
    const lastLineIndex = lines.length - 1;
    const lastLine = lines[lastLineIndex];
    
    if (!hasValidContent(lastLine)) {
      // Focus the last empty line instead of creating a new one
      focusLine(lastLineIndex);
      return;
    }

    if (lines.length < maxLines) {
      const newLines = [...lines, ''];
      setLines(newLines);
      onChange(newLines);
      
      // Focus the new line
      focusLine(newLines.length - 1);
    }
  };

  // Calculate container height
  const getContainerHeight = () => {
    if (lines.length <= 2) {
      return 'auto';
    }
    return '120px';
  };

  const needsScrolling = lines.length > 2;

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Lines container with conditional scrolling */}
      <div 
        ref={scrollContainerRef}
        className={`space-y-0 ${needsScrolling ? 'overflow-y-auto scroll-smooth' : ''}`}
        style={{ 
          height: getContainerHeight(),
          maxHeight: '120px'
        }}
      >
        {lines.map((line, index) => (
          <div 
            key={index}
            className="relative group"
            style={{ minHeight: '60px' }}
          >
            {/* Line container with bottom border */}
            <div className="border-b border-gray-300 hover:border-gray-400 transition-colors duration-200">
              <AnswerInput
                ref={(el) => (inputRefs.current[index] = el)}
                value={line}
                onChange={(newValue: string) => handleLineChange(index, newValue)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                placeholder={index === 0 ? placeholder : `Line ${index + 1}...`}
                disabled={disabled}
                multiline={false}
                className="border-0 border-transparent bg-transparent focus:ring-0 focus:border-transparent shadow-none px-3 py-3 text-fluid-lg leading-relaxed rounded-none hover:bg-gray-50 focus:bg-white transition-colors duration-200"
                onSpamDetected={onSpamDetected}
                onResetSpamFlag={onResetSpamFlag}
              />
            </div>
            
            {/* Delete button */}
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteLine(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 text-sm px-2 py-1 rounded z-10"
                disabled={disabled}
                title={`Delete line ${index + 1}`}
              >
                ✕
              </button>
            )}

            {/* Content validation indicator */}
            {index > 0 && !hasValidContent(line) && line.length > 0 && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 text-xs opacity-70">
                ⚠️
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll indicators */}
      {needsScrolling && (
        <div className="text-xs text-gray-400 text-center py-1">
          <span>Scroll to see all lines • </span>
          <span>{lines.length} total lines</span>
        </div>
      )}

      {/* Add line button */}
      {lines.length < maxLines && (
        <div className="pt-2">
          <button
            type="button"
            onClick={addNewLine}
            disabled={disabled}
            className={`text-sm transition-colors duration-200 px-3 py-2 rounded-md ${
              lines.length > 0 && !hasValidContent(lines[lines.length - 1])
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            } disabled:text-gray-400 disabled:cursor-not-allowed`}
            title={
              lines.length > 0 && !hasValidContent(lines[lines.length - 1])
                ? 'Please add content to the current line first'
                : `Add line (${lines.length}/${maxLines})`
            }
          >
            {lines.length > 0 && !hasValidContent(lines[lines.length - 1])
              ? '⚠️ Complete current line first'
              : `+ Add line (${lines.length}/${maxLines})`
            }
          </button>
        </div>
      )}

  
    </div>
  );
}