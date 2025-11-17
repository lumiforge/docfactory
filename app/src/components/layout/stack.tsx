import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StackProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function Stack({ 
  children, 
  className, 
  direction = 'col', 
  spacing = 'md', 
  align = 'stretch', 
  justify = 'start' 
}: StackProps) {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div 
      className={cn(
        'flex',
        directionClass,
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}