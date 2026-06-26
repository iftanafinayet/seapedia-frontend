import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Layout, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getSiteConfig, updateSiteConfig } from '../../api/admin';
import useUiStore from '../../stores/uiStore';

export default function HeroEditorPage() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin', 'siteConfig'],
    queryFn: getSiteConfig,
    select: (res) => res.data.data,
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    values: config ? {
      heroTitle: config.heroTitle || '',
      heroSubtitle: config.heroSubtitle || '',
      heroCtaText: config.heroCtaText || '',
      heroCtaLink: config.heroCtaLink || '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: updateSiteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'siteConfig'] });
      addNotification('Hero section berhasil diupdate!', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal update', 'error'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[24px] font-semibold">Hero Section Editor</h1>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-on-surface">Hero Section Editor</h1>
          <p className="text-[13px] text-on-surface-variant mt-1">Edit konten Hero di Landing Page</p>
        </div>
      </div>

      {/* Preview */}
      <Card className="!p-6 bg-gradient-to-br from-surface via-surface to-primary-fixed/20">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-outline" />
          <span className="text-[12px] font-semibold text-outline uppercase tracking-wider">Preview Desktop</span>
        </div>
        <div className="max-w-lg">
          <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[12px] font-medium rounded-full mb-4 w-fit uppercase tracking-[0.05em]">
            Premium Marketplace
          </span>
          <h2 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-surface mb-3">
            {config?.heroTitle || 'Belanja Mudah di SEAPEDIA'}
          </h2>
          <p className="text-[16px] leading-[24px] text-on-surface-variant mb-6">
            {config?.heroSubtitle || 'Temukan perlengkapan terbaik...'}
          </p>
          <button className="bg-primary-container text-white px-6 py-3 rounded-[8px] text-[14px] font-semibold">
            {config?.heroCtaText || 'Mulai Belanja'}
          </button>
        </div>
      </Card>

      {/* Form */}
      <Card className="!p-5">
        <h2 className="text-[16px] font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Layout className="w-4 h-4 text-primary" />
          Edit Konten
        </h2>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
          <Input label="Judul Hero" placeholder="Belanja Mudah di SEAPEDIA" {...register('heroTitle')} />
          <Input label="Subtitle" placeholder="Temukan perlengkapan terbaik..." {...register('heroSubtitle')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Teks Tombol CTA" placeholder="Mulai Belanja" {...register('heroCtaText')} />
            <Input label="Link Tombol CTA" placeholder="/products" {...register('heroCtaLink')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
