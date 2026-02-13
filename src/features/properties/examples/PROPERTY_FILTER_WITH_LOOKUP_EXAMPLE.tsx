/**
 * EXAMPLE: How to integrate governorates and amenities lookups in PropertySearchFilter
 * 
 * This example shows how to update PropertySearchFilter to use live lookups from backend
 * instead of static data.
 */

import { useState } from 'react';
import { useGovernorates, useAmenities, usePropertyTypes } from '@/features/lookup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PropertySearchParams } from '../property.types';

interface Props {
  params: PropertySearchParams;
  onParamsChange: (params: PropertySearchParams) => void;
}

/**
 * Example of updated PropertySearchFilter with live lookups
 */
const PropertySearchFilterExample = ({ params, onParamsChange }: Props) => {
  const [draft, setDraft] = useState<PropertySearchParams>({ ...params });
  
  // Load lookups
  const { governorates, loading: loadingGov } = useGovernorates();
  const { amenities, loading: loadingAmenities } = useAmenities();
  const { propertyTypes, loading: loadingTypes } = usePropertyTypes();

  const toggleAmenity = (id: number) => {
    const current = draft.AmenityIds || [];
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    setDraft({ ...draft, AmenityIds: next });
  };

  return (
    <div className="space-y-6">
      {/* Location Filter - with live governorates */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Location</Label>
        <Select
          value={draft.GovernorateId?.toString() || ''}
          onValueChange={(v) => setDraft({ ...draft, GovernorateId: v ? Number(v) : undefined })}
          disabled={loadingGov}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingGov ? "Loading locations..." : "All Locations"} />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((gov) => (
              <SelectItem key={gov.id} value={gov.id.toString()}>
                {gov.nameEn || gov.nameAr || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type Filter - with live property types */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Property Type</Label>
        <Select 
          value={draft.Type || ''} 
          onValueChange={(v) => setDraft({ ...draft, Type: v || undefined })}
          disabled={loadingTypes}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTypes ? "Loading types..." : "Any type"} />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amenities Filter - with live amenities */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Amenities</Label>
        {loadingAmenities ? (
          <p className="text-sm text-muted-foreground">Loading amenities...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-accent/5 transition-colors"
              >
                <Checkbox
                  checked={(draft.AmenityIds || []).includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <span className="text-sm">{amenity.nameEn}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearchFilterExample;
