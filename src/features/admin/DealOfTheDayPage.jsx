import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Star, StarOff, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getProducts, toggleDealProduct } from '../../api/admin';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function DealOfTheDayPage() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: getProducts,
    select: (res) => res.data.data || [],
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDealProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      const product = res?.data?.data;
      const status = product?.isDealOfTheDay ? 'ditambahkan ke' : 'dihapus dari';
      addNotification(`${product?.name || 'Produk'} ${status} Deals of the Day`, 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal update deal', 'error'),
  });

  const dealCount = products.filter((p) => p.isDealOfTheDay).length;

  // Split into active deals and others
  const activeDeals = products.filter((p) => p.isDealOfTheDay);
  const otherProducts = products.filter((p) => !p.isDealOfTheDay);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[24px] font-semibold text-on-surface">Deals of the Day</h1>
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-on-surface">Deals of the Day</h1>
          <p className="text-[13px] text-on-surface-variant mt-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            {dealCount} produk aktif
          </p>
        </div>
      </div>

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Aktif ({activeDeals.length})
          </h2>
          <div className="space-y-2">
            {activeDeals.map((p) => (
              <Card key={p.id} className="!p-4 border-l-[3px] border-l-amber-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-on-surface truncate">{p.name}</p>
                    <p className="text-[12px] text-outline">{p.store?.name} · {formatCurrency(p.price)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10">
                  <Badge variant="primary">Deal Aktif</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate(p.id)} disabled={toggleMutation.isPending}>
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Products */}
      <div>
        <h2 className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
          Semua Produk ({otherProducts.length})
        </h2>
        <div className="space-y-2">
          {otherProducts.map((p) => (
            <Card key={p.id} className="!p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                  <StarOff className="w-5 h-5 text-outline" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-on-surface truncate">{p.name}</p>
                  <p className="text-[12px] text-outline">{p.store?.name} · {formatCurrency(p.price)}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-outline-variant/10">
                <Button size="sm" onClick={() => toggleMutation.mutate(p.id)} disabled={toggleMutation.isPending}>
                  <Star className="w-3.5 h-3.5" />
                  Jadikan Deal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
