import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Truck, Ticket, ShoppingBag, ArrowRight, Check, Plus, Loader2, Store } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import useCartStore from '../../stores/cartStore';
import useUiStore from '../../stores/uiStore';
import { getAddresses, checkout, checkoutPreview } from '../../api/buyer';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

const deliveryMethods = [
  { value: 'Instant', label: 'Instant', time: '1 jam', fee: 25000 },
  { value: 'NextDay', label: 'Next Day', time: '1 hari', fee: 15000 },
  { value: 'Regular', label: 'Regular', time: '2-3 hari', fee: 10000 },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getSelectedItems, storeName, clearCart } = useCartStore();
  const addNotification = useUiStore((s) => s.addNotification);

  const selectedItems = getSelectedItems();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('Instant');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const { data: addresses, isLoading: loadingAddr, isError: addrError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    select: (res) => res.data.data || [],
  });

  const safeAddresses = addresses || [];

  const cartSubtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const cartDeliveryFee = deliveryMethods.find((m) => m.value === deliveryMethod)?.fee ?? 0;

  const displaySubtotal = cartSubtotal;
  const displayDiscount = previewData?.discountAmount ?? 0;
  const afterDiscount = Math.max(0, displaySubtotal - displayDiscount);
  const displayDelivery = cartDeliveryFee;
  const displayTax = Math.round(afterDiscount * 0.12);
  const displayTotal = afterDiscount + displayDelivery + displayTax;

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setPreviewData(null);
    if (!voucherCode.trim()) return;
    const addrId = selectedAddress || safeAddresses[0]?.id;
    if (!addrId) { setVoucherError('Pilih alamat'); return; }
    setCheckingVoucher(true);
    try {
      const res = await checkoutPreview({ addressId: addrId, deliveryMethod, discountCode: voucherCode });
      const p = res.data.data;
      p.discountError ? setVoucherError(p.discountError) : (setPreviewData(p), addNotification('Kode diskon diterapkan!', 'success'));
    } catch (err) {
      setVoucherError(err.response?.data?.message || 'Gagal validasi');
    } finally { setCheckingVoucher(false); }
  };

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: () => { clearCart(); queryClient.invalidateQueries({ queryKey: ['orders', 'buyer'] }); queryClient.invalidateQueries({ queryKey: ['wallet'] }); addNotification('Checkout berhasil!', 'success'); navigate('/buyer/orders'); },
    onError: (err) => addNotification(err.response?.data?.message || 'Checkout gagal', 'error'),
  });

  if (selectedItems.length === 0) { navigate('/buyer/cart'); return null; }

  return (
    <div className="max-w-content mx-auto px-4 lg:px-6">
      <h1 className="text-[24px] lg:text-[32px] font-semibold text-on-surface mb-6">Checkout</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Store info */}
          <Card className="!p-4">
            <div className="flex items-center gap-2"><Store className="w-4 h-4 text-primary" /><span className="text-[13px] font-semibold">{storeName || 'Store'}</span></div>
          </Card>

          {/* Address */}
          <Card>
            <h2 className="text-[16px] font-semibold text-on-surface mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center"><MapPin className="w-4 h-4 text-primary" /></div>Alamat Pengiriman</h2>
            {loadingAddr ? <Skeleton className="h-20 rounded-lg" /> : addrError || safeAddresses.length === 0 ? (
              <div className="text-center py-6"><MapPin className="w-10 h-10 text-outline/30 mx-auto mb-2" /><p className="text-[14px] text-on-surface-variant mb-3">Belum ada alamat</p><Link to="/buyer/addresses" className="text-[13px] font-semibold text-primary hover:underline">+ Tambah Alamat</Link></div>
            ) : (
              <div className="space-y-2">
                {safeAddresses.map((addr) => (
                  <label key={addr.id} className={cn('flex items-start gap-3 p-4 rounded-xl border cursor-pointer', selectedAddress === addr.id ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:bg-surface-container-low')}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-0.5 accent-primary w-4 h-4" />
                    <div className="min-w-0"><p className="text-[14px] font-semibold">{addr.label} — {addr.recipient}</p><p className="text-[13px] text-on-surface-variant mt-0.5">{addr.addressLine}, {addr.city} {addr.postalCode}</p><p className="text-[12px] text-on-surface-variant mt-0.5">{addr.phone}</p></div>
                  </label>
                ))}
                <Link to="/buyer/addresses" className="flex items-center gap-2 text-[13px] text-primary font-medium hover:underline mt-2 pl-2"><Plus className="w-3.5 h-3.5" /> Tambah alamat</Link>
              </div>
            )}
          </Card>

          {/* Delivery */}
          <Card>
            <h2 className="text-[16px] font-semibold text-on-surface mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center"><Truck className="w-4 h-4 text-primary" /></div>Metode Pengiriman</h2>
            <div className="space-y-2">
              {deliveryMethods.map((m) => (
                <label key={m.value} className={cn('flex items-center justify-between p-4 rounded-xl border cursor-pointer', deliveryMethod === m.value ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:bg-surface-container-low')}>
                  <div className="flex items-center gap-3"><input type="radio" name="delivery" checked={deliveryMethod === m.value} onChange={() => setDeliveryMethod(m.value)} className="accent-primary w-4 h-4" /><div><p className="text-[14px] font-semibold">{m.label}</p><p className="text-[12px] text-on-surface-variant">{m.time}</p></div></div>
                  <p className="text-[14px] font-semibold">{formatCurrency(m.fee)}</p>
                </label>
              ))}
            </div>
          </Card>

          {/* Voucher */}
          <Card>
            <h2 className="text-[16px] font-semibold text-on-surface mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center"><Ticket className="w-4 h-4 text-primary" /></div>Kode Voucher / Promo</h2>
            <div className="flex gap-2">
              <Input placeholder="Masukkan kode" value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value); setVoucherError(''); setPreviewData(null); }} error={voucherError} />
              <Button variant="outline" className="shrink-0" onClick={handleApplyVoucher} disabled={checkingVoucher}>{checkingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pakai'}</Button>
            </div>
            {displayDiscount > 0 && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" /><span className="text-[13px] font-semibold text-emerald-700">Diskon -{formatCurrency(displayDiscount)}</span><p className="text-[11px] text-emerald-600/70">Kode: {voucherCode}</p>
              </div>
            )}
          </Card>

          {/* Items */}
          <Card>
            <h3 className="text-[14px] font-semibold mb-3">{selectedItems.length} produk</h3>
            <div className="divide-y divide-outline-variant/10">
              {selectedItems.map((item) => (
                <div key={item.productId} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5 text-outline/40" /></div>
                  <div className="flex-1 min-w-0"><p className="text-[13px] font-medium line-clamp-1">{item.name}</p><p className="text-[12px] text-on-surface-variant">{item.quantity} x {formatCurrency(item.price)}</p></div>
                  <p className="text-[13px] font-semibold shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 mt-6 lg:mt-0 space-y-4">
          <Card>
            <h2 className="text-[16px] font-semibold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2.5 text-[14px]">
              <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal ({totalItems} items)</span><span className="font-medium">{formatCurrency(displaySubtotal)}</span></div>
              {displayDiscount > 0 && <div className="flex justify-between"><span className="text-emerald-600 font-medium">Diskon</span><span className="text-emerald-600 font-medium">-{formatCurrency(displayDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-on-surface-variant">Ongkir ({deliveryMethod})</span><span className="font-medium">{formatCurrency(displayDelivery)}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">PPN 12%</span><span className="font-medium">{formatCurrency(displayTax)}</span></div>
              <hr className="border-outline-variant/20 my-1" />
              <div className="flex justify-between text-[16px] font-bold"><span>Total</span><span className="text-primary">{formatCurrency(displayTotal)}</span></div>
            </div>
          </Card>
          <Button className="w-full" size="lg" onClick={() => {
            if (!selectedAddress) { addNotification('Pilih alamat', 'warning'); return; }
            checkoutMutation.mutate({ addressId: selectedAddress, deliveryMethod, discountCode: displayDiscount > 0 ? voucherCode : undefined });
          }} disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? 'Memproses...' : `Konfirmasi (${totalItems} items)`}<ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
