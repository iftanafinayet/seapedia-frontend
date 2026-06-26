import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Ticket, Truck, CheckCircle, Bell, Percent } from 'lucide-react';
import { getBuyerOrders } from '../../api/buyer';
import { getActiveDiscounts } from '../../api/guest';
import { formatDateShort } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

const getLastSeen = () => {
  try { return parseInt(localStorage.getItem('notifLastSeen') || '0', 10); } catch { return 0; }
};
const setLastSeen = (ts) => { localStorage.setItem('notifLastSeen', String(ts)); };

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState(getLastSeen);
  const [dotState, setDotState] = useState('idle'); // idle | showing | dismissing
  const ref = useRef(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const { data: orders } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: getBuyerOrders,
    select: (res) => (res.data.data || []).slice(0, 20),
    enabled: open && isAuthenticated,
  });

  const { data: discountsData } = useQuery({
    queryKey: ['active-discounts'],
    queryFn: getActiveDiscounts,
    select: (res) => res.data.data,
    enabled: open,
  });

  const safeOrders = orders || [];
  const safeDiscounts = discountsData || { vouchers: [], promos: [] };

  const notifications = safeOrders.flatMap((o) => {
    const items = [];
    const itemNames = (o.items || []).map((i) => i.product?.name).filter(Boolean).join(', ');

    if (o.status === 'SedangDikirim') {
      items.push({
        id: `ship-${o.id}`,
        type: 'shipping',
        icon: Truck,
        title: 'Pesanan Dalam Perjalanan',
        desc: itemNames ? `${itemNames} sedang dikirim` : `Pesanan #${o.id} sedang dikirim`,
        time: formatDateShort(o.updatedAt || o.createdAt),
        timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
        link: `/buyer/orders/${o.id}`,
      });
    }
    if (o.status === 'PesananSelesai') {
      items.push({
        id: `done-${o.id}`,
        type: 'delivered',
        icon: CheckCircle,
        title: 'Pesanan Telah Sampai',
        desc: itemNames ? `${itemNames} telah sampai` : `Pesanan #${o.id} telah sampai`,
        time: formatDateShort(o.updatedAt || o.createdAt),
        timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
        link: `/buyer/orders/${o.id}`,
      });
    }
    return items;
  });

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  const discountNotifs = [
    ...safeDiscounts.promos.map((p) => ({
      id: `promo-${p.id}`,
      type: 'promo',
      icon: Ticket,
      title: `Promo ${p.code}`,
      desc: p.discountType === 'Percentage'
        ? `Diskon ${p.discountValue}%${p.minOrder ? `, min belanja Rp${p.minOrder.toLocaleString()}` : ''}`
        : `Diskon Rp${p.discountValue.toLocaleString()}${p.minOrder ? `, min belanja Rp${p.minOrder.toLocaleString()}` : ''}`,
      time: 'Tersedia',
      timestamp: 0,
      link: '/products',
    })),
    ...safeDiscounts.vouchers.map((v) => ({
      id: `voucher-${v.id}`,
      type: 'voucher',
      icon: Percent,
      title: `Voucher ${v.code}`,
      desc: v.discountType === 'Percentage'
        ? `Diskon ${v.discountValue}%${v.minOrder ? `, min belanja Rp${v.minOrder.toLocaleString()}` : ''}`
        : `Diskon Rp${v.discountValue.toLocaleString()}${v.minOrder ? `, min belanja Rp${v.minOrder.toLocaleString()}` : ''}`,
      time: 'Tersedia',
      timestamp: 0,
      link: '/products',
    })),
  ];

  const allNotifs = [...discountNotifs, ...sortedNotifications];
  const hasUnread = notifications.length > 0 && notifications.some((n) => n.timestamp > lastSeen);

  // Auto-show dot when new notifications arrive
  useEffect(() => {
    if (hasUnread && dotState === 'idle') {
      setDotState('showing');
    } else if (!hasUnread && dotState === 'showing') {
      setDotState('idle');
    }
  }, [hasUnread, dotState]);

  const handleToggle = useCallback(() => {
    if (hasUnread && dotState === 'showing') {
      setDotState('dismissing');
      setOpen(true);
    } else {
      // Re-check: if no unread, just open
      const now = Date.now();
      setLastSeenState(now);
      setLastSeen(now);
      setDotState('idle');
      setOpen((prev) => !prev);
    }
  }, [hasUnread, dotState]);

  const onDotAnimEnd = useCallback(() => {
    if (dotState === 'dismissing') {
      const now = Date.now();
      setLastSeenState(now);
      setLastSeen(now);
      setDotState('idle');
    }
  }, [dotState]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-surface-container-low transition-colors relative"
      >
        <Bell className="w-5 h-5 text-on-surface-variant" />
        {dotState !== 'idle' && (
          <span
            className={cn(
              'absolute top-2 right-2 w-2 h-2 bg-error rounded-full',
              dotState === 'showing' && 'animate-dot-in',
              dotState === 'dismissing' && 'animate-dot-out',
            )}
            onAnimationEnd={onDotAnimEnd}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-card-elevated z-50 animate-scale-in origin-top-right flex flex-col">
          <div className="p-4 border-b border-outline-variant/10 shrink-0">
            <p className="text-[14px] font-semibold text-on-surface">Notifikasi</p>
          </div>

          {allNotifs.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-outline/30 mx-auto mb-2" />
              <p className="text-[13px] text-on-surface-variant">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10 max-h-[360px] overflow-y-auto">
              {allNotifs.map((n) => (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 p-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    n.type === 'promo' && 'bg-amber-50 text-amber-600',
                    n.type === 'voucher' && 'bg-purple-50 text-purple-600',
                    n.type === 'shipping' && 'bg-blue-50 text-blue-600',
                    n.type === 'delivered' && 'bg-emerald-50 text-emerald-600',
                  )}>
                    <n.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-on-surface line-clamp-1">{n.title}</p>
                    <p className="text-[12px] text-on-surface-variant line-clamp-2 mt-0.5">{n.desc}</p>
                    <p className="text-[11px] text-outline mt-1">{n.time}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
