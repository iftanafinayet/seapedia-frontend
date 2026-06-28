import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, MessageSquare, User, Send } from 'lucide-react';
import DOMPurify from 'dompurify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import { getReviews, createReview } from '../../api/guest';
import { formatDateShort } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';

const schema = z.object({
  reviewerName: z.string().min(1, 'Nama wajib diisi'),
  rating: z.number().min(1, 'Rating minimal 1').max(5),
  comment: z.string().min(1, 'Komentar wajib diisi'),
});

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors"
        >
          <Star className={`w-7 h-7 transition-all duration-150 ${s <= value ? 'text-amber-400 fill-amber-400 scale-110' : 'text-outline-variant'}`} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'}`} />
      ))}
    </div>
  );
}

export default function ReviewSection() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const addNotification = useUiStore((s) => s.addNotification);
  const [rating, setRating] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { reviewerName: user?.username || '', rating: 0, comment: '' },
  });

  const { data: reviews, isLoading, isError } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews(),
    select: (res) => res.data.data || [],
  });

  const safeReviews = reviews || [];

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addNotification('Ulasan berhasil dikirim!', 'success');
      reset({ reviewerName: user?.username || '', rating: 0, comment: '' });
      setRating(0);
    },
    onError: (err) => {
      addNotification(err.response?.data?.message || 'Gagal mengirim ulasan', 'error');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ ...data, rating });
  };

  return (
    <div className="max-w-content mx-auto px-4 lg:px-6 pt-4">
      <div className="mb-8">
        <h1 className="text-[24px] lg:text-[32px] font-semibold text-on-surface">Ulasan</h1>
        <p className="text-[14px] lg:text-[16px] text-on-surface-variant mt-1">Lihat dan bagikan pengalaman kamu</p>
      </div>

      {/* Desktop: two-column — form left, stats right */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start mb-10">
        {/* Review Form */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 lg:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-[18px] font-semibold text-on-surface">Tulis Ulasan</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nama" placeholder="Nama kamu" error={errors.reviewerName?.message} {...register('reviewerName')} />

            <div>
              <label className="text-[14px] font-medium text-on-surface-variant mb-2 block">Rating</label>
              <StarPicker value={rating} onChange={(v) => { setRating(v); setValue('rating', v, { shouldValidate: true }); }} />
              {errors.rating && <p className="mt-1 text-[12px] text-error font-medium">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="text-[14px] font-medium text-on-surface-variant mb-2 block">Komentar</label>
              <textarea
                {...register('comment')}
                rows={4}
                className="w-full bg-white border border-outline-variant rounded-[8px] px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tulis komentar kamu..."
              />
              {errors.comment && <p className="mt-1 text-[12px] text-error font-medium">{errors.comment.message}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Rating Summary - Desktop only */}
        <div className="hidden lg:block bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 shadow-card text-center">
          <div className="text-[48px] font-bold text-on-surface leading-none">
            {safeReviews.length > 0
              ? (safeReviews.reduce((s, r) => s + r.rating, 0) / safeReviews.length).toFixed(1)
              : '0.0'}
          </div>
          <StarDisplay rating={Math.round(safeReviews.reduce((s, r) => s + r.rating, 0) / safeReviews.length) || 0} size="lg" />
          <p className="text-[14px] text-on-surface-variant mt-2">{safeReviews.length} ulasan</p>
        </div>
      </div>

      {/* All Reviews */}
      <h2 className="text-[20px] lg:text-[24px] font-semibold text-on-surface mb-4">Semua Ulasan</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : isError || safeReviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-outline/40" />
          </div>
          <p className="text-[16px] font-semibold text-on-surface-variant">Belum ada ulasan</p>
          <p className="text-[14px] text-on-surface-variant mt-1">Jadilah yang pertama memberikan ulasan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {safeReviews.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[15px] shrink-0">
                  {r.reviewerName?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-on-surface">{r.reviewerName}</p>
                  <StarDisplay rating={r.rating} />
                </div>
                <span className="text-[12px] text-on-surface-variant shrink-0">{formatDateShort(r.createdAt)}</span>
              </div>
              <div
                className="text-[14px] lg:text-[15px] text-on-surface-variant leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.comment) }}
              />
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : isError || safeReviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-outline/40" />
          </div>
          <p className="text-[16px] font-semibold text-on-surface-variant">Belum ada ulasan</p>
          <p className="text-[14px] text-on-surface-variant mt-1">Jadilah yang pertama memberikan ulasan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {safeReviews.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[15px] shrink-0">
                  {r.reviewerName?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-on-surface">{r.reviewerName}</p>
                  <StarDisplay rating={r.rating} />
                </div>
                <span className="text-[12px] text-on-surface-variant shrink-0">{formatDateShort(r.createdAt)}</span>
              </div>
              <div
                className="text-[14px] lg:text-[15px] text-on-surface-variant leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.comment) }}
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">Semua hak cipta dilindungi &copy; 2026 Seapedia</p>
    </div>

  );
}
