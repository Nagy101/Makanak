# Lookup Integration Implementation Guide

## Overview

This guide provides step-by-step instructions for integrating the lookup feature into existing components in the auth and property features.

## Integration Steps

### Step 1: Update PropertySearchFilter Component

Replace the static imports with the lookup hooks:

**Before:**

```typescript
import { GOVERNORATES, AMENITIES, PROPERTY_TYPES } from "@/data/staticLookups";
```

**After:**

```typescript
import {
  useGovernorates,
  useAmenities,
  usePropertyTypes,
} from "@/features/lookup";
```

**Changes in component:**

1. Add hooks at the top of the component:

```typescript
const { governorates, loading: loadingGov } = useGovernorates();
const { amenities, loading: loadingAmenities } = useAmenities();
const { propertyTypes, loading: loadingTypes } = usePropertyTypes();
```

2. Replace `GOVERNORATES` with `governorates` in the governorate select sections (appears twice in the component)

3. Replace `AMENITIES` with `amenities` in the amenities checkbox section

4. Replace `PROPERTY_TYPES` with `propertyTypes` in the property type select section

5. Add loading states to SelectTrigger elements

**Example:**

```typescript
<SelectTrigger className="w-[180px] h-11 hidden md:flex" disabled={loadingGov}>
  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
  <SelectValue placeholder={loadingGov ? "Loading..." : "All Locations"} />
</SelectTrigger>
```

---

### Step 2: Update RegisterPage Component (Optional)

Add governorate selection to user registration:

1. Import the hook:

```typescript
import { useGovernorates } from "@/features/lookup";
```

2. Use the hook in the component:

```typescript
const { governorates, loading: loadingGov } = useGovernorates();
```

3. Add a new field in the form schema:

```typescript
const schema = z.object({
  // ... existing fields ...
  governorateId: z.string().optional(),
});
```

4. Add the select component:

```typescript
<div className="space-y-2">
  <Label htmlFor="governorate">Governorate (Optional)</Label>
  <Select
    value={watch('governorateId') || ''}
    onValueChange={(value) => {
      const val = value ? Number(value) : undefined;
      setValue('governorateId', val);
    }}
    disabled={loadingGov}
  >
    <SelectTrigger className="h-11">
      <SelectValue placeholder={loadingGov ? "Loading..." : "Select Governorate"} />
    </SelectTrigger>
    <SelectContent>
      {governorates.map((gov) => (
        <SelectItem key={gov.id} value={gov.id.toString()}>
          {gov.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

---

### Step 3: Update ProfilePage Component (Optional)

Display user governorate from lookups:

1. Import hooks:

```typescript
import {
  useGovernorates,
  useUserTypes,
  useUserStatuses,
} from "@/features/lookup";
```

2. Use the hooks:

```typescript
const { governorates } = useGovernorates();
const { userTypes } = useUserTypes();
const { userStatuses } = useUserStatuses();
```

3. Create helper functions to get names:

```typescript
const getGovernorateNameById = (id?: number) =>
  governorates.find((g) => g.id === id)?.name || "Unknown";

const getUserTypeName = (type?: string) =>
  userTypes.find((u) => u.name === type)?.name || type || "N/A";

const getUserStatusName = (status?: string) =>
  userStatuses.find((u) => u.name === status)?.name || status || "N/A";
```

4. Display in profile:

```typescript
<div>
  <p className="text-sm text-gray-600">Governorate</p>
  <p className="font-semibold">{getGovernorateNameById(user?.governorateId)}</p>
</div>
```

---

## Data Format Reference

### Governorates

```typescript
{
  id: number;
  name: string; // e.g., "Cairo"
  icon: string; // e.g., "https://..."
}
```

### Amenities

```typescript
{
  id: number;
  nameEn: string; // English name
  nameAr: string; // Arabic name
}
```

### Property Types, Statuses, etc.

```typescript
{
  id: number;
  name: string;
}
```

---

## Testing Components with Lookups

Mock the lookup hooks in tests:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/features/lookup', () => ({
  useGovernorates: vi.fn(() => ({
    governorates: [
      { id: 1, name: 'Cairo', icon: 'icon-url' },
      { id: 2, name: 'Alexandria', icon: 'icon-url' },
    ],
    loading: false,
    error: null,
  })),
  useAmenities: vi.fn(() => ({
    amenities: [
      { id: 1, nameEn: 'WiFi', nameAr: 'واي فاي' },
    ],
    loading: false,
    error: null,
  })),
}));

describe('PropertySearchFilter', () => {
  it('renders governorates from lookup', () => {
    render(<PropertySearchFilter {...props} />);
    expect(screen.getByText('Cairo')).toBeInTheDocument();
  });
});
```

---

## Benefits of This Implementation

✅ **Live Data**: Governorates and amenities are fetched from backend
✅ **Centralized Caching**: Data is cached in Zustand store
✅ **Type Safe**: Full TypeScript support
✅ **Scalable**: Easy to add new lookups
✅ **Performance**: Automatic caching prevents duplicate requests
✅ **Error Handling**: Each component handles loading and error states
✅ **Future Proof**: Prepared for enum-based lookups when needed

---

## Migration Checklist

- [ ] Update PropertySearchFilter to use lookup hooks
- [ ] Update RegisterPage (optional)
- [ ] Update ProfilePage (optional)
- [ ] Update any other components using static lookups
- [ ] Test components in browser
- [ ] Verify API calls are made
- [ ] Update unit tests to mock lookup hooks
- [ ] Remove static lookup imports where no longer needed
