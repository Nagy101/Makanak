import { memo, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users } from 'lucide-react';
import { useCreateBooking } from '../useBookings';
import { differenceInDays } from 'date-fns';

const bookingSchema = z
  .object({
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    numberOfGuests: z.coerce.number().min(1, 'At least 1 guest'),
    specialRequests: z.string().optional(),
  })
  .refine((d) => new Date(d.checkOutDate) > new Date(d.checkInDate), {
    message: 'Check-out must be after check-in',
    path: ['checkOutDate'],
  });

type BookingForm = z.infer<typeof bookingSchema>;

interface CreateBookingWidgetProps {
  propertyId: number;
  pricePerNight: number;
  maxGuests: number;
}

const CreateBookingWidget = memo(({ propertyId, pricePerNight, maxGuests }: CreateBookingWidgetProps) => {
  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { numberOfGuests: 1, specialRequests: '' },
  });

  const checkIn = watch('checkInDate');
  const checkOut = watch('checkOutDate');

  const totalDays =
    checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
      ? differenceInDays(new Date(checkOut), new Date(checkIn))
      : 0;
  const totalPrice = totalDays * pricePerNight;

  const onSubmit = useCallback(
    (data: BookingForm) => {
      createBooking.mutate({
        propertyId,
        checkInDate: new Date(data.checkInDate).toISOString(),
        checkOutDate: new Date(data.checkOutDate).toISOString(),
        numberOfGuests: data.numberOfGuests,
        specialRequests: data.specialRequests || undefined,
      });
    },
    [propertyId, createBooking],
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-lg border-0 ring-1 ring-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">
            {pricePerNight.toLocaleString()} EGP
          </span>
          <span className="text-muted-foreground text-base font-normal">/ night</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">CHECK-IN</Label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  min={today}
                  {...register('checkInDate')}
                  className="text-sm bg-transparent outline-none w-full text-foreground"
                />
              </div>
              {errors.checkInDate && (
                <p className="text-xs text-destructive">{errors.checkInDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">CHECK-OUT</Label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  min={checkIn || today}
                  {...register('checkOutDate')}
                  className="text-sm bg-transparent outline-none w-full text-foreground"
                />
              </div>
              {errors.checkOutDate && (
                <p className="text-xs text-destructive">{errors.checkOutDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">GUESTS</Label>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                {...register('numberOfGuests')}
                className="text-sm bg-transparent outline-none w-full text-foreground"
              >
                {Array.from({ length: maxGuests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>
            {errors.numberOfGuests && (
              <p className="text-xs text-destructive">{errors.numberOfGuests.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">SPECIAL REQUESTS</Label>
            <Textarea
              {...register('specialRequests')}
              placeholder="Any special requests..."
              rows={3}
              className="resize-none"
            />
          </div>

          {totalDays > 0 && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {pricePerNight.toLocaleString()} EGP × {totalDays} night{totalDays > 1 ? 's' : ''}
                  </span>
                  <span className="text-foreground font-medium">{totalPrice.toLocaleString()} EGP</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} EGP</span>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            size="lg"
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? 'Booking...' : 'Book Now'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">You won't be charged yet</p>
        </form>
      </CardContent>
    </Card>
  );
});

CreateBookingWidget.displayName = 'CreateBookingWidget';
export default CreateBookingWidget;
