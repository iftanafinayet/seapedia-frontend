import useUiStore from '../../stores/uiStore';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-50 border-emerald-400 text-emerald-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-amber-50 border-amber-400 text-amber-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

export default function ToastContainer() {
  const notifications = useUiStore((s) => s.notifications);
  const dismiss = useUiStore((s) => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-[60px] left-4 right-4 z-50 flex flex-col gap-2 sm:top-20 sm:left-auto sm:right-4 sm:w-80">
      {notifications.map((n) => {
        const Icon = icons[n.type] || Info;
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-[12px] shadow-lg border-l-4 animate-slide-up ${styles[n.type] || styles.info}`}
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="flex-1 text-[14px]">{n.message}</p>
            <button onClick={() => dismiss(n.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
