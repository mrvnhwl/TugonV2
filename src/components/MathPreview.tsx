import React from 'react';
import { MathJax } from 'better-react-mathjax';

interface MathPreviewProps {
  value: string;
  className?: string;
  as?: 'div' | 'span';
}

export const MathPreview: React.FC<MathPreviewProps> = ({ value, className = "", as: Component = 'div' }) => {
  if (!value || value.trim() === "") return <span className="text-gray-400 italic">No content...</span>;

  // If the value already starts with delimiters, use it as is.
  // Otherwise, wrap it in inline MathJax delimiters \( ... \).
  const formattedValue = (value.startsWith('\\(') && value.endsWith('\\)'))
    ? value
    : `\\(${value}\\)`;

  return (
    <Component className={`font-serif ${Component === 'div' ? 'text-lg' : ''} ${className}`}>
      <MathJax dynamic>{formattedValue}</MathJax>
    </Component>
  );
};
