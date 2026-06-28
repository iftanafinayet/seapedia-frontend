import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Pencil, Package, ShoppingBag, TrendingUp, Upload, X, Loader2, MapPin, Phone, Mail, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../api/client';
import { getMyStore, createStore, updateStore, getSellerProducts, getSellerOrders } from '../../api/seller';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

function getOrderRevenue(order) {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  }
  return (order.totalAmount || 0) - (order.discountAmount || 0);
}

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
    queryKey: ['myStore'], queryFn: getMyStore, select: (res) => res.data.data,
  });

  const { data: products } = useQuery({
    queryKey: ['sellerProducts'], queryFn: getSellerProducts,
    select: (res) => res.data.data || [], enabled: !!store,
  });

  const { data: orders } = useQuery({
    queryKey: ['orders', 'seller'], queryFn: getSellerOrders,
    select: (res) => res.data.data || [], enabled: !!store,
  });

  const safeProducts = products || [];
  const safeOrders = orders || [];
  const completedOrders = safeOrders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const totalIncome = completedOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name || '', description: store?.description || '',
      phone: store?.phone || '', email: store?.email || '',
      city: store?.city || '', addressLine: store?.addressLine || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myStore'] }); addNotification('Toko berhasil dibuat!', 'success'); setEditing(false); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal membuat toko', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myStore'] }); addNotification('Toko berhasil diupdate!', 'success'); setEditing(false); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal mengupdate toko', 'error'),
  });

  const onSubmit = (data) => {
    const payload = { ...data, logoUrl: logoUrl || undefined };
    if (store) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setUploadingLogo(true);
    try {
      const form = new FormData(); form.append('image', file);
      const { data } = await api.post('/upload', form);
      setLogoUrl(data.data.url);
    } catch { addNotification('Gagal upload logo', 'error'); }
    finally { setUploadingLogo(false); }
  };

  const startEdit = () => {
    setEditing(true);
    setLogoUrl(store?.logoUrl || '');
    reset({ name: store?.name || '', description: store?.description || '', phone: store?.phone || '', email: store?.email || '', city: store?.city || '', addressLine: store?.addressLine || '' });
  };

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">{store?.name || 'Toko Saya'}</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{store ? 'Kelola informasi toko kamu' : 'Buat toko untuk mulai berjualan'}</p>
        </div>
        {store && (
          <button onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] text-outline hover:text-error transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        )}
      </div>

      {/* Store Info / Create Form */}
      {store && !editing ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-on-surface">{store.name}</p>
              {store.description && <p className="text-[13px] text-on-surface-variant mt-0.5">{store.description}</p>}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[12px] text-on-surface-variant">
                {store.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.city}</span>}
                {store.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{store.phone}</span>}
                {store.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{store.email}</span>}
              </div>
              {store.addressLine && <p className="text-[12px] text-on-surface-variant mt-1">{store.addressLine}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
            <p className="text-[11px] text-outline">ID: {store.id} · Dibuat {new Date(store.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <Button variant="outline" size="sm" onClick={startEdit}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">{store ? 'Edit Toko' : 'Buat Toko Baru'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-on-surface-variant mb-1 block">Logo Toko</label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setLogoUrl('')} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"><X className="w-2.5 h-2.5 text-white" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary cursor-pointer transition-colors bg-surface-container-low">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Upload className="w-4 h-4 text-outline" />}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                  </label>
                )}
              </div>
            </div>
            <Input label="Nama Toko" placeholder="Nama toko kamu" error={errors.name?.message} {...register('name')} />
            <div>
              <label className="text-[12px] font-medium text-on-surface-variant mb-1 block">Deskripsi</label>
              <textarea rows={2} placeholder="Ceritakan tentang toko..." className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-[13px] text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telepon" placeholder="08123456789" error={errors.phone?.message} {...register('phone')} />
              <Input label="Email" placeholder="toko@email.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Kota" placeholder="Jakarta" error={errors.city?.message} {...register('city')} />
            <div>
              <label className="text-[12px] font-medium text-on-surface-variant mb-1 block">Alamat</label>
              <textarea rows={2} placeholder="Jl. Contoh No. 123" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-[13px] text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" {...register('addressLine')} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
              </Button>
              {store && <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Batal</Button>}
            </div>
          </form>
        </div>
      )}

      {/* KPI Cards */}
      {store && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-center">
            <Package className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[18px] font-bold text-on-surface">{safeProducts.length}</p>
            <p className="text-[10px] text-on-surface-variant">Produk</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-center">
            <ShoppingBag className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-[18px] font-bold text-on-surface">{completedOrders.length}</p>
            <p className="text-[10px] text-on-surface-variant">Pesanan Selesai</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-[18px] font-bold text-on-surface">{formatCurrency(totalIncome)}</p>
            <p className="text-[10px] text-on-surface-variant">Pendapatan</p>
          </div>
        </div>
      )}

      <ConfirmDialog open={logoutOpen} title="Keluar" message="Yakin ingin keluar dari akun seller?" confirmLabel="Keluar"
        onConfirm={() => { logout(); navigate('/'); }} onCancel={() => setLogoutOpen(false)} />
    </div>
  );
}
