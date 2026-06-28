import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';
import { loginUser } from '../../api/auth';
import api from '../../api/client';

const schema = z.object({
  identifier: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const addNotification = useUiStore((s) => s.addNotification);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const { user, token } = res.data.data;
      useAuthStore.getState().setAuth({ user, token, roles: user.roles });
      const nonAdminRoles = user.roles.filter(r => r !== 'Admin');
      if (nonAdminRoles.length > 1) {
        navigate('/choose-role');
      } else {
        const role = nonAdminRoles.length === 1 ? nonAdminRoles[0] : 'Admin';
        const { data: roleRes } = await api.post('/auth/active-role', { activeRole: role });
        useAuthStore.getState().setActiveRole({ activeRole: role, token: roleRes.data.token });
        navigate(role === 'Buyer' ? '/' : `/${role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Login gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px-76px)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] lg:max-w-[420px]">
        <div className="text-center mb-6 lg:mb-8">
          <img src="/seapedialogo.svg" alt="SEAPEDIA" className="h-12 lg:h-16 mx-auto mb-3 lg:mb-4" />
          <h1 className="text-[22px] lg:text-[24px] font-bold text-on-surface">Masuk ke SEAPEDIA</h1>
          <p className="text-[13px] lg:text-[14px] text-on-surface-variant mt-1">Masuk untuk melanjutkan belanja</p>
        </div>

        <Card className="!p-4 lg:!p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 lg:space-y-4">
            <div>
              <label className="label">Username atau Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="username atau email@example.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[8px] pl-4 pr-4 py-2.5 lg:py-3.5 text-[14px] lg:text-[15px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200"
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="#" className="text-[12px] font-semibold text-primary hover:underline">Lupa?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-[8px] pl-4 pr-12 py-3.5 text-[15px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all duration-200"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface-variant"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[14px] text-on-surface-variant mt-6">
          Belum punya akun? <Link to="/register" className="text-primary font-semibold hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
