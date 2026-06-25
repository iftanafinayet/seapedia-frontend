import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/buyer';
import useUiStore from '../../stores/uiStore';

const addressSchema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  recipient: z.string().min(1, 'Nama penerima wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  addressLine: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
  isPrimary: z.boolean().optional(),
});

export default function AddressPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: addresses, isLoading, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    select: (res) => res.data.data || [],
  });

  const safeAddresses = addresses || [];

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', recipient: '', phone: '', addressLine: '', city: '', postalCode: '', isPrimary: false },
  });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addNotification('Alamat berhasil ditambahkan', 'success');
      setShowForm(false);
      form.reset();
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addNotification('Alamat berhasil diupdate', 'success');
      setEditing(null);
      form.reset();
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addNotification('Alamat berhasil dihapus', 'success');
      setDeleting(null);
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const startEdit = (addr) => {
    setEditing(addr);
    form.reset(addr);
  };

  const onSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-on-surface">Alamat</h1>
        {!showForm && !editing && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        )}
      </div>

      {(showForm || editing) && (
        <Card>
          <h2 className="text-[16px] font-semibold text-on-surface mb-4">{editing ? 'Edit Alamat' : 'Tambah Alamat'}</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Label" placeholder="Rumah / Kantor" error={form.formState.errors.label?.message} {...form.register('label')} />
              <Input label="Nama Penerima" placeholder="Nama penerima" error={form.formState.errors.recipient?.message} {...form.register('recipient')} />
            </div>
            <Input label="Telepon" placeholder="08123456789" error={form.formState.errors.phone?.message} {...form.register('phone')} />
            <Input label="Alamat" placeholder="Jalan, No. Rumah" error={form.formState.errors.addressLine?.message} {...form.register('addressLine')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Kota" placeholder="Jakarta" error={form.formState.errors.city?.message} {...form.register('city')} />
              <Input label="Kode Pos" placeholder="12345" error={form.formState.errors.postalCode?.message} {...form.register('postalCode')} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('isPrimary')} className="rounded" />
              <span className="text-[14px] text-on-surface-variant">Jadikan alamat utama</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditing(null); form.reset(); }}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : isError || safeAddresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-outline mx-auto mb-3" />
          <p className="text-[14px] text-on-surface-variant">Belum ada alamat</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeAddresses.map((addr) => (
            <Card key={addr.id} className="relative">
              {addr.isPrimary && (
                <span className="absolute top-3 right-3 badge-success">Utama</span>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-on-surface-variant mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface">{addr.label}</p>
                  <p className="text-[14px] text-on-surface-variant">{addr.recipient} - {addr.phone}</p>
                  <p className="text-[13px] text-on-surface-variant">{addr.addressLine}, {addr.city} {addr.postalCode}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="ghost" size="sm" onClick={() => startEdit(addr)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(addr)} className="text-error hover:text-error/80">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </Button>
              </div>
            </Card>
          ))}
          </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Alamat"
        message="Yakin ingin menghapus alamat ini?"
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
