import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ShoppingCart, AlertCircle, Star, Store, Truck, Share2, Heart, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getProduct } from '../../api/guest';
import { getProductReviews, createProductReview } from '../../api/guest';
import { addToCart } from '../../api/buyer';
import { formatCurrency } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import useUiStore from '../../stores/uiStore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, activeRole } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const addNotification = useUiStore((s) => s.addNotification);
  const [liked, setLiked] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    select: (res) => res.data.data,
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['productReviews', id],
    queryFn: () => getProductReviews(id),
    select: (res) => res.data.data || [],
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => createProductReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', id] });
      addNotification('Review berhasil dikirim!', 'success');
      setReviewRating(0);
      setReviewComment('');
    },
    onError: () => addNotification('Gagal mengirim review', 'error'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-content mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <Skeleton className="w-full aspect-square lg:aspect-[4/3] rounded-xl" />
          <div className="hidden lg:block space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-outline/40" />
        </div>
        <p className="text-[16px] font-semibold text-on-surface-variant">Produk tidak ditemukan</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const result = addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      storeId: product.storeId,
      storeName: product.store?.name,
      quantity: 1,
    });
    if (result.conflict) {
      addNotification(
        `Keranjang hanya bisa berisi 1 toko. Hapus produk dari "${result.currentStoreName}" dulu.`,
        'warning'
      );
      return;
    }
    try {
      await addToCart({ productId: product.id, quantity: 1 });
    } catch (e) {
      console.log('Failed to sync cart to backend:', e);
    }
    addNotification(`${product.name} ditambahkan ke keranjang`, 'success');
  };

  const canBuy = isAuthenticated && activeRole === 'Buyer';

  const allImages = (() => {
    const imgs = [];
    if (product?.imageUrl) imgs.push(product.imageUrl);
    if (product?.images) {
      try { imgs.push(...JSON.parse(product.images)); } catch {}
    }
    return imgs;
  })();

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(allImages.length, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(allImages.length, 1)) % Math.max(allImages.length, 1));

  const handleReviewSubmit = () => {
    if (!reviewName.trim() || !reviewComment.trim() || reviewRating < 1) {
      addNotification('Isi nama, rating, dan komentar', 'warning');
      return;
    }
    reviewMutation.mutate({ reviewerName: reviewName, rating: reviewRating, comment: reviewComment });
  };

  const safeReviews = reviews || [];

  return (
    <div className="max-w-content mx-auto pb-[100px] lg:pb-0 lg:pt-6">
      {/* Desktop back button */}
      <button
        onClick={() => navigate(-1)}
        className="hidden lg:inline-flex items-center gap-2 text-[14px] font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* F-Pattern Row 1: Image + Info */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
        {/* Image Carousel */}
        <div className="relative w-full aspect-square lg:aspect-[4/3] overflow-hidden bg-surface-container-highest lg:rounded-2xl lg:sticky lg:top-20">
          {allImages.length > 0 ? (
            <>
              <img src={allImages[currentSlide]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
              {allImages.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white scale-125' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          ) : (
            <ShoppingBag className="absolute inset-0 m-auto w-20 h-20 text-outline/30" />
          )}

          {/* Back button - mobile only, desktop has its own outside */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 lg:hidden w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>

          {/* Share + Like */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
              <Share2 className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-error fill-error' : 'text-on-surface-variant'}`} />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="px-4 lg:px-0 mt-6 lg:mt-0 space-y-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-semibold uppercase tracking-wider mb-3">
              Premium Series
            </span>
            <h1 className="text-[22px] lg:text-[32px] font-bold text-on-surface leading-tight tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mt-3">
              <p className="text-[28px] lg:text-[36px] font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-[14px] lg:text-[16px] text-outline line-through">
                  {formatCurrency(product.originalPrice)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-[13px] font-medium">4.9</span>
              <span className="text-[13px]">(2.4k reviews)</span>
            </div>
          </div>

          {/* Store Info */}
          {product.store && (
            <Link to={`/stores/${product.store.id}`} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center overflow-hidden">
                  {product.store.logoUrl ? (
                    <img src={product.store.logoUrl} alt={product.store.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">{product.store.name}</p>
                  <div className="flex items-center gap-1 text-on-surface-variant text-[12px]">
                    <span>{product.store.city || ''}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {product.stock > 0 ? (
                  <span className="text-[12px] font-semibold text-error flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    Tersisa {product.stock}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-semibold">Habis</span>
                )}
                {product.store.city && (
                  <p className="text-[11px] text-outline mt-0.5">{product.store.city}</p>
                )}
              </div>
            </Link>
          )}

          {/* Desktop: Buy buttons in info panel */}
          <div className="hidden lg:flex gap-3 pt-2">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => canBuy ? handleAddToCart() : navigate('/login')}>
              Beli Langsung
            </Button>
            <Button size="lg" className="flex-1" onClick={() => canBuy ? handleAddToCart() : navigate('/login')} disabled={product.stock <= 0}>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* F-Pattern Row 2: Details + Specs */}
      <div className="px-4 lg:px-0 mt-8 lg:mt-12 space-y-8">
        {product.description && (
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface uppercase tracking-[0.05em] mb-4">Product Details</h3>
            <p className="text-[15px] lg:text-[16px] text-on-surface-variant leading-relaxed max-w-3xl">
              {product.description}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/30">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Category</span>
                <p className="text-[14px] font-medium text-on-surface">{product.categoryName || 'General'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Stock</span>
                <p className="text-[14px] font-medium text-on-surface">{product.stock ?? '-'} units</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Store</span>
                {product.store ? (
                  <Link to={`/stores/${product.store.id}`} className="text-[14px] font-medium text-primary hover:underline">{product.store.name}</Link>
                ) : (
                  <p className="text-[14px] font-medium text-on-surface">-</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Condition</span>
                <p className="text-[14px] font-medium text-on-surface">New</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Reviews */}
        <div className="lg:max-w-3xl">
          <h3 className="text-[14px] font-semibold text-on-surface uppercase tracking-[0.05em] mb-4">
            Reviews ({safeReviews.length})
          </h3>

          {/* Review Form */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-on-surface">Write a Review</span>
            </div>
            <div className="flex gap-3">
              <input
                placeholder="Your name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary-container"
              />
              <div className="flex gap-0.5 items-center">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)} className="p-1">
                    <Star className={`w-5 h-5 ${s <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Write your comment..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={2}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary-container resize-none"
            />
            <Button size="sm" onClick={handleReviewSubmit} disabled={reviewMutation.isPending}>
              <Send className="w-3.5 h-3.5" />
              {reviewMutation.isPending ? 'Sending...' : 'Submit Review'}
            </Button>
          </div>

          {/* Review List */}
          {loadingReviews ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : safeReviews.length === 0 ? (
            <p className="text-[13px] text-on-surface-variant text-center py-4">No reviews yet. Be the first!</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {safeReviews.map(r => (
                <div key={r.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[11px]">
                      {r.reviewerName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-[13px] font-semibold text-on-surface">{r.reviewerName}</span>
                    <div className="flex gap-0.5 ml-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant p-5 flex items-center gap-4 lg:max-w-3xl">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-on-surface">Gratis Ongkir</h4>
            <p className="text-[13px] text-on-surface-variant">Min. belanja Rp 0 ke seluruh Indonesia</p>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Bottom Bar */}
      <footer className="fixed bottom-[68px] lg:hidden left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-outline-variant z-30 pb-safe">
        <div className="flex items-center gap-3 px-4 h-[72px]">
          <button className="w-12 h-12 rounded-xl border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0 active:scale-90 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-2">
            <button
              className="flex-1 h-12 rounded-xl border-2 border-primary text-primary text-[14px] font-semibold flex items-center justify-center active:scale-95 transition-all"
              onClick={() => canBuy ? handleAddToCart() : navigate('/login')}
            >
              Beli Langsung
            </button>
            <button
              className="flex-1 h-12 rounded-xl bg-primary-container text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              onClick={() => canBuy ? handleAddToCart() : navigate('/login')}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
