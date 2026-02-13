# Lookup Feature Usage Guide

## Overview

This guide explains how to use the lookup feature which provides access to backend lookup controllers and caches the data locally.

## Available Lookups

### 1. Governorates

- **Endpoint**: `/api/Lookup/governorates`
- **Hook**: `useGovernorates()`
- **Data**: `{ id, name, icon }`
- **Use Case**: Property location selection in auth and property features

### 2. Amenities

- **Endpoint**: `/api/Lookup/amenities`
- **Hook**: `useAmenities()`
- **Data**: `{ id, nameEn, nameAr }`
- **Use Case**: Property amenity selection and filtering

### 3-9. Enum Lookups (Prepared for Future Use)

- Property Types: `/api/Lookup/property-types`
- Property Statuses: `/api/Lookup/property-statuses`
- User Statuses: `/api/Lookup/user-statuses`
- User Types: `/api/Lookup/user-types`
- Dispute Reasons: `/api/Lookup/dispute-reasons`
- Booking Statuses: `/api/Lookup/booking-statuses`
- Dispute Statuses: `/api/Lookup/dispute-statuses`

## Usage Examples

### Example 1: Using Governorates in a Select Component

```typescript
import { useGovernorates } from '@/features/lookup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const GovernorateSelect = () => {
  const { governorates, loading, error } = useGovernorates();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select Governorate" />
      </SelectTrigger>
      <SelectContent>
        {governorates.map((gov) => (
          <SelectItem key={gov.id} value={gov.id.toString()}>
            {gov.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### Example 2: Using Amenities for Multi-select

```typescript
import { useAmenities } from '@/features/lookup';
import { Checkbox } from '@/components/ui/checkbox';

export const AmenitiesFilter = ({ onSelect }: { onSelect: (ids: number[]) => void }) => {
  const { amenities, loading } = useAmenities();
  const [selected, setSelected] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    onSelect(selected);
  };

  if (loading) return <div>Loading amenities...</div>;

  return (
    <div className="space-y-2">
      {amenities.map((amenity) => (
        <div key={amenity.id} className="flex items-center space-x-2">
          <Checkbox
            id={`amenity-${amenity.id}`}
            checked={selected.includes(amenity.id)}
            onCheckedChange={() => handleToggle(amenity.id)}
          />
          <label htmlFor={`amenity-${amenity.id}`}>{amenity.nameEn}</label>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Using Lookups in Form

```typescript
import { useForm } from 'react-hook-form';
import { useGovernorates } from '@/features/lookup';

export const PropertySearchForm = () => {
  const { control, watch } = useForm();
  const { governorates } = useGovernorates();

  return (
    <Select name="governorateId" control={control}>
      {governorates.map((gov) => (
        <option key={gov.id} value={gov.id}>
          {gov.name}
        </option>
      ))}
    </Select>
  );
};
```

### Example 4: Accessing Lookups Directly from Store

```typescript
import { useLookups } from '@/features/lookup';

export const MyComponent = () => {
  const { governorates, amenities, propertyTypes, loading } = useLookups();

  // Use lookups directly without automatic fetching
  return <div>{governorates.length} governorates available</div>;
};
```

## Integration in Features

### Auth Feature

- Use `useGovernorates()` in ProfilePage for address/location selection
- Use `useUserStatuses()` and `useUserTypes()` for display purposes

### Property Feature

- Use `useGovernorates()` for location filter
- Use `useAmenities()` for amenity filtering
- Use `usePropertyTypes()` for property type filtering (when needed)
- Use `usePropertyStatuses()` to display property status

## Features

✅ **Automatic Caching**: Lookups are fetched once and cached in Zustand store
✅ **Parallel Loading**: `useAllLookups()` fetches all at once on app startup
✅ **Error Handling**: Each hook includes error state for error handling
✅ **Loading State**: Track loading state for each lookup
✅ **Type-Safe**: Full TypeScript support

## Performance Tips

1. **Use specific hooks**: Import only what you need (`useGovernorates`, `useAmenities`, etc.)
2. **Cache on startup**: `useAllLookups()` is called in App.tsx to pre-load all data
3. **Avoid duplicate fetches**: Data is cached after first fetch
4. **Error Recovery**: If one lookup fails, others continue

## Testing

When testing components that use lookups, mock the hooks:

```typescript
import { vi } from "vitest";
vi.mock("@/features/lookup", () => ({
  useGovernorates: vi.fn(() => ({
    governorates: [{ id: 1, name: "Cairo", icon: "icon-url" }],
    loading: false,
    error: null,
  })),
}));
```
