import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Star, Search, X } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getProducts, toggleDealProduct } from '../../api/admin';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function DealOfTheDayPage() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: getProducts,
    select: (res) => res.data.data || [],
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDealProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      const product = res?.data?.data;
      const status = product?.isDealOfTheDay ? 'ditambahkan ke' : 'dihapus dari';
      addNotification(`${product?.name || 'Produk'} ${status} Deals`, 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const activeDeals = products.filter((p) => p.isDealOfTheDay);
  const filtered = products.filter((p) => {
    if (!search) return true;
    return p.name?.toLowerCase().includes(search.toLowerCase()) || p.store?.name?.toLowerCase().includes(search.toLowerCase());
  });
  const inactive = filtered.filter((p) => !p.isDealOfTheDay);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 rounded-xl" />
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface">Deals of the Day</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            <Sparkles className="w-3 h-3 inline text-amber-500 mr-1" />
            {activeDeals.length} produk aktif
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl">
          <Search className="w-4 h-4 text-outline" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..." className="bg-transparent text-[13px] text-on-surface outline-none w-40" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-outline" /></button>}
        </div>
      </div>

      {/* Active Deals — compact chips */}
      {activeDeals.length > 0 && (
        <div className="bg-surface-container-lowest border border-amber-200 rounded-xl p-4">
          <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] mb-2">Aktif</p>
          <div className="flex gap-2 flex-wrap">
            {activeDeals.map((p) => (
              <div key={p.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[13px] font-semibold text-on-surface">{p.name}</span>
                <button onClick={() => toggleMutation.mutate(p.id)} disabled={toggleMutation.isPending}
                  className="ml-1 p-0.5 rounded hover:bg-amber-100 transition-colors" title="Hapus dari Deal">
                  <X className="w-3 h-3 text-amber-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product List — compact toggle rows */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container">
          <p className="text-[12px] text-on-surface-variant font-semibold">
            {search ? `${filtered.length} produk ditemukan` : `Semua Produk (${inactive.length})`}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-on-surface-variant">Produk tidak ditemukan</div>
        ) : (
          <div className="divide-y divide-outline-variant/10 max-h-[60vh] overflow-y-auto">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-container/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {p.isDealOfTheDay ? (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  ) : (
                    <Star className="w-4 h-4 text-outline/30 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface truncate">{p.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.store?.name} · {formatCurrency(p.price)}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleMutation.mutate(p.id)}
                  disabled={toggleMutation.isPending}
                  className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    p.isDealOfTheDay
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}>
                  {p.isDealOfTheDay ? 'Hapus' : 'Jadikan Deal'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
