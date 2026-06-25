import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Store, CheckSquare, Square } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useCartStore from '../../stores/cartStore';
import { formatCurrency } from '../../lib/utils';

export default function CartPage() {
  const { items, storeName, updateQuantity, removeItem, clearCart, toggleSelect, selectAll, deselectAll } = useCartStore();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedItems = items.filter((i) => i.selected !== false);
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const selectedCount = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const allSelected = items.length > 0 && items.every((i) => i.selected !== false);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-outline/40" />
        </div>
        <h1 className="text-[24px] font-bold text-on-surface">Keranjang Kosong</h1>
        <p className="text-[14px] text-on-surface-variant mt-2 max-w-xs">Keranjang kamu kosong, yuk isi dengan produk favorit!</p>
        <Link to="/products" className="inline-block mt-6">
          <Button>Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 lg:px-6 pb-[180px] lg:pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[24px] lg:text-[32px] font-semibold text-on-surface">My Cart</h1>
          <p className="text-[13px] lg:text-[14px] text-on-surface-variant mt-0.5">
            {totalItems} items · {selectedCount} selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => allSelected ? deselectAll() : selectAll()} className="text-[13px] font-semibold text-primary hover:underline">
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="text-[13px] font-semibold text-error hover:bg-error-container/10 px-3 py-1.5 rounded-lg transition-colors">
            Clear
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 lg:p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider">{storeName || 'Store'}</h3>
              <span className="ml-auto text-[11px] text-outline bg-surface-container-low px-2 py-0.5 rounded-full">
                Single store
              </span>
            </div>

            <div className="divide-y divide-outline-variant/20">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <button onClick={() => toggleSelect(item.productId)} className="shrink-0 self-center">
                    {item.selected !== false ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-outline" />
                    )}
                  </button>

                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-outline/40" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[14px] lg:text-[15px] font-semibold text-on-surface line-clamp-1">{item.name}</h4>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">{formatCurrency(item.price)} / unit</p>
                      </div>
                      <span className="text-[15px] font-semibold text-on-surface ml-3">{formatCurrency(item.price * item.quantity)}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center bg-surface-container-low rounded-full border border-outline-variant/20">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-primary hover:bg-surface-container rounded-full transition-colors active:scale-75">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 lg:w-9 text-center text-[14px] font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-primary hover:bg-surface-container rounded-full transition-colors active:scale-75">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container/10">
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 mt-6 lg:mt-0 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 lg:p-6 space-y-3 shadow-card">
            <h3 className="text-[16px] font-semibold text-on-surface mb-2">Order Summary</h3>
            <div className="flex justify-between text-[14px]">
              <span className="text-on-surface-variant">Selected ({selectedCount} items)</span>
              <span className="text-on-surface font-medium">{formatCurrency(selectedSubtotal)}</span>
            </div>
            <p className="text-[11px] text-outline">Ongkir & PPN dihitung saat checkout</p>
            <hr className="border-outline-variant/20" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[16px] font-semibold text-on-surface">Subtotal</span>
              <span className="text-[18px] font-bold text-primary">{formatCurrency(selectedSubtotal)}</span>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="hidden lg:block">
              <Button size="lg" className="w-full" onClick={() => navigate('/buyer/checkout')}>
                Checkout ({selectedCount} items)
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="fixed bottom-[68px] lg:hidden left-0 right-0 bg-white/80 backdrop-blur-[8px] border-t border-outline-variant/30 px-4 py-3 z-30 pb-safe">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-on-surface-variant">{selectedCount} items selected</span>
            <span className="text-[18px] font-bold text-primary">{formatCurrency(selectedSubtotal)}</span>
          </div>
          <Button size="lg" className="w-full" onClick={() => navigate('/buyer/checkout')}>
            Checkout ({selectedCount} items)
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      <ConfirmDialog open={showClearConfirm} title="Clear Cart" message="Hapus semua item dari keranjang?" confirmLabel="Clear Cart"
        onConfirm={() => { clearCart(); setShowClearConfirm(false); }} onCancel={() => setShowClearConfirm(false)} />
    </div>
  );
}
