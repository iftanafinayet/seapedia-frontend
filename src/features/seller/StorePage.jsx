import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Pencil, Package, ShoppingBag, TrendingUp, Upload, X, Loader2, MapPin, Phone, Mail, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../api/client';
import { getMyStore, createStore, updateStore, getSellerProducts, getSellerOrders } from '../../api/seller';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

const storeSchema = z.object({
  name: z.string().min(3, 'Nama toko minimal 3 karakter'),
  description: z.string().max(200, 'Maksimal 200 karakter').optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor tidak valid').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  addressLine: z.string().max(255).optional().or(z.literal('')),
});

export default function StorePage() {
  const [editing, setEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const fileRef = useRef(null);
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: store, isLoading } = useQuery({
    queryKey: ['myStore'],
    queryFn: getMyStore,
    select: (res) => res.data.data,
  });

  const { data: products } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: getSellerProducts,
    select: (res) => res.data.data || [],
    enabled: !!store,
  });

  const { data: orders } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: getSellerOrders,
    select: (res) => res.data.data || [],
    enabled: !!store,
  });

  const safeProducts = products || [];
  const safeOrders = orders || [];
  const completedOrders = safeOrders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const totalIncome = completedOrders.reduce((sum, o) => sum + (o.finalTotal || o.totalAmount || 0), 0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name || '',
      description: store?.description || '',
      phone: store?.phone || '',
      email: store?.email || '',
      city: store?.city || '',
      addressLine: store?.addressLine || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
      addNotification('Toko berhasil dibuat!', 'success');
      setEditing(false);
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal membuat toko', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore'] });
      addNotification('Toko berhasil diupdate!', 'success');
      setEditing(false);
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal mengupdate toko', 'error'),
  });

  const onSubmit = (data) => {
    const payload = { ...data, logoUrl: logoUrl || undefined };
    if (store) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/upload', form);
      setLogoUrl(data.data.url);
    } catch {
      addNotification('Gagal upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const startEdit = () => {
    setEditing(true);
    setLogoUrl(store?.logoUrl || '');
    reset({
      name: store?.name || '',
      description: store?.description || '',
      phone: store?.phone || '',
      email: store?.email || '',
      city: store?.city || '',
      addressLine: store?.addressLine || '',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-surface">Toko Saya</h1>
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>

      {store && !editing ? (
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-on-surface-variant">Nama Toko</p>
              <p className="text-headline-md text-on-surface">{store.name}</p>
              {store.description && (
                <p className="text-body-sm text-on-surface-variant mt-1">{store.description}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {store.city && (
                  <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {store.city}
                  </span>
                )}
                {store.phone && (
                  <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {store.phone}
                  </span>
                )}
                {store.email && (
                  <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {store.email}
                  </span>
                )}
              </div>
              {store.addressLine && (
                <p className="text-[12px] text-on-surface-variant mt-1">{store.addressLine}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="w-4 h-4" /> Edit Toko
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-headline-md text-on-surface mb-4">{store ? 'Edit Toko' : 'Buat Toko'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="text-[14px] font-medium text-on-surface mb-1.5 block">Logo Toko</label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary cursor-pointer transition-colors bg-surface-container-low">
                    {uploadingLogo ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-outline" />
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                )}
              </div>
            </div>

            <Input
              label="Nama Toko"
              placeholder="Toko Keren Kamu"
              error={errors.name?.message}
              {...register('name')}
            />
            <div>
              <label className="text-[14px] font-medium text-on-surface mb-1.5 block">
                Deskripsi Toko
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan tentang toko kamu..."
                className="w-full rounded-[8px] border border-outline-variant px-4 py-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                {...register('description')}
              />
              {errors.description?.message && (
                <p className="text-error text-[12px] mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nomor Telepon"
                placeholder="08123456789"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Email"
                placeholder="toko@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <Input
              label="Kota"
              placeholder="Jakarta"
              error={errors.city?.message}
              {...register('city')}
            />
            <div>
              <label className="text-[14px] font-medium text-on-surface mb-1.5 block">Alamat</label>
              <textarea
                rows={2}
                placeholder="Jl. Contoh No. 123"
                className="w-full rounded-[8px] border border-outline-variant px-4 py-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                {...register('addressLine')}
              />
              {errors.addressLine?.message && (
                <p className="text-error text-[12px] mt-1">{errors.addressLine.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              {store && (
                <Button variant="outline" onClick={() => setEditing(false)}>Batal</Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {store && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="!p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Produk</p>
                  <p className="text-[20px] font-bold text-on-surface">{safeProducts.length}</p>
                </div>
              </div>
            </Card>
            <Card className="!p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Pesanan Selesai</p>
                  <p className="text-[20px] font-bold text-on-surface">{completedOrders.length}</p>
                </div>
              </div>
            </Card>
            <Card className="!p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Total Pendapatan</p>
                  <p className="text-[20px] font-bold text-on-surface">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="text-label-md text-on-surface mb-2">Informasi Toko</h2>
            <div className="text-body-sm text-on-surface-variant space-y-1">
              <p>ID: {store.id}</p>
              <p>Dibuat: {new Date(store.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar"
        message="Yakin ingin keluar dari akun seller?"
        confirmLabel="Keluar"
        onConfirm={() => { logout(); navigate('/'); }}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
