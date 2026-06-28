import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Search, Heart } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getProducts } from '../../api/guest';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

const filterChips = [
  { label: 'Popular', value: '' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low', value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
];

const getProductCategory = (product) => {
  const name = product.name?.toLowerCase() || '';
  if (name.includes('phone') || name.includes('smart')) return 'SMARTPHONE';
  if (name.includes('laptop') || name.includes('notebook') || name.includes('ultrabook')) return 'LAPTOP';
  if (name.includes('earbud') || name.includes('wireless') || name.includes('headphone') || name.includes('audio')) return 'AUDIO';
  if (name.includes('jaket') || name.includes('denim') || name.includes('clothing') || name.includes('baju')) return 'CLOTHING';
  if (name.includes('sepatu') || name.includes('sneaker') || name.includes('casual') || name.includes('shoes')) return 'FOOTWEAR';
  if (name.includes('tas') || name.includes('ransel') || name.includes('backpack') || name.includes('bag')) return 'BAG';
  if (name.includes('flat bottom') || name.includes('lightpack') || name.includes('coffee') || name.includes('packaging')) return 'FLAT BOTTOM';

  if (product.store?.name?.toLowerCase().includes('elektronik')) return 'ELECTRONICS';
  if (product.store?.name?.toLowerCase().includes('fashion')) return 'FASHION';
  return 'GENERAL';
};

const getProductImage = (product) => {
  const name = product.name?.toLowerCase() || '';
  if (name.includes('phone') || name.includes('smart')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('laptop') || name.includes('notebook') || name.includes('ultrabook')) {
    return 'https://images.unsplash.com/photo-1496181130204-7552cc14f1d0?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('earbud') || name.includes('wireless') || name.includes('headphone') || name.includes('audio')) {
    return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('jaket') || name.includes('denim')) {
    return 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('sepatu') || name.includes('sneaker') || name.includes('casual') || name.includes('shoes')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('tas') || name.includes('ransel') || name.includes('backpack') || name.includes('bag')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('flat bottom') || name.includes('lightpack') || name.includes('coffee') || name.includes('packaging')) {
    return 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
};

function ProductImage({ p }) {
  const [hoverIndex, setHoverIndex] = useState(0);
  const images = (() => {
    const imgs = [];
    if (p.imageUrl) imgs.push(p.imageUrl);
    if (p.images) try { imgs.push(...JSON.parse(p.images)); } catch { }
    if (imgs.length === 0) imgs.push(getProductImage(p));
    return imgs;
  })();

  return (
    <img
      src={images[hoverIndex] || images[0]}
      alt={p.name}
      className="w-full h-full object-cover rounded-lg"
      onMouseEnter={() => {
        if (images.length > 1) {
          setHoverIndex(1);
        }
      }}
      onMouseLeave={() => setHoverIndex(0)}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
      }}
    />
  );
}

export default function ProductListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category') || '';
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [favorites, setFavorites] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter, categoryParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', debouncedSearch, activeFilter, categoryParam, page],
    queryFn: () => getProducts({ search: debouncedSearch || undefined, sort: activeFilter || undefined, category: categoryParam || undefined, page, limit: 20 }),
  });

  const products = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const safeProducts = products || [];
  const totalPages = pagination.totalPages || 1;
  const total = pagination.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-content mx-auto px-4 lg:px-6 pt-4 pb-6 lg:pb-8">
      {/* Hero / Search Banner */}
      <section className="mb-6 lg:mb-8">
        <div className="mb-1 lg:mb-3">
          <h1 className="text-[22px] lg:text-[32px] font-semibold text-on-surface tracking-tight">
            {debouncedSearch ? `"${debouncedSearch}"` : categoryParam || 'Semua Produk'}
          </h1>
          <p className="text-[14px] lg:text-[16px] text-on-surface-variant mt-1">
            {debouncedSearch
              ? `${safeProducts.length} produk ditemukan`
              : categoryParam
                ? `Jelajahi produk kategori ${categoryParam}`
                : 'Temukan berbagai produk terbaik untuk kebutuhanmu'
            }
          </p>
        </div>

        {/* Search + Filters in one row (desktop), stacked (mobile) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 lg:flex-none lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>
          {!debouncedSearch && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {filterChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setActiveFilter(chip.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95',
                    activeFilter === chip.value
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product count */}
      {!debouncedSearch && (
        <p className="text-[13px] text-on-surface-variant mb-4">
          {total > 20
            ? `Menampilkan ${(page - 1) * 20 + 1}-${Math.min(page * 20, total)} dari ${total} produk`
            : `${total} produk tersedia`
          }
        </p>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] p-2.5 lg:p-4 flex flex-col">
              <Skeleton className="w-full aspect-square rounded-xl mb-3 bg-slate-100" />
              <Skeleton className="h-4 w-3/4 rounded mt-1 bg-slate-100" />
              <div className="flex justify-between items-center mt-auto pt-2">
                <Skeleton className="h-5 w-16 rounded bg-slate-100" />
                <Skeleton className="h-4 w-12 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || safeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 lg:py-32">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-outline/40" />
          </div>
          <h2 className="text-[20px] font-semibold text-on-surface mb-2">
            {debouncedSearch ? 'No products found' : 'No products available'}
          </h2>
          <p className="text-[14px] text-on-surface-variant text-center max-w-sm mb-6">
            {debouncedSearch
              ? 'Try adjusting your search keywords.'
              : 'Check back later for new arrivals.'}
          </p>
          {debouncedSearch && (
            <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="btn-secondary">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {safeProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="bg-white border border-slate-100 rounded shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 p-2.5 lg:p-4 transition-all duration-300 group flex flex-col h-full"
            >
              {/* Image with hover carousel */}
              <div className="aspect-square bg-slate-50/50 flex items-center justify-center p-2 relative overflow-hidden transition-transform duration-300">
                <ProductImage p={p} />

                {p.stock != null && p.stock <= 3 && p.stock > 0 && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold bg-error text-white tracking-wide uppercase">
                    {p.stock} left
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col pt-2.5 min-h-[72px]">
                <h3 className="text-[13px] font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors duration-200">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[14px] font-bold text-primary-container">
                    {formatCurrency(p.price)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {p.stock != null ? p.stock : 0} stok
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hover:text-primary mt-1 truncate h-4">
                  {p.store?.name || ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-outline-variant text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Sebelumnya
          </button>
          <span className="text-[13px] text-on-surface-variant font-medium">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-outline-variant text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
