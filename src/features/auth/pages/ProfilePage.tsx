import { useState, useRef, useCallback, memo, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Camera, CheckCircle2, Clock, Loader2,
  Mail, Phone, Shield, Upload, User, XCircle, KeyRound, Lock,
} from 'lucide-react';
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
  useInitiateEmailChange, useConfirmEmailChange,
} from '../hooks/useAuth';
import UserNavbar from '@/components/UserNavbar';

// ── Schemas ──
const profileSchema = z.object({
  Name: z.string().min(2, 'Name required').max(100),
  PhoneNumber: z.string().optional().default(''),
});

const identitySchema = z.object({
  NationalId: z.string().min(5, 'National ID required'),
});

const emailChangeSchema = z.object({
  Email: z.string().email('Enter a valid email'),
  currentPassword: z.string().min(6, 'Password is required'),
});

const confirmEmailSchema = z.object({
  otp: z.string().min(4, 'OTP required'),
  Email: z.string().min(1).email(),
});

const ProfilePage = memo(() => {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const verifyIdentity = useVerifyIdentity();
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

  // Optimized effect with proper dependency tracking
  const initializeIdPreviews = useCallback(() => {
    if (user?.nationalIdImageFrontUrl && !frontIdPreview) {
      setFrontIdPreview(user.nationalIdImageFrontUrl);
    }
    if (user?.nationalIdImageBackUrl && !backIdPreview) {
      setBackIdPreview(user.nationalIdImageBackUrl);
    }
  }, [user?.nationalIdImageFrontUrl, user?.nationalIdImageBackUrl, frontIdPreview, backIdPreview]);

  // Call this effect only when user data is ready
  useEffect(() => {
    initializeIdPreviews();
  }, [initializeIdPreviews]);

  const identityForm = useForm<z.infer<typeof identitySchema>>({
    resolver: zodResolver(identitySchema),
    values: { NationalId: user?.nationalId ?? '' },
  });

  const emailForm = useForm<z.infer<typeof emailChangeSchema>>({
    resolver: zodResolver(emailChangeSchema),
  });

  const confirmEmailForm = useForm<z.infer<typeof confirmEmailSchema>>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: { Email: '', otp: '' },
  });

  const handleFilePreview = useCallback((
    file: File,
    setPreview: (url: string) => void,
    setFile: (f: File) => void,
  ) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

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
    setPendingEmail(d.Email);
    confirmEmailForm.setValue('Email', d.Email);
    initiateEmail.mutate({ newEmail: d.Email, currentPassword: d.currentPassword }, {
      onSuccess: () => setEmailStep('confirm'),
    });
  });

  const handleEmailConfirm = confirmEmailForm.handleSubmit((d) => {
    confirmEmail.mutate({ otp: d.otp!, Email: d.Email! }, {
      onSuccess: () => {
        toast.success('Email changed successfully! Logging out...');
        setTimeout(() => {
          storage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }, 1500);
      },
      onError: (error: unknown) => {
        let errorMsg = 'Failed to confirm email change. Please try again.';
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string } } };
          errorMsg = apiError.response?.data?.message || errorMsg;
        }
        toast.error(errorMsg);
      }
    });
  });

  const handleAvatarClick = () => {
    avatarRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFilePreview(f, setAvatarPreview, setAvatarFile);
  };

  const handleFrontIdClick = () => {
    if (user?.userStatus !== 'Active') {
      frontIdRef.current?.click();
    }
  };

  const handleFrontIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFilePreview(f, setFrontIdPreview, setFrontIdFile);
  };

  const handleBackIdClick = () => {
    if (user?.userStatus !== 'Active') {
      backIdRef.current?.click();
    }
  };

  const handleBackIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFilePreview(f, setBackIdPreview, setBackIdFile);
  };

  const handleEmailStepChange = () => {
    setEmailStep('initiate');
  };

  const memberSinceDate = user?.joinAt ? new Date(user.joinAt).toLocaleDateString() : '';
  const isIdentityVerified = user?.userStatus === 'Active';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <main className="container mx-auto max-w-4xl px-6 py-10 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="h-28 auth-gradient" />
          <CardContent className="relative pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-28 w-28 rounded-full border-4 border-card bg-muted overflow-hidden shadow-lg">
                  {avatarPreview || user?.profilePictureUrl ? (
                    <img
                      src={avatarPreview || user?.profilePictureUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
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
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isIdentityVerified ? (
                  <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Unverified</Badge>
                )}
                {user?.userStatus && (
                  <Badge
                    className={`gap-1 ${
                      user.userStatus === 'Active'
                        ? 'bg-success text-success-foreground'
                        : user.userStatus === 'Banned'
                          ? 'bg-destructive text-destructive-foreground'
                          : user.userStatus === 'Pending'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {user.userStatus}
                  </Badge>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" className="pl-10 bg-muted" value={user?.email ?? ''} disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userType">Account Type</Label>
                      <Input id="userType" className="bg-muted" value={user?.userType ?? ''} disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" className="bg-muted" value={user?.age ?? ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" className="bg-muted" value={user?.address ?? ''} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinAt">Member Since</Label>
                    <Input id="joinAt" className="bg-muted" value={memberSinceDate} disabled />
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

            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Status
                </CardTitle>
                <CardDescription>Your current account status and verification information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Badge
                        className={`${
                          user?.userStatus === 'Active'
                            ? 'bg-success text-success-foreground'
                            : user?.userStatus === 'Banned'
                              ? 'bg-destructive text-destructive-foreground'
                              : user?.userStatus === 'Pending'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {user?.userStatus ?? 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Strike Count</Label>
                    <Input
                      type="number"
                      className="bg-muted"
                      value={user?.strikeCount ?? 0}
                      disabled
                    />
                  </div>
                </div>
                {user?.userStatus === 'Banned' && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Account Suspended</p>
                    <p className="text-sm text-destructive/80 mt-1">
                      Your account has been suspended. Please contact support for more information.
                    </p>
                  </div>
                )}
                {user?.userStatus === 'Rejected' && user?.rejectedReason && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Verification Rejected</p>
                    <p className="text-sm text-destructive/80 mt-1">{user.rejectedReason}</p>
                  </div>
                )}
                {user?.userStatus === 'Pending' && (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning font-medium">Verification Pending</p>
                    <p className="text-sm text-warning/80 mt-1">
                      Your account verification is in progress. We'll notify you once it's complete.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Identity Tab */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Identity Verification
                  {isIdentityVerified ? (
                    <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Not Verified</Badge>
                  )}
                </CardTitle>
                <CardDescription>Your national ID information and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIdentitySubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="nationalId">National ID Number</Label>
                      {isIdentityVerified ? (
                        <Input id="nationalId" className="bg-muted" value={user?.nationalId ?? ''} disabled />
                      ) : (
                        <>
                          <Input id="nationalId" placeholder="Enter your national ID" {...identityForm.register('NationalId')} />
                          {identityForm.formState.errors.NationalId && (
                            <p className="text-sm text-destructive">{identityForm.formState.errors.NationalId.message}</p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verificationStatus">Verification Status</Label>
                      <Input id="verificationStatus" className="bg-muted" value={user?.userStatus ?? 'Pending'} disabled />
                    </div>
                  </div>

                  {user?.strikeCount !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="strikeCount">Strike Count</Label>
                      <Input id="strikeCount" type="number" className="bg-muted" value={user.strikeCount} disabled />
                    </div>
                  )}

                  {user?.rejectedReason && (
                    <div className="space-y-2">
                      <Label>Rejection Reason</Label>
                      <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                        {user.rejectedReason}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Front ID */}
                    <div className="space-y-2">
                      <Label>ID Front</Label>
                      <button
                        type="button"
                        onClick={handleFrontIdClick}
                        disabled={isIdentityVerified}
                        className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors overflow-auto bg-muted/50 ${
                          isIdentityVerified
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'text-muted-foreground hover:border-primary hover:text-primary cursor-pointer'
                        }`}
                      >
                        {frontIdPreview ? (
                          <img src={frontIdPreview} alt="Front ID" className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">{isIdentityVerified ? 'Verified' : 'Upload front side'}</span>
                          </>
                        )}
                      </button>
                      {!isIdentityVerified && (
                        <input ref={frontIdRef} type="file" accept="image/*" className="hidden" onChange={handleFrontIdChange} />
                      )}
                    </div>
                    {/* Back ID */}
                    <div className="space-y-2">
                      <Label>ID Back</Label>
                      <button
                        type="button"
                        onClick={handleBackIdClick}
                        disabled={isIdentityVerified}
                        className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors overflow-auto bg-muted/50 ${
                          isIdentityVerified
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'text-muted-foreground hover:border-primary hover:text-primary cursor-pointer'
                        }`}
                      >
                        {backIdPreview ? (
                          <img src={backIdPreview} alt="Back ID" className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">{isIdentityVerified ? 'Verified' : 'Upload back side'}</span>
                          </>
                        )}
                      </button>
                      {!isIdentityVerified && (
                        <input ref={backIdRef} type="file" accept="image/*" className="hidden" onChange={handleBackIdChange} />
                      )}
                    </div>
                  </div>

                  {!isIdentityVerified && (
                    <>
                      <Separator />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={verifyIdentity.isPending || !frontIdFile || !backIdFile || !identityForm.getValues('NationalId')}>
                          {verifyIdentity.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Submit Verification
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
                <CardDescription>Manage your account security and email settings</CardDescription>
              </CardHeader>
              <CardContent>
                {emailStep === 'initiate' ? (
                  <form onSubmit={handleEmailInitiate} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Current Email</Label>
                      <Input value={user?.email ?? ''} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Email">New Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="Email" type="email" placeholder="email@example.com" className="pl-10" {...emailForm.register('Email')} />
                      </div>
                      {emailForm.formState.errors.Email && (
                        <p className="text-sm text-destructive">{emailForm.formState.errors.Email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="currentPassword" type="password" placeholder="Enter your password" className="pl-10" {...emailForm.register('currentPassword')} />
                      </div>
                      {emailForm.formState.errors.currentPassword && (
                        <p className="text-sm text-destructive">{emailForm.formState.errors.currentPassword.message}</p>
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
                      <Button type="button" variant="ghost" onClick={handleEmailStepChange}>
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
});

ProfilePage.displayName = 'ProfilePage';
export default ProfilePage;
