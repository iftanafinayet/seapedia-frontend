import Button from './Button';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, confirmLabel = 'Confirm' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-[12px] p-6 max-w-sm w-full shadow-card-elevated animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h3 className="text-[18px] font-semibold text-on-surface text-center mb-2">{title}</h3>
        <p className="text-[14px] text-on-surface-variant text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
