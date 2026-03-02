import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { useCreateDispute } from "../useDisputes";
import {
  useRoleDisputeReasons,
  type DisputeReasonRole,
} from "@/features/lookup/useLookups";
import { getDisputeReasonLabel } from "../dispute.i18n";

const schema = z.object({
  BookingId: z.number().min(1, "Booking ID is required"),
  Reason: z.number().min(1, "Please select a reason"),
  Description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  /** Role of the current user — determines which reasons endpoint is called */
  role?: DisputeReasonRole;
}

export default function CreateDisputeModal({
  open,
  onOpenChange,
  bookingId,
  role = "tenant",
}: Props) {
  const { t } = useTranslation();
  const [images, setImages] = useState<File[]>([]);

  // Fetch reasons on-demand (only when the modal is actually open)
  const { disputeReasons, isLoading: reasonsLoading } = useRoleDisputeReasons(
    role,
    open,
  );

  const createMutation = useCreateDispute();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { BookingId: bookingId, Reason: 0, Description: "" },
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      createMutation.mutate(
        {
          BookingId: values.BookingId,
          Reason: values.Reason,
          Description: values.Description,
          Images: images,
        },
        {
          onSuccess: () => {
            reset();
            setImages([]);
            onOpenChange(false);
          },
        },
      );
    },
    [createMutation, images, reset, onOpenChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) setImages((prev) => [...prev, ...Array.from(files)]);
    },
    [],
  );

  const removeImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("disputes.fileDispute")}</DialogTitle>
          <DialogDescription>{t("disputes.reportIssue")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="hidden"
            {...register("BookingId", { valueAsNumber: true })}
          />

          {/* Reason */}
          <div className="space-y-1.5">
            <Label>{t("disputes.reason")}</Label>
            <Select
              disabled={reasonsLoading}
              onValueChange={(v) =>
                setValue("Reason", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    reasonsLoading
                      ? t("disputes.loadingReasons")
                      : t("disputes.selectReason")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {disputeReasons.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {/* Use Arabic label when the layout is RTL, otherwise use API English name */}
                    {getDisputeReasonLabel(r.id, r.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.Reason && (
              <p className="text-xs text-destructive">
                {errors.Reason.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>{t("disputes.description")}</Label>
            <Textarea
              rows={4}
              placeholder={t("disputes.describeIssue")}
              {...register("Description")}
            />
            {errors.Description && (
              <p className="text-xs text-destructive">
                {errors.Description.message}
              </p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-1.5">
            <Label>{t("disputes.evidenceImages")}</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary/50 hover:bg-secondary/50 transition-colors">
              <Upload className="h-4 w-4" />
              {t("disputes.clickToUpload")}
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-16 w-16 rounded-md object-cover border border-border"
                      width={64}
                      height={64}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-muted hover:text-foreground"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || reasonsLoading}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              {t("disputes.submitDispute")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
