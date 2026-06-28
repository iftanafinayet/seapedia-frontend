import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
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
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: getSellerProducts,
    select: (res) => res.data.data || [],
  });

  const safeProducts = products || [];

  const form = useForm({ resolver: zodResolver(productSchema) });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      addNotification('Produk ditambahkan', 'success');
      setShowForm(false);
      form.reset();
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      addNotification('Produk diupdate', 'success');
      setEditing(null);
      form.reset();
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      addNotification('Produk dihapus', 'success');
      setDeleting(null);
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const startEdit = (p) => {
    setEditing(p);
    setImageUrl(p.imageUrl || '');
    form.reset({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category || 'General' });
  };

  const onSubmit = (data) => {
    const payload = { ...data, imageUrl };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-surface">Produk</h1>
        {!showForm && !editing && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        )}
      </div>

      {(showForm || editing) && (
        <Card>
          <h2 className="text-headline-md text-on-surface mb-4">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
            <Input label="Nama Produk" error={form.formState.errors.name?.message} {...form.register('name')} />
            <div>
              <label className="label">Deskripsi</label>
              <textarea rows={3} className="input-field" {...form.register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Harga (Rp)" type="number" error={form.formState.errors.price?.message} {...form.register('price')} />
              <Input label="Stok" type="number" error={form.formState.errors.stock?.message} {...form.register('stock')} />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input-field" {...form.register('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); form.reset(); }}>Batal</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : isError || safeProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="text-body-base text-on-surface-variant">Belum ada produk</p>
            </div>
          ) : (
        <div className="space-y-2">
          {safeProducts.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-on-surface-variant" />
                  )}
                </div>
                <div>
                  <p className="text-label-md text-on-surface">{p.name}</p>
                  <p className="text-body-sm text-primary font-medium">{formatCurrency(p.price)}</p>
                  <p className="text-body-sm text-on-surface-variant">Stok: {p.stock}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} className="text-error"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
          </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${deleting?.name}"?`}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
