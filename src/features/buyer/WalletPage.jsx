import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, X, Check, CreditCard, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getWallet, topUpWallet, getTransactions } from '../../api/buyer';
import { formatCurrency, formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const quickAmounts = [10000, 50000, 100000, 500000];

const typeLabels = {
  TopUp: 'Top Up', Payment: 'Pembayaran', Refund: 'Refund',
  topup: 'Top Up', payment: 'Pembayaran', refund: 'Refund',
};

export default function WalletPage() {
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const navigate = useNavigate();

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    select: (res) => res.data.data,
  });

  const { data: transactions, isLoading: loadingTx, isError: txError } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    select: (res) => res.data.data || [],
  });

  const safeTransactions = transactions || [];

  const topUpMutation = useMutation({
    mutationFn: topUpWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      addNotification('Top-up berhasil!', 'success');
      setShowTopUp(false);
      setAmount('');
    },
    onError: (err) => {
      addNotification(err.response?.data?.message || 'Top-up gagal', 'error');
    },
  });

  const income = safeTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = safeTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="max-w-content mx-auto px-4 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[24px] font-semibold text-on-surface">Wallet</h1>
          </div>
          <p className="text-[14px] text-on-surface-variant mt-1">Manage your balance and transactions</p>
        </div>
        <button onClick={() => setShowTopUp(true)} className="btn-primary hidden lg:inline-flex">
          <Plus className="w-4 h-4" /> Top Up
        </button>
      </div>

      {/* Balance + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Balance Card */}
        {loadingWallet ? (
          <Skeleton className="h-[180px] rounded-2xl lg:col-span-2" />
        ) : (
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-primary-container p-6 lg:p-8 text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary rounded-full blur-2xl -mb-16" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-[13px] font-medium text-white/70 mb-2">Current Balance</p>
                <h2 className="text-[36px] lg:text-[44px] font-bold leading-none tracking-tight">
                  {formatCurrency(wallet?.balance || 0)}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-white/60 text-[13px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+2.4% from last month</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopUp(true)}
                  className="bg-white text-primary font-semibold text-[14px] px-5 py-3 rounded-xl hover:bg-primary-fixed transition-colors active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Funds
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white font-semibold text-[14px] px-5 py-3 rounded-xl hover:bg-white/30 transition-colors active:scale-95">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {loadingWallet ? (
          <>
            <Skeleton className="h-[80px] rounded-xl" />
            <Skeleton className="h-[80px] rounded-xl" />
          </>
        ) : (
          <>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[13px] font-medium text-on-surface-variant">Income</p>
              </div>
              <p className="text-[22px] font-bold text-emerald-600">+{formatCurrency(income)}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-[13px] font-medium text-on-surface-variant">Expenses</p>
              </div>
              <p className="text-[22px] font-bold text-red-600">-{formatCurrency(spent)}</p>
            </div>
          </>
        )}
      </div>

      {/* Transaction History */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-on-surface">Transaction History</h2>
      </div>

      {loadingTx ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-[56px] rounded-lg" />)}
        </div>
      ) : txError || safeTransactions.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-outline" />
          </div>
          <h3 className="text-[16px] font-semibold text-on-surface mb-2">No transactions yet</h3>
          <p className="text-[14px] text-on-surface-variant">Your transaction history will appear here.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
          {/* Mobile */}
          <div className="lg:hidden divide-y divide-outline-variant/10">
            {safeTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', t.amount > 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                    {t.amount > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface">{typeLabels[t.type] || t.type}</p>
                    {t.description && <p className="text-[12px] text-on-surface-variant truncate">{t.description}</p>}
                    <p className="text-[11px] text-on-surface-variant">{formatDateShort(t.createdAt)}</p>
                  </div>
                </div>
                <p className={cn('text-[15px] font-bold shrink-0 ml-3', t.amount > 0 ? 'text-emerald-600' : 'text-red-600')}>
                  {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Type</th>
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Description</th>
                  <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Date</th>
                  <th className="text-right px-6 py-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {safeTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', t.amount > 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                          {t.amount > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />}
                        </div>
                        <span className="text-[14px] font-medium text-on-surface">{typeLabels[t.type] || t.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[14px] text-on-surface-variant">{t.description || '-'}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[14px] text-on-surface-variant">{formatDateShort(t.createdAt)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={cn('text-[14px] font-bold', t.amount > 0 ? 'text-emerald-600' : 'text-red-600')}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTopUp(false)} />
          <div className="relative bg-white rounded-t-3xl lg:rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-on-surface">Top Up Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Saved Card */}
            <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-3 mb-5">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[14px] font-semibold text-on-surface">Visa •••• 4242</p>
                <p className="text-[12px] text-on-surface-variant">Expires 12/26</p>
              </div>
              <Check className="w-4 h-4 text-emerald-600 ml-auto" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-on-surface-variant mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-on-surface-variant">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-container-low border-0 rounded-xl py-4 pl-10 pr-4 text-[20px] font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={cn(
                      'py-2.5 border border-outline-variant rounded-xl text-[13px] font-semibold hover:border-primary hover:text-primary transition-colors',
                      amount === String(a) && 'border-primary bg-primary/5 text-primary'
                    )}
                  >
                    +Rp {a.toLocaleString('id')}
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={() => topUpMutation.mutate({ amount: Number(amount) })} disabled={topUpMutation.isPending || !amount}>
                {topUpMutation.isPending ? 'Processing...' : 'Confirm Top Up'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
