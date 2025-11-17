import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header 
      className={cn(
        'w-full border-b py-4 px-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}