import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '../components/AuthLayout';
import { useForgotPassword, useVerifyOtp, useResetPassword } from '../hooks/useAuth';

type Step = 'email' | 'otp' | 'reset';

const emailSchema = z.object({ email: z.string().min(1).email('Enter a valid email') });

const resetSchema = z.object({
  newPassword: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(1),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
});

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const forgot = useForgotPassword();
  const verify = useVerifyOtp();
  const reset = useResetPassword();

  const emailForm = useForm<z.output<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email: '' } });
  const resetForm = useForm<z.output<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { newPassword: '', confirmPassword: '' } });

  const handleEmailSubmit = emailForm.handleSubmit((d) => {
    setEmail(d.email);
    forgot.mutate({ email: d.email }, { onSuccess: () => setStep('otp') });
  });

  const handleOtpSubmit = () => {
    verify.mutate({ otp, email }, { onSuccess: () => setStep('reset') });
  };

  const handleResetSubmit = resetForm.handleSubmit((d) => {
    reset.mutate({ confirmPassword: d.confirmPassword!, newPassword: d.newPassword!, email, otp });
  });

  const titles: Record<Step, { title: string; subtitle: string }> = {
    email: { title: 'Forgot password?', subtitle: "Enter your email and we'll send you a code" },
    otp: { title: 'Check your email', subtitle: `We sent a verification code to ${email}` },
    reset: { title: 'Set new password', subtitle: 'Create a strong password for your account' },
  };

  return (
    <AuthLayout title={titles[step].title} subtitle={titles[step].subtitle}>
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...emailForm.register('email')} />
            </div>
            {emailForm.formState.errors.email && (
              <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 font-semibold" disabled={forgot.isPending}>
            {forgot.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Code'}
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </form>
      )}

      {step === 'otp' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleOtpSubmit} className="w-full h-12 font-semibold" disabled={otp.length < 6 || verify.isPending}>
            {verify.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
          </Button>
          <button onClick={() => setStep('email')} className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Change email
          </button>
        </div>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="newPassword" type="password" placeholder="••••••••" className="pl-10" {...resetForm.register('newPassword')} />
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10" {...resetForm.register('confirmPassword')} />
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 font-semibold" disabled={reset.isPending}>
            {reset.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
