import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-primary-container text-white hover:bg-primary active:bg-primary shadow-sm hover:shadow-md active:scale-[0.98]',
  outline: 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low active:bg-surface-container active:scale-[0.98]',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low active:bg-surface-container',
  danger: 'bg-error text-white hover:opacity-90 active:opacity-90 shadow-sm active:scale-[0.98]',
  accent: 'bg-success text-white hover:opacity-90 active:opacity-90 shadow-sm hover:shadow-md active:scale-[0.98]',
};

const sizes = {
  sm: 'h-9 px-3 text-[13px] rounded-lg',
  default: 'h-11 px-5 text-[14px] rounded-[8px]',
  lg: 'h-14 px-8 text-[15px] rounded-[8px]',
  icon: 'h-11 w-11 rounded-[8px]',
};

export default function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
