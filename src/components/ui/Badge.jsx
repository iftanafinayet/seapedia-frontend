import { cn } from '../../lib/utils';

const variants = {
  success: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  error: 'bg-error-container text-error border border-[#ffcdd2]',
  info: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  primary: 'bg-primary-fixed text-primary border border-primary-fixed-dim',
  overdue: 'bg-error text-white font-bold',
};

export default function Badge({ variant = 'info', className, children }) {
  return (
    <span className={cn('inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full', variants[variant], className)}>
      {children}
    </span>
  );
}
