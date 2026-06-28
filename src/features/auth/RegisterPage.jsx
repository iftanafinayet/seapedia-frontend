import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';
import { registerUser } from '../../api/auth';
import api from '../../api/client';
import { UserPlus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const schema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  roles: z.array(z.enum(['Buyer', 'Seller', 'Driver'])).min(1, 'Pilih minimal 1 peran'),
  agreed: z.literal(true, { errorMap: () => ({ message: 'Anda harus menyetujui syarat & ketentuan' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

const roleOptions = [
  { value: 'Buyer', label: 'Pembeli', desc: 'Belanja produk' },
  { value: 'Seller', label: 'Penjual', desc: 'Jual produk' },
  { value: 'Driver', label: 'Kurir', desc: 'Antar pesanan' },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { roles: [], agreed: false }
  });
  const selectedRoles = watch('roles', []);
  const agreed = watch('agreed', false);
  const addNotification = useUiStore((s) => s.addNotification);

  const toggleRole = (role) => {
    const current = selectedRoles;
    if (current.includes(role)) {
      setValue('roles', current.filter(r => r !== role), { shouldValidate: true });
    } else {
      setValue('roles', [...current, role], { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, confirmPassword: undefined, agreed: undefined };
      const res = await registerUser(payload);
      const { user, token } = res.data.data;
      useAuthStore.getState().setAuth({ user, token, roles: user.roles });
      addNotification('Registrasi berhasil!', 'success');
      const nonAdminRoles = user.roles.filter(r => r !== 'Admin');
      if (nonAdminRoles.length > 1) {
        navigate('/choose-role');
      } else if (nonAdminRoles.length === 1) {
        const role = nonAdminRoles[0];
        const { data: roleRes } = await api.post('/auth/active-role', { activeRole: role });
        useAuthStore.getState().setActiveRole({ activeRole: role, token: roleRes.data.token });
        navigate(`/${role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Registrasi gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[400px] lg:max-w-[420px] p-4 lg:p-6">
        <div className="text-center mb-4 lg:mb-6">
          <img src="/seapedialogo.svg" alt="SEAPEDIA" className="h-12 lg:h-16 mx-auto mb-3 lg:mb-4" />
          <h1 className="text-[22px] lg:text-[24px] font-semibold text-on-surface">Daftar di SEAPEDIA</h1>
          <p className="text-[13px] lg:text-[14px] text-on-surface-variant mt-1">Buat akun baru</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 lg:space-y-4">
          <Input label="Username" placeholder="username" error={errors.username?.message} {...register('username')} />
          <Input label="Email" type="email" placeholder="email@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="Minimal 6 karakter" error={errors.password?.message} {...register('password')} />
          <Input label="Konfirmasi Password" type="password" placeholder="Konfirmasi password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          
          <div>
            <label className="label">Pilih Peran</label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => {
                const isSelected = selectedRoles.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRole(opt.value)}
                    className={cn(
                      'p-3 rounded-[10px] border text-center transition-all min-h-[44px]',
                      isSelected
                        ? 'border-primary bg-primary-fixed text-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    )}
                  >
                    <p className="text-[13px] font-semibold">{opt.label}</p>
                    <p className="text-[11px] text-outline">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.roles && <p className="mt-1 text-[12px] text-red-500">{errors.roles.message}</p>}
          </div>

          <label className={cn(
            'flex items-start gap-3 p-3 rounded-btn cursor-pointer transition-all border',
            agreed ? 'border-primary bg-primary-fixed/50' : 'border-outline-variant hover:border-outline'
          )}>
            <input type="checkbox" className="sr-only" {...register('agreed')} />
            <div className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
              agreed ? 'bg-primary border-primary' : 'border-outline-variant'
            )}>
              {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-[13px] text-on-surface-variant leading-snug">Saya menyetujui <span className="text-primary font-medium">Syarat & Ketentuan</span> serta <span className="text-primary font-medium">Kebijakan Privasi</span> yang berlaku</span>
          </label>
          {errors.agreed && <p className="text-[12px] text-red-500">{errors.agreed.message}</p>}

          <Button type="submit" className="w-full" disabled={loading || !agreed}>
            {loading ? 'Memproses...' : 'Daftar'}
            {!loading && <UserPlus className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-center text-[14px] text-on-surface-variant mt-4">
          Sudah punya akun? <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link>
        </p>
      </Card>
    </div>
  );
}
