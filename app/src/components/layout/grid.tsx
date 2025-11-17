import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gap?: string; // Custom gap value if needed
}

export function Grid({ 
  children, 
  className, 
  cols = 1, 
  spacing = 'md',
  gap 
}: GridProps) {
  const colClass = `grid-cols-${cols}`;
  
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div 
      className={cn(
        'grid',
        colClass,
        gap ? `gap-${gap}` : spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
}