import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Truck, Shield, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useAuthStore from '../../stores/authStore';

const roleConfig = {
  Buyer: { icon: ShoppingCart, label: 'Pembeli', desc: 'Belanja produk, kelola keranjang & pesanan', color: 'bg-primary-fixed text-primary' },
  Seller: { icon: Store, label: 'Penjual', desc: 'Kelola toko, produk & pesanan masuk', color: 'bg-secondary-container text-secondary' },
  Driver: { icon: Truck, label: 'Kurir', desc: 'Ambil & antar pesanan, lihat penghasilan', color: 'bg-tertiary-fixed text-tertiary' },
  Admin: { icon: Shield, label: 'Admin', desc: 'Monitoring, kelola voucher & sistem', color: 'bg-error-container text-error' },
};

export default function RoleSelectionPage() {
  const { roles, setActiveRole, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setActiveRole(role);
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100dvh-56px-76px)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] text-center mb-8">
        <h1 className="text-[24px] font-bold text-on-surface">Pilih Peran Anda</h1>
        <p className="text-[14px] text-on-surface-variant mt-2">Pilih peran yang paling sesuai untuk pengalaman terbaik</p>
      </div>

      <div className="w-full max-w-[480px] space-y-4">
        {roles.filter(r => r !== 'Admin').map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          return (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="w-full group relative overflow-hidden bg-white rounded-[12px] border border-outline-variant p-5 flex items-center gap-4 text-left hover:border-primary hover:shadow-card-hover transition-all duration-200"
            >
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${config.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-on-surface">{config.label}</p>
                <p className="text-[13px] text-on-surface-variant mt-0.5">{config.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          );
        })}

        {roles.includes('Admin') && (
          <button
            onClick={() => handleSelect('Admin')}
            className="w-full group relative overflow-hidden bg-white rounded-[12px] border border-outline-variant p-5 flex items-center gap-4 text-left hover:border-error hover:shadow-card-hover transition-all duration-200"
          >
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 bg-error-container text-error group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-semibold text-on-surface">Admin</p>
              <p className="text-[13px] text-on-surface-variant mt-0.5">Monitoring, kelola voucher & sistem</p>
            </div>
            <ArrowRight className="w-4 h-4 text-outline group-hover:text-error group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        )}
      </div>

      {roles.length > 1 && (
        <p className="text-[13px] text-outline mt-6 text-center">Kamu bisa mengganti peran kapan saja</p>
      )}

      <button onClick={handleLogout} className="mt-8 text-[14px] text-outline hover:text-error transition-colors font-medium">
        Keluar
      </button>
    </div>
  );
}
