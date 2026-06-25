import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Play, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { simulateNextDay, getAdminDashboard } from '../../api/admin';
import useUiStore from '../../stores/uiStore';

export default function SimulatePage() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    select: (res) => res.data.data,
  });

  const systemDate = dashboard?.systemDate || null;

  const simulateMutation = useMutation({
    mutationFn: simulateNextDay,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      const newDate = res?.data?.data?.systemDate;
      const msg = newDate
        ? `Sistem dimajukan ke ${new Date(newDate).toLocaleDateString('id-ID')}. Cek order overdue.`
        : 'Sistem berhasil dimajukan 1 hari. Cek order overdue.';
      addNotification(msg, 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Simulasi gagal', 'error'),
  });

  const displayDate = systemDate
    ? new Date(systemDate)
    : new Date();

  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold text-on-surface">Simulasi Waktu</h1>

      <Card className="text-center py-8">
        <Calendar className="w-12 h-12 text-outline mx-auto mb-4" />
        {isLoading ? (
          <Skeleton className="h-8 w-48 mx-auto mb-1" />
        ) : (
          <>
            <p className="text-[14px] text-on-surface-variant mb-1">Tanggal Simulasi Saat Ini</p>
            <p className="text-[24px] font-bold text-on-surface">
              {displayDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </>
        )}
        <p className="text-[13px] text-outline mt-4 max-w-sm mx-auto">
          Klik tombol di bawah untuk memajukan sistem 1 hari dan memicu pengecekan order overdue.
        </p>
        <Button
          className="mt-6"
          size="lg"
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
        >
          {simulateMutation.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {simulateMutation.isPending ? 'Memproses...' : 'Simulasikan Hari Berikutnya'}
        </Button>
      </Card>
    </div>
  );
}
