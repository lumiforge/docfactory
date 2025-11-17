import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Sidebar({ 
  children, 
  className, 
  collapsible = false, 
  width = 'md' 
}: SidebarProps) {
  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96',
  };

  return (
    <aside 
      className={cn(
        'h-full border-r p-4',
        widthClasses[width],
        className
      )}
    >
      {children}
    </aside>
  );
}