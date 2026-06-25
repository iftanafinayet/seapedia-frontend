import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ticket, Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, getPromos, createPromo, updatePromo, deletePromo } from '../../api/admin';
import { formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const PAGE_SIZE = 6;

const numberField = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
  z.number().positive('Nilai harus positif').optional()
);

const voucherSchema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number({ invalid_type_error: 'Nilai wajib diisi' }).positive('Nilai harus positif'),
  minOrder: numberField,
  expiryDate: z.string().min(1, 'Tanggal wajib diisi'),
  usageLimit: numberField,
  applicableToDeals: z.boolean().optional(),
});

const promoSchema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number({ invalid_type_error: 'Nilai wajib diisi' }).positive('Nilai harus positif'),
  minOrder: numberField,
  expiryDate: z.string().min(1, 'Tanggal wajib diisi'),
});

const defaultValues = { discountType: 'percentage', code: '', discountValue: '', minOrder: '', expiryDate: '', usageLimit: '', applicableToDeals: false };

export default function VoucherPage() {
  const [activeTab, setActiveTab] = useState('voucher');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: vouchers = [], isLoading: loadingVouchers, isError: voucherError, error: voucherErr } = useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn: getVouchers,
    select: (res) => res.data.data || [],
    enabled: activeTab === 'voucher',
  });

  const { data: promos = [], isLoading: loadingPromos, isError: promoError, error: promoErr } = useQuery({
    queryKey: ['admin', 'promos'],
    queryFn: getPromos,
    select: (res) => res.data.data || [],
    enabled: activeTab === 'promo',
  });

  const schema = activeTab === 'voucher' ? voucherSchema : promoSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const resetForm = useCallback(() => {
    form.reset(defaultValues);
    setEditingItem(null);
    setShowForm(false);
  }, [form]);

  const handleEdit = (item) => {
    setEditingItem(item);
    const rawDate = item.expiryDate;
    const dateStr = rawDate && typeof rawDate === 'object' && !(rawDate instanceof Date)
      ? ''
      : rawDate instanceof Date
        ? rawDate.toISOString().split('T')[0]
        : typeof rawDate === 'string'
          ? rawDate.split('T')[0]
          : '';
    form.reset({
      code: item.code || '',
      discountType: (item.discountType || 'percentage').toLowerCase(),
      discountValue: item.discountValue ?? '',
      minOrder: item.minOrder ?? '',
      expiryDate: dateStr,
      usageLimit: item.usageLimit ?? '',
      applicableToDeals: item.applicableToDeals || false,
    });
    setShowForm(true);
  };

  const voucherCreate = useMutation({
    mutationFn: createVoucher,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); addNotification('Voucher berhasil dibuat', 'success'); resetForm(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal membuat voucher', 'error'),
  });

  const voucherUpdate = useMutation({
    mutationFn: ({ id, data }) => updateVoucher(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); addNotification('Voucher berhasil diupdate', 'success'); resetForm(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal update voucher', 'error'),
  });

  const voucherDelete = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); addNotification('Voucher berhasil dihapus', 'success'); setDeleteTarget(null); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal hapus voucher', 'error'),
  });

  const promoCreate = useMutation({
    mutationFn: createPromo,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] }); addNotification('Promo berhasil dibuat', 'success'); resetForm(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal membuat promo', 'error'),
  });

  const promoUpdate = useMutation({
    mutationFn: ({ id, data }) => updatePromo(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] }); addNotification('Promo berhasil diupdate', 'success'); resetForm(); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal update promo', 'error'),
  });

  const promoDelete = useMutation({
    mutationFn: deletePromo,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promos'] }); addNotification('Promo berhasil dihapus', 'success'); setDeleteTarget(null); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal hapus promo', 'error'),
  });

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(0); resetForm(); };

  const onSubmit = (data) => {
    if (activeTab === 'voucher') {
      editingItem ? voucherUpdate.mutate({ id: editingItem.id, data }) : voucherCreate.mutate(data);
    } else {
      editingItem ? promoUpdate.mutate({ id: editingItem.id, data }) : promoCreate.mutate(data);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTarget.type === 'voucher' ? voucherDelete.mutate(deleteTarget.id) : promoDelete.mutate(deleteTarget.id);
  };

  const items = activeTab === 'voucher' ? vouchers : promos;
  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const pagedItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const isLoading = activeTab === 'voucher' ? loadingVouchers : loadingPromos;
  const isError = activeTab === 'voucher' ? voucherError : promoError;
  const errorMsg = activeTab === 'voucher' ? voucherErr?.response?.data?.message : promoErr?.response?.data?.message;
  const isPending = voucherCreate.isPending || voucherUpdate.isPending || voucherDelete.isPending || promoCreate.isPending || promoUpdate.isPending || promoDelete.isPending;

  return (
    <div className="space-y-4">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-[24px] font-semibold text-on-surface">Voucher & Promo</h1>
        <div className="flex items-center gap-2">
          {[{ key: 'voucher', label: 'Voucher' }, { key: 'promo', label: 'Promo' }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-primary-container text-white'
                  : 'bg-white text-on-surface-variant border border-outline-variant'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <span className="text-[13px] text-on-surface-variant">
          {items.length} {activeTab === 'voucher' ? 'voucher' : 'promo'}
        </span>
        <Button size="sm" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? 'Tutup' : <><Plus className="w-4 h-4" /> Tambah</>}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="!p-4 lg:!p-5">
          <h2 className="text-[16px] font-semibold text-on-surface mb-4">
            {editingItem ? 'Edit' : 'Buat'} {activeTab === 'voucher' ? 'Voucher' : 'Promo'}
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Kode" placeholder="DISKON50" error={form.formState.errors.code?.message} {...form.register('code')} />
              <div>
                <label className="text-[13px] font-medium text-on-surface mb-1.5 block">Tipe Diskon</label>
                <select {...form.register('discountType')} className="w-full bg-white border border-outline-variant rounded-[8px] px-4 py-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent">
                  <option value="percentage">Persentase</option>
                  <option value="fixed">Nominal Tetap</option>
                </select>
              </div>
              <Input label="Nilai Diskon" type="number" placeholder="10" error={form.formState.errors.discountValue?.message} {...form.register('discountValue')} />
              <Input label="Minimal Order (Rp)" type="number" placeholder="50000" {...form.register('minOrder')} />
              <Input label="Tanggal Kadaluarsa" type="date" error={form.formState.errors.expiryDate?.message} min={new Date().toISOString().split('T')[0]} {...form.register('expiryDate')} />
              {activeTab === 'voucher' && (
                <Input label="Batas Pemakaian" type="number" placeholder="100" error={form.formState.errors.usageLimit?.message} {...form.register('usageLimit')} />
              )}
            </div>
            {activeTab === 'voucher' && (
              <div className="flex items-center gap-3 py-1">
                <input type="checkbox" id="applicableToDeals" {...form.register('applicableToDeals')} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor="applicableToDeals" className="text-[14px] text-on-surface font-medium cursor-pointer">
                  Berlaku untuk Deals of the Day
                </label>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
              {editingItem && <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>}
            </div>
          </form>
        </Card>
      )}

      {/* Error */}
      {isError && (
        <Card className="!p-4 border-error/20 bg-error-container/20">
          <p className="text-[14px] text-error font-medium text-center">{errorMsg || 'Gagal memuat data'}</p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <>
          {pagedItems.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="w-12 h-12 text-outline/30 mx-auto mb-3" />
              <p className="text-[14px] text-outline">Belum ada {activeTab === 'voucher' ? 'voucher' : 'promo'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pagedItems.map((v) => (
                <Card key={v.id}>
                  {/* Top row: code + badges */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-[14px] font-semibold text-on-surface truncate">{v.code}</p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5">
                        {(v.discountType || '').toLowerCase() === 'percentage' ? `${v.discountValue}%` : `Rp ${v.discountValue?.toLocaleString()}`}
                        {v.minOrder ? ` · min. Rp ${v.minOrder.toLocaleString()}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {v.applicableToDeals && <Badge variant="primary" className="text-[10px]">Deals</Badge>}
                      <Badge variant={new Date(v.expiryDate) > new Date() ? 'success' : 'error'} className="text-[10px]">
                        {new Date(v.expiryDate) > new Date() ? 'Aktif' : 'Expired'}
                      </Badge>
                    </div>
                  </div>
                  {/* Bottom row: info + actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-outline">
                      Exp: {formatDateShort(v.expiryDate)}
                      {v.usageLimit != null ? ` · ${v.usedCount || 0}/${v.usageLimit} terpakai` : ''}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(v)} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-outline hover:text-primary" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: v.id, type: activeTab })} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-outline hover:text-error" aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-[13px] text-on-surface-variant px-2">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Hapus ${activeTab === 'voucher' ? 'Voucher' : 'Promo'}`}
        message={`Yakin ingin menghapus ${activeTab === 'voucher' ? 'voucher' : 'promo'} ini?`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={voucherDelete.isPending || promoDelete.isPending}
      />
    </div>
  );
}
