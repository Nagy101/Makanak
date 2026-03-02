import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  CheckCircle2,
  XCircle,
  Ban,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useUserVerification,
  useUpdateUserStatus,
  useAddStrike,
  useRemoveStrike,
} from "../useAdmin";
import type { UserStatus } from "../admin.types";
import { toast } from "sonner";

interface UserVerificationModalProps {
  userId: string;
  onClose: () => void;
}

const statusBadge: Record<UserStatus, string> = {
  New: "bg-primary/10 text-primary",
  Pending: "bg-warning/10 text-warning",
  Active: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  Banned: "bg-destructive/10 text-destructive",
};

// ── Memoized strike count display (primitive props) ──
const StrikeCountBadge = memo(function StrikeCountBadge({
  count,
}: {
  count: number;
}) {
  const colorClass =
    count === 0
      ? "bg-success/10 text-success border-success/20"
      : count >= 3
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-warning/10 text-warning border-warning/20";

  return (
    <Badge variant="outline" className={`text-sm font-semibold ${colorClass}`}>
      {count}/3
    </Badge>
  );
});
StrikeCountBadge.displayName = "StrikeCountBadge";

const UserVerificationModal = memo<UserVerificationModalProps>(
  ({ userId, onClose }) => {
    const { t } = useTranslation();
    const { data, isLoading } = useUserVerification(userId);
    const mutation = useUpdateUserStatus();
    const addStrikeMutation = useAddStrike();
    const removeStrikeMutation = useRemoveStrike();
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const isStrikePending =
      addStrikeMutation.isPending || removeStrikeMutation.isPending;

    const handleAction = useCallback(
      (newStatus: UserStatus, reason?: string) => {
        mutation.mutate(
          { userId, newStatus, rejectedReason: reason ?? "" },
          {
            onSuccess: () => {
              toast.success(
                t("admin.userStatusUpdated", { status: newStatus }),
              );
              onClose();
            },
            onError: () => toast.error(t("admin.failedUpdateUserStatus")),
          },
        );
      },
      [userId, mutation, onClose, t],
    );

    const handleAddStrike = useCallback(() => {
      addStrikeMutation.mutate(userId, {
        onSuccess: () => toast.success(t("admin.strikeAdded")),
        onError: () => toast.error(t("admin.strikeAddFailed")),
      });
    }, [userId, addStrikeMutation, t]);

    const handleRemoveStrike = useCallback(() => {
      removeStrikeMutation.mutate(userId, {
        onSuccess: () => toast.success(t("admin.strikeRemoved")),
        onError: () => toast.error(t("admin.strikeRemoveFailed")),
      });
    }, [userId, removeStrikeMutation, t]);

    const handleReject = useCallback(() => {
      if (showRejectInput) {
        handleAction("Rejected", rejectReason);
      } else {
        setShowRejectInput(true);
      }
    }, [showRejectInput, rejectReason, handleAction]);

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("admin.userVerificationDetails")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !data ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("admin.noDataFound")}
            </p>
          ) : (
            <div className="space-y-5 py-2">
              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {data.profilePictureUrl ? (
                    <img
                      src={data.profilePictureUrl}
                      alt={data.name}
                      className="h-14 w-14 rounded-full object-cover"
                      loading="lazy"
                      width={56}
                      height={56}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {data.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={statusBadge[data.userStatus]}
                    >
                      {data.userStatus}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {data.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {data.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {t("admin.joined")}{" "}
                    {new Date(data.joinAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" /> {data.userType}
                  </div>
                </div>

                {/* Strike Count — Prominent Display */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-foreground">
                      {t("admin.strikes")}
                    </span>
                  </div>
                  <StrikeCountBadge count={data.strikeCount} />
                </div>
              </div>

              <Separator />

              {/* National ID */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {t("admin.nationalIdDocuments")}
                </h4>
                {data.nationalId && (
                  <p className="text-sm text-muted-foreground">
                    ID: {data.nationalId}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("admin.front")}
                    </p>
                    {data.nationalIdImageFrontUrl ? (
                      <a
                        href={data.nationalIdImageFrontUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={data.nationalIdImageFrontUrl}
                          alt="ID Front"
                          className="h-48 w-full rounded-lg border border-border object-contain bg-black/5"
                          loading="lazy"
                          width={400}
                          height={256}
                        />
                      </a>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                        {t("admin.notProvided")}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("admin.back")}
                    </p>
                    {data.nationalIdImageBackUrl ? (
                      <a
                        href={data.nationalIdImageBackUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={data.nationalIdImageBackUrl}
                          alt="ID Back"
                          className="h-48 w-full rounded-lg border border-border object-contain bg-black/5"
                          loading="lazy"
                          width={400}
                          height={256}
                        />
                      </a>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                        {t("admin.notProvided")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reject reason input */}
              {showRejectInput && (
                <Textarea
                  placeholder={t("admin.reasonForRejection")}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  disabled={mutation.isPending}
                  onClick={() => handleAction("Active")}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> {t("admin.approve")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={mutation.isPending}
                  onClick={handleReject}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  {showRejectInput
                    ? t("admin.confirmReject")
                    : t("admin.reject")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                  disabled={mutation.isPending}
                  onClick={() => handleAction("Banned")}
                >
                  <Ban className="mr-1 h-4 w-4" /> {t("admin.ban")}
                </Button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Issue Strike with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-warning border-warning/30 hover:bg-warning hover:text-warning-foreground"
                      disabled={isStrikePending || (data.strikeCount ?? 0) >= 3}
                    >
                      <AlertTriangle className="mr-1 h-4 w-4" />{" "}
                      {t("admin.issueStrike")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("admin.confirmStrikeTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("admin.confirmStrikeDesc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleAddStrike}
                      >
                        {t("admin.confirmStrikeAction")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Revoke Strike */}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  disabled={isStrikePending || (data.strikeCount ?? 0) === 0}
                  onClick={handleRemoveStrike}
                >
                  <MinusCircle className="mr-1 h-4 w-4" />{" "}
                  {t("admin.revokeStrike")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

UserVerificationModal.displayName = "UserVerificationModal";
export default UserVerificationModal;
