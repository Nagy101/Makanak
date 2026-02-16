import { memo, useCallback, useState } from 'react';
import { X, MapPin, DollarSign, Users, Building2, Bed, Bath, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProperty } from '@/features/properties/useProperties';
import { useUpdatePropertyStatus } from '../useAdmin';
import type { PropertyStatus } from '../admin.types';
import { toast } from 'sonner';

interface PropertyDetailsModalProps {
  propertyId: number | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-warning/10 text-warning',
  Accepted: 'bg-success/10 text-success',
  Rejected: 'bg-destructive/10 text-destructive',
  Banned: 'bg-destructive/10 text-destructive',
};

const PropertyDetailsModal = memo<PropertyDetailsModalProps>(({ propertyId, onClose }) => {
  const { data: property, isLoading } = useProperty(propertyId);
  const mutation = useUpdatePropertyStatus();
  const [newStatus, setNewStatus] = useState<PropertyStatus | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleStatusChange = useCallback(
    (status: PropertyStatus) => {
      setNewStatus(status);
      if (status === 'Rejected') {
        setShowReasonInput(true);
      } else {
        setShowReasonInput(false);
      }
    },
    []
  );

  const handleApplyStatus = useCallback(() => {
    if (!propertyId || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    mutation.mutate(
      {
        propertyId,
        newStatus,
        rejectedReason: newStatus === 'Rejected' ? rejectionReason : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Property status updated to ${newStatus}`);
          setNewStatus('');
          setRejectionReason('');
          setShowReasonInput(false);
          onClose();
        },
        onError: () => {
          toast.error('Failed to update property status');
        },
      }
    );
  }, [propertyId, newStatus, rejectionReason, mutation, onClose]);

  return (
    <Dialog open={propertyId !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Property Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : !property ? (
          <p className="py-8 text-center text-muted-foreground">No property data found</p>
        ) : (
          <div className="space-y-6 py-2">
            {/* Main Image */}
            {property.mainImageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={property.mainImageUrl}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Title & Status */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{property.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[property.propertyStatus ?? 'Pending']}>
                  {property.propertyStatus ?? 'Pending'}
                </Badge>
                <Badge variant="outline">{property.propertyType}</Badge>
              </div>
            </div>

            <Separator />

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Price/Night</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.pricePerNight}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bedrooms</p>
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bathrooms</p>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.bathrooms}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Max Guests</p>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{property.maxGuests}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Location
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{property.address}</p>
                <p className="text-xs">{property.areaName}, {property.governorateName}</p>
                <p className="text-xs">Area: {property.area} m²</p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity.id} variant="secondary">
                      {amenity.name || amenity.nameEn || amenity.nameAr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Status Management */}
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
              <p className="text-sm font-medium text-foreground">Update Status</p>

              <Select value={newStatus} onValueChange={(val) => handleStatusChange(val as PropertyStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              {showReasonInput && (
                <Textarea
                  placeholder="Reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="resize-none h-20"
                />
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyStatus}
                  disabled={mutation.isPending || !newStatus}
                >
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Apply Status
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

PropertyDetailsModal.displayName = 'PropertyDetailsModal';
export default PropertyDetailsModal;
