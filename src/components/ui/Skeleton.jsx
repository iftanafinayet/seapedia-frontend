import { cn } from '../../lib/utils';

export default function Skeleton({ className, ...props }) {
  return <div className={cn('bg-surface-container-high animate-pulse rounded-lg', className)} {...props} />;
}
