import React from "react";

export function Heading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`font-semibold text-fluid-xl sm:text-fluid-2xl leading-tight ${className}`}>
      {children}
    </h1>
  );
}

export function SubHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-medium text-fluid-lg ${className}`}>
      {children}
    </h2>
  );
}

export function Text({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-fluid-base ${className}`}>
      {children}
    </p>
  );
}

export function Small({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <small className={`text-fluid-sm ${className}`}>
      {children}
    </small>
  );
}

export default { Heading, SubHeading, Text, Small };
