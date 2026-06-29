import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-card-elevated animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
