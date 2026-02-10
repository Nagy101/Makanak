import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, Camera, CheckCircle2, Clock, Loader2, LogOut,
  Mail, Phone, Shield, Upload, User, XCircle, KeyRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProfile, useUpdateProfile, useVerifyIdentity,
  useLogout, useInitiateEmailChange, useConfirmEmailChange,
} from '../hooks/useAuth';

// ── Schemas ──
const profileSchema = z.object({
  Name: z.string().min(2, 'Name required').max(100),
  PhoneNumber: z.string().optional().default(''),
});

const identitySchema = z.object({
  NationalId: z.string().min(5, 'National ID required'),
});

const emailChangeSchema = z.object({
  newEmail: z.string().email('Enter a valid email'),
});

const confirmEmailSchema = z.object({
  otp: z.string().min(4, 'OTP required'),
  newEmail: z.string().min(1).email(),
});


const ProfilePage = () => {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const verifyIdentity = useVerifyIdentity();
  const logout = useLogout();
  const initiateEmail = useInitiateEmailChange();
  const confirmEmail = useConfirmEmailChange();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [emailStep, setEmailStep] = useState<'initiate' | 'confirm'>('initiate');
  const [pendingEmail, setPendingEmail] = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);
  const frontIdRef = useRef<HTMLInputElement>(null);
  const backIdRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { Name: user?.name ?? '', PhoneNumber: user?.phoneNumber ?? '' },
  });

  const identityForm = useForm<z.infer<typeof identitySchema>>({
    resolver: zodResolver(identitySchema),
    values: { NationalId: user?.nationalId ?? '' },
  });

  const emailForm = useForm<z.infer<typeof emailChangeSchema>>({
    resolver: zodResolver(emailChangeSchema),
  });

  const confirmEmailForm = useForm<z.infer<typeof confirmEmailSchema>>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: { newEmail: '', otp: '' },
  });

  const handleFilePreview = (
    file: File,
    setPreview: (url: string) => void,
    setFile: (f: File) => void,
  ) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = profileForm.handleSubmit((d) => {
    updateProfile.mutate({
      Name: d.Name,
      PhoneNumber: d.PhoneNumber || '',
      ProfilePicture: avatarFile ?? undefined,
    });
  });

  const handleIdentitySubmit = identityForm.handleSubmit((d) => {
    if (!frontIdFile || !backIdFile) return;
    verifyIdentity.mutate({
      NationalId: d.NationalId,
      NationalIdImageFrontUrl: frontIdFile,
      NationalIdImageBackUrl: backIdFile,
    });
  });

  const handleEmailInitiate = emailForm.handleSubmit((d) => {
    setPendingEmail(d.newEmail);
    confirmEmailForm.setValue('newEmail', d.newEmail);
    initiateEmail.mutate({ newEmail: d.newEmail }, {
      onSuccess: () => setEmailStep('confirm'),
    });
  });

  const handleEmailConfirm = confirmEmailForm.handleSubmit((d) => {
    confirmEmail.mutate({ otp: d.otp!, newEmail: d.newEmail! }, { onSuccess: () => setEmailStep('initiate') });
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="container mx-auto max-w-4xl px-6 py-10 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Makanak</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="h-28 auth-gradient" />
          <CardContent className="relative pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-28 w-28 rounded-full border-4 border-card bg-muted overflow-hidden shadow-lg">
                  {avatarPreview || user?.profilePicture ? (
                    <img
                      src={avatarPreview || user?.profilePicture}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFilePreview(f, setAvatarPreview, setAvatarFile);
                  }}
                />
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {user?.isIdentityVerified ? (
                  <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Unverified</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start bg-card border rounded-lg p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="h-4 w-4" /> Identity
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <KeyRound className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name, phone number, and profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" className="pl-10" {...profileForm.register('Name')} />
                      </div>
                      {profileForm.formState.errors.Name && (
                        <p className="text-sm text-destructive">{profileForm.formState.errors.Name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" className="pl-10" {...profileForm.register('PhoneNumber')} />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Identity Tab */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Identity Verification
                  {user?.isIdentityVerified ? (
                    <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Not Verified</Badge>
                  )}
                </CardTitle>
                <CardDescription>Upload your national ID to verify your identity</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIdentitySubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID Number</Label>
                    <Input id="nationalId" placeholder="Enter your national ID" {...identityForm.register('NationalId')} />
                    {identityForm.formState.errors.NationalId && (
                      <p className="text-sm text-destructive">{identityForm.formState.errors.NationalId.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Front ID */}
                    <div className="space-y-2">
                      <Label>ID Front</Label>
                      <button
                        type="button"
                        onClick={() => frontIdRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors overflow-hidden"
                      >
                        {frontIdPreview ? (
                          <img src={frontIdPreview} alt="Front ID" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">Upload front side</span>
                          </>
                        )}
                      </button>
                      <input ref={frontIdRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFilePreview(f, setFrontIdPreview, setFrontIdFile);
                        }}
                      />
                    </div>
                    {/* Back ID */}
                    <div className="space-y-2">
                      <Label>ID Back</Label>
                      <button
                        type="button"
                        onClick={() => backIdRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors overflow-hidden"
                      >
                        {backIdPreview ? (
                          <img src={backIdPreview} alt="Back ID" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">Upload back side</span>
                          </>
                        )}
                      </button>
                      <input ref={backIdRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFilePreview(f, setBackIdPreview, setBackIdFile);
                        }}
                      />
                    </div>
                  </div>

                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={verifyIdentity.isPending || !frontIdFile || !backIdFile}>
                      {verifyIdentity.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Verification
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
                <CardDescription>A verification code will be sent to your new email address</CardDescription>
              </CardHeader>
              <CardContent>
                {emailStep === 'initiate' ? (
                  <form onSubmit={handleEmailInitiate} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Current Email</Label>
                      <Input value={user?.email ?? ''} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="newEmail" type="email" placeholder="newemail@example.com" className="pl-10" {...emailForm.register('newEmail')} />
                      </div>
                      {emailForm.formState.errors.newEmail && (
                        <p className="text-sm text-destructive">{emailForm.formState.errors.newEmail.message}</p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={initiateEmail.isPending}>
                        {initiateEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Send Verification Code
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleEmailConfirm} className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                      We sent a code to <span className="font-medium text-foreground">{pendingEmail}</span>
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="emailOtp">Verification Code</Label>
                      <Input id="emailOtp" placeholder="Enter code" {...confirmEmailForm.register('otp')} />
                      {confirmEmailForm.formState.errors.otp && (
                        <p className="text-sm text-destructive">{confirmEmailForm.formState.errors.otp.message}</p>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="ghost" onClick={() => setEmailStep('initiate')}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={confirmEmail.isPending}>
                        {confirmEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Change
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
