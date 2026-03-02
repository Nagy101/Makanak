import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, LogIn, ShieldCheck } from "lucide-react";
import { useCreateBooking } from "../useBookings";
import { useAuthStore } from "@/features/auth/store/authStore";
import { differenceInDays } from "date-fns";

// -- Validation schema
const bookingSchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    numberOfGuests: z.coerce.number().min(1, "At least 1 guest"),
    specialRequests: z.string().optional(),
  })
  .refine((d) => new Date(d.checkOutDate) > new Date(d.checkInDate), {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

type BookingForm = z.infer<typeof bookingSchema>;

interface CreateBookingWidgetProps {
  propertyId: number;
  pricePerNight: number;
  maxGuests: number;
}

// -- Component
const CreateBookingWidget = memo(
  ({ propertyId, pricePerNight, maxGuests }: CreateBookingWidgetProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useAuthStore((s) => !!s.token);
    const createBooking = useCreateBooking();

    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<BookingForm>({
      resolver: zodResolver(bookingSchema),
      defaultValues: { numberOfGuests: 1, specialRequests: "" },
    });

    const checkIn = watch("checkInDate");
    const checkOut = watch("checkOutDate");

    const totalDays =
      checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
        ? differenceInDays(new Date(checkOut), new Date(checkIn))
        : 0;
    const totalPrice = totalDays * pricePerNight;

    // -- Submit handler
    const onSubmit = useCallback(
      (data: BookingForm) => {
        if (!isAuthenticated) {
          toast.error(t("auth.loginToPerformAction"));
          navigate("/login", { state: { from: location.pathname } });
          return;
        }
        createBooking.mutate({
          propertyId,
          checkInDate: new Date(data.checkInDate).toISOString(),
          checkOutDate: new Date(data.checkOutDate).toISOString(),
          numberOfGuests: data.numberOfGuests,
          specialRequests: data.specialRequests || undefined,
        });
      },
      [propertyId, createBooking, isAuthenticated, navigate, location.pathname],
    );

    const today = new Date().toISOString().split("T")[0];

    return (
      <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
        {/* Price header */}
        <div className="bg-gradient-to-br from-primary/8 to-primary/3 px-6 pt-6 pb-5 border-b">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-primary">
              {pricePerNight.toLocaleString()} EGP
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              {t("common.perNight")}
            </span>
          </div>
          {totalDays > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {totalDays}{" "}
              {totalDays > 1 ? t("common.nights") : t("common.night")} ·{" "}
              {totalPrice.toLocaleString()} EGP{" "}
              {t("bookings.total").toLowerCase()}
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date pickers — combined border box like Airbnb */}
            <div className="rounded-xl border overflow-hidden divide-y">
              {/* Check-in */}
              <div className="px-4 py-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                  {t("bookings.checkIn")}
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    min={today}
                    {...register("checkInDate")}
                    className="text-sm bg-transparent outline-none w-full text-foreground font-medium"
                  />
                </div>
                {errors.checkInDate && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.checkInDate.message}
                  </p>
                )}
              </div>
              {/* Check-out */}
              <div className="px-4 py-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                  {t("bookings.checkOut")}
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    min={checkIn || today}
                    {...register("checkOutDate")}
                    className="text-sm bg-transparent outline-none w-full text-foreground font-medium"
                  />
                </div>
                {errors.checkOutDate && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.checkOutDate.message}
                  </p>
                )}
              </div>
              {/* Guests */}
              <div className="px-4 py-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                  {t("bookings.guests")}
                </Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select
                    {...register("numberOfGuests")}
                    className="text-sm bg-transparent outline-none w-full text-foreground font-medium"
                  >
                    {Array.from({ length: maxGuests }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}{" "}
                        {i === 0
                          ? t("bookings.guest")
                          : t("bookings.guestsPlural")}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.numberOfGuests && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.numberOfGuests.message}
                  </p>
                )}
              </div>
            </div>

            {/* Special requests */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("bookings.specialRequests")}
              </Label>
              <Textarea
                {...register("specialRequests")}
                placeholder={t("bookings.anySpecialRequests")}
                rows={3}
                className="resize-none rounded-xl text-sm"
              />
            </div>

            {/* Price breakdown — only when dates selected */}
            {totalDays > 0 && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {pricePerNight.toLocaleString()} EGP × {totalDays}{" "}
                    {totalDays > 1 ? t("common.nights") : t("common.night")}
                  </span>
                  <span>{totalPrice.toLocaleString()} EGP</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-foreground text-base">
                  <span>{t("bookings.total")}</span>
                  <span>{totalPrice.toLocaleString()} EGP</span>
                </div>
              </div>
            )}

            {/* CTA button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl"
              size="lg"
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {t("bookings.processing")}
                </span>
              ) : isAuthenticated ? (
                t("bookings.bookNow")
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t("bookings.loginToBook")}
                </span>
              )}
            </Button>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("bookings.wontBeChargedYet")}
            </div>
          </form>
        </div>
      </div>
    );
  },
);

CreateBookingWidget.displayName = "CreateBookingWidget";
export default CreateBookingWidget;
