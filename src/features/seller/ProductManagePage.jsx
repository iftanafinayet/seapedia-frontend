import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Package, Search, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ImageUpload from '../../components/ui/ImageUpload';
import { getSellerProducts, createProduct, updateProduct, deleteProduct } from '../../api/seller';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Harga harus lebih dari 0'),
  stock: z.coerce.number().int().min(0, 'Stok minimal 0'),
  category: z.enum(['Beauty', 'Fashion', 'Electronic', 'Grocery', 'Home', 'Sport', 'General']).default('General'),
});

const CATEGORIES = [
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Electronic', label: 'Electronic' },
  { value: 'Grocery', label: 'Grocery' },
  { value: 'Home', label: 'Home' },
  { value: 'Sport', label: 'Sport' },
  { value: 'General', label: 'General' },
];

export default function ProductManagePage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: products, isLoading } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: getSellerProducts,
    select: (res) => res.data.data || [],
  });

  const safeProducts = products || [];
  const filtered = search
    ? safeProducts.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : safeProducts;
  const displayed = showAll ? filtered : filtered.slice(0, 10);
  const hasMore = filtered.length > 10;

  const form = useForm({ resolver: zodResolver(productSchema) });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sellerProducts'] }); addNotification('Produk ditambahkan', 'success'); setShowForm(false); setImageUrl(''); form.reset(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sellerProducts'] }); addNotification('Produk diupdate', 'success'); setEditing(null); setImageUrl(''); form.reset(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sellerProducts'] }); addNotification('Produk dihapus', 'success'); setDeleting(null); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const startEdit = (p) => {
    setEditing(p);
    setImageUrl(p.imageUrl || '');
    form.reset({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category || 'General' });
    setShowForm(false);
  };

  const onSubmit = (data) => {
    let images = [];
    try { images = JSON.parse(imageUrl || '[]'); } catch { images = imageUrl ? [imageUrl] : []; }
    const payload = {
      ...data,
      imageUrl: images[0] || '',
      images: images.length > 0 ? JSON.stringify(images) : '',
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Produk</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{safeProducts.length} produk · {filtered.length} ditampilkan</p>
        </div>
        {!editing && (
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditing(null); setImageUrl(''); if (!showForm) form.reset(); }}>
            <Plus className="w-4 h-4" /> {showForm ? 'Tutup' : 'Tambah'}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showForm || editing) && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-on-surface">{editing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); form.reset(); }}
              className="p-1 rounded-lg hover:bg-surface-container transition-colors"><X className="w-4 h-4 text-outline" /></button>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <ImageUpload value={imageUrl} onChange={(val) => setImageUrl(val)} />
            <Input label="Nama Produk" error={form.formState.errors.name?.message} {...form.register('name')} />
            <div>
              <label className="text-[13px] font-medium text-on-surface-variant mb-1 block">Deskripsi</label>
              <textarea rows={2} placeholder="Deskripsi singkat produk..." className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-[14px] text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" {...form.register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Harga (Rp)" type="number" error={form.formState.errors.price?.message} {...form.register('price')} />
              <Input label="Stok" type="number" error={form.formState.errors.stock?.message} {...form.register('stock')} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-on-surface-variant mb-1 block">Kategori</label>
              <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" {...form.register('category')}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : (editing ? 'Update' : 'Simpan')}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); form.reset(); }}>Batal</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {!isLoading && safeProducts.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl">
          <Search className="w-4 h-4 text-outline shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..." className="bg-transparent text-[13px] text-on-surface outline-none flex-1" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-outline" /></button>}
        </div>
      )}

      {/* Product List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-outline/30 mx-auto mb-2" />
          <p className="text-[13px] text-on-surface-variant">{search ? 'Produk tidak ditemukan' : 'Belum ada produk'}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayed.map((p) => (
            <div key={p.id} className="flex items-center gap-2 p-2.5 lg:p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-4 h-4 lg:w-5 lg:h-5 text-outline/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[12px] lg:text-[13px] font-semibold text-on-surface truncate">{p.name}</p>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] lg:text-[10px] font-medium bg-surface-container text-on-surface-variant">{p.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] lg:text-[12px]">
                  <span className="font-bold text-primary">{formatCurrency(p.price)}</span>
                  <span className={`${p.stock <= 5 ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>Stok: {p.stock}</span>
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => startEdit(p)} className="p-1.5 lg:p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
                  <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button onClick={() => setDeleting(p)} className="p-1.5 lg:p-2 rounded-lg hover:bg-error/10 transition-colors text-outline hover:text-error">
                  <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          ))}
          {hasMore && !showAll && (
            <button onClick={() => setShowAll(true)}
              className="w-full py-2.5 text-center text-[13px] text-primary font-semibold hover:bg-surface-container-low rounded-xl transition-colors">
              Lihat Semua ({filtered.length}) →
            </button>
          )}
          {showAll && hasMore && (
            <button onClick={() => setShowAll(false)}
              className="w-full py-2 text-center text-[12px] text-outline hover:text-on-surface-variant transition-colors">
              Tampilkan Lebih Sedikit ↑
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${deleting?.name}"?`}
        confirmLabel="Hapus"
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
