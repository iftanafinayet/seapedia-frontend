import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, Heart, ChevronLeft, ChevronRight, Bell, Sparkles, Zap, ArrowRight, Megaphone } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { getProducts, getReviews, getTopRatedProducts, getDealsOfTheDay, getSiteConfig } from '../../api/guest';
import { formatCurrency } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import NotificationDropdown from '../../components/shared/NotificationDropdown';
import { cn } from '../../lib/utils';

const categories = [
  { label: 'Beauty', icon: '💄', keyword: 'beauty' },
  { label: 'Fashion', icon: '👕', keyword: 'fashion' },
  { label: 'Electronic', icon: '📱', keyword: 'elektronik' },
  { label: 'Grocery', icon: '🛒', keyword: 'grocery' },
  { label: 'Home', icon: '🏠', keyword: 'home' },
  { label: 'Sport', icon: '⚽', keyword: 'sport' },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((end - now) / 1000));
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => { setTimeLeft((prev) => Math.max(0, prev - 1)); }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor((timeLeft % 86400) / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  return (
    <div className="flex items-center gap-1 text-[12px] font-semibold">
      <span className="bg-primary-container text-white rounded px-1.5 py-0.5">{String(h).padStart(2, '0')}h</span>
      <span className="text-outline">:</span>
      <span className="bg-primary-container text-white rounded px-1.5 py-0.5">{String(m).padStart(2, '0')}m</span>
      <span className="text-outline">:</span>
      <span className="bg-primary-container text-white rounded px-1.5 py-0.5">{String(s).padStart(2, '0')}s</span>
    </div>
  );
}

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

function ProductCard({ product, className = '' }) {
  const [liked, setLiked] = useState(false);
  const [hoverImg, setHoverImg] = useState(0);

  const cardImages = (() => {
    const imgs = [];
    if (product.imageUrl) imgs.push(product.imageUrl);
    if (product.images) try { imgs.push(...JSON.parse(product.images)); } catch { }
    if (imgs.length === 0) imgs.push(getProductImage(product));
    return imgs;
  })();

  return (
    <Link
      to={`/products/${product.id}`}
      className={`bg-white border border-slate-100 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 p-2.5 lg:p-4 transition-all duration-300 group flex flex-col h-full ${className}`}
    >
      <div className="aspect-square bg-slate-50/50 rounded-xl flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300"
        onMouseEnter={() => { if (cardImages.length > 1) setHoverImg(1); }}
        onMouseLeave={() => setHoverImg(0)}
      >
        <img
          src={cardImages[hoverImg] || cardImages[0]}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors active:scale-90"
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              liked ? 'text-error fill-error' : 'text-slate-400'
            )}
          />
        </button>

        {product.stock != null && product.stock <= 3 && product.stock > 0 && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-error text-white tracking-wide uppercase">
            {product.stock} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col pt-2.5">
        <h3 className="text-[13px] font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[14px] font-bold text-primary-container">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {product.stock != null ? product.stock : 0} stok
          </span>
        </div>
      </div>
    </Link>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('w-4 h-4', i <= rating ? 'text-primary fill-primary' : 'text-outline-variant')} />
      ))}
    </div>
  );
}

const dummyReviews = [
  { reviewerName: 'Capt. Hendra', rating: 5, comment: 'Layanan SEAPEDIA sangat luar biasa. Proses pemesanan mesin kapal sangat transparan dan pengirimannya jauh lebih cepat dari yang saya bayangkan.' },
  { reviewerName: 'Budi Santoso', rating: 5, comment: 'Sangat mudah mencari GPS yang spesifik. Interface-nya bersih dan informatif.' },
  { reviewerName: 'Sari Putri', rating: 5, comment: 'Harga kompetitif dan barang 100% original. Top banget pokoknya!' },
  { reviewerName: 'Dedi Pratama', rating: 4, comment: 'Pengiriman tepat waktu, packing aman. Akan belanja lagi di sini.' },
  { reviewerName: 'Anisa Rahma', rating: 5, comment: 'Pilihan perlengkapan laut terlengkap. Sangat membantu untuk usaha diving saya.' },
];

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const { isAuthenticated, activeRole } = useAuthStore();
  const scrollRef = useRef(null);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ sort: 'popular' }),
    select: (res) => (res.data.data || []).slice(0, 8),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews,
    select: (res) => (res.data.data || []).slice(0, 5),
  });

  const { data: topRated } = useQuery({
    queryKey: ['products', 'topRated'],
    queryFn: getTopRatedProducts,
    select: (res) => res.data.data || [],
  });

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: getDealsOfTheDay,
    select: (res) => res.data.data || [],
  });

  const { data: siteConfig } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: getSiteConfig,
    select: (res) => res.data.data,
    staleTime: 5 * 60 * 1000,
  });

  const hero = siteConfig || {};

  const safeProducts = products || [];
  const safeReviews = reviews || [];

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  // ─── MOBILE LAYOUT ───
  const MobileLanding = () => (
    <div className="px-4 pb-4 lg:hidden">
      <section className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[15px]">
            {user?.username?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div>
            <p className="text-[13px] text-on-surface-variant">Welcome back,</p>
            <p className="text-[16px] font-bold text-on-surface">{user?.username || activeRole || 'Guest'}</p>
          </div>
        </div>
        <NotificationDropdown />
      </section>

      {/* Deals of the Day */}
      {deals && deals.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h3 className="text-[15px] font-bold text-on-surface">Deals of the Day</h3>
            </div>
            <Link to="/products?sort=newest" className="text-[12px] text-primary font-semibold">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {deals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} className="w-full" />)}
          </div>
        </section>
      )}

      <section className="mb-5">
        <h3 className="text-[15px] font-semibold text-on-surface mb-3">Browse Categories</h3>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <Link key={cat.label} to={`/products?search=${cat.keyword}`} className="flex flex-col items-center shrink-0 w-[72px]">
              <div className="w-[60px] h-[60px] rounded-xl bg-surface-container-low flex items-center justify-center text-2xl mb-1.5">{cat.icon}</div>
              <span className="text-[11px] font-medium text-on-surface-variant text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-on-surface">Deals of the day!</h3>
          <CountdownTimer />
        </div>
        {loadingProducts ? (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="shrink-0 w-[48vw] aspect-[0.85] rounded-xl" />)}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {safeProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} className="shrink-0 w-[48vw]" />)}
          </div>
        )}
      </section>

      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-on-surface">Top Rated</h3>
          <Link to="/products" className="text-[12px] font-semibold text-primary">See All</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {(topRated || []).slice(0, 4).map(p => <ProductCard key={p.id + '-top'} product={p} className="shrink-0 w-[48vw]" />)}
        </div>
      </section>

      {/* Mobile Reviews */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-on-surface">Reviews</h3>
          <Link to="/reviews" className="text-[12px] font-semibold text-primary">See All</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {(safeReviews.length > 0 ? safeReviews : dummyReviews).slice(0, 5).map((r, i) => (
            <div key={i} className="shrink-0 w-[80vw] bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div>
                <StarRating rating={r.rating || 5} />
                <p className="text-[13px] text-slate-600 leading-relaxed mt-2 mb-3 line-clamp-3">
                  "{r.comment}"
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                  {(r.reviewerName || 'A')[0]}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-on-surface">{r.reviewerName || 'User'}</p>
                  <p className="text-[10px] text-slate-400">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/reviews" className="block mt-4">
          <button className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-transform">
            Tulis Ulasan
          </button>
        </Link>
      </section>

      <footer className="text-center pb-4 pt-2">
        <p className="text-[13px] font-bold text-on-surface">SEAPEDIA</p>
        <p className="text-[11px] text-outline mt-0.5">&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );

  // ─── DESKTOP LAYOUT ───
  const DesktopLanding = () => (
    <div className="hidden lg:block">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-gradient-to-br from-surface via-surface to-primary-fixed/30">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-primary-fixed/20" />
        <div className="relative z-20 h-full flex flex-col justify-center px-8 max-w-content mx-auto">
          <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[12px] font-medium rounded-full mb-6 w-fit uppercase tracking-[0.05em]">
            Premium Marketplace
          </span>
          <h2 className="text-[48px] font-bold leading-[56px] tracking-[-0.02em] text-on-surface mb-6 max-w-2xl">
            {hero.heroTitle || 'Belanja Mudah di SEAPEDIA'}
          </h2>
          <p className="text-[18px] leading-[28px] text-on-surface-variant mb-10 max-w-lg">
            {hero.heroSubtitle || 'Temukan perlengkapan maritim terbaik dari seluruh dunia dalam satu platform. Kualitas terjamin untuk petualangan laut Anda.'}
          </p>
          <div className="flex gap-4">
            <Link to={hero.heroCtaLink || '/products'}>
              <Button size="lg" className="px-8 py-4 text-[14px] font-semibold">{hero.heroCtaText || 'Mulai Belanja'}</Button>
            </Link>
            <Link to="/products">
              <button className="border border-primary text-primary px-8 py-4 rounded-[8px] text-[14px] font-semibold hover:bg-primary/5 transition-all active:scale-[0.98]">
                Lihat Katalog
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Deals of the Day — Desktop */}
      {deals && deals.length > 0 && (
        <section className="py-16 px-8 max-w-content mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Megaphone className="w-6 h-6 text-amber-500" />
                <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface">Deals of the Day</h3>
              </div>
              <p className="text-[16px] text-on-surface-variant">Penawaran spesial hari ini, jangan sampai kelewatan!</p>
            </div>
            <Link to="/products?sort=newest" className="text-primary font-semibold hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {deals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} className="w-full" />)}
          </div>
        </section>
      )}

      {/* Featured Products Horizontal Scroll */}
      <section className="py-16 px-8 max-w-content mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface">Produk Unggulan</h3>
            <p className="text-[16px] text-on-surface-variant mt-1">Kurasi terbaik untuk kebutuhan profesional Anda.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors">
              <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
            </button>
            <button onClick={() => scroll(1)} className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors">
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
          {loadingProducts ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[calc(25%-12px)] w-[calc(25%-12px)] shrink-0 snap-start">


                <Skeleton className="w-full aspect-square rounded-xl bg-surface-container-low" />
                <Skeleton className="h-3 w-16 rounded mt-3" />
                <Skeleton className="h-4 w-3/4 rounded mt-2" />
                <Skeleton className="h-4 w-1/2 rounded mt-2" />
              </div>
            ))
          ) : (
            safeProducts.map((p) => (
              <div key={p.id} className="min-w-[calc(25%-12px)] w-[calc(25%-12px)] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Categories - Desktop */}
      <section className="py-16 px-8 max-w-content mx-auto">
        <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface mb-8">Browse Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/products?q=${cat.keyword}`}
              className="flex flex-col items-center p-6 bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-primary hover:shadow-card-hover transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bento Reviews Section */}
      <section className="py-16 px-8 bg-surface-container-low">
        <div className="max-w-content mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface">Apa Kata Mereka?</h3>
            <p className="text-[16px] text-on-surface-variant mt-2">Ribuan pelaut mempercayai SEAPEDIA untuk kebutuhan maritim mereka.</p>
          </div>

          {/* Auto-scrolling Review Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll-reviews hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
              {[...(safeReviews.length > 0 ? safeReviews : dummyReviews), ...(safeReviews.length > 0 ? safeReviews : dummyReviews)].map((r, i) => (
                <div key={i} className="w-[400px] shrink-0 bg-white/80 backdrop-blur-[12px] border border-white/30 p-6 rounded-xl flex flex-col justify-between">
                  <div>
                    <StarRating rating={r.rating || 5} />
                    <p className="text-[15px] italic text-on-surface leading-relaxed mt-3 mb-4 line-clamp-3">
                      "{r.comment || 'Layanan SEAPEDIA sangat luar biasa. Proses pemesanan sangat transparan dan pengirimannya cepat.'}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
                      {(r.reviewerName || 'A')[0]}
                    </div>
                    <div>
                      <h5 className="text-[13px] font-semibold text-on-surface">{r.reviewerName || 'User'}</h5>
                      <p className="text-[11px] text-on-surface-variant">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 max-w-3xl mx-auto bg-primary p-8 rounded-xl flex items-center justify-between text-on-primary">
            <div className="max-w-md">
              <h4 className="text-[24px] font-semibold mb-2">Ingin membagikan pengalaman Anda?</h4>
              <p className="text-[16px] text-on-primary/80">Bergabunglah dengan komunitas pelaut profesional SEAPEDIA.</p>
            </div>
            <Link to="/reviews">
              <button className="bg-white text-primary px-6 py-3 rounded-[8px] text-[14px] font-semibold hover:bg-white/90 transition-all active:scale-[0.98] shrink-0">
                Tulis Ulasan
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop Footer */}
      <footer className="border-t border-outline-variant py-8 px-8 bg-surface-container-lowest">
        <div className="max-w-content mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[14px] font-bold text-on-surface">SEAPEDIA</span>
            <p className="text-[14px] text-secondary mt-2 text-center md:text-left">&copy; 2024 SEAPEDIA Global. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="text-[14px] text-secondary hover:text-primary hover:underline transition-all">Sitemap</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary hover:underline transition-all">Privacy Policy</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary hover:underline transition-all">Terms of Service</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary hover:underline transition-all">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      <MobileLanding />
      <DesktopLanding />
    </>
  );
}
