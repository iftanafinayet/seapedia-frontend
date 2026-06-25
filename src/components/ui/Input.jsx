import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full bg-white border border-outline-variant rounded-[8px] px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200',
          error && 'border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-error font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
