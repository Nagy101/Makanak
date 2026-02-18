// ── API Response Envelope ──
export interface OwnerApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message?: string;
  data: T;
  errors?: string[] | null;
}

// ── My Properties Search Params ──
export interface MyPropertiesParams {
  FilterStatus?: string;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
}

// ── Owner Property Listing (My Properties response item) ──
export interface OwnerPropertyListing {
  id: number;
  title: string;
  mainImageUrl: string;
  pricePerNight: number;
  governorateName: string;
  propertyStatus: string;
  propertyType: string;
  averageRating: number;
  createdAt: string;
  isAvailable: boolean;
}

// ── Paginated Data ──
export interface PaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

// ── Create Property Payload ──
export interface CreatePropertyPayload {
  Title: string;
  Description: string;
  PropertyType: string;
  AreaName: string;
  Address: string;
  PricePerNight: number;
  Latitude: number;
  Longitude: number;
  Area: number;
  Bedrooms: number;
  Bathrooms: number;
  MaxGuests: number;
  GovernorateId: number;
  MainImage: File;
  GalleryImages: File[];
  AmenityIds: number[];
}

// ── Edit Property Payload ──
export interface EditPropertyPayload extends CreatePropertyPayload {
  DeletedImageIds: number[];
}
