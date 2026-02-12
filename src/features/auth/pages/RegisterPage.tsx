import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Home, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().min(1).email('Enter a valid email'),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(1),
  userType: z.enum(['Tenant', 'Owner'], { message: 'Please select a user type' }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type RegisterFormData = z.output<typeof schema>;

const RegisterPage = () => {
  const [showPw, setShowPw] = useState(false);
  const { mutate, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phoneNumber: '', password: '', confirmPassword: '', userType: 'Tenant', dateOfBirth: '' },
  });
  const selectedUserType = watch('userType');

  return (
    <AuthLayout title="Create your account" subtitle="Join Makanak and start exploring properties">
      <form onSubmit={handleSubmit((d) => mutate(d as any))} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" placeholder="John Doe" className="pl-10" {...register('name')} />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="phone" placeholder="+1 234 567 890" className="pl-10" {...register('phoneNumber')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Choose Your Account Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedUserType === 'Tenant' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                value="Tenant"
                {...register('userType')}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">Tenant</span>
              </div>
            </label>
            <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedUserType === 'Owner' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                value="Owner"
                {...register('userType')}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span className="font-medium">Owner</span>
              </div>
            </label>
          </div>
          {errors.userType && <p className="text-sm text-destructive">{errors.userType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isPending}>
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
