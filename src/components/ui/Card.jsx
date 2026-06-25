import { cn } from '../../lib/utils';

export default function Card({ className, children, hover = false, glass = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-[12px] shadow-card p-4',
        hover && 'transition-all duration-200 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        glass && 'bg-white/80 backdrop-blur-[8px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
