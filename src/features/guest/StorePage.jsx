import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, MapPin, Phone, Mail, Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getStore } from '../../api/guest';
import { formatCurrency } from '../../lib/utils';

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: store, isLoading: loadingStore } = useQuery({
    queryKey: ['store', id],
    queryFn: () => getStore(id),
    select: (res) => res.data.data,
  });

  const products = store?.products || [];
  const loadingProducts = loadingStore;

  if (loadingStore) {
    return (
      <div className="px-4 py-6 max-w-content mx-auto space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-20 max-w-content mx-auto">
        <Store className="w-16 h-16 text-outline/30 mx-auto mb-4" />
        <h1 className="text-[22px] font-semibold text-on-surface">Toko tidak ditemukan</h1>
      </div>
    );
  }

  const safeProducts = products;

  return (
    <div className="px-4 py-6 lg:py-10 max-w-content mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Store Header */}
      <Card className="!p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-10 h-10 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-bold text-on-surface">{store.name}</h1>
            {store.description && (
              <p className="text-[14px] text-on-surface-variant mt-1.5">{store.description}</p>
            )}

            {/* Contact + Location */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              {store.city && (
                <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {store.city}
                </span>
              )}
              {store.phone && (
                <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> {store.phone}
                </span>
              )}
              {store.email && (
                <span className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {store.email}
                </span>
              )}
            </div>
            {store.addressLine && (
              <p className="text-[13px] text-on-surface-variant mt-1">{store.addressLine}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Products */}
      <div>
        <h2 className="text-[20px] font-semibold text-on-surface mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Produk ({safeProducts.length})
        </h2>

        {loadingProducts ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : safeProducts.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <Package className="w-12 h-12 text-outline/30 mx-auto mb-3" />
            <p className="text-[14px] text-on-surface-variant">Belum ada produk di toko ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {safeProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`}>
                <Card hover className="h-full">
                  <div className="w-full aspect-square bg-surface-container rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-outline/40" />
                    )}
                  </div>
                  <p className="text-[14px] font-semibold text-on-surface line-clamp-2">{p.name}</p>
                  <p className="text-[16px] font-bold text-primary mt-1">{formatCurrency(p.price)}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">
                    Stok: {p.stock}
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="text-error ml-1">(Tersisa {p.stock})</span>
                    )}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
