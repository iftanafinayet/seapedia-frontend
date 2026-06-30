import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Truck, Check, Circle, MapPin, CreditCard, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getBuyerOrder } from '../../api/buyer';
import { formatCurrency, formatDate, getStatusBadge, getStatusStep } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getBuyerOrder(id),
    select: (res) => res.data.data,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-content mx-auto">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-outline/40" />
        </div>
        <h2 className="text-[20px] font-semibold text-on-surface mb-2">Login to View Order</h2>
        <p className="text-[14px] text-on-surface-variant mb-6 max-w-sm">You need to login first to see order details.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-outline mx-auto mb-3" />
        <p className="text-[14px] text-on-surface-variant">Pesanan tidak ditemukan</p>
      </div>
    );
  }

  const steps = getStatusStep(order.status);
  const badge = getStatusBadge(order.status);

  return (
    <div className="space-y-5 pb-4 max-w-content mx-auto px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[24px] font-semibold text-on-surface">Order Details</h1>
          <p className="text-[13px] text-on-surface-variant">{formatDate(order.createdAt)}</p>
        </div>
        <span className="self-start inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border bg-primary-fixed text-primary border-primary-fixed-dim">
          #{order.id}
        </span>
      </div>

      {/* Items — the main focus */}
      {order.items && order.items.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Products ({order.items.length})
          </h2>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 overflow-hidden">
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-outline/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-on-surface leading-snug">
                      {item.product?.name || `Product #${item.productId}`}
                    </h3>
                    {item.product?.description && (
                      <p className="text-[12px] text-on-surface-variant mt-0.5 line-clamp-2">{item.product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
                    <span className="bg-surface-container-low rounded-lg px-2 py-0.5">
                      Qty: <span className="font-semibold text-on-surface">{item.quantity}</span>
                    </span>
                    <span>×</span>
                    <span className="font-medium text-on-surface">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10">
                    <span className="text-[12px] text-on-surface-variant">Subtotal</span>
                    <span className="text-[15px] font-bold text-on-surface">{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Tracker */}
      <Card>
        <h2 className="text-[14px] font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" /> Status Pesanan
        </h2>
        <div className="flex items-start">
          {steps.map((step, i) => (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold z-10',
                step.completed ? 'bg-emerald-500 text-white' : step.active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-container-high text-on-surface-variant'
              )}>
                {step.completed ? <Check className="w-4 h-4" /> : step.active ? <Circle className="w-4 h-4 fill-white" /> : i + 1}
              </div>
              <p className={cn(
                'text-[11px] mt-2 text-center leading-tight max-w-[70px]',
                step.active ? 'text-primary font-semibold' : step.completed ? 'text-emerald-600' : 'text-on-surface-variant'
              )}>
                {step.label}
              </p>
              {i < steps.length - 1 && (
                <div className={cn(
                  'absolute top-4 left-[calc(50%+8px)] right-[calc(-50%+8px)] h-0.5',
                  step.completed ? 'bg-emerald-500' : 'bg-surface-container-high'
                )} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Driver Info + Address — side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {order.deliveryJob?.driver && (
          <Card className="border-primary-fixed/50 bg-primary-fixed/10">
            <h2 className="text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Info Kurir
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                {(order.deliveryJob.driver.username || 'D')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface">
                  {order.deliveryJob.driver.username || order.deliveryJob.driver.name || 'Driver'}
                </p>
                {order.deliveryJob.driver.phone && (
                  <p className="text-[13px] text-on-surface-variant">{order.deliveryJob.driver.phone}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {order.address && (
          <Card>
            <h2 className="text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Alamat Pengiriman
            </h2>
            <p className="text-[14px] font-semibold text-on-surface">{order.address.recipient}</p>
            <p className="text-[13px] text-on-surface-variant mt-0.5">{order.address.phone}</p>
            <p className="text-[13px] text-on-surface-variant mt-0.5">{order.address.addressLine}, {order.address.city} {order.address.postalCode}</p>
          </Card>
        )}
      </div>

      {/* Payment Summary */}
      <Card>
        <h2 className="text-[14px] font-semibold text-on-surface mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Rincian Pembayaran
        </h2>
        <div className="space-y-2.5 text-[14px]">
          <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal ({order.items?.length || 0} items)</span><span className="text-on-surface font-medium">{formatCurrency(order.totalAmount)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between"><span className="text-emerald-600 font-medium">Diskon</span><span className="text-emerald-600 font-medium">-{formatCurrency(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-on-surface-variant">Ongkir ({order.deliveryMethod})</span><span className="text-on-surface font-medium">{formatCurrency(order.deliveryFee)}</span></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">PPN 12%</span><span className="text-on-surface font-medium">{formatCurrency(order.taxAmount)}</span></div>
          <hr className="border-outline-variant/30 my-1" />
          <div className="flex justify-between text-[16px] font-bold pt-1">
            <span className="text-on-surface">Total</span>
            <span className="text-primary">{formatCurrency(order.finalTotal)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
